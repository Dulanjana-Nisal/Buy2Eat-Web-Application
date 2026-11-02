// import third party libraries
const mongoose = require("mongoose");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

// import database models 
const Users = require("../../models/userModel");
const CustomerProfile = require("../../models/customerProfileModel");
const SellerProfile = require("../../models/sellerProfileModel");
const registrationOtpModel = require("../../models/registrationOtpModel");

// import error handlers
const asyncHandler = require("../../middleware/asyncHandler");
const AppError = require("../../errors/AppError");
const { ErrorCode, StatusCode } = require("../../constants");

// import token and cookie utilities
const { createCookies, createTokenPair, createRefreshToken } = require("../../services/token.service");
const { resendEmailOTP } = require("../../utils/sendEmails");
const { AGREEMENT_VERSION } = require("../../config/env");

// verify otp controller
const verifyOtp = asyncHandler(async (req, res) => {
    const { otp, verification_id } = req.validated.body;

    // validate OTP with correct format
    const normalizedOtp = String(otp).trim();
    if (!/^\d*$/.test(normalizedOtp)) {
        throw new AppError(
            ErrorCode.VALIDATION_INVALID_FORMAT,
            {
                message: "OTP in wrong format!, Please Enter numbers for OTP.",
                details: [
                    {
                        field: "otp",
                        issue: "OTP in wrong format!, Please Enter numbers for OTP."
                    }
                ]
            }
        );
    }

    // find otp by verification ID
    const otpUser = await registrationOtpModel.findOne({ verification_id: verification_id })
    if (!otpUser) {
        throw new AppError(
            ErrorCode.RESOURCE_NOT_FOUND,
            {
                message: "OTP is not exist!",
            }
        );
    }

    // check if otp is exist
    if (!otpUser.hash_otp) {
        throw new AppError(
            ErrorCode.RESOURCE_NOT_FOUND,
            {
                message: "OTP is dose not exist!",
            }
        );
    }

    // check if OTP is expired
    if (otpUser.expiresAt <= new Date()) {
        throw new AppError(
            ErrorCode.OTP_EXPIRED,
            {
                message: "OTP is Expired!, Please request a new OTP"
            }
        );
    }

    // check if agreement is ok
    if (!otpUser.accept_agreement) {
        throw new AppError(
            ErrorCode.VALIDATION_FIELD_REQUIRED,
            {
                message: "You'r not agree with Terms of services and Privacy Policy!",
                details: [
                    {
                        field: 'termsAccepted',
                        issue: "You'r not agree with Terms of services and Privacy Policy!"
                    }
                ]
            }
        )
    }

    // check if agreement version is existed
    if (!AGREEMENT_VERSION) {
        throw new AppError(
            ErrorCode.INTERNAL_SERVER_ERROR,
            {
                message: "We can't complete your registration right now. Please try again later.",
            }
        );
    }

    // check is attempt ok
    const updatedOtpUser = await registrationOtpModel.findOneAndUpdate(
        {
            _id: otpUser._id,
            attempts: { $gt: 0 }
        },
        {
            $inc: { attempts: -1 }
        },
        {
            new: true
        }
    );

    if (!updatedOtpUser) {
        throw new AppError(
            ErrorCode.RATE_LIMIT_EXCEEDED,
            {
                message: "Maximum attempts exceeded!. Please try again later.",
            },
        );
    }

    // compare otp with user inputs
    const compOtp = await bcrypt.compare(normalizedOtp, otpUser.hash_otp)
    if (!compOtp) {
        throw new AppError(
            ErrorCode.AUTH_INVALID_CREDENTIALS,
            {
                message: "Invalid OTP!. Please try again.",
            }
        );
    }

    // check role is correct
    if (!['customer', 'seller'].includes(otpUser.role)) {
        throw new AppError(
            ErrorCode.VALIDATION_INVALID_FORMAT,
            {
                message: "Invalid role selection!. Please Try again.",
            }
        );
    }

    // == Start Transaction ==
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // create user 
        const [user] = await Users.create([{
            email: otpUser.email,
            password: otpUser.hash_password || undefined,
            role: otpUser.role,
            agreement: otpUser.accept_agreement
        }], { session });

        // create user profile
        let userProfile;
        if (otpUser.role === 'customer') {
            [userProfile] = await CustomerProfile.create([{ ...otpUser.profile_data, user_id: user._id }], { session });
        }
        else if (otpUser.role === 'seller') {
            [userProfile] = await SellerProfile.create([{ ...otpUser.profile_data, user_id: user._id }], { session });
        }

        // Delete temporary OTP data
        await registrationOtpModel.deleteOne(
            { _id: otpUser._id },
            { session }
        );

        // create jwt token for user and save it in database
        const { accessToken, refreshToken } = createTokenPair(user, { rememberMe: false });
        await createRefreshToken(
            req,
            user,
            refreshToken,
            {
                rememberMe: false,
                session,
            }
        );

        // commit transaction
        await session.commitTransaction();

        // save token in to cookies			
        createCookies(res, refreshToken, { rememberMe: false });

        // send response
        return res.status(StatusCode.CREATED).json({
            success: true,
            message: `${user.role} registered successfully!`,
            user: {
                _id: user._id,
                email: user.email,
                role: user.role,
                accessToken: accessToken
            },
            userProfile,
        });

    }
    catch (error) {
        await session.abortTransaction();
        throw error;
    }
    finally {
        await session.endSession();
    }
    // == End Transaction ==

});

// resend otp controller
const resendOtp = asyncHandler(async (req, res) => {
    const { verification_id } = req.validated.body;

    // Get data from registrationOtpModel
    const otpUser = await registrationOtpModel.findOne({ verification_id: verification_id });
    if (!otpUser) {
        throw new AppError(
            ErrorCode.RESOURCE_NOT_FOUND,
            {
                message: "Failed to resend OTP!. Please try again later.",
            }
        );
    }

    if (otpUser.session_expiresAt <= new Date()) {
        throw new AppError(
            ErrorCode.OTP_EXPIRED,
            {
                message: "OTP session is expired!. Please re register again to get new OTP.",
            }
        );
    }

    // set cooldown time 
    const cooldownPeriod = 60 * 1000;

    // get now time
    const now = Date.now();

    // store previous state of otpUser to rollback in case of error
    const previousState = {
        hash_otp: otpUser.hash_otp,
        attempts: otpUser.attempts,
        expiresAt: otpUser.expiresAt,
        lastResendAt: otpUser.lastResendAt,
        resendCount: otpUser.resendCount,
    };

    // set reservation time for lastResendAt
    const reservationTime = new Date();

    // generate reservation id
    const reservationId = crypto.randomUUID();

    // get reserved otp user with conditions
    const reservedOtpUser = await registrationOtpModel.findOneAndUpdate(
        {
            verification_id,
            resendCount: { $lt: 4 },
            session_expiresAt: { $gt: new Date() },
            reservation_id: null,
            $or: [
                { lastResendAt: null },
                { lastResendAt: { $lte: new Date(now - cooldownPeriod) } },
            ],
        },
        {
            $set: {
                lastResendAt: reservationTime,
                reservation_id: reservationId,
            },
            $inc: { resendCount: 1 },
        },
        { new: true }
    );

    // if reservation user is not with conditions
    if (!reservedOtpUser) {
        const latestOtpUser = await registrationOtpModel.findOne({ verification_id });

        // check cooldown time is competed 
        if (latestOtpUser?.lastResendAt && (now - latestOtpUser.lastResendAt.getTime()) < cooldownPeriod) {
            throw new AppError(
                ErrorCode.RATE_LIMIT_EXCEEDED,
                {
                    message: "You can only request a new OTP once per minute. Please wait before trying again.",
                }
            );
        }

        // check resend count is exceeded
        if (latestOtpUser?.resendCount >= 4) {
            throw new AppError(
                ErrorCode.RATE_LIMIT_EXCEEDED,
                {
                    message: "You have reached the maximum number of OTP resend attempts. Please try again later.",
                }
            );
        }

        // send Error response
        throw new AppError(
            ErrorCode.EXTERNAL_SERVICE_UNAVAILABLE,
            {
                message: "OTP resend is temporarily unavailable. Please try again in a moment.",
            },
        );
    }

    try {
        // generate new otp for resent
        const newOtp = crypto.randomInt(100000, 1000000).toString();
        const hashNewOtp = await bcrypt.hash(newOtp, 10);


        // update otp in database with new hash and reset attempts
        const updateNewResentUser = await registrationOtpModel.findOneAndUpdate(
            {
                verification_id,
                lastResendAt: reservationTime,
                reservation_id: reservationId,
                resendCount: reservedOtpUser.resendCount,
            },
            {
                $set: {
                    hash_otp: hashNewOtp,
                    attempts: 5,
                    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
                },
            },
            { new: true }
        );

        // check if failed to get updateNewResentUser
        if (!updateNewResentUser) {
            throw new AppError(
                ErrorCode.WRITE_CONFLICT_ERROR,
                {
                    message: "Failed to update database while sending email!. Please try again.",
                }
            );
        };

        // resend otp via email
        await resendEmailOTP(otpUser.email, newOtp);

        // if email is successfully send remove that reservation id value
        await registrationOtpModel.findOneAndUpdate(
            {
                verification_id,
                reservation_id: reservationId
            },
            {
                $set: {
                    reservation_id: null,
                },
            },
            { new: true }
        )

        // send response
        return res.status(StatusCode.OK).json({
            success: true,
            message: 'OTP resend successfully...',
            expiresAt: updateNewResentUser.expiresAt,
        });

    } catch (error) {
        // rollback the lastResendAt and resendCount to previous state
        await registrationOtpModel.findOneAndUpdate(
            {
                verification_id,
                lastResendAt: reservationTime,
                reservation_id: reservationId,
            },
            {
                $set: {
                    hash_otp: previousState.hash_otp,
                    attempts: previousState.attempts,
                    expiresAt: previousState.expiresAt,
                    lastResendAt: previousState.lastResendAt,
                    resendCount: previousState.resendCount,
                    reservation_id: null,
                },
            },
            { new: true }
        );
        throw error;
    }
})

module.exports = {
    verifyOtp,
    resendOtp
};
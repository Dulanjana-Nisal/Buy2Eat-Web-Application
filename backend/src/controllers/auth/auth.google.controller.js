// import third party libraries
const axios = require('axios');
const crypto = require('crypto');
const mongoose = require('mongoose');

// import google client
const { OAuth2Client } = require("google-auth-library");
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, AGREEMENT_VERSION } = require("../../config/env");

// import database models
const Users = require('../../models/userModel');
const GoogleRegisterModel = require('../../models/googleRegisterModel');
const CustomerProfile = require('../../models/customerProfileModel');
const SellerProfile = require('../../models/sellerProfileModel');

// import errors handlers
const AppError = require("../../errors/AppError");
const { ErrorCode, StatusCode } = require("../../constants");
const asyncHandler = require("../../middleware/asyncHandler");

// import token creation service
const { createRefreshToken, createTokenPair, createCookies } = require("../../services/tokenCreationService");
const OTPHelper = require("../../services/OTPHelper");

// get google client
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// Google auth for users
const googleAuth = asyncHandler(async (req, res) => {
    const { code } = req.body;

    // check google code is exist
    if (!code) {
        throw new AppError(
            ErrorCode.VALIDATION_FIELD_REQUIRED,
            { message: "Google authorization code is required!" },
        );
    }

    // convert authorization code in to google token
    let tokenResponse;
    try {
        tokenResponse = await axios.post(
            'https://oauth2.googleapis.com/token',
            {
                code,
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                redirect_uri: 'postmessage',
                grant_type: 'authorization_code'
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10_000
            }
        )
    }
    catch (err) {
        throw err;
    }

    // get token id
    const { id_token } = tokenResponse.data;

    if (!id_token) {
        throw new AppError(
            ErrorCode.VALIDATION_FIELD_REQUIRED,
            { message: "Google ID token was not received!" },
        );
    }

    // token verification
    const ticket = await client.verifyIdToken({
        idToken: id_token,
        audience: GOOGLE_CLIENT_ID
    });

    // get payload form ticket
    const { email, email_verified, sub, picture, given_name, family_name, name } = ticket.getPayload();

    // check email is verified
    if (!email_verified) {
        throw new AppError(
            ErrorCode.AUTH_MISSING_TOKEN,
            { message: "Email is not verified in Google!" }
        );
    }

    // check user already exist
    const user = await Users.findOne({ email });

    if (!user) {

        // Generate and hash register token
        const registerToken = crypto.randomBytes(32).toString('hex');
        const hashedRegisterToken = crypto.createHash('sha256').update(registerToken).digest('hex');

        // check if google register user already exist
        const existUser = await GoogleRegisterModel.findOneAndUpdate(
            {
                email: email,
                google_id: sub,
            },
            {
                $set: {
                    registration_token: hashedRegisterToken,
                    expiresAt: new Date(Date.now() + 40 * 60 * 1000) // expired in 40 minutes
                }
            },
            {
                new: true,
            }
        );

        if (!existUser) {
            // create new google register user
            const googleRegisterUser = await GoogleRegisterModel.create({
                google_id: sub,
                email: email,
                first_name: given_name || name || "User",
                last_name: family_name || undefined,
                profile_image: picture,
                registration_token: hashedRegisterToken,
                expiresAt: new Date(Date.now() + 40 * 60 * 1000) // expired in 40 minutes
            });

            if (!googleRegisterUser) {
                throw new AppError(
                    ErrorCode.WRITE_CONFLICT_ERROR,
                    { message: "Error while google registration!" }
                );
            }
        }

        // register user
        return res.status(StatusCode.CREATED).json({
            success: true,
            isRegistered: false,
            register_token: registerToken
        });

    }

    // update user
    if (user.google_id && user.google_id !== sub) {
        throw new AppError(
            ErrorCode.AUTH_MISSING_TOKEN,
            { message: "Google account linked to another account!" }
        );
    }

    // link account if not link to another account
    let linkedNow = false;
    if (!user.google_id) {
        user.google_id = sub;
        await user.save();
        linkedNow = true
    }

    // update user profiles
    if (picture) {
        try {
            // if customer
            if (user.role === 'customer') {
                await CustomerProfile.findOneAndUpdate(
                    {
                        user_id: user._id
                    },
                    {
                        $set: {
                            profile_image: picture,

                        }
                    },
                    { new: true }
                )
            }
            // if seller
            if (user.role === 'seller') {
                await SellerProfile.findOneAndUpdate(
                    {
                        user_id: user._id
                    },
                    {
                        $set: {
                            profile_image: picture,

                        }
                    },
                    { new: true }
                )
            }
        }
        catch (err) {
            if (linkedNow) {
                await Users.updateOne({ _id: user._id }, { $unset: { google_id: 1 } });
            }

            // send response
            throw new AppError(
                ErrorCode.WRITE_CONFLICT_ERROR,
                { message: "Error while update profile!" }
            );
        }
    }

    // create jwt tokens and save it into cookie
    const { accessToken, refreshToken } = createTokenPair(user, { rememberMe: true });
    try {
        await createRefreshToken(req, user, refreshToken, { rememberMe: true });
        createCookies(res, refreshToken, { rememberMe: true });
    }
    catch (err) {
        throw new AppError(ErrorCode.WRITE_CONFLICT_ERROR, { message: "Error while generating token!" });
    }

    // send response
    return res.status(StatusCode.OK).json({
        success: true,
        isRegistered: true,
        message: 'User logged in successfully!',
        user: {
            _id: user._id,
            email: user.email,
            role: user.role,
            accessToken: accessToken
        }
    });

})

// Google Registration
const googleRegistration = asyncHandler(async (req, res) => {
    const { registerToken, role, phone_number, accept_agreement } = req.validated.body;

    // check if registerToken is exist
    if (!registerToken) {
        throw new AppError(
            ErrorCode.VALIDATION_FIELD_REQUIRED,
            { message: "Google registration failed!" }
        );
    }

    // check if accept agreement
    if (!accept_agreement || typeof accept_agreement !== "boolean") {
        throw new AppError(
            ErrorCode.VALIDATION_FIELD_REQUIRED,
            {
                message: "Please agree with Terms of services and Privacy Policy",
                details: [
                    {
                        field: 'termsAccepted',
                        issue: 'Please agree with Terms of services and Privacy Policy'
                    }
                ]
            }
        );
    }

    // create hash token for verification
    const tokenHash = crypto.createHash('sha256').update(registerToken).digest('hex');

    // check if user exist in registry
    const googleRegisteredUser = await GoogleRegisterModel.findOne(
        {
            registration_token: tokenHash,
            expiresAt: {
                $gt: new Date()
            }
        }
    );

    if (!googleRegisteredUser) {
        throw new AppError(
            ErrorCode.AUTH_EXPIRED_TOKEN,
            { message: "Your session timed out. Reconnect Google to save your info." }
        );
    }

    // check if user exist again
    const existUserAgain = await Users.findOne({ email: googleRegisteredUser.email });
    if (existUserAgain) {
        throw new AppError(
            ErrorCode.RESOURCE_ALREADY_EXISTS,
            { message: "User already exist!" }
        );
    }

    // check agreement version existed
    if (!AGREEMENT_VERSION) {
        throw new AppError(
            ErrorCode.INTERNAL_SERVER_ERROR,
            { message: "We can't complete your registration right now. Please try again later." }
        );
    }

    // set agreement data
    const agreementData = {
        accepted: accept_agreement,
        version: AGREEMENT_VERSION,
        acceptedAt: new Date(),
    }

    // ===== Start Transaction =====
    const session = await mongoose.startSession();

    // If all things passed
    try {
        session.startTransaction();

        let profile_data;
        if (role === 'customer') {
            // set profile_data
            profile_data = {
                first_name: googleRegisteredUser.first_name,
                last_name: googleRegisteredUser.last_name,
                addresses: [],
                profile_image: googleRegisteredUser.profile_image,
                favorite_shops: [],
                favorite_foods: [],
                phone_number: phone_number,
            }
        }

        else if (role === 'seller') {
            // set profile_data
            profile_data = {
                first_name: googleRegisteredUser.first_name,
                last_name: googleRegisteredUser.last_name,
                profile_image: googleRegisteredUser.profile_image,
                phone_number: phone_number,
            }
        }

        // send OTP to user
        const sendOTP = await OTPHelper({
            normalizedEmail: googleRegisteredUser.email,
            role,
            hashedPassword: undefined,
            profile_data,
            session,
            accept_agreement: agreementData,
        });

        // send response
        if (!sendOTP?.success) {
            throw new AppError(
                ErrorCode.OTP_SEND_FAILED,
                { message: "Send OTP Failed!" }
            );
        }

        // if all things are success delete google Register user
        await GoogleRegisterModel.deleteOne(
            { _id: googleRegisteredUser._id },
            { session }
        );

        await session.commitTransaction(); // commit transaction

        return res.status(StatusCode.OK).json({
            success: sendOTP.success,
            message: sendOTP.message,
            verification_id: sendOTP.verification_id,
            masked_email: sendOTP.masked_email,
            expiresAt: sendOTP.expiresAt,
            register_with: 'google'
        });

    }
    catch (err) {
        await session.abortTransaction();
        throw err;
    }
    finally {
        await session.endSession();
    }
    // ===== End Transaction =====

});

module.exports = {
    googleAuth,
    googleRegistration
}
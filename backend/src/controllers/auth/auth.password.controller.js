// import third party libraries
const mongoose = require("mongoose");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

// import database models
const Users = require("../../models/userModel");
const resetPasswordModel = require("../../models/resetPasswordModel");
const refreshTokenModel = require("../../models/refreshTokenModel");

// import error handler and constants
const asyncHandler = require("../../middleware/asyncHandler");
const AppError = require("../../errors/AppError");
const { StatusCode, ErrorCode } = require("../../constants");

// import token creation service and email service
const { sendEmailResetPassword } = require("../../utils/sendEmails");
const { createTokenPair, createRefreshToken, createCookies } = require("../../services/token.service");
const { CLIENT_URL } = process.env;

// forgot password controller
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.validated.body;

    // check email is exits
    const normalizedEmail = email.trim().toLowerCase();
    const user = await Users.findOne({ email: normalizedEmail });
    if (!user) {
        return res.status(StatusCode.OK).json({
            success: true,
            message: "If an account exists with this email, a password reset link will be sent. Check your email."
        })
    }

    // generate new reset password token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // date and time variables
    const nowDate = new Date();
    const coolDownTime = new Date(Date.now() - 60 * 1000);
    const expiredAtTime = new Date(Date.now() + 15 * 60 * 1000)

    // generate reset link
    const resetLink = `${CLIENT_URL}/reset-password/${resetToken}` // this link should be change with frontend ( with frontend PORT )

    // check if have any old data with same user ID  
    const oldForgotPassword = await resetPasswordModel.findOneAndUpdate(
        {
            user_id: user._id,
            createdAt: { $lte: coolDownTime }, // check cooldown time is over (1 minute)
        },
        {
            $set: {
                resetPasswordToken: hashResetToken,
                createdAt: nowDate,
                expiredAt: expiredAtTime // set to 15 minutes
            }
        },
        { new: true }
    );

    // if oldForgotPassword is false
    if (!oldForgotPassword) {

        // fetch forgot password data
        const passwordUser = await resetPasswordModel.findOne({ user_id: user._id })

        // check if user dose not exist
        if (!passwordUser) {
            try {
                // store brand new forgot password data in to database
                await resetPasswordModel.create(
                    {
                        user_id: user._id,
                        resetPasswordToken: hashResetToken,
                        createdAt: nowDate,
                        expiredAt: expiredAtTime, // set to 15 minutes
                    }
                );

            }
            catch (err) {
                // send Error response 
                return res.status(StatusCode.OK).json({
                    success: true,
                    message: "If an account exists with this email, a password reset link will be sent. Check your email."
                })
            }

            try {
                // send reset password link to user email
                await sendEmailResetPassword(normalizedEmail, resetLink);

                // send response 
                return res.status(StatusCode.OK).json({
                    success: true,
                    message: "If an account exists with this email, a password reset link will be sent. Check your email."
                })
            }
            catch (err) {

                // delete database
                await resetPasswordModel.deleteOne({
                    user_id: user._id,
                    resetPasswordToken: hashResetToken
                });

                // send Error response 
                return res.status(StatusCode.OK).json({
                    success: true,
                    message: "If an account exists with this email, a password reset link will be sent. Check your email."
                })
            }
        }

        // check that have complete cool down
        const lastCreatedTime = passwordUser.createdAt.getTime();
        const currentTime = nowDate.getTime();
        const oneMinuteInMs = 60 * 1000;

        if (currentTime - lastCreatedTime < oneMinuteInMs) {
            throw new AppError(
                ErrorCode.RATE_LIMIT_EXCEEDED,
                {
                    message: "You can only resend OTP once per minute. Please wait before trying again.",
                }
            );
        }
    }

    // if oldForgotPassword is true
    try {

        // send reset password link to user email
        await sendEmailResetPassword(normalizedEmail, resetLink);

        // send response 
        return res.status(StatusCode.OK).json({
            success: true,
            message: "If an account exists with this email, a password reset link will be sent. Check your email."
        })

    }
    catch (err) {
        const setDefaultData = await resetPasswordModel.findOneAndUpdate(
            {
                user_id: user._id,
                resetPasswordToken: hashResetToken
            },
            {
                $set: {
                    expiredAt: new Date(),
                }
            },
            { new: true }
        );

        if (!setDefaultData) {
            return res.status(StatusCode.OK).json({
                success: true,
                message: "If an account exists with this email, a password reset link will be sent. Check your email."
            })
        }

        // send Error response 
        return res.status(StatusCode.OK).json({
            success: true,
            message: "If an account exists with this email, a password reset link will be sent. Check your email."
        })
    }

});

// reset password controller
const resetPassword = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.validated.body;

    // check password have enough characters
    if (newPassword.length < 8) {
        throw new AppError(
            ErrorCode.PASSWORD_TOO_WEAK,
            {
                message: "New Password must have more that 8 Numbers!",
                details: [
                    {
                        field: 'newPassword',
                        issue: "New Password must have more that 8 Numbers!"
                    }
                ]
            }
        );
    }

    // === Start Transaction ===
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // check that token is exist on database model
        const hashToken = crypto.createHash("sha256").update(token).digest("hex");
        const resetUser = await resetPasswordModel.findOne(
            {
                resetPasswordToken: hashToken,
                expiredAt: { $gt: new Date() }
            },
            null,
            { session }
        );

        if (!resetUser) {
            // Abort transaction
            await session.abortTransaction();

            throw new AppError(
                ErrorCode.PASSWORD_RESET_TOKEN_INVALID,
                {
                    message: "Your reset password link is expired or Invalid token!",
                }
            );
        }

        // hash password using bcrypt
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // update user
        const updateUser = await Users.findOneAndUpdate(
            {
                _id: resetUser.user_id,
            },
            {
                $set: {
                    password: hashedPassword,
                }
            },
            { new: true, session }
        );

        if (!updateUser) {
            // Abort transaction
            await session.abortTransaction();

            throw new AppError(
                ErrorCode.RESOURCE_NOT_FOUND,
                {
                    message: "User does not exist!",
                }
            );
        }

        // delete forgot password data from database
        await resetPasswordModel.deleteOne(
            { _id: resetUser._id },
            { session }
        );

        // get refresh data from specific user 
        const storedRefreshToken = await refreshTokenModel.findOne(
            { user_id: updateUser._id },
            null,
            { session }
        )

        // if refresh token model data not found
        if (!storedRefreshToken) {
            throw new AppError(
                ErrorCode.AUTH_MISSING_TOKEN,
                {
                    message: "Can't Reset your Password!. Please try again later.",
                }
            );
        }

        // update refreshTokenModel database
        await refreshTokenModel.updateMany(
            { user_id: updateUser._id },
            {
                $set: {
                    isRevoked: true,
                }
            },
            { session }
        )

        // get valid time zone
        const newRefreshExpire = storedRefreshToken.expiresAt;

        // create jwt tokens
        const refreshRemaining = Math.floor((newRefreshExpire.getTime() - Date.now()) / 1000);
        const { accessToken, refreshToken } = createTokenPair(
            updateUser,
            { refreshExpire: refreshRemaining, rememberMe: storedRefreshToken.rememberMe }
        );

        // save refresh token in to database
        await createRefreshToken(
            req,
            updateUser,
            refreshToken,
            {
                rememberMe: storedRefreshToken.rememberMe,
                oldFamilyId: storedRefreshToken.familyId,
                refreshExpiry: newRefreshExpire,
                session,
            }
        );

        // commit transaction
        await session.commitTransaction();

        // crete cookies for refresh token
        createCookies(res, refreshToken, { refreshExpiry: storedRefreshToken.expiresAt, rememberMe: storedRefreshToken.rememberMe });


        // send success response
        return res.status(StatusCode.OK).json({
            success: true,
            accessToken: accessToken,
            message: 'Password Reset successfully'
        })
    }
    catch (err) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        throw err
    }
    finally {
        await session.endSession();
    }

    // === End Transaction ===

});

// verify reset password controller
const verifyResetPassword = asyncHandler(async (req, res) => {
    const { token } = req.validated.params;

    // hashed token
    const hashResetToken = crypto.createHash("sha256").update(token).digest("hex");

    // check token is exist
    const resetUser = await resetPasswordModel.findOne(
        {
            resetPasswordToken: hashResetToken,
            expiredAt: { $gt: new Date() },
        }
    )
    if (!resetUser) {
        throw new AppError(
            ErrorCode.PASSWORD_RESET_TOKEN_INVALID,
            {
                message: "Your reset password URL is expired or wrong URL!. Generate new URL and try again.",
            }
        );
    }

    // send response
    return res.status(StatusCode.OK).json({
        success: true,
        message: 'Token is ok'
    })
})

module.exports = {
    forgotPassword,
    resetPassword,
    verifyResetPassword,
};
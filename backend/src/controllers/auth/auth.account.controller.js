// import third party libraries
const bcrypt = require('bcryptjs');

// import database models
const Users = require('../../models/userModel');
const refreshTokenModel = require("../../models/refreshTokenModel");

// import error handlers
const asyncHandler = require("../../middleware/asyncHandler");
const AppError = require("../../errors/AppError");
const { ErrorCode } = require("../../constants");
const { StatusCode } = require("../../constants");

// import token creation services
const { createTokenPair, createRefreshToken, createCookies, hash, clearCookie } = require("../../services/token.service");
const OTPHelper = require("../../services/otp.service");
const { AGREEMENT_VERSION } = require("../../config/env");

// login auth for all role
const authLogin = asyncHandler(async (req, res) => {
    const { email, password, rememberMe } = req.validated.body;

    // check password have more that 8 characters
    if (password.length < 8) {
        throw new AppError(
            ErrorCode.PASSWORD_TOO_WEAK,
            {
                details: [
                    {
                        field: 'password',
                        issue: "Password must have at least 8 characters"
                    }
                ]
            }
        );
    }

    // normalized email
    const normalizedEmail = email.trim().toLowerCase();

    // check if user exist
    const user = await Users.findOne({ email: normalizedEmail });
    if (!user) {
        throw new AppError(
            ErrorCode.AUTH_INVALID_CREDENTIALS,
            {
                message: "Invalid email or password",
            }
        );
    }

    // check password is exist on database
    if (!user.password) {
        throw new AppError(
            ErrorCode.AUTH_INVALID_CREDENTIALS,
            { message: "Invalid email or password" }
        );
    }

    // check password
    const checkPass = await bcrypt.compare(password, user.password);
    if (!checkPass) {
        throw new AppError(
            ErrorCode.AUTH_INVALID_CREDENTIALS,
            { message: "Invalid email or password" },
        );
    }

    // create jwt tokens and save it into cookie
    const { accessToken, refreshToken } = createTokenPair(user, { rememberMe: rememberMe });
    try {
        await createRefreshToken(req, user, refreshToken, { rememberMe });
        createCookies(res, refreshToken, { rememberMe });
    }
    catch (err) {
        throw new AppError(ErrorCode.WRITE_CONFLICT_ERROR, { message: "Error while generating token!. Try again later." });
    }

    // send response
    return res.status(StatusCode.OK).json({
        success: true,
        message: 'User logged in successfully!',
        user: {
            _id: user._id,
            email: user.email,
            role: user.role,
            accessToken: accessToken
        }
    });
});

// Register auth for customers
const registerCustomers = asyncHandler(async (req, res) => {
    const {
        first_name,
        last_name,
        email,
        password,
        conformPass,
        phone_number,
        accept_agreement,
    } = req.validated.body;

    // check password have more that 8 characters
    if (password.length < 8) {
        throw new AppError(
            ErrorCode.PASSWORD_TOO_WEAK,
            {
                message: "Password must have at least 8 characters",
                details: [
                    {
                        field: 'password',
                        issue: 'Password must have at least 8 characters'
                    }
                ]
            }
        );
    }

    // check password and conform password are same 
    if (password !== conformPass) {
        throw new AppError(
            ErrorCode.VALIDATION_INVALID_FORMAT,
            {
                message: "Passwords do not match",
                details: [
                    {
                        field: 'confPass',
                        issue: 'Passwords do not match'
                    }
                ]
            }
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

    // check user is exist
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await Users.findOne({ email: normalizedEmail });
    if (existingUser) {
        throw new AppError(
            ErrorCode.RESOURCE_ALREADY_EXISTS,
            {
                message: "Email is already registered!"
            }
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

    // hash password using bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // set profile_data
    const profile_data = {
        first_name: first_name,
        last_name: last_name,
        addresses: [],
        profile_image: "",
        favorite_shops: [],
        favorite_foods: [],
        phone_number: phone_number,
    }

    // send OTP to user
    const sendOTP = await OTPHelper(
        {
            normalizedEmail,
            role: 'customer',
            hashedPassword,
            profile_data,
            accept_agreement: agreementData,
        }
    );

    // if otp is failed to send
    if (!sendOTP?.success) {
        throw new AppError(
            ErrorCode.OTP_SEND_FAILED,
            {
                message: "Send OTP Failed!"
            }
        );
    }

    // send response
    return res.status(StatusCode.OK).json({
        success: sendOTP.success,
        message: sendOTP.message,
        verification_id: sendOTP.verification_id,
        masked_email: sendOTP.masked_email,
        expiresAt: sendOTP.expiresAt,
        register_with: 'email'
    });

});

// Register auth for sellers
const registerSellers = asyncHandler(async (req, res) => {
    const {
        first_name,
        last_name,
        email,
        password,
        conformPass,
        phone_number,
        accept_agreement,
    } = req.validated.body;

    // check password have more that 8 characters
    if (password.length < 8) {
        throw new AppError(
            ErrorCode.PASSWORD_TOO_WEAK,
            {
                message: "Password must have at least 8 characters",
                details: [
                    {
                        field: "password",
                        issue: "Password must have at least 8 characters"
                    }
                ]
            }
        );
    }

    // check password and conform password are same 
    if (password !== conformPass) {
        throw new AppError(
            ErrorCode.VALIDATION_INVALID_FORMAT,
            {
                message: "Passwords do not match",
                details: [
                    {
                        field: 'confPass',
                        issue: 'Passwords do not match'
                    }
                ]
            }
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

    // check user is already exist
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await Users.findOne({ email: normalizedEmail });
    if (existingUser) {
        throw new AppError(
            ErrorCode.RESOURCE_ALREADY_EXISTS,
            {
                message: "Email is already registered!"
            }
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

    // hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt);

    // set profile_data
    const profile_data = {
        first_name: first_name,
        last_name: last_name,
        profile_image: "",
        phone_number: phone_number,
    }

    // send OTP to user
    const sendOTP = await OTPHelper(
        {
            normalizedEmail,
            role: 'seller',
            hashedPassword,
            profile_data,
            accept_agreement: agreementData,
        }
    );

    // if otp is failed to send
    if (!sendOTP?.success) {
        throw new AppError(
            ErrorCode.OTP_SEND_FAILED,
            {
                message: "Send OTP Failed!"
            }
        );
    }

    // send response
    return res.status(StatusCode.OK).json({
        success: sendOTP.success,
        message: sendOTP.message,
        verification_id: sendOTP.verification_id,
        masked_email: sendOTP.masked_email,
        expiresAt: sendOTP.expiresAt,
        register_with: 'email'
    });

});

// User logout 
const userLogout = asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken;

    if (!token) {
        throw new AppError(
            ErrorCode.AUTH_MISSING_TOKEN,
            {
                message: "Your Authentication token is missing!"
            }
        )
    }

    // clear refresh token database data
    await refreshTokenModel.findOneAndUpdate(
        {
            hashToken: hash(token),
        },
        {
            isRevoked: true,
        }
    )

    // clear refresh token cookies
    clearCookie(res);

    // send response
    res.status(StatusCode.OK).json({
        success: true,
        message: 'User successfully logout...'
    })
});

module.exports = {
    authLogin,
    registerCustomers,
    registerSellers,
    userLogout,
}
const { REFRESH_SECRET, CLIENT_URL, GOOGLE_CLIENT_SECRET, GOOGLE_CLIENT_ID, AGREEMENT_VERSION } = require('../config/env');
const asyncHandler = require('../middleware/asyncHandler');
const Users = require('../models/userModel');
const CustomerProfile = require('../models/customerProfileModel');
const SellerProfile = require('../models/sellerProfileModel');
const GoogleRegisterModel = require('../models/googleRegisterModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmailResetPassword, resendEmailOTP } = require('../utils/sendEmails');
const { OAuth2Client } = require('google-auth-library');
const registrationOtpModel = require('../models/registrationOtpModel');
const resetPasswordModel = require('../models/resetPasswordModel');
const mongoose = require('mongoose');
const OTPHelper = require('../services/OTPHelper');
const axios = require('axios');
const { StatusCode, ErrorCode } = require('../constants');
const AppError = require('../errors/AppError');
const { createTokenPair, hash, clearCookie, createCookies, createRefreshToken } = require('../services/tokenCreationService');
const refreshTokenModel = require('../models/refreshTokenModel');





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

// refresh token auth for generate new tokens
const refreshToken = asyncHandler(async (req, res) => {
	const incomingRefreshToken = req.cookies?.refreshToken;

	// check refresh token is exist
	if (!incomingRefreshToken) {
		throw new AppError(
			ErrorCode.AUTH_MISSING_TOKEN,
			{
				message: "Refresh token is missing.",
			}
		);
	}

	let decoded;
	try {
		// Decode refresh token
		decoded = jwt.verify(incomingRefreshToken, REFRESH_SECRET, { algorithms: ['HS256'] });
	}
	catch (err) {
		// clear cookie
		clearCookie(res);

		throw new AppError(
			ErrorCode.AUTH_INVALID_REFRESH_TOKEN,
			{
				message: "Invalid Session!",
			},
		);
	}

	// ======== Start Transaction ======== //
	const session = await mongoose.startSession();
	let result = null;
	let tokens = null;

	try {
		await session.withTransaction(async () => {

			// add default value as null
			result = null;
			tokens = null;

			// check if refresh token exit in database
			const storedRefreshToken = await refreshTokenModel.findOneAndUpdate(
				{
					hashToken: hash(incomingRefreshToken),
					isRevoked: false,
					expiresAt: { $gt: new Date() }
				},
				{
					$set: { isRevoked: true }
				},
				{ session }
			);

			// if storedRefreshToken is failed
			if (!storedRefreshToken) return;

			// find user with belong to jwt token
			const user = await Users.findById(decoded._id);

			// check user is exist with decode user id
			if (!user) {
				throw new AppError(
					ErrorCode.AUTH_INVALID_CREDENTIALS,
					{
						message: "User not Authorized!",
					}
				);
			}

			// check that refresh token id and database refresh token id is match or not
			if (String(storedRefreshToken.user_id) !== String(decoded._id)) {
				throw new AppError(
					ErrorCode.AUTH_INVALID_CREDENTIALS,
					{
						message: "Invalid session!. Please login back.",
					}
				);
			}

			// get valid time zone
			const newRefreshExpire = storedRefreshToken.expiresAt;

			// create new jwt tokens and save it into cookie
			const refreshRemaining = Math.floor((newRefreshExpire.getTime() - Date.now()) / 1000);
			tokens = createTokenPair(
				user,
				{ refreshExpire: refreshRemaining, rememberMe: storedRefreshToken.rememberMe }
			);

			// create cookies
			await createRefreshToken(
				req,
				user,
				tokens.refreshToken,
				{
					rememberMe: storedRefreshToken.rememberMe,
					oldFamilyId: storedRefreshToken.familyId,
					refreshExpiry: newRefreshExpire,
					session,
				}
			);

			result = storedRefreshToken;
		});
	}
	catch (err) {
		if (err instanceof AppError) { clearCookie(res) }
		throw err;
	}
	finally {
		// ======== end Transaction ======== //
		await session.endSession();
	}
	// ======== =============== ======== //

	// if have not refresh token in refreshTokenModel
	if (!result) {

		// clear cookie
		clearCookie(res);

		// Get token data from refreshTokenModel
		const tokenData = await refreshTokenModel.findOne({ hashToken: hash(incomingRefreshToken) });
		if (!tokenData) {
			throw new AppError(
				ErrorCode.AUTH_INVALID_REFRESH_TOKEN,
				{
					message: "Invalid Session or Session expired!. Please login back.",
				}
			);
		}

		// if refresh token is revoked or detect stolen
		if (tokenData.isRevoked) {

			// logout all users belong to same family id
			await refreshTokenModel.updateMany(
				{ familyId: tokenData.familyId, isRevoked: false },
				{
					$set: { isRevoked: true },
				}
			);

			throw new AppError(
				ErrorCode.AUTH_REFRESH_TOKEN_REUSED,
				{
					message: "Session is revoked!. Please login back",
				}
			);
		}

		// if refresh token is expired
		if (tokenData.expiresAt < new Date()) {
			throw new AppError(
				ErrorCode.AUTH_EXPIRED_TOKEN,
				{
					message: "Session expired!. Please login back.",
				}
			);
		}

		// if happened anything else
		throw new AppError(
			ErrorCode.AUTH_INVALID_REFRESH_TOKEN,
			{
				message: "Invalid Session. Please login back.",
			}
		);
	}

	// crete cookies for refresh token
	createCookies(res, tokens.refreshToken, { refreshExpiry: result.expiresAt, rememberMe: result.rememberMe });

	// send response
	return res.status(StatusCode.OK).json({
		success: true,
		accessToken: tokens.accessToken,
		message: 'Sessions refreshed successfully!',
	});

});

module.exports = {
	authLogin,
	googleAuth,
	googleRegistration,
	refreshToken,
	registerCustomers,
	registerSellers,
	userLogout,
	verifyOtp,
	resendOtp,
	forgotPassword,
	resetPassword,
	verifyResetPassword,
};

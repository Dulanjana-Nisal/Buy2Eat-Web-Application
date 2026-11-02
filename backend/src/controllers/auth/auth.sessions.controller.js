// import third party libraries
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// import database models
const Users = require('../../models/userModel');
const refreshTokenModel = require('../../models/refreshTokenModel');

// import error handlers
const asyncHandler = require('../../middleware/asyncHandler');
const AppError = require('../../errors/AppError');
const { StatusCode, ErrorCode } = require('../../constants');

// import token creation services and environment variables
const { createTokenPair, hash, clearCookie, createCookies, createRefreshToken } = require('../../services/token.service');
const { REFRESH_SECRET } = require('../../config/env');


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
    refreshToken,
};
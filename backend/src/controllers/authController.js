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
const { createTokenPair, hash, clearCookie, createCookies, createRefreshToken } = require('../utils/tokenCreation');
const refreshTokenModel = require('../models/refreshTokenModel');

// get google client
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

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
		return res.status(201).json({
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
	const salt = await bcrypt.genSalt(10)
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
				message: "Password must have more that 8 Numbers!",
				details: [
					{
						field: "password",
						issue: "Password must have more that 8 Numbers!"
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
		return res.status(201).json({
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
					message: "You can only resend OTP once per minute. Please wait before trying again.",
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

// User logout 
const userLogout = asyncHandler(async (req, res) => {
	const token = req.cookies?.accessToken;

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

		// update refresh token data in database
		const storedRefreshToken = await refreshTokenModel.findOneAndUpdate(
			{ user_id: updateUser._id },
			{
				$set: {
					isRevoked: true,
				}
			}
		)

		// if refresh token not found
		if (!storedRefreshToken) {
			throw new AppError(
				ErrorCode.AUTH_MISSING_TOKEN,
				{
					message: "Can't Reset your Password!. Please try again later.",
				}
			);
		}

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
		decoded = jwt.verify(incomingRefreshToken, REFRESH_SECRET);
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

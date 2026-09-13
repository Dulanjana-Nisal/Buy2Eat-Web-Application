const { ACCESS_SECRET, ACCESS_EXPIRED, REFRESH_SECRET, REFRESH_EXPIRED, PORT, CLIENT_URL } = require('../config/env');
const asyncHandler = require('../middleware/asyncHandler');
const Users = require('../models/userModel');
const CustomerProfile = require('../models/customerProfileModel');
const SellerProfile = require('../models/sellerProfileModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmailOTP, sendEmailResetPassword, resendEmailOTP } = require('../utils/sendEmails');
const registrationOtpModel = require('../models/registrationOtpModel');
const resetPasswordModel = require('../models/resetPasswordModel');
const mongoose = require('mongoose');
const maskEmail = require('../utils/maskEmail');

// cookie options
const cookieOptions = {
	httpOnly: true,
	sameSite: 'Lax',
	path: '/',
	secure: process.env.NODE_ENV !== 'development',
};

// function for create jwt token
const createTokenPair = (user) => {
	const jwtPayload = {
		_id: user._id,
		email: user.email,
		role: user.role,
	};

	const accessToken = jwt.sign(jwtPayload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRED });
	const refreshToken = jwt.sign(jwtPayload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRED });

	return { accessToken, refreshToken };
};

// function for save tokens in http only cookies
const setAuthCookies = (res, accessToken, refreshToken) => {
	res.cookie('accessToken', accessToken, {
		...cookieOptions,
		maxAge: 15 * 60 * 1000,
	});

	res.cookie('refreshToken', refreshToken, {
		...cookieOptions,
		maxAge: 7 * 24 * 60 * 60 * 1000,
	});
};

// login auth for all role
const authLogin = asyncHandler(async (req, res) => {
	const { email, password } = req.body;

	// check email and password is entered
	if (!email || !password) {
		return res.status(400).json({
			success: false,
			message: 'Please provide email and password',
		});
	}

	// check if user exist
	const user = await Users.findOne({ email: email.toLowerCase() });
	if (!user) {
		return res.status(400).json({
			success: false,
			message: 'User is not registered!',
		});
	}

	// check password have more that 6 characters
	if (password.length < 6) {
		return res.status(400).json({
			success: false,
			message: 'Password must have at least 6 characters!',
		});
	}

	// check password
	const checkPass = await bcrypt.compare(password, user.password);
	if (!checkPass) {
		return res.status(400).json({
			success: false,
			message: 'Password is incorrect!',
		});
	}

	// create jwt tokens and save it into cookie
	const { accessToken, refreshToken } = createTokenPair(user);
	setAuthCookies(res, accessToken, refreshToken);

	// send otp via email
	sendEmailOTP(email, '123456')

	// send response
	return res.status(200).json({
		success: true,
		message: 'User logged in successfully!',
		user: {
			_id: user._id,
			email: user.email,
			role: user.role,
		}
	});
});

// Register auth for customers
const registerCustomers = asyncHandler(async (req, res) => {
	const {
		email,
		password,
		first_name,
		last_name,
		phone_number,
		addresses = [],
		profile_image,
		favorite_shops = [],
		favorite_foods = [],
	} = req.body;

	// check all required fields are filled
	if (!email || !password || !first_name || !last_name || !phone_number) {
		return res.status(400).json({
			success: false,
			message: 'Please provide email, password, first name, last name and phone number',
		});
	}

	// check user is exist
	const normalizedEmail = email.trim().toLowerCase();
	const existingUser = await Users.findOne({ email: normalizedEmail });
	if (existingUser) {
		return res.status(400).json({
			success: false,
			message: 'Email is already registered!',
		});
	}

	// check password have more that 6 characters
	if (password.length < 6) {
		return res.status(400).json({
			success: false,
			message: 'Password must have at least 6 characters!',
		});
	}

	// hash password using bcrypt
	const salt = await bcrypt.genSalt(10)
	const hashedPassword = await bcrypt.hash(password, salt);

	// generate otp
	const generateOtp = crypto.randomInt(100000, 1000000).toString();
	const hashOtp = await bcrypt.hash(generateOtp, 10);

	// generate verification_id 
	const verification_id_value = crypto.randomUUID();

	// delete old OTP from same email
	await registrationOtpModel.deleteMany({ email: normalizedEmail })

	// save otp in database
	const nowDate = new Date();
	const otpCreation = await registrationOtpModel.create({
		verification_id: verification_id_value,
		email: email,
		hash_otp: hashOtp,
		expiresAt: new Date(Date.now() + 5 * 60 * 1000), // expires in 5 min
		session_expiresAt: new Date(nowDate.getTime() + 30 * 60 * 1000), // session expires in 30 min
		role: 'customer',
		hash_password: hashedPassword,
		profile_data: {
			first_name,
			last_name,
			addresses,
			profile_image,
			favorite_shops,
			favorite_foods,
			phone_number,
		}
	})

	// if something wrong wile create database schema
	if (!otpCreation) {
		throw new Error('Error while create database schema!')
	}

	// mask email for sending otp
	const maskedEmail = maskEmail(email);

	// send otp via email
	sendEmailOTP(email, first_name, last_name, generateOtp)

	// send response
	res.status(200).json({
		success: true,
		message: 'OTP send successfully...',
		verification_id: verification_id_value,
		masked_email: maskedEmail,
		expiresAt: otpCreation.expiresAt
	})
});

// Register auth for sellers
const registerSellers = asyncHandler(async (req, res) => {
	const {
		email,
		password,
		first_name,
		last_name,
		phone_number,
		profile_image,
		ratings = 0,
		rank,
	} = req.body;

	// check required fields are filled
	if (!email || !password || !first_name || !last_name || !phone_number) {
		return res.status(400).json({
			success: false,
			message: 'Please provide email, password, first name, last name and phone number',
		});
	}

	// check user is already exist
	const normalizedEmail = email.trim().toLowerCase();
	const existingUser = await Users.findOne({ email: normalizedEmail });
	if (existingUser) {
		return res.status(400).json({
			success: false,
			message: 'Email is already registered!',
		});
	}

	// check password have more that 6 characters
	if (password.length < 6) {
		return res.status(400).json({
			success: false,
			message: 'Password must have at least 6 characters!',
		});
	}

	// hash password
	const salt = await bcrypt.genSalt(10)
	const hashedPassword = await bcrypt.hash(password, salt);

	// generate otp
	const generateOtp = crypto.randomInt(100000, 1000000).toString();
	const hashOtp = await bcrypt.hash(generateOtp, 10);

	// generate verification_id 
	const verification_id_value = crypto.randomUUID();

	// delete old OTP from same email
	await registrationOtpModel.deleteMany({ email: normalizedEmail })

	// save otp in database
	const nowDate = new Date();
	const otpCreation = await registrationOtpModel.create({
		verification_id: verification_id_value,
		email: email,
		hash_otp: hashOtp,
		hash_password: hashedPassword,
		expiresAt: new Date(Date.now() + 5 * 60 * 1000), // expires in 5 min
		session_expiresAt: new Date(nowDate.getTime() + 30 * 60 * 1000), // session expires in 30 min
		role: 'seller',
		profile_data: {
			first_name,
			last_name,
			profile_image,
			phone_number,
			ratings,
			rank,
		}
	})

	// if something wrong while create schema
	if (!otpCreation) {
		throw new Error('Error while create database schema!')
	}

	// mask email for sending otp
	const maskedEmail = maskEmail(email);

	// send otp via email
	sendEmailOTP(email, first_name, last_name, generateOtp)

	// send response
	res.status(200).json({
		success: true,
		message: 'OTP send successfully...',
		verification_id: verification_id_value,
		masked_email: maskedEmail,
		expiresAt: otpCreation.expiresAt
	})
});

// verify otp controller
const verifyOtp = asyncHandler(async (req, res) => {
	const { otp, verification_id } = req.body;

	// check verification_id and otp are entered
	if (!verification_id || !otp) return res.status(400).json({
		success: false,
		message: 'Verification_id and otp is required!'
	})

	// find otp by verification ID
	const otpUser = await registrationOtpModel.findOne({ verification_id: verification_id })
	if (!otpUser) return res.status(400).json({
		success: false,
		message: 'OTP is not exist!'
	})

	// check if otp is exist
	if (!otpUser.hash_otp) return res.status(401).json({
		success: false,
		message: 'OTP is dose not exist!'
	})

	// check if OTP is expired
	if (otpUser.expiresAt <= new Date()) {

		await registrationOtpModel.deleteOne({
			_id: otpUser._id
		});

		return res.status(400).json({
			success: false,
			message: 'OTP is Expired!'
		})
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
		return res.status(429).json({
			success: false,
			message: "Maximum attempts exceeded!"
		});
	}

	// compare otp with user inputs
	const compOtp = await bcrypt.compare(otp, otpUser.hash_otp)
	if (!compOtp) return res.status(400).json({
		success: false,
		message: 'Invalid OTP'
	})

	// == Start Transaction ==
	const session = await mongoose.startSession();

	try {
		session.startTransaction();

		// create user 
		const [user] = await Users.create([{
			email: otpUser.email,
			password: otpUser.hash_password,
			role: otpUser.role,
		}], { session });

		// create user profile
		let userProfile;
		if (otpUser.role === 'customer') {
			[userProfile] = await CustomerProfile.create([{ ...otpUser.profile_data, user_id: user._id }], { session });
		}
		if (otpUser.role === 'seller') {
			[userProfile] = await SellerProfile.create([{ ...otpUser.profile_data, user_id: user._id }], { session });
		}

		// Delete temporary OTP data
		await registrationOtpModel.deleteOne(
			{ _id: otpUser._id },
			{ session }
		);

		await session.commitTransaction();

		// create jwt token and save it in to cookie
		const { accessToken, refreshToken } = createTokenPair(user)
		setAuthCookies(res, accessToken, refreshToken)

		// send response
		return res.status(201).json({
			success: true,
			message: `${user.role} registered successfully!`,
			user: {
				_id: user._id,
				email: user.email,
				role: user.role,
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
	const { verification_id } = req.body;

	if (!verification_id) return res.status(400).json({
		success: false,
		message: 'Verification_id is required!'
	})

	const otpUser = await registrationOtpModel.findOne({ verification_id: verification_id });
	if (!otpUser) return res.status(400).json({
		success: false,
		message: 'Invalid verification_id'
	});

	if (otpUser.session_expiresAt <= new Date()) return res.status(400).json({
		success: false,
		message: 'OTP record was delete, pleas re register to get new OTP!'
	});

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
			return res.status(429).json({
				success: false,
				message: 'You can only resend OTP once per minute. Please wait before trying again.',
			});
		}

		// check resend count is exceeded
		if (latestOtpUser?.resendCount >= 4) {
			return res.status(429).json({
				success: false,
				message: 'You have reached the maximum number of OTP resend attempts. Please try again later.',
			});
		}

		// send response
		return res.status(429).json({
			success: false,
			message: 'OTP resend is temporarily unavailable. Please try again in a moment.',
		});
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
			throw new Error("Failed to update database while sending email!")
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
		return res.status(200).json({
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
	res.clearCookie('accessToken', {
		httpOnly: true,
		sameSite: 'Lax',
		path: '/',
		secure: process.env.NODE_ENV !== 'development',
	})

	res.clearCookie('refreshToken', {
		httpOnly: true,
		sameSite: 'Lax',
		path: '/',
		secure: process.env.NODE_ENV !== 'development',
	})

	// send response
	res.status(200).json({
		success: true,
		message: 'User successfully logout...'
	})
});

// forgot password controller
const forgotPassword = asyncHandler(async (req, res) => {
	const { email } = req.body;

	// check if email is entered
	if (!email) return res.status(400).json({
		success: false,
		message: "Please provide email!"
	});

	// check email is exits
	const normalizedEmail = email.trim().toLowerCase();
	const user = await Users.findOne({ email: normalizedEmail });
	if (!user) return res.status(200).json({
		success: true,
		message: "If an account exists with this email, a password reset link will be sent."
	})

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
				// send response 
				return res.status(500).json({
					success: false,
					message: 'Something wrong while sending Email!'
				})
			}

			try {
				// send reset password link to user email
				await sendEmailResetPassword(normalizedEmail, resetLink);

				// send response 
				return res.status(200).json({
					success: true,
					message: 'Reset link is sent to your email'
				})
			}
			catch (err) {

				// delete database
				await resetPasswordModel.deleteOne({
					user_id: user._id,
					resetPasswordToken: hashResetToken
				});

				// send response 
				return res.status(500).json({
					success: false,
					message: 'Something wrong while sending Email!'
				})
			}
		}

		// check that have complete cool down
		const lastCreatedTime = passwordUser.createdAt.getTime();
		const currentTime = nowDate.getTime();
		const oneMinuteInMs = 60 * 1000;

		if (currentTime - lastCreatedTime < oneMinuteInMs) {
			return res.status(200).json({
				success: true,
				message: "If an account exists with this email, a password reset link will be sent."
			})
		}
	}

	// if oldForgotPassword is true
	try {

		// send reset password link to user email
		await sendEmailResetPassword(normalizedEmail, resetLink);

		// send response 
		return res.status(200).json({
			success: true,
			message: 'Reset link is sent to your email'
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
			throw new Error('Error While updating database!');
		}

		// send response 
		return res.status(500).json({
			success: false,
			message: 'Something wrong while sending Email!'
		})
	}

});

// reset password controller
const resetPassword = asyncHandler(async (req, res) => {
	const { newPassword } = req.body
	const { token } = req.params;

	// check token and newPassword is entered
	if (!token || !newPassword) return res.status(400).json({
		success: false,
		message: "Please provide token and new password!"
	});

	// check password have enough characters
	if( newPassword.length <= 6){
		return res.status(400).json({
			success: false,
			message: 'Password should be more than 6 characters!'
		})
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

		if (!resetUser){
			// Abort transaction
			await session.abortTransaction();

			return res.status(400).json({
				success: false,
				message: "Your reset password link is expired or Invalid token"
			});
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

		if (!updateUser){
			// Abort transaction
			await session.abortTransaction();

			return res.status(400).json({
				success: false,
				message: "User dose not exist"
			});	
		} 

		// delete forgot password data from database
		await resetPasswordModel.deleteOne(
			{ _id: resetUser._id },
			{ session }
		);

		// commit transaction
		await session.commitTransaction();
		
		// send success response
		return res.status(200).json({
			success: true,
			message: 'Password Reset successfully'
		})
	}
	catch (err) {
		await session.abortTransaction();
		throw err
	}
	finally {
		await session.endSession();
	}

	// === End Transaction ===

});

// refresh token auth for generate new tokens
const refreshToken = asyncHandler(async (req, res) => {
	const incomingRefreshToken = req.cookies?.refreshToken;

	// check refresh token is exist
	if (!incomingRefreshToken) {
		return res.status(401).json({
			success: false,
			message: 'Refresh token is missing.',
		});
	}

	try {
		const decoded = jwt.verify(incomingRefreshToken, REFRESH_SECRET);
		const user = await Users.findById(decoded._id);

		if (!user) {
			return res.status(401).json({
				success: false,
				message: 'User not found.',
			});
		}

		// generate new token
		const { accessToken: newAccessToken, refreshToken: newRefreshToken } = createTokenPair(user);
		setAuthCookies(res, newAccessToken, newRefreshToken);

		return res.status(200).json({
			success: true,
			message: 'Tokens refreshed successfully!',
			newAccessToken: newAccessToken,
			newRefreshToken: newRefreshToken,
		});

	} catch (error) {
		return res.status(401).json({
			success: false,
			message: 'Refresh token expired or invalid.',
		});
	}
});

module.exports = {
	authLogin,
	refreshToken,
	registerCustomers,
	registerSellers,
	userLogout,
	verifyOtp,
	resendOtp,
	forgotPassword,
	resetPassword,
};

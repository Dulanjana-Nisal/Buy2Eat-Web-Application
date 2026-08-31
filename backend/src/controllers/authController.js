const { ACCESS_SECRET, ACCESS_EXPIRED, REFRESH_SECRET, REFRESH_EXPIRED, PORT } = require('../config/env');
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
	await registrationOtpModel.create({
		verification_id: verification_id_value,
		email: email,
		hash_otp: hashOtp,
		expiresAt: new Date(Date.now() + 5 * 60 * 1000), // expires in 5 min
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
		expiredAt: new Date(Date.now() + 5 * 60 * 1000) // expires in 5 min
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
	await registrationOtpModel.create({
		verification_id: verification_id_value,
		email: email,
		hash_otp: hashOtp,
		hash_password: hashedPassword,
		expiresAt: new Date(Date.now() + 5 * 60 * 1000), // expires in 5 min
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
		expiredAt: new Date(Date.now() + 5 * 60 * 1000) // expires in 5 min
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

const resendOtp = asyncHandler(async (req, res) => {
	const { verification_id } = req.body;

	// check verification_id is entered
	if (!verification_id) return res.status(400).json({
		success: false,
		message: 'Verification_id is required!'
	})

	// find the OTP user
	const otpUser = await registrationOtpModel.findOne({ verification_id: verification_id });
	if (!otpUser) return res.status(400).json({
		success: false,
		message: 'Invalid verification_id!'
	});

	// generate new OTP
	const newOtp = crypto.randomInt(100000, 1000000).toString();
	const hashNewOtp = await bcrypt.hash(newOtp, 10);

	// update the OTP user
	otpUser.hash_otp = hashNewOtp;
	otpUser.attempts = 5;
	otpUser.expiresAt = new Date(Date.now() + 5 * 60 * 1000); // expires in 5 min

	await otpUser.save();
	
	// send the new OTP to the user
	resendEmailOTP(otpUser.email, newOtp);

	// send response
	return res.status(200).json({
		success: true,
		message: 'OTP resend successfully...',
	})
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
	const user = await Users.findOne({ email: email });
	if (!user) return res.status(400).json({
		success: false,
		message: "Email is not registered!"
	})

	// generate new reset password token
	const resetToken = crypto.randomBytes(32).toString('hex');
	const hashResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");

	// delete old data in resetPasswordModel
	await resetPasswordModel.deleteMany({ user_id: user._id })

	// save that token in to database
	const forgotPasswordSchema = await resetPasswordModel.create({
		user_id: user._id,
		resetPasswordToken: hashResetToken,
		expiredAt: new Date(Date.now() + 5 * 60 * 1000)
	})

	// generate reset link
	const resetLink = `http://localhost:${PORT}/api/v1/buy2eat/auth/reset-password/${resetToken}` // this link should be change with frontend ( with frontend PORT )

	// send reset password link to user email
	sendEmailResetPassword(email, resetLink);

	// send response
	res.status(200).json({
		success: true,
		message: 'Password reset link has been sent to your email.'
	})

});

// reset password controller
const resetPassword = asyncHandler(async (req, res) => {
	const { token, newPassword } = req.body

	// check token and newPassword is entered
	if (!token || !newPassword) return res.status(400).json({
		success: false,
		message: "Please provide token and new password!"
	});

	// check that token is exist on database model
	const hashToken = crypto.createHash("sha256").update(token).digest("hex");
	const resetUser = await resetPasswordModel.findOne({ resetPasswordToken: hashToken })

	if (!resetUser) return res.status(400).json({
		success: false,
		message: "Your reset password link is expired or Invalid token"
	});

	// replace new password with old password
	const user = await Users.findOne({ _id: resetUser.user_id })
	if (!user) return res.status(400).json({
		success: false,
		message: "User dose not exist"
	});

	// hash new password
	const salt = await bcrypt.genSalt(10);
	const hashNewPass = await bcrypt.hash(newPassword, salt);

	user.password = hashNewPass;
	await user.save();

	// delete old data in resetPasswordModel
	await resetPasswordModel.deleteMany({ user_id: resetUser.user_id })

	// send response
	res.status(200).json({
		success: true,
		message: 'Password reset successfully...'
	})
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

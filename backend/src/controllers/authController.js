const { ACCESS_SECRET, ACCESS_EXPIRED, REFRESH_SECRET, REFRESH_EXPIRED } = require('../config/env');
const asyncHandler = require('../middleware/asyncHandler');
const Users = require('../models/userModel');
const CustomerProfile = require('../models/customerProfileModel');
const SellerProfile = require('../models/sellerProfileModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

	return res.status(200).json({
		success: true,
		message: 'User logged in successfully!',
		user: {
			_id: user._id,
			email: user.email,
			role: user.role,
		},
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

	// create user 
	const user = await Users.create({
		email: normalizedEmail,
		password: hashedPassword,
		role: 'customer',
	});

	// create customer profile
	const customerProfile = await CustomerProfile.create({
		user_id: user._id,
		first_name,
		last_name,
		addresses,
		profile_image,
		favorite_shops,
		favorite_foods,
		phone_number,
	});

	// create jwt token and save it in to cookie
	const {accessToken, refreshToken} = createTokenPair(user)
	setAuthCookies(res, accessToken, refreshToken)

	// get response
	return res.status(201).json({
		success: true,
		message: 'Customer registered successfully!',
		user: {
			_id: user._id,
			email: user.email,
			role: user.role,
		},
		customerProfile,
		accessToken: accessToken,
		refreshToken: refreshToken
	});
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

	// create user
	const user = await Users.create({
		email: normalizedEmail,
		password: hashedPassword,
		role: 'seller',
	});

	// create seller profile
	const sellerProfile = await SellerProfile.create({
		user_id: user._id,
		first_name,
		last_name,
		profile_image,
		phone_number,
		ratings,
		rank,
	});

	// create jwt and save it into cookie
	const {accessToken, refreshToken} = createTokenPair(user);
	setAuthCookies(res, accessToken, refreshToken);

	return res.status(201).json({
		success: true,
		message: 'Seller registered successfully!',
		user: {
			_id: user._id,
			email: user.email,
			role: user.role,
		},
		sellerProfile,
	});
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

module.exports = { authLogin, refreshToken, registerCustomers, registerSellers };

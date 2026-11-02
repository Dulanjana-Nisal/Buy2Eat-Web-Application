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

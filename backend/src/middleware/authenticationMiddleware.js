const jwt = require('jsonwebtoken');
const { ACCESS_SECRET } = require('../config/env');
const { ErrorCode } = require('../constants');
const AppError = require('../errors/AppError');

const authenticationMiddleware = (req, res, next) => {
	const authorizationHeader = req.get('Authorization');
	const accessToken = authorizationHeader?.startsWith('Bearer ')
		? authorizationHeader.slice(7).trim()
		: null;

	if (!accessToken) {
		throw new AppError(
			ErrorCode.AUTH_MISSING_TOKEN,
			{ message: "Access Token is missing!" },
		);
	}

	try {
		req.user = jwt.verify(accessToken, ACCESS_SECRET);
		next();
	} catch (error) {
		throw new AppError(
			ErrorCode.AUTH_INVALID_TOKEN,
			{ message: "Access Token is expired or invalid." },
		);
	}
};

module.exports = authenticationMiddleware;

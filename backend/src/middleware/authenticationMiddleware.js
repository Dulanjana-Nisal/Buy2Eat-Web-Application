const jwt = require('jsonwebtoken');
const { ACCESS_SECRET } = require('../config/env');

const authenticationMiddleware = (req, res, next) => {
	const authorizationHeader = req.get('Authorization');
	const bearerToken = authorizationHeader?.startsWith('Bearer ')
		? authorizationHeader.slice(7).trim()
		: null;
	const accessToken = bearerToken || req.cookies?.accessToken;

	if (!accessToken) {
		return res.status(401).json({
			success: false,
			message: 'Access token is required.'
		});
	}

	try {
		req.user = jwt.verify(accessToken, ACCESS_SECRET);
		next();
	} catch (error) {
		return res.status(401).json({
			success: false,
			message: error.name === 'TokenExpiredError'
				? 'Access token has expired.'
				: 'Access token is invalid.'
		});
	}
};

module.exports = authenticationMiddleware;

const { StatusCode, ErrorCode } = require('../constants/index');
const { GetErrorCodes } = require('../errors/getErrorCodes');

const errorHandlerMiddleware = (err, req, res, next) => {

	// if not return in err, initialized default errs
	const status = err.status || StatusCode.INTERNAL_SERVER_ERROR;
	const category = err.category || GetErrorCodes[ErrorCode.INTERNAL_SERVER_ERROR];
	const code = err.code || ErrorCode.INTERNAL_SERVER_ERROR;
	const message = err.message || GetErrorCodes[ErrorCode.INTERNAL_SERVER_ERROR].message;

	const details = err.details || {};

	res.status(status).json({
		success: false,
		error: {
			code: code,
			category: category,
			message: message,
			timestamp: new Date().toISOString(),
			path: req.originalUrl,
			details
		}
	});
};

module.exports = errorHandlerMiddleware; 
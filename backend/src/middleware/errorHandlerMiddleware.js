const ErrorCode = require('../constants/errorCodes');

const errorHandlerMiddleware = (err, req, res, next) => {
	const statusCode = err.statusCode || 500;

	const code = err.code || ErrorCode.INTERNAL_SERVER_ERROR;

	res.status(statusCode).json({
		success: false,
		code: code,
		message: err.message || 'Internal server error',
		timestamp: new Date().toISOString(),
		path: req.originalUrl,
		details: [
			{
				fields: err.details.fields || "fields are missing",
				issue: err.details.issue || "Something wrong",
			}
		]
	});
};

module.exports = errorHandlerMiddleware;
const { StatusCode, ErrorCode } = require('../constants/index');

const errorHandlerMiddleware = (err, req, res, next) => {

	// if not return in err, initialized default errs
	const statusCode = err.statusCode || StatusCode.INTERNAL_SERVER_ERROR;
	const code = err.code || ErrorCode.INTERNAL_SERVER_ERROR;
	const message = err.message || "Unexpected error happened!";

	const details = [
		{
			field: err.fields || "fields are missing",
			issue: err.issue || "Something wrong",
		}
	] || [];

	res.status(statusCode).json({
		success: false,
		code: code,
		message: message,
		timestamp: new Date().toISOString(),
		path: req.originalUrl,
		details
	});
};

module.exports = errorHandlerMiddleware; 
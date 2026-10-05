const { NODE_ENV } = require('../config/env');
const { StatusCode, ErrorCode } = require('../constants/index');
const { GetErrorCodes } = require('../errors/getErrorCodes');
const normalizedError = require('./normalizedErrors');

// main error handler middleware function
const errorHandlerMiddleware = (err, req, res, next) => {

	// check if request is already exist
	if (res.headerSent) return next(err);

	const error = normalizedError(err);

	// if not return in err, initialized default errs
	const status = error.status || StatusCode.INTERNAL_SERVER_ERROR;
	const category = error.category || GetErrorCodes[ErrorCode.INTERNAL_SERVER_ERROR];
	const code = error.code || ErrorCode.INTERNAL_SERVER_ERROR;
	const message = error.message || GetErrorCodes[ErrorCode.INTERNAL_SERVER_ERROR].message;

	const details = error.details || [];

	// create error response should be...

	/**
	{
	   "success": false,
	   "error": {
	     "code": "VALIDATION_FIELD_REQUIRED",
	     "category": "VALIDATION_ERROR",
	     "message": "Email is required",
	     "details": [{ "field": "email", "issue": "Email is required" }],
	     "requestId": "b7e1c2a4-...",
	     "timestamp": "2026-10-02T10:15:30.000Z"
	}
	**/

	res.status(status).json({
		success: false,
		error: {
			code: code,
			category: category,
			message: message,
			timestamp: new Date().toISOString(),
			path: req.originalUrl,
			request_id: req.id,
			details,
		}
	});
};

module.exports = errorHandlerMiddleware; 
const { NODE_ENV } = require('../config/env');
const { StatusCode, ErrorCode } = require('../constants/index');
const AppError = require('../errors/appError');
const { GetErrorCodes } = require('../errors/getErrorCodes');

// Normalized all errors
const normalizedError = (error) => {
	if (error instanceof AppError) return error;

	// Mongoose validations
	if(error.name === 'ValidationError' && error.errors){
		const details = Object.values(error.errors).map((element) => ({
			field: element.path,
			issue: element.message
		}));
		return new AppError(ErrorCode.VALIDATION_FIELD_REQUIRED, { message: "Validation failed", details });
	}
	
	// Mongoose bad object id
	if(error.name === "CastError"){
		return new AppError(ErrorCode.VALIDATION_INVALID_FORMAT, { message: `Invalid ${error.path}: ${error.value}` });
	}

	// Mongo db duplicate key
	if(error.code === 11000){
		const field = Object.keys(error.keyValue)[0];
		return new AppError(ErrorCode.RESOURCE_ALREADY_EXISTS, { message: field ? `${field} already exists` : undefined });
	}

	// MongoDB transient write conflict
	if(error.name === "WriteConflict") return new AppError(ErrorCode.WRITE_CONFLICT_ERROR);

	// JWT
	if(error.name === "TokenExpiredError") return new AppError(ErrorCode.AUTH_EXPIRED_TOKEN);
	if(error.name === "JsonWebTokenError") return new AppError(ErrorCode.AUTH_INVALID_TOKEN);
	if(error.name === "NotBeforeError") return new AppError(ErrorCode.AUTH_RESOURCE_FORBIDDEN);

	// Multer
	if(error.code === "LIMIT_FILE_SIZE") return new AppError(ErrorCode.FILE_TOO_LARGE);

	// Malformed JSON body
	if(error.type === "entity.parse.failed") return new AppError(ErrorCode.VALIDATION_INVALID_FORMAT, { message: "Malformed JSON body" });

	// Anything else is a bug
	const unknownError = new AppError(ErrorCode.INTERNAL_SERVER_ERROR, { cause: error });
	unknownError.isOperational = false;
	unknownError.stack = error.stack;
	return unknownError;
}

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
			...(NODE_ENV === 'development' && { stack: error.stack })
		}
	});
};

module.exports = errorHandlerMiddleware; 
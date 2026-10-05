const { ErrorCode } = require("../constants");
const AppError = require("../errors/appError");

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

module.exports = normalizedError;
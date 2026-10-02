const { ErrorCode } = require("../constants/errorCodes");
const { GetErrorCodes } = require("./getErrorCodes");

class AppError extends Error{
    constructor(code, { message, details } = {}){

        // create variable for get all errors details from GetErrorCodes using code 
        const def = GetErrorCodes[code] ?? GetErrorCodes[ErrorCode.INTERNAL_SERVER_ERROR];

        super(message ?? def.message);
        this.name = "AppError";
        this.status = def.status;
        this.code = GetErrorCodes[code] ? code : ErrorCode.INTERNAL_SERVER_ERROR;
        this.category = def.category;
        this.details = details;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
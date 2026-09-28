class AppError extends Error{
    constructor(statusCode, code, message, fields, issue){
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.fields = fields;
        this.issue = issue;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
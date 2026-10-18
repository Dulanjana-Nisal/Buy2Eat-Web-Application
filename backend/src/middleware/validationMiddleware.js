const { ErrorCode } = require("../constants");
const AppError = require("../errors/AppError");

const validationMiddleware = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse({
            body: req.body,
            params: req.params,
            query: req.query,
        });

        if (!result.success) {
            const errors = result.error.issues.map((issue) => ({
                field: issue.path.join(".").replaceAll("body.", ""),
                issue: issue.message,
            }));
            
            throw new AppError(
                ErrorCode.VALIDATION_INVALID_FORMAT,
                {
                    message: "Invalid Input data",
                    details: errors
                }
            )
        }

        // pass validate data in to req.validated
        req.validated = result.data;

        next();
    };
};

module.exports = validationMiddleware;

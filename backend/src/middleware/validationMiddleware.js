const { ErrorCode } = require("../constants");
const AppError = require("../errors/AppError");

const validateRequest = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse({
            body: req.body,
            params: req.params,
            query: req.query,
        });

        if (!result.success) {
            const errors = result.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
                code: issue.code,
            }));

            console.error(errors)

            throw new AppError(
                ErrorCode.VALIDATION_INVALID_FORMAT,
                {
                    message: "Invalid Input data",
                }
            )
        }

        // pass validate data in to req.validated
        req.validated = result.data;

        next();
    };
};

module.exports = validateRequest;

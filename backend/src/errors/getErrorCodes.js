const { StatusCode } = require("../constants/statusCodes");

const GetErrorCodes = Object.freeze({
    // ── Authentication (who are you?) ──
    AUTH_MISSING_TOKEN: {
        status: StatusCode.UNAUTHORIZED,
        category: "AUTHENTICATION_ERROR",
        message: "Authentication token is missing"
    },
    AUTH_INVALID_TOKEN: {
        status: StatusCode.UNAUTHORIZED,
        category: "AUTHENTICATION_ERROR",
        message: "Invalid authentication token"
    },
    AUTH_INVALID_CREDENTIALS: {
        status: StatusCode.UNAUTHORIZED,
        category: "AUTHENTICATION_ERROR",
        message: "Invalid email or password"
    },
    AUTH_2FA_REQUIRED: {
        status: StatusCode.UNAUTHORIZED,
        category: "AUTHENTICATION_ERROR",
        message: "Two-factor verification required"
    },
    AUTH_2FA_INVALID: {
        status: StatusCode.UNAUTHORIZED,
        category: "AUTHENTICATION_ERROR",
        message: "Invalid two-factor code"
    },
    AUTH_OAUTH_FAILED: {
        status: StatusCode.UNAUTHORIZED,
        category: "AUTHENTICATION_ERROR",
        message: "Social login failed, please try again"
    },
    AUTH_OAUTH_EMAIL_CONFLICT: {
        status: StatusCode.CONFLICT,
        category: "AUTHENTICATION_ERROR",
        message: "This email is registered with a different login method"
    },

    // ── Session / tokens ──
    AUTH_EXPIRED_TOKEN: {
        status: StatusCode.UNAUTHORIZED,
        category: "SESSION_ERROR",
        message: "Session expired, please log in again"
    },
    AUTH_REVOKED_TOKEN: {
        status: StatusCode.UNAUTHORIZED,
        category: "SESSION_ERROR",
        message: "Session has been revoked"
    },
    AUTH_INVALID_REFRESH_TOKEN: {
        status: StatusCode.UNAUTHORIZED,
        category: "SESSION_ERROR",
        message: "Invalid refresh token, please log in again"
    },
    AUTH_REFRESH_TOKEN_REUSED: {
        status: StatusCode.UNAUTHORIZED,
        category: "SESSION_ERROR",
        message: "Security issue detected, please log in again"
    },
    AUTH_SESSION_LIMIT_REACHED: {
        status: StatusCode.FORBIDDEN,
        category: "SESSION_ERROR",
        message: "Maximum active sessions reached"
    },

    // ── Authorization (what can you do?) ──
    AUTH_INSUFFICIENT_PERMISSIONS: {
        status: StatusCode.FORBIDDEN,
        category: "AUTHORIZATION_ERROR",
        message: "You don't have permission to do this"
    },
    AUTH_RESOURCE_FORBIDDEN: {
        status: StatusCode.FORBIDDEN,
        category: "AUTHORIZATION_ERROR",
        message: "You don't have access to this resource"
    },
    AUTH_CSRF_INVALID: {
        status: StatusCode.FORBIDDEN,
        category: "AUTHORIZATION_ERROR",
        message: "Invalid or missing CSRF token"
    },
    AUTH_ORIGIN_NOT_ALLOWED: {
        status: StatusCode.FORBIDDEN,
        category: "AUTHORIZATION_ERROR",
        message: "Request origin is not allowed"
    },
    AUTH_REAUTH_REQUIRED: {
        status: StatusCode.FORBIDDEN,
        category: "AUTHORIZATION_ERROR",
        message: "Please confirm your password to continue"
    },

    // ── Account state ──
    ACCOUNT_EMAIL_NOT_VERIFIED: {
        status: StatusCode.FORBIDDEN,
        category: "ACCOUNT_ERROR",
        message: "Please verify your email first"
    },
    ACCOUNT_PHONE_NOT_VERIFIED: {
        status: StatusCode.FORBIDDEN,
        category: "ACCOUNT_ERROR",
        message: "Please verify your phone number first"
    },
    ACCOUNT_DISABLED: {
        status: StatusCode.FORBIDDEN,
        category: "ACCOUNT_ERROR",
        message: "This account has been disabled"
    },
    ACCOUNT_SUSPENDED: {
        status: StatusCode.FORBIDDEN,
        category: "ACCOUNT_ERROR",
        message: "This account has been suspended"
    },
    ACCOUNT_DELETED: {
        status: StatusCode.GONE,
        category: "ACCOUNT_ERROR",
        message: "This account has been deleted"
    },
    ACCOUNT_LOCKED: {
        status: StatusCode.LOCKED,
        category: "ACCOUNT_ERROR",
        message: "Account temporarily locked due to failed attempts"
    },
    ACCOUNT_ALREADY_VERIFIED: {
        status: StatusCode.CONFLICT,
        category: "ACCOUNT_ERROR",
        message: "Account is already verified"
    },
    ACCOUNT_EMAIL_TAKEN: {
        status: StatusCode.CONFLICT,
        category: "ACCOUNT_ERROR",
        message: "Email is already in use"
    },
    ACCOUNT_USERNAME_TAKEN: {
        status: StatusCode.CONFLICT,
        category: "ACCOUNT_ERROR",
        message: "Username is already taken"
    },

    // ── Passwords ──
    PASSWORD_TOO_WEAK: {
        status: StatusCode.BAD_REQUEST,
        category: "VALIDATION_ERROR",
        message: "Password does not meet requirements"
    },
    PASSWORD_INCORRECT_CURRENT: {
        status: StatusCode.BAD_REQUEST,
        category: "VALIDATION_ERROR",
        message: "Current password is incorrect"
    }, 
    PASSWORD_SAME_AS_OLD: {
        status: StatusCode.BAD_REQUEST,
        category: "VALIDATION_ERROR",
        message: "New password must be different"
    },
    PASSWORD_MISMATCH: {
        status: StatusCode.BAD_REQUEST,
        category: "VALIDATION_ERROR",
        message: "Passwords do not match"
    },
    PASSWORD_RESET_TOKEN_INVALID: {
        status: StatusCode.BAD_REQUEST,
        category: "ACCOUNT_ERROR",
        message: "Reset link is invalid"
    },
    PASSWORD_RESET_TOKEN_EXPIRED: {
        status: StatusCode.BAD_REQUEST,
        category: "ACCOUNT_ERROR",
        message: "Reset link has expired"
    },
    PASSWORD_RESET_TOKEN_USED: {
        status: StatusCode.BAD_REQUEST,
        category: "ACCOUNT_ERROR",
        message: "Reset link has already been used"
    },

    // ── Email verification links ──
    VERIFY_TOKEN_INVALID: {
        status: StatusCode.BAD_REQUEST,
        category: "ACCOUNT_ERROR",
        message: "Verification link is invalid"
    },
    VERIFY_TOKEN_EXPIRED: {
        status: StatusCode.BAD_REQUEST,
        category: "ACCOUNT_ERROR",
        message: "Verification link has expired"
    },

    // ── OTP ──
    OTP_INVALID: {
        status: StatusCode.BAD_REQUEST,
        category: "OTP_ERROR",
        message: "Invalid verification code"
    },
    OTP_EXPIRED: {
        status: StatusCode.BAD_REQUEST,
        category: "OTP_ERROR",
        message: "Verification code has expired"
    },
    OTP_NOT_FOUND: {
        status: StatusCode.BAD_REQUEST,
        category: "OTP_ERROR",
        message: "No active code, please request a new one"
    },
    OTP_ALREADY_USED: {
        status: StatusCode.BAD_REQUEST,
        category: "OTP_ERROR",
        message: "This code has already been used"
    },
    OTP_MAX_ATTEMPTS: {
        status: StatusCode.TOO_MANY_REQUESTS,
        category: "OTP_ERROR",
        message: "Too many incorrect attempts, request a new code"
    },
    OTP_RESEND_TOO_SOON: {
        status: StatusCode.TOO_MANY_REQUESTS,
        category: "OTP_ERROR",
        message: "Please wait before requesting another code"
    },
    OTP_DAILY_LIMIT_REACHED: {
        status: StatusCode.TOO_MANY_REQUESTS,
        category: "OTP_ERROR",
        message: "Daily code limit reached, try again tomorrow"
    },
    OTP_SEND_FAILED: {
        status: StatusCode.BAD_GATEWAY,
        category: "OTP_ERROR",
        message: "Could not send verification code"
    },

    // ── Validation / request shape ──
    VALIDATION_FIELD_REQUIRED: {
        status: StatusCode.BAD_REQUEST,
        category: "VALIDATION_ERROR",
        message: "A required field is missing"
    },
    VALIDATION_INVALID_FORMAT: {
        status: StatusCode.BAD_REQUEST,
        category: "VALIDATION_ERROR",
        message: "Invalid format"
    },
    VALIDATION_OUT_OF_RANGE: {
        status: StatusCode.BAD_REQUEST,
        category: "VALIDATION_ERROR",
        message: "Value is out of allowed range"
    },
    VALIDATION_INVALID_ID: {
        status: StatusCode.BAD_REQUEST,
        category: "VALIDATION_ERROR",
        message: "Invalid ID"
    },
    VALIDATION_UNPROCESSABLE: {
        status: StatusCode.UNPROCESSABLE_ENTITY,
        category: "VALIDATION_ERROR",
        message: "Request is valid but could not be processed"
    },
    MALFORMED_JSON: {
        status: StatusCode.BAD_REQUEST,
        category: "VALIDATION_ERROR",
        message: "Request body is not valid JSON"
    },
    PAYLOAD_TOO_LARGE: {
        status: StatusCode.PAYLOAD_TOO_LARGE,
        category: "VALIDATION_ERROR",
        message: "Request body is too large"
    },
    UNSUPPORTED_MEDIA_TYPE: {
        status: StatusCode.UNSUPPORTED_MEDIA_TYPE,
        category: "VALIDATION_ERROR",
        message: "Unsupported content type"
    },
    METHOD_NOT_ALLOWED: {
        status: StatusCode.METHOD_NOT_ALLOWED,
        category: "VALIDATION_ERROR",
        message: "Method not allowed"
    },
    PAGINATION_INVALID: {
        status: StatusCode.BAD_REQUEST,
        category: "VALIDATION_ERROR",
        message: "Invalid pagination parameters"
    },

    // ── File uploads ──
    FILE_REQUIRED: {
        status: StatusCode.BAD_REQUEST,
        category: "UPLOAD_ERROR",
        message: "No file was uploaded"
    },
    FILE_TOO_LARGE: {
        status: StatusCode.PAYLOAD_TOO_LARGE,
        category: "UPLOAD_ERROR",
        message: "File is too large"
    },
    FILE_TYPE_NOT_ALLOWED: {
        status: StatusCode.UNSUPPORTED_MEDIA_TYPE,
        category: "UPLOAD_ERROR",
        message: "File type is not allowed"
    },
    FILE_TOO_MANY: {
        status: StatusCode.BAD_REQUEST,
        category: "UPLOAD_ERROR",
        message: "Too many files uploaded"
    },
    FILE_UPLOAD_FAILED: {
        status: StatusCode.BAD_GATEWAY,
        category: "UPLOAD_ERROR",
        message: "File upload failed, please try again"
    },

    // ── Not found / state ──
    RESOURCE_NOT_FOUND: {
        status: StatusCode.NOT_FOUND,
        category: "NOT_FOUND_ERROR",
        message: "Resource not found"
    },
    ROUTE_NOT_FOUND: {
        status: StatusCode.NOT_FOUND,
        category: "NOT_FOUND_ERROR",
        message: "Route not found"
    },
    RESOURCE_GONE: {
        status: StatusCode.GONE,
        category: "NOT_FOUND_ERROR",
        message: "Resource is no longer available"
    },

    // ── Conflict ──
    RESOURCE_ALREADY_EXISTS: {
        status: StatusCode.CONFLICT,
        category: "CONFLICT_ERROR",
        message: "Resource already exists"
    },
    WRITE_CONFLICT_ERROR: {
        status: StatusCode.CONFLICT,
        category: "CONFLICT_ERROR",
        message: "Conflict while saving, please retry"
    },
    RESOURCE_IN_USE: {
        status: StatusCode.CONFLICT,
        category: "CONFLICT_ERROR",
        message: "Resource is in use and cannot be removed"
    },
    INVALID_STATE_TRANSITION: {
        status: StatusCode.CONFLICT,
        category: "CONFLICT_ERROR",
        message: "This action isn't allowed in the current state"
    },
    STALE_VERSION: {
        status: StatusCode.PRECONDITION_FAILED,
        category: "CONFLICT_ERROR",
        message: "Data was changed elsewhere, refresh and try again"
    },
    IDEMPOTENCY_KEY_REUSED: {
        status: StatusCode.UNPROCESSABLE_ENTITY,
        category: "CONFLICT_ERROR",
        message: "Idempotency key was already used with a different request"
    },

    // ── Rate limit / quota ──
    RATE_LIMIT_EXCEEDED: {
        status: StatusCode.TOO_MANY_REQUESTS,
        category: "RATE_LIMIT_ERROR",
        message: "Too many requests, try again later"
    },
    QUOTA_EXCEEDED: {
        status: StatusCode.TOO_MANY_REQUESTS,
        category: "RATE_LIMIT_ERROR",
        message: "Usage limit reached for your plan"
    },

    // ── Payment (OPTIONAL: delete this block if the app has no payments) ──
    PAYMENT_REQUIRED: {
        status: StatusCode.PAYMENT_REQUIRED,
        category: "PAYMENT_ERROR",
        message: "Payment is required to continue"
    },
    PAYMENT_CARD_DECLINED: {
        status: StatusCode.PAYMENT_REQUIRED,
        category: "PAYMENT_ERROR",
        message: "Your card was declined"
    },
    PAYMENT_INSUFFICIENT_FUNDS: {
        status: StatusCode.PAYMENT_REQUIRED,
        category: "PAYMENT_ERROR",
        message: "Insufficient funds"
    },
    PAYMENT_CARD_EXPIRED: {
        status: StatusCode.PAYMENT_REQUIRED,
        category: "PAYMENT_ERROR",
        message: "Your card has expired"
    },
    PAYMENT_AUTHENTICATION_REQUIRED: {
        status: StatusCode.PAYMENT_REQUIRED,
        category: "PAYMENT_ERROR",
        message: "Additional card authentication required"
    },
    PAYMENT_PROCESSING_FAILED: {
        status: StatusCode.BAD_GATEWAY,
        category: "PAYMENT_ERROR",
        message: "Payment could not be processed"
    },
    PAYMENT_WEBHOOK_INVALID: {
        status: StatusCode.BAD_REQUEST,
        category: "PAYMENT_ERROR",
        message: "Invalid webhook signature"
    },

    // ── Server / infrastructure ──
    INTERNAL_SERVER_ERROR: {
        status: StatusCode.INTERNAL_SERVER_ERROR,
        category: "SERVER_ERROR",
        message: "Something went wrong"
    },
    DATABASE_ERROR: {
        status: StatusCode.INTERNAL_SERVER_ERROR,
        category: "SERVER_ERROR",
        message: "Database error"
    },
    NOT_IMPLEMENTED: {
        status: StatusCode.NOT_IMPLEMENTED,
        category: "SERVER_ERROR",
        message: "This feature is not available yet"
    },
    EXTERNAL_SERVICE_ERROR: {
        status: StatusCode.BAD_GATEWAY,
        category: "SERVER_ERROR",
        message: "A dependent service returned an error"
    },
    EXTERNAL_SERVICE_UNAVAILABLE: {
        status: StatusCode.SERVICE_UNAVAILABLE,
        category: "SERVER_ERROR",
        message: "A dependent service is unavailable"
    },
    SERVICE_MAINTENANCE: {
        status: StatusCode.SERVICE_UNAVAILABLE,
        category: "SERVER_ERROR",
        message: "Service is under maintenance, please try again soon"
    },
    REQUEST_TIMEOUT: {
        status: StatusCode.GATEWAY_TIMEOUT,
        category: "SERVER_ERROR",
        message: "The request timed out"
    },
});

module.exports = { GetErrorCodes };

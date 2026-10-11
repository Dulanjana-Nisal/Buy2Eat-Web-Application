
/**
 * Maps backend error categories to frontend handling categories.
 *
 * Backend categories describe WHAT kind of error occurred.
 * Frontend categories describe HOW the UI should handle the error.
 */

export const errorCategoryList = {
    INPUT: "INPUT_ERROR",
    AUTH: "AUTH_ERROR",
    ACCOUNT: "ACCOUNT_ERROR",
    RESOURCE: "RESOURCE_ERROR",
    TRANSACTION: "TRANSACTION_ERROR",
    LIMIT: "LIMIT_ERROR",
    SYSTEM: "SYSTEM_ERROR",
    NETWORK: "NETWORK_ERROR",
    UNKNOWN: "UNKNOWN_ERROR"
};


export const getErrorCategory = (err) => {
    switch (err?.category || err?.type) {

        // ─────────────────────────────────────────────
        // User input / user-provided data
        // ─────────────────────────────────────────────

        case "VALIDATION_ERROR":
        case "UPLOAD_ERROR":
            return errorCategoryList.INPUT;


        // ─────────────────────────────────────────────
        // Authentication / session / permissions
        // ─────────────────────────────────────────────

        case "AUTHENTICATION_ERROR":
        case "SESSION_ERROR":
        case "AUTHORIZATION_ERROR":
        case "OTP_ERROR":
            return errorCategoryList.AUTH;


        // ─────────────────────────────────────────────
        // User account
        // ─────────────────────────────────────────────

        case "ACCOUNT_ERROR":
        case "popup_closed":
            return errorCategoryList.ACCOUNT;


        // ─────────────────────────────────────────────
        // Resources / data conflicts
        // ─────────────────────────────────────────────

        case "NOT_FOUND_ERROR":
        case "CONFLICT_ERROR":
            return errorCategoryList.RESOURCE;


        // ─────────────────────────────────────────────
        // Payments / transactions
        // ─────────────────────────────────────────────

        case "PAYMENT_ERROR":
            return errorCategoryList.TRANSACTION;


        // ─────────────────────────────────────────────
        // Rate limiting
        // ─────────────────────────────────────────────

        case "RATE_LIMIT_ERROR":
            return errorCategoryList.LIMIT;


        // ─────────────────────────────────────────────
        // Backend / infrastructure problems
        // ─────────────────────────────────────────────

        case "SERVER_ERROR":
            return errorCategoryList.SYSTEM;


        // ─────────────────────────────────────────────
        // Unknown backend category
        // ─────────────────────────────────────────────

        default:
            return errorCategoryList.UNKNOWN;
    }
};


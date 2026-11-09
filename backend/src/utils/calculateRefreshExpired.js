const { ErrorCode } = require("../constants");
const AppError = require("../errors/AppError");

// calculate expired times for refresh token data schema
const calculateExpired = (refreshExpiry, rememberMe) => {
    const DAY = 24 * 60 * 60 * 1000; // 1 day
    const now = new Date(); // current time
    const expiresAt = refreshExpiry ?? new Date(now.getTime() + (rememberMe ? 60 * DAY : DAY));
    const remainingTimeMs = expiresAt.getTime() - now.getTime();
    if (!Number.isFinite(remainingTimeMs) || remainingTimeMs <= 0) {
        throw new AppError(
            ErrorCode.AUTH_EXPIRED_TOKEN,
            {
                message: "Token is Expired!. Please login back"
            }
        )
    }

    return { remainingTimeMs, expiresAt }
}

module.exports = calculateExpired;
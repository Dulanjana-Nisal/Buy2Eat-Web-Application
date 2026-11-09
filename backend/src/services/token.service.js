const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const { ACCESS_EXPIRED, REFRESH_EXPIRED, ACCESS_SECRET, REFRESH_SECRET, NODE_ENV } = require("../config/env");
const refreshTokenModel = require("../models/refreshTokenModel");
const AppError = require("../errors/AppError");
const { ErrorCode } = require("../constants");

// hash token pair
const hash = (token) => crypto.createHash('sha256').update(token).digest('hex');

// calculate date
const DAY = 24 * 60 * 60 * 1000;

// cookie options
const cookieOptions = {
    httpOnly: true,
    sameSite: 'Lax',
    path: '/',
    secure: NODE_ENV !== 'development',
};

// calculate expired times
const calculateExpired = (refreshExpiry, rememberMe) => {
    const now = new Date();
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

// clear refresh token cookies
const clearCookie = (res) => {
    res.clearCookie('refreshToken', {
        httpOnly: true,
        sameSite: 'Lax',
        path: '/',
        secure: NODE_ENV !== 'development',
    });
}

// function for create jwt token
const createTokenPair = (user, { refreshExpire = null, rememberMe = false } = {}) => {

    // calculate expires in value for new users
    let expiresInValue;
    if (refreshExpire !== null) {

        // check have remaining time for store token in jwt
        if (!Number.isFinite(refreshExpire) || refreshExpire <= 0) {
            throw new AppError(
                ErrorCode.AUTH_EXPIRED_TOKEN,
                {
                    message: "Token is Expired!. Please login back"
                }
            );
        }
        expiresInValue = refreshExpire;
    }
    else {
        expiresInValue = rememberMe ? REFRESH_EXPIRED : '1d'
    }

    // create jwt payload
    const jwtPayload = {
        _id: user._id,
        email: user.email,
        role: user.role,
    }

    // create access token pair
    const accessToken = jwt.sign(
        jwtPayload,
        ACCESS_SECRET,
        { expiresIn: ACCESS_EXPIRED, algorithm: 'HS256' }
    );

    // create refresh token pair
    const refreshToken = jwt.sign(
        { ...jwtPayload, jti: crypto.randomUUID() },
        REFRESH_SECRET,
        { expiresIn: expiresInValue, algorithm: 'HS256' }
    );

    return { accessToken, refreshToken };
};

// function for save tokens in http only cookies
const createRefreshToken = async (
    req,
    user,
    refreshToken,
    {
        rememberMe = false,
        oldFamilyId = null,
        refreshExpiry = null,
        session = null
    }
) => {

    // calculate expired times
    const { expiresAt } = calculateExpired(refreshExpiry, rememberMe);

    // hash refresh token and family id
    const hashedRefreshToken = hash(refreshToken);
    const family_id = crypto.randomUUID();

    // create payload and session keyword
    const options = session ? { session } : {}
    const modelPayload = {
        user_id: user._id,
        familyId: oldFamilyId || family_id,
        hashToken: hashedRefreshToken,
        deviceInfo: {
            userAgent: req.headers['user-agent'] || "UNKNOWN",
            ipAddress: req.ip || "UNKNOWN",
        },
        rememberMe: rememberMe,
        expiresAt: expiresAt,
    }

    // store refresh token in to database
    session
        ?
        await refreshTokenModel.create([modelPayload], options)
        :
        await refreshTokenModel.create(modelPayload)
};

// Create cookies function
const createCookies = (res, refreshToken, { refreshExpiry = null, rememberMe = false }) => {

    // calculate expired times
    const { remainingTimeMs } = calculateExpired(refreshExpiry, rememberMe);

    // store refresh token in http only cookie
    res.cookie('refreshToken', refreshToken, {
        ...cookieOptions,
        maxAge: remainingTimeMs,
    });
}

module.exports = {
    createTokenPair,
    createRefreshToken,
    hash,
    createCookies,
    clearCookie,
};
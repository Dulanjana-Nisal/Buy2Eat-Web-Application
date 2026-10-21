const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const { ACCESS_EXPIRED, REFRESH_EXPIRED, ACCESS_SECRET, REFRESH_SECRET } = require("../config/env");
const refreshTokenModel = require("../models/refreshTokenModel");
const AppError = require("../errors/AppError");
const { ErrorCode } = require("../constants");

// cookie options
const cookieOptions = {
    httpOnly: true,
    sameSite: 'Lax',
    path: '/',
    secure: process.env.NODE_ENV !== 'development',
};

// calculate date
const DAY = 24 * 60 * 60 * 1000;
const hash = (token) => crypto.createHash('sha256').update(token).digest('hex');

// function for create jwt token
const createTokenPair = (user) => {
    const jwtPayload = {
        _id: user._id,
        email: user.email,
        role: user.role,
        tokenVersion: user.tokenVersion,
    };

    const accessToken = jwt.sign(jwtPayload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRED });
    const refreshToken = jwt.sign(jwtPayload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRED });

    return { accessToken, refreshToken };
};

// function for save tokens in http only cookies
const setAuthCookies = async (req, res, user, refreshToken, rememberMe = false) => {

    // hash refresh token and family id
    const hashedRefreshToken = hash(refreshToken);
    const family_id = crypto.randomUUID();

    // calculate duration for expired
    const expiredTime = rememberMe ? 60 * DAY : DAY

    try {
        // store refresh token in to database
        await refreshTokenModel.create({
            user_id: user._id,
            familyId: family_id,
            hashToken: hashedRefreshToken,
            deviceInfo: {
                userAgent: req.headers['user-agent'] || "UNKNOWN",
                ipAddress: req.ip || "UNKNOWN",
            },
            rememberMe: rememberMe,
            expiresAt: new Date(Date.now() + expiredTime),
        });

    }
    catch (err) {
        throw new AppError(ErrorCode.WRITE_CONFLICT_ERROR, { message: "Error while generating token!" });

    }

    // store refresh token in http only cookie
    res.cookie('refreshToken', refreshToken, {
        ...cookieOptions,
        maxAge: expiredTime,
    });

};

module.exports = {
    createTokenPair,
    setAuthCookies,
};
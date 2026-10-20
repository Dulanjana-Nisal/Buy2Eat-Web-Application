const jwt = require("jsonwebtoken");
const { ACCESS_EXPIRED, REFRESH_EXPIRED, ACCESS_SECRET, REFRESH_SECRET } = require("../config/env");

// cookie options
const cookieOptions = {
    httpOnly: true,
    sameSite: 'Lax',
    path: '/',
    secure: process.env.NODE_ENV !== 'development',
};

// calculate date
const DAY = 24 * 60 * 60 * 1000;

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
const setAuthCookies = (res, accessToken, refreshToken) => {
    res.cookie('accessToken', accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};

module.exports = {
    createTokenPair,
    setAuthCookies,
};
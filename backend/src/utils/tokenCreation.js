const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const { ACCESS_EXPIRED, REFRESH_EXPIRED, ACCESS_SECRET, REFRESH_SECRET, NODE_ENV } = require("../config/env");
const refreshTokenModel = require("../models/refreshTokenModel");
const AppError = require("../errors/AppError");
const { ErrorCode } = require("../constants");

// hash token pair
const hash = (token) => crypto.createHash('sha256').update(token).digest('hex');

// cookie options
const cookieOptions = {
    httpOnly: true,
    sameSite: 'Lax',
    path: '/',
    secure: NODE_ENV !== 'development',
};

// clear refresh token cookies
const clearCookie = (res) => {
    res.clearCookie('refreshToken', {
        httpOnly: true,
        sameSite: 'Lax',
        path: '/',
        secure: NODE_ENV !== 'development',
    });
}

// calculate date
const DAY = 24 * 60 * 60 * 1000;

// function for create jwt token
const createTokenPair = (user, { refreshExpire=null, rememberMe=false }) => {

    // calculate expires in value for new users
    let expiresInValue;
    if(refreshExpire !== null){

        // check have remaining time for store token in jwt
        if (refreshExpire <= 0) {
            ErrorCode.AUTH_EXPIRED_TOKEN,
            {
                message: "Token is Expired!. Please login back"
            }
        }
        expiresInValue = refreshExpire;
    }
    else{
        expiresInValue = rememberMe ? REFRESH_EXPIRED : '1d'
    }
    
    
    // create jwt payload
    const jwtPayload = {
        _id: user._id,
        email: user.email,
        role: user.role,
    };

    const accessToken = jwt.sign(jwtPayload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRED });
    const refreshToken = jwt.sign({ ...jwtPayload, jti: crypto.randomUUID() }, REFRESH_SECRET, { expiresIn: refreshExpire ? refreshExpire : expiresInValue });

    return { accessToken, refreshToken };
};

// function for save tokens in http only cookies
const setAuthCookies = async (
    req,
    res,
    user,
    refreshToken,
    {
        rememberMe = false,
        oldFamilyId = null,
        refreshExpiry = null,
    }
) => {

    // calculate expired times
    const now = new Date();
    const expiresAt = refreshExpiry ?? new Date( now + (rememberMe ? 60 * DAY : DAY)  );
    const remainingTimeMs = expiresAt.getTime() - now;
    if (remainingTimeMs <= 0) {
        throw new AppError(
            ErrorCode.AUTH_EXPIRED_TOKEN,
            {
                message: "Token is Expired!. Please login back"
            }
        )
    }

    // hash refresh token and family id
    const hashedRefreshToken = hash(refreshToken);
    const family_id = crypto.randomUUID();

    try {
        // store refresh token in to database
        await refreshTokenModel.create({
            user_id: user._id,
            familyId: oldFamilyId || family_id,
            hashToken: hashedRefreshToken,
            deviceInfo: {
                userAgent: req.headers['user-agent'] || "UNKNOWN",
                ipAddress: req.ip || "UNKNOWN",
            },
            rememberMe,
            expiresAt,
        });

        // store refresh token in http only cookie
        res.cookie('refreshToken', refreshToken, {
            ...cookieOptions,
            maxAge: remainingTimeMs,
        });

    }
    catch (err) {
        throw new AppError(ErrorCode.WRITE_CONFLICT_ERROR, { message: "Error while generating token!" });
    }
};

module.exports = {
    createTokenPair,
    setAuthCookies,
    hash,
    clearCookie,
};
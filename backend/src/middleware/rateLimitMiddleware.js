const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const AppError = require('../errors/AppError');
const { ErrorCode } = require('../constants');

// create minutes for every limiter function
const MINUTE = 60 * 1000;

// ip key generator
const ipKey = (req) => ipKeyGenerator(req.ip);


// skip checking non api traffic
const skipTraffics = (req) => req.method === 'OPTIONS' || req.path === '/health';


// create handler
const handler = (message) => (req, res, next) => {
    console.warn(
        `[Rate Limit] exceeded ip=${req.ip} ` +
        `user=${req.user?.id ?? 'anon'} ` +
        `method=${req.method} path=${req.path}`
    );
    
    next(
        new AppError(
            ErrorCode.RATE_LIMIT_EXCEEDED,
            { message: message || "Too many requests. Please try again later." }
        )
    );
}

// create centralized rate limiter
const createLimiter = (
    {
        windowMs,
        limit,
        message = null,
        keyGenerator = ipKey,
        skip = skipTraffics,
        skipSuccessfulRequests = false
    }
) => {
    return rateLimit({
        standardHeaders: 'draft-7',
        legacyHeaders: false,
        windowMs,
        limit,
        keyGenerator,
        skip,
        skipSuccessfulRequests,
        handler: handler(message),
    });
}

// limit for global api endpoint
const globalLimiter = createLimiter({
    windowMs: 15 * MINUTE,
    limit: 200,
})

// limit for login / Register users
const loginLimiter = createLimiter({
    windowMs: 15 * MINUTE,
    limit: 8,
    skipSuccessfulRequests: true,
})

// sensitive api limits
const sensitiveLimiter = createLimiter({
    windowMs: 15 * MINUTE,
    limit: 6,
    skipSuccessfulRequests: false,
})

module.exports = {
    globalLimiter,
    loginLimiter,
    sensitiveLimiter,
}


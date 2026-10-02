const { randomUUID } = require('crypto');

// create middleware for generate request id for every request
const requestIDMiddleware = (req,res,next) => {
    const requestID = req.get["X-Request-Id"]
    req.id = requestID && /^[\w-]{8,64}$/.test(requestID) ? requestID : randomUUID();
    res.setHeader("X-Request-Id", req.id);
    console.log(req.id)
    next();
}

module.exports = requestIDMiddleware;
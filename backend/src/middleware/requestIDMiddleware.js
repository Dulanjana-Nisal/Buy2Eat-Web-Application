const { randomUUID } = require('crypto');

// create middleware for generate request id for every request
const requestIDMiddleware = (req,res,next) => {
    const requestID = req.get["X-Request-Id"];

    // if request id not with better id, create new one and store in header
    req.id = requestID && /^[\w-]{8,64}$/.test(requestID) ? requestID : randomUUID(); 
    res.setHeader("X-Request-Id", req.id);

    next();
}

module.exports = requestIDMiddleware;
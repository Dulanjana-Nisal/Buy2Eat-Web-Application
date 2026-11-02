// Controllers from auth.account.controller.js
const { authLogin, registerCustomers, registerSellers, userLogout } = require('./auth.account.controller');

// Controllers from auth.google.controller.js
const { googleAuth, googleRegistration } = require('./auth.google.controller');

// Controllers from auth.otp.controller.js
const { verifyOtp, resendOtp } = require('./auth.otp.controller');

// Controllers from auth.password.controller.js
const { forgotPassword, resetPassword, verifyResetPassword } = require('./auth.password.controller');

// Controllers from auth.sessions.controller.js
const { refreshToken } = require('./auth.sessions.controller');

module.exports = {
    authLogin,
    registerCustomers,
    registerSellers,
    userLogout,
    googleAuth,
    googleRegistration,
    verifyOtp,
    resendOtp,
    forgotPassword,
    resetPassword,
    verifyResetPassword,
    refreshToken,
};
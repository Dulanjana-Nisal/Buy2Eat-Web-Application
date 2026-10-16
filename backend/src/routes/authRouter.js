const express = require('express');
const {
    authLogin,
    googleAuth,
    googleRegistration,
    refreshToken,
    registerCustomers,
    registerSellers,
    verifyOtp,
    resendOtp,
    userLogout,
    forgotPassword,
    resetPassword,
    verifyResetPassword
} = require('../controllers/authController');
const { loginLimiter, sensitiveLimiter } = require('../middleware/rateLimitMiddleware');

const router = express.Router();

router.post('/login', loginLimiter, authLogin);
router.post('/google', sensitiveLimiter, googleAuth);
router.post('/google/register', sensitiveLimiter, googleRegistration);
router.post('/register-customer', loginLimiter, registerCustomers);
router.post('/register-seller', loginLimiter, registerSellers);
router.post('/logout', loginLimiter, userLogout);
router.post('/verify-otp', sensitiveLimiter, verifyOtp);
router.post('/resend-otp', sensitiveLimiter,  resendOtp);
router.post('/refresh-token', sensitiveLimiter,  refreshToken);
router.post('/forgot-password', sensitiveLimiter,  forgotPassword);
router.post('/reset-password', sensitiveLimiter,  resetPassword);
router.get('/verify-reset-password/:token', sensitiveLimiter,  verifyResetPassword);

module.exports = router;

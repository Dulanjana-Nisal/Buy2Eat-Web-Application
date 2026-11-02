// import express
const express = require('express');

// import controllers
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
} = require('../controllers/auth');

// import middlewares
const { loginLimiter, sensitiveLimiter } = require('../middleware/rateLimitMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');

// import validations schema
const {
    authLoginSchema,
    registerCustomerSchema,
    registerSellerSchema,
    googleRegistrationSchema,
    verifyOtpSchema,
    resendOtpSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    verifyResetPasswordSchema
} = require('../validations/authValidation');

const router = express.Router();

// all routers implementations
router.post('/login', validationMiddleware(authLoginSchema), loginLimiter, authLogin);
router.post('/google', sensitiveLimiter, googleAuth);
router.post('/google/register', sensitiveLimiter, validationMiddleware(googleRegistrationSchema), googleRegistration);
router.post('/register-customer', loginLimiter, validationMiddleware(registerCustomerSchema), registerCustomers);
router.post('/register-seller', loginLimiter, validationMiddleware(registerSellerSchema), registerSellers);
router.post('/logout', loginLimiter, userLogout);
router.post('/verify-otp', sensitiveLimiter, validationMiddleware(verifyOtpSchema), verifyOtp);
router.post('/resend-otp', sensitiveLimiter, validationMiddleware(resendOtpSchema), resendOtp);
router.post('/refresh-token', sensitiveLimiter, refreshToken);
router.post('/forgot-password', sensitiveLimiter, validationMiddleware(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', sensitiveLimiter, validationMiddleware(resetPasswordSchema), resetPassword);
router.get('/verify-reset-password/:token', sensitiveLimiter, validationMiddleware(verifyResetPasswordSchema), verifyResetPassword);

module.exports = router;

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

const router = express.Router();

router.post('/login', authLogin);
router.post('/google', googleAuth);
router.post('/google/register', googleRegistration);
router.post('/register-customer', registerCustomers);
router.post('/register-seller', registerSellers);
router.post('/logout', userLogout);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/verify-reset-password/:token', verifyResetPassword);

module.exports = router;

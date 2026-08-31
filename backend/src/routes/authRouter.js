const express = require('express');
const { 
    authLogin, 
    refreshToken, 
    registerCustomers, 
    registerSellers, 
    verifyOtp, 
    resendOtp,
    userLogout, 
    forgotPassword,
    resetPassword,
} = require('../controllers/authController');

const router = express.Router();

router.post('/login', authLogin);
router.post('/register-customer', registerCustomers);
router.post('/register-seller', registerSellers);
router.post('/logout', userLogout);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:id', resetPassword);

module.exports = router;

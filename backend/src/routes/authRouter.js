const express = require('express');
const { authLogin, refreshToken, registerCustomers, registerSellers, verifyOtp } = require('../controllers/authController');

const router = express.Router();

router.post('/login', authLogin);
router.post('/register-customer', registerCustomers);
router.post('/register-seller', registerSellers);
router.post('/verify-otp', verifyOtp);
router.post('/refresh-token', refreshToken);

module.exports = router;

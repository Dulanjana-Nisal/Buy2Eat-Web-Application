const express = require('express');
const { authLogin, refreshToken, registerCustomers, registerSellers } = require('../controllers/authLoginController');

const router = express.Router();

router.post('/login', authLogin);
router.post('/register', registerCustomers);
router.post('/register-seller', registerSellers);
router.post('/refresh-token', refreshToken);

module.exports = router;

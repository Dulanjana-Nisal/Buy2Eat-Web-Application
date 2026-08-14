const express = require('express');
const { authLogin, refreshToken } = require('../controllers/authLoginController');

const router = express.Router();

router.post('/login', authLogin);
router.post('/refresh-token', refreshToken);

module.exports = router;

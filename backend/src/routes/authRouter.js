const express = require('express');
const { authLogin } = require('../controllers/authLoginController');

const router = express.Router();

router.get('/login', authLogin);

module.exports = router;

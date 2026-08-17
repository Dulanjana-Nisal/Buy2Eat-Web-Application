const express = require('express');
const { getAllCustomers } = require('../controllers/customersController');
const router = express.Router();

router.get('/', getAllCustomers);

module.exports = router;
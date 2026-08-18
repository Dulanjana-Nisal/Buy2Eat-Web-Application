const express = require('express');
const { getAllCustomers, getSingleCustomer } = require('../controllers/customersController');
const router = express.Router();

router.get('/', getAllCustomers);
router.get('/:id', getSingleCustomer);

module.exports = router;
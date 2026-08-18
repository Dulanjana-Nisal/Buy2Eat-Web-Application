const express = require('express');
const {
    getAllCustomers,
    getSingleCustomer,
    updateCustomer
} = require('../controllers/customersController');
const router = express.Router();

// main customer routers
router.get('/', getAllCustomers);
router.get('/:id', getSingleCustomer);
router.patch('/:id', updateCustomer);

module.exports = router;
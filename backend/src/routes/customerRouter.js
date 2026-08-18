const express = require('express');
const {
    getAllCustomers,
    getSingleCustomer,
    updateCustomer,
    updateAddresses,
    addAddresses,
    deleteAddress
} = require('../controllers/customersController');
const router = express.Router();

// main customer routers
router.get('/', getAllCustomers);
router.get('/:id', getSingleCustomer);
router.patch('/:id', updateCustomer);

// customer addresses routers
router.patch('/', updateAddresses);
router.post('/', addAddresses);
router.delete('/', deleteAddress);

module.exports = router;
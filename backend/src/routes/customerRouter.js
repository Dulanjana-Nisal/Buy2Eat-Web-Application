const express = require('express');
const {
    getAllCustomers,
    getSingleCustomer,
    updateCustomer,
    updateAddresses,
    addAddresses,
    deleteAddress,
    addFavShops,
    deleteFavShops,
    addFavFoods,
    deleteFavFoods
} = require('../controllers/customersController');
const authenticationMiddleware = require('../middleware/authenticationMiddleware');
const router = express.Router();

// main customer routers
router.get('/', getAllCustomers);
router.get('/:id', getSingleCustomer);
router.patch('/:id', updateCustomer);

// customer addresses routers
router.patch('/addresses/:id', updateAddresses);
router.post('/addresses/:id', addAddresses);
router.delete('/addresses/:id', deleteAddress);

// customer Favorite shops routers
router.post('/shops/', authenticationMiddleware, addFavShops);
router.delete('/shops/',authenticationMiddleware, deleteFavShops);

// customer Favorite foods routers
router.post('/foods/', authenticationMiddleware, addFavFoods);
router.delete('/foods/',authenticationMiddleware, deleteFavFoods);

module.exports = router;
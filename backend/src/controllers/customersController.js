const asyncHandler = require("../middleware/asyncHandler");
const customerProfileModel = require("../models/customerProfileModel");
const shopModel = require("../models/shopModel");
const pagination = require("../utils/pagination");
const foodsModel = require("../models/foodsModel");

// ============== Main Customer Controllers ==============

// get all customers with filters
const getAllCustomers = asyncHandler(async (req, res) => {
    const { searchByName, phone } = req.query

    // create queryData object 
    const queryData = {}

    // search with name
    if (searchByName) {
        queryData.$or = [
            { first_name: { $regex: searchByName, $options: 'i' } },
            { last_name: { $regex: searchByName, $options: 'i' } }
        ]
    }

    // search with phone number
    if (phone) {
        queryData.phone_number = {
            $regex: phone,
            $options: 'i'
        }
    }

    // paging
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || req.query.limit || 10;
    const skip = (page - 1) * limit;

    // get all customers data
    const all_customers = await customerProfileModel.find(queryData);

    // if need to get all customers without limit
    if (limit === 'all') {
        const paginationData = await pagination(all_customers, all_customers, page);
        return res.status(200).json({ success: true, message: 'Get all Customers', data: all_customers, pagination: paginationData })
    }

    // find data in database base on queryData
    const customers = await customerProfileModel.find(queryData).skip(skip).limit(limit);
    const paginationData = await pagination(all_customers, customers, page);
    res.status(200).json({ success: true, data: customers, pagination: paginationData })
});

// get single customer
const getSingleCustomer = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // get customer form database base on id
    const customer = await customerProfileModel.findOne({ user_id: id })
    if (!customer) return res.status(400).json({
        success: false,
        message: 'Customer dose not exist!'
    })

    // send response if all things are good
    res.status(200).json({
        success: true,
        data: customer,
    })
});

// update customers details
const updateCustomer = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, profile_image, phone_number } = req.body;

    // check customer is exist
    const customer = await customerProfileModel.findOne({ user_id: id })
    if (!customer) return res.status(400).json({
        success: false,
        message: 'Customer dose not exist!'
    })

    const queryData = {}

    // check if have first name
    if (first_name) {
        if (first_name === "" || (first_name.trim()).length < 3) {
            console.log(first_name, "First")
            return res.status(400).json({
                success: false,
                message: 'first_name must have more that 3 letters!'
            })
        }
        queryData.first_name = first_name.trim()
    }

    // check if have last name
    if (last_name) {
        if (last_name === "" || (last_name.trim()).length < 3) {
            return res.status(400).json({
                success: false,
                message: 'last_name must have more that 3 letters!'
            })
        }
        queryData.last_name = last_name.trim()
    }

    //check if have profile image
    if (profile_image) {
        queryData.profile_image = profile_image
    }

    // check if have phone Number
    if (phone_number) {
        queryData.phone_number = phone_number
    }

    // update database with querydata
    const customerUpdate = await customerProfileModel.findOneAndUpdate(
        {user_id: id},
        queryData,
        {runValidators: true, returnDocument: 'after'}
    )
    if (!customerUpdate) return res.status(400).json({
        success: false,
        message: 'Failed to update!'
    })

    // send response
    res.status(200).json({ success: true, message: 'Profile updated!', data: customerUpdate })
});

// ============== ========================= ==============

// ============== Customer Addresses Controllers ==============

// Update addresses
const updateAddresses = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { _id } = req.body;
    
    // check if customer and address is exist
    const customer = await customerProfileModel.findOne({ user_id: id, "addresses._id": _id });
    if(!customer) return res.status(400).json({
        success: false,
        message: 'Address is not exist!'
    })

    // update customer address
    const updatedCustomer = await customerProfileModel.findOneAndUpdate(
        { user_id: id, "addresses._id": _id },
        {
            $set: {
                "addresses.$": req.body
            }
        },
        { runValidators: true, returnDocument: 'after' }
    )

    // get response
    res.status(200).json({
        success: true,
        message: "Address Updated!",
        data: updatedCustomer
    })
});

// Add new address
const addAddresses = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { label, street, city, is_default } = req.body;
    
    // check if customer is exist
    const customer = await customerProfileModel.findOne({ user_id: id });
    if(!customer) return res.status(400).json({
        success: false,
        message: 'Customer is not exist!'
    })

    // if check all required fields are filled
    if(!label || !street || !city || !is_default) return res.status(400).json({
        success: false,
        message: 'label, street city and is_default fields are required!'
    })

     // Add customer address
    const AddedCustomerAddress = await customerProfileModel.findOneAndUpdate(
        { user_id: id },
        {
            $push: {
                addresses: req.body
            }
        },
        { runValidators: true, returnDocument: 'after' }
    )

    // get response
    res.status(200).json({
        success: true,
        message: "Address Added!",
        data: AddedCustomerAddress.addresses
    })

});

// Delete address
const deleteAddress = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { _id } = req.body;
    
    // check if customer and address is exist
    const customer = await customerProfileModel.findOne({ user_id: id, "addresses._id": _id });
    if(!customer) return res.status(400).json({
        success: false,
        message: 'Address is not exist!'
    })

    // delete customer address
    const deleteExistingAddress = await customerProfileModel.findOneAndUpdate(
        { user_id: id },
        {
            $pull: {
                addresses: {_id: _id}
            }
        },
        { runValidators: true, returnDocument: 'after' }
    )

    // get response
    res.status(200).json({
        success: true,
        message: "Address Deleted!",
        data: deleteExistingAddress
    })
});

// ============== ========================= ==============

// ============== Customer Favorite Shops Controllers ==============

// Add new shops
const addFavShops = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { shop_id } = req.body;
    
    // check if customer and shop is exist
    const customer = await customerProfileModel.findOne({ user_id: _id });
    const shop = await shopModel.findOne({ _id: shop_id });

    if(!customer) return res.status(400).json({
        success: false,
        message: 'Customer is not exist!'
    })

    if(!shop) return res.status(400).json({
        success: false,
        message: 'Shop is not exist!'
    })

    const favoriteShop = {
        shop_id: shop_id,
        seller_id: shop.seller_id,
        shop_name: shop.shop_name,
        logo_image: shop.logo_image,
        location: shop.location,
        description: shop.description
    }

     // Add customer Shop
    const addedCustomerShop = await customerProfileModel.findOneAndUpdate(
        { user_id: _id, 'favorite_shops.shop_id': { $ne: shop._id } },
        { $addToSet: { favorite_shops: favoriteShop }},
        { runValidators: true, returnDocument: 'after' }
    );

    if (!addedCustomerShop) return res.status(400).json({
        success: false,
        message: 'Shop is already in favorites!'
    })

    // get response
    res.status(200).json({
        success: true,
        message: "Shop Added!",
        shops_count: (addedCustomerShop.favorite_shops).length,
        data: addedCustomerShop.favorite_shops
    })

});

// Delete shops
const deleteFavShops = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { shop_id } = req.body;
    
    // check if customer and Shop is exist
    const customer = await customerProfileModel.findOne({ user_id: _id, "favorite_shops.shop_id": shop_id });
    if(!customer) return res.status(400).json({
        success: false,
        message: 'Shop is not exist!'
    })

    // delete customer Shop
    const deleteExistingShop = await customerProfileModel.findOneAndUpdate(
        { user_id: _id },
        {
            $pull: {
                favorite_shops: {shop_id: shop_id}
            }
        },
        { runValidators: true, returnDocument: 'after' }
    )

    // get response
    res.status(200).json({
        success: true,
        message: "Shop Deleted!",
        shops_count: (deleteExistingShop.favorite_shops).length,
        data: deleteExistingShop.favorite_shops
    })
});

// ============== ========================= ==============

// ============== Customer Favorite Foods Controllers ==============

// Add new Foods
const addFavFoods = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { food_id } = req.body;
    
    // check if Food and shop is exist
    const customer = await customerProfileModel.findOne({ user_id: _id });
    const food = await foodsModel.findOne({ _id: food_id });

    if(!customer) return res.status(400).json({
        success: false,
        message: 'Customer is not exist!'
    })

    if(!food) return res.status(400).json({
        success: false,
        message: 'Food is not exist!'
    })

    const favoriteFood = {
        food_id: food._id,
        name: food.name,
        image: food.image,
    }

     // Add customer Foods
    const addedCustomerFood = await customerProfileModel.findOneAndUpdate(
        { user_id: _id, 'favorite_foods.food_id': { $ne: food._id } },
        { $addToSet: { favorite_foods: favoriteFood }},
        { runValidators: true, returnDocument: 'after' }
    );

    if (!addedCustomerFood) return res.status(400).json({
        success: false,
        message: 'Food is already in favorites!'
    })

    // get response
    res.status(200).json({
        success: true,
        message: "Food Added!",
        shops_count: (addedCustomerFood.favorite_foods).length,
        data: addedCustomerFood.favorite_foods
    })

});

// Delete Foods
const deleteFavFoods = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { food_id } = req.body;
    
    // check if customer and Food is exist
    const customer = await customerProfileModel.findOne({ user_id: _id, "favorite_foods.food_id": food_id });
    if(!customer) return res.status(400).json({
        success: false,
        message: 'Food is not exist!'
    })

    // delete customer Food
    const deleteExistingFood = await customerProfileModel.findOneAndUpdate(
        { user_id: _id },
        {
            $pull: {
                favorite_foods: { food_id: food_id }
            }
        },
        { runValidators: true, returnDocument: 'after' }
    )

    // get response
    res.status(200).json({
        success: true,
        message: "Food Deleted!",
        shops_count: (deleteExistingFood.favorite_foods).length,
        data: deleteExistingFood.favorite_foods
    })
});

// ============== ========================= ==============

module.exports = {
    // main
    getAllCustomers,
    getSingleCustomer,
    updateCustomer,

    // addresses
    updateAddresses,
    addAddresses,
    deleteAddress,

    // shops
    addFavShops,
    deleteFavShops,

    // Foods
    addFavFoods,
    deleteFavFoods,
}
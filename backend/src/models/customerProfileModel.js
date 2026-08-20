const mongoose = require('mongoose');
const validateCoordinates = require('../utils/coordinateValidator');

// addressesModel Schema 
const addressesModel = mongoose.Schema({
    label: {
        type: String
    },
    address_name: {
        type: String,
    },
    street: {
        type: String,
    },
    city: {
        type: String,
        required: [true, 'City is required!']
    },
    is_default: {
        type: Boolean,
        required: [true, 'is_default value is required!']
    }
})

// favoriteShopsModel Schema
const favoriteShopsModel = mongoose.Schema({
    shop_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shops',
        required: [true, 'shop_id is required!']
    },
    seller_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'seller_id is required'],
        ref: 'SellerProfile'
    },
    shop_name: {
        type: String,
        required: [true, 'Shop name is required!']
    },
    logo_image: {
        type: String
    },
    location: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point"
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true,
            validate: {
                validator: validateCoordinates,
                message: 'Coordinates must be [longitude, latitude] or [longitude, latitude, altitude] with valid ranges!'
            }
        }
    },
    description: {
        type: String,
        minlength: [3, 'Description must have more than 3 letters!'],
        required: [true, 'Description is required!']
    }
})

// favoriteFoodsModel Schema
const favoriteFoodsModel = mongoose.Schema({
    food_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Foods',
        required: [true, 'food_id is required!']
    },
    name: {
        type: String,
        required: [true, 'Food must have a name!']
    },
    image: {
        type: String,
        required: [true, 'Image is required!']
    }
})

// customerProfileModel Schema
const customerProfileModel = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'user_id is required!'],
        ref: 'Users'
    },
    first_name: {
        type: String,
        required: [true, 'First Name is required!'],
        minlength: [2, 'First name must be more than 2 letters']
    },
    last_name: {
        type: String,
        required: [true, 'Last Name is required!'],
        minlength: [2, 'Last name must be more than 2 letters']
    },
    addresses: [addressesModel],
    profile_image: {
        type: String,
    },
    favorite_shops: [favoriteShopsModel],
    favorite_foods: [favoriteFoodsModel],
    phone_number: {
        type: String,
        required: [true, 'Phone Number is required!'],
        minlength: [10, 'Phone Number must have 10 numbers']
    }
})

module.exports = mongoose.model('CustomerProfile', customerProfileModel)
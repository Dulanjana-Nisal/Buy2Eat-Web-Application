const mongoose = require('mongoose');

// addressesModel Schema 
const addressesModel = mongoose.Schema({
    label: {
        type: String
    },
    street: {
        type: String,
        required: [true, 'Street is required!']
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
    shop_name: {
        type: String,
        required: [true, 'Shop name is required!']
    },
    is_open: {
        type: Boolean,
        required: [true, 'is_open value is required!']
    },
    logo_image: {
        type: String
    },
    location: {
        type: String,
        required: [true, 'Location is required!']
    }
})

// favoriteFoodsModel Schema
const favoriteFoodsModel = mongoose.Schema({
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
    user_id : {
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
        type: Number,
        required: [true, 'Phone Number is required!']
    }
})

module.exports = mongoose.model('CustomerProfile', customerProfileModel)
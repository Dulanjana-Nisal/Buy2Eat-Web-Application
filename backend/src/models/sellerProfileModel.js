const mongoose = require('mongoose');

// SellerProfileModel Schema
const sellerProfileModel = mongoose.Schema({
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
    profile_image: {
        type: String,
    },
    phone_number: {
        type: Number,
        required: [true, 'Phone Number is required!']
    },
    ratings: {
        type: Number,
        default: 0,
        maxlength: [5, 'Ratings must be lower than 5']
    },
    rank: {
        type: String,
        enum: ['new-seller', 'verified-seller', 'rising-seller', 'top-seller', 'elite-seller']
    }
})

module.exports = mongoose.model('SellerProfile', sellerProfileModel)
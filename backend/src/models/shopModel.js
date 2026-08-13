const mongoose = require('mongoose');

const shopsModel = mongoose.Schema({
    seller_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'seller_id is required'],
        ref: 'SellerProfile'
    },
    shop_name: {
        type: String,
        required: [true, 'Shop name is required!'],
        minlength: [3, 'Shop name must have more than 3 letters!']
    },
    address: {
        type: String,
        required: [true, 'Address is required!'],
    },
    location: {
        type: String,
        required: [true, 'Location is required!']
    },
    open_time: {
        type: Date,
        required: [true, 'Open time is required!']
    },
    close_time: {
        type: Date,
        required: [true, 'Close time is required!']
    },
    is_open: {
        type: Boolean,
        required: [true, 'is_open value is required!']
    },
    logo_image: {
        type: String,
    },
    description: {
        type: String,
        minlength: [3, 'Comment must have more than 3 letters!'],
        required: [true, 'Description is required!']
    },
}, { timestamps: true })

module.exports = mongoose.models('Shops', shopsModel)
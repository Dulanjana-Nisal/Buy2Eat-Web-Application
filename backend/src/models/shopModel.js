const mongoose = require('mongoose');
const validateCoordinates = require('../utils/coordinateValidator');

// shopsModel Schema
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
        minlength: [3, 'Description must have more than 3 letters!'],
        required: [true, 'Description is required!']
    },
}, { timestamps: true })

module.exports = mongoose.model('Shops', shopsModel)
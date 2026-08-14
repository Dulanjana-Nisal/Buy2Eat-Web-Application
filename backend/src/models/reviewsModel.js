const mongoose = require('mongoose');

// reviewsModel Schema
const reviewsModel = mongoose.Schema({
    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'customer_id is required'],
        ref: 'CustomerProfile'
    },
    seller_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'seller_id is required'],
        ref: 'SellerProfile'
    },
    comment: {
        type: String,
        minlength: [3, 'Comment must have more than 3 letters!']
    },
    ratings: {
        type: Number,
        required: [true, 'Rating is required!'],
        maxlength: [5, 'Rating must have less than 5']
    },
    images: [
        {
            type: String,
        }
    ]
}, { timestamps: true })

module.exports = mongoose.model('Reviews', reviewsModel)
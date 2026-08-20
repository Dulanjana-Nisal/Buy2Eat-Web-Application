const mongoose = require('mongoose');

// foodsModel Schema
const foodsModel = mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: [true, 'Food must have a name!']
    },
    seller_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: [true, 'seller_id is required!']
    },
    description: {
        type: String,
    },
    image: {
        type: String,
        required: [true, 'Image is required!']
    },
    category: {
        type: String,
        required: [true, 'food must have category!'],
        enum: ['rice-and-curry','kottu','hoppers','short-eats','seafood','desserts-and-sweets','beverages','street-food','devilled-dishes','meats','bites']
    },
    tags: [{
        type: String,
        required: [true, 'tags is required!'],
    }],
    availability: {
        type: Boolean,
        required: [true, 'availability is required!']
    },
    ratings: {
        type: Number,
        default: 0,
        maxlength: [5, 'Ratings must be lower than 5']
    },
    price: {
        type: Number,
        required: [true, 'Price is required!']
    }
}, { timestamps: true } )

module.exports = mongoose.model('Foods', foodsModel)
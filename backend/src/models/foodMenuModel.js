const mongoose = require('mongoose');

// foodsModel Schema
const foodListModel = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Food must have a name!']
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
    price: {
        type: Number,
        required: [true, 'Price is required!']
    }
})

// foodMenuModel Schema
const foodMenuModel = mongoose.Schema({
    shop_id : {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'shop_id is required!'],
        ref: 'Shops'
    },
    title: {
        type: String,
        required: [true, 'title is required!']
    },
    price: {
        type: Number,
        required: [true, 'Price is required!'],
    },
    description: {
        type: String,
        minlength: [3, 'Description must have more than 3 letters!'],
        required: [true, 'Description is required!']
    },
    foods: [foodListModel],
    meal_type: {
        type: String,
        required: [true, 'meal_type is required!'],
        enum: ['breakfast', 'lunch', 'dinner','tea-time','snack']
    },
    menu_availability: {
        type: String,
        required: [true, 'menu_availability is required!'],
        enum: ['open','close']
    },
    discount_price: {
        type: Number,
    },
    discount_availability: {
        type: Boolean,
        required: [true, 'discount_availability is required!']
    },
    stock: {
        type: Number,
        required: [true, 'Stock value is required!']
    },
    stock_type: {
        type: String,
        required: [true, 'stock_type is required!'],
        enum: ['g','kg','l','ml','cup-of','packs','bottle-of']
    }
}, { timestamps: true })

module.exports = mongoose.model('FoodMenu', foodMenuModel)
const mongoose = require('mongoose');

// orderItem Schema
const orderItemSchema = mongoose.Schema({
	item_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'FoodMenu'
	},
	name: {
		type: String,
		required: [true, 'Item name is required!']
	},
	price: {
		type: Number,
		required: [true, 'Item price is required!']
	},
	image: {
		type: String,
	},
    availability: {
        type: Boolean,
        required: [true, 'availability is required!']
    },

})

// ordersModel Schema
const ordersModel = mongoose.Schema({
	seller_id: {
		type: mongoose.Schema.Types.ObjectId,
		required: [true, 'seller_id is required!'],
		ref: 'SellerProfile'
	},
	customer_id: {
		type: mongoose.Schema.Types.ObjectId,
		required: [true, 'customer_id is required!'],
		ref: 'CustomerProfile'
	},
	status: {
		type: String,
		required: [true, 'Status is required!'],
		enum: ['pending', 'accepted', 'preparing', 'on-the-way', 'delivered', 'cancelled'],
		default: 'pending'
	},
	items: [orderItemSchema],
	total_price: {
		type: Number,
		required: [true, 'Total price is required!'],
		default: 0
	},
	addone_messages: {
		type: String
	},
	location: {
		type: String,
		required: [true, 'location is required!'],
	},
	first_name: {
		type: String,
		required: [true, 'first_name is required!'],
	},
	last_name: {
		type: String,
		required: [true, 'last_name is required!'],
	},
	phone_number: {
		type: Number,
		required: [true, 'phone_number is required!'],
	},
	address: {
		type: String,
		required: [true, 'address is required!'],
	},
	discount: {
		type: Number,
		default: 0
	},
	payment_method: {
		type: String,
		enum: ['cash-on-delivery', 'card'],
		required: [true, 'payment_method is required!'],
	},
	deliverAt: {
		type: Date,
	},
	is_accept: {
		type: Boolean,
		default: false
	},
	quantity: {
		type: Number,
		default: 1,
		required: [true, 'quantity is required!'],
	}
}, { timestamps: true })

module.exports = mongoose.models('Orders', ordersModel)

const mongoose = require('mongoose');

// Agreement Schema
const Agreement = mongoose.Schema({
    accepted: {
        type: Boolean,
        default: false
    },
    version: {
        type: String,
        required: [true, 'version is required!']
    },
    acceptedAt: {
        type: Date,
        required: [true, 'Accepted date and time is required!']
    }
}, { _id: false, id: false });

// UserModel Schema
const UserModel = mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required!'],
        unique: [true, 'Email must be unique!'],
        trim: true,
        lowercase: true,
        match: [
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            "Please enter a valid email address"
        ]
    },
    google_id: {
        type: String,
        unique: true,
        sparse: true
    },
    password: {
        type: String,
    },
    role: {
        type: String,
        enum: ['admin', 'customer', 'seller'],
        required: [true, 'Role is required!']
    },
    agreement: Agreement

}, { timestamps: true });

module.exports = mongoose.model('Users', UserModel);
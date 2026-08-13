const mongoose = require('mongoose');

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
    password: {
        type: String,
        required: [true, 'Password is required!'],
        minlength: [6, 'Password must be more than 6 characters!']
    },
    role: {
        type: String,
        enum: ['admin','customer','seller'],
        required: [true, 'Role is required!']
    }
}, { timestamps: true })

module.exports = mongoose.models('Users', UserModel)
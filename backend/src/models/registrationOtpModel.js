const mongoose = require('mongoose');

// registration OTP model schema
const registrationOtpModel = mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required!'],
        trim: true,
        lowercase: true,
        match: [
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            "Please enter a valid email address"
        ]
    },
    hash_otp: {
        type: String,
        required: [true, "hash_otp is required!"]
    },
    hash_password: {
        type: String,
        required: [true, "hash_password is required!"]
    },
    expiresAt: {
        type: Date,
        required: [true, 'expiresAt is required!']
    },
    attempts: {
        type: Number,
        default: 5,
        maxlength: [5, 'Attempts number should be less than 5']
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600
    },
    role: {
        type: String,
        enum: ['admin','customer','seller'],
        required: [true, 'Role is required!']
    },
    profile_data: {
        type: Object,
        required: [true, 'Profile data is required!']
    }
})

module.exports = mongoose.model('RegistrationOtp', registrationOtpModel)
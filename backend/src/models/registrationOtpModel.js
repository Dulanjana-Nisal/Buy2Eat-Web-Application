const mongoose = require('mongoose');

// registration OTP model schema
const registrationOtpModel = mongoose.Schema({
    verification_id: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    email: {
        type: String,
        unique: [true, 'Email cant duplicate!'],
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
        required: [true, 'expiresAt is required!'],
        expireAfterSeconds: 0
    },
    attempts: {
        type: Number,
        default: 5,
        max: [5, 'Attempts number should be less than 5'],
        min: [0, 'Attempts number cannot be negative']
    },
    lastResendAt: {
        type: Date,
        default: null
    },
    resendCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    role: {
        type: String,
        enum: ['admin', 'customer', 'seller'],
        required: [true, 'Role is required!']
    },
    profile_data: {
        type: Object,
        required: [true, 'Profile data is required!']
    }
})

module.exports = mongoose.model('RegistrationOtp', registrationOtpModel)
const mongoose = require('mongoose');

const GoogleRegisterModel = mongoose.Schema({
    google_id: {
        type: String,
        required: [true, 'google_id is required!'],
    },
    email: {
        type: String,
        required: [true, 'Email is required!'],
        lowercase: true,
        trim: true,
    },
    first_name: {
        type: String,
        required: [true, 'First Name is required!'],
    },
    last_name: {
        type: String,
        required: [true, 'Last Name is required!'],
    },
    profile_image: {
        type: String,
    },
    registration_token: {
        type: String,
        required: [true, 'registration_token is required!']
    },
    expiresAt: {
        type: Date,
        required: [true, 'Date is required!'],
        expires: 600
    }
}, { timestamps: true });

module.exports = mongoose.model("GoogleRegister", GoogleRegisterModel)
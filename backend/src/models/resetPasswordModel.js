const mongoose = require('mongoose');

const resetPasswordModel = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: [true, 'user_id is required!']
    },
    resetPasswordToken: {
        type: String,
        required: [true, 'Reset token is required!']
    },
    expiredAt: {
        type: Date,
        required: [true, 'expiredAt is required!'],
        expires: 600
    }
})

module.exports = mongoose.model('ResetPassword', resetPasswordModel)
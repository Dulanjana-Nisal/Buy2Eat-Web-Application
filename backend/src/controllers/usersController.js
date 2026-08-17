const asyncHandler = require("../middleware/asyncHandler");
const Users = require('../models/userModel');

// get all users details with filters
const getAllUsers = asyncHandler(async (req, res) => {
    const { searchByEmail, role } = req.query

    // create queryData empty object
    const queryData = {}

    // search with email
    if (searchByEmail) {
        queryData.email = {
            $regex: searchByEmail,
            $options: "i",
        }
    }

    // filter with role
    if (role) {
        queryData.role = role
    }

    // paging users
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || req.query.limit || 10;
    const skip = (page - 1) * limit;

    // if need all data without paging
    if (limit === 'all') {
        const unlimitUsers = await Users.find(queryData).select("-password");
        // return response
        return res.status(200).json({ success: true, message: 'All Users Here!', data: unlimitUsers });
    }

    // find data form database and send response
    const user = await Users.find(queryData).select("-password").skip(skip).limit(limit).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: user });
});

// get single user details
const getSingleUser = asyncHandler(async (req, res) => {
    res.status(200).json({success: true, message: 'Get single user details'})
});

module.exports = {
    getAllUsers,
    getSingleUser,
};
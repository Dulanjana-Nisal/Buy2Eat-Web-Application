const asyncHandler = require("../middleware/asyncHandler");

const getAllUsers = asyncHandler(async (req,res)=>{
    res.status(200).json({success: true, message: 'Get all users details'})
});

module.exports = getAllUsers;
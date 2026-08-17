const asyncHandler = require("../middleware/asyncHandler");

// get all customers with filters
const getAllCustomers = asyncHandler(async (req,res)=>{
    res.status(200).json({success: true, message: 'Get all Customers details'})
})

module.exports = {
    getAllCustomers,
}
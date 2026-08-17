const asyncHandler = require("../middleware/asyncHandler");

// get all customers with filters
const getAllCustomers = asyncHandler(async (req,res)=>{
    const { searchByName } = req.query
    
    // create queryData object 
    const queryData ={}

    // search with name
    if(searchByName){
        queryData.first_name = searchByName ? searchByName : '';
    }

    res.status(200).json({success: true, message: 'Get all Customers details'})
})

module.exports = {
    getAllCustomers,
}
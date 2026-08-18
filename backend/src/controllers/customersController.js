const asyncHandler = require("../middleware/asyncHandler");
const customerProfileModel = require("../models/customerProfileModel");

// get all customers with filters
const getAllCustomers = asyncHandler(async (req,res)=>{
    const { searchByName } = req.query
    
    // create queryData object 
    const queryData = {}

    // search with name
    if(searchByName){
        queryData.$or = [
            { first_name : { $regex: searchByName, $options: 'i' } },
            { last_name : { $regex: searchByName, $options: 'i' } }
        ]
    }

    // paging
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page-1)*limit;

    // if need to get all customers without limit
    if(limit === 'unlimited'){
        const unlimitedCustomers = await customerProfileModel.find(queryData)
        return res.status(200).json({success: true, message: 'Get all Customers', data: unlimitedCustomers})
    }

    // find data in database base on queryData
    const customers = await customerProfileModel.find(queryData).skip(skip).limit(limit);
    res.status(200).json({success: true, data: customers})
})

module.exports = {
    getAllCustomers,
}
const asyncHandler = require("../middleware/asyncHandler");
const customerProfileModel = require("../models/customerProfileModel");
const pagination = require("../utils/pagination");

// get all customers with filters
const getAllCustomers = asyncHandler(async (req, res) => {
    const { searchByName } = req.query

    // create queryData object 
    const queryData = {}

    // search with name
    if (searchByName) {
        queryData.$or = [
            { first_name: { $regex: searchByName, $options: 'i' } },
            { last_name: { $regex: searchByName, $options: 'i' } }
        ]
    }

    // paging
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || req.query.limit || 10;
    const skip = (page - 1) * limit;

    // get all customers data
    const all_customers = await customerProfileModel.find(queryData);

    // if need to get all customers without limit
    if (limit === 'all') {
        const paginationData = await pagination(all_customers, all_customers, page);
        return res.status(200).json({ success: true, message: 'Get all Customers', data: all_customers, pagination: paginationData })
    }

    // find data in database base on queryData
    const customers = await customerProfileModel.find(queryData).skip(skip).limit(limit);
    const paginationData = await pagination(all_customers, customers, page);
    res.status(200).json({ success: true, data: customers, pagination: paginationData })
})

module.exports = {
    getAllCustomers,
}
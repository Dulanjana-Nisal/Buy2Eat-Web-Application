const asyncHandler = require('../middleware/asyncHandler');

const authLogin = asyncHandler(async (req, res) => {
	res.status(200).json({success: true, message: 'Test login auth api'})
});

module.exports = { authLogin };

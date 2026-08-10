const asyncHandler = require('../middleware/asyncHandler');

// login auth for all role
const authLogin = asyncHandler(async (req, res) => {
	const {email, password} = req.body;

	if(!email || !password) return res.status(400).json({
		
	})
});

module.exports = { authLogin };

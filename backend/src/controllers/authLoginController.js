const asyncHandler = require('../middleware/asyncHandler');

// login auth for all role
const authLogin = asyncHandler(async (req, res) => {
	const {email, password} = req.body;

	// if not provide email and password
	if(!email || !password) return res.status(400).json({
		success: false,
		message: 'Please provide email and password'
	})

	// if email is already exist in database
	const exitEmail = await 
});

module.exports = { authLogin };

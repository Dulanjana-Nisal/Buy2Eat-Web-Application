const asyncHandler = require('../middleware/asyncHandler');
const Users = require('../models/userModel');
const bcrypt = require('bcryptjs');

// login auth for all role
const authLogin = asyncHandler(async (req, res) => {
	const {email, password} = req.body;

	// if not provide email and password
	if(!email || !password) return res.status(400).json({
		success: false,
		message: 'Please provide email and password'
	})

	// if email is already exist in database
	const exitEmail = await Users.find({email: email});
	if(!exitEmail) return res.status(400).json({
		success: false,
		message: 'User is not registered exist!'
	})

	// check if password is correct
	const checkPass = await bcrypt.compare(password, exitEmail.password);
	if(!checkPass) return res.status(400).json({
		success: false,
		message: 'Password is incorrect!'
	})

	// get response form server
	res.status(200).json({success: true, message: 'User logged!'})
});
 
module.exports = { authLogin };

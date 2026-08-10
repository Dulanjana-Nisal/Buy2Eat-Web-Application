const asyncHandler = require('../middleware/asyncHandler');

const getHealth = asyncHandler(async (_request, response) => {
	response.json({
		status: 'ok',
		message: 'Buy2Eat API is healthy',
	});
});

module.exports = { getHealth };

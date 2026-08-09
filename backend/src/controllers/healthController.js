function getHealth(_request, response) {
  response.json({
    status: 'ok',
    service: 'buy2eat-api',
    timestamp: new Date().toISOString(),
  });
}

module.exports = { getHealth };

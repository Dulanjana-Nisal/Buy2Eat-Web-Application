const mongoose = require('mongoose');
const { MONGO_URI, NODE_ENV } = require('../config/env');

// Connect database with mongoose
async function connectDatabase() {
  if (!MONGO_URI) {
    console.warn('MONGO_URI is not set; starting without a database connection.');
    return;
  }

  try {
    if (NODE_ENV !== 'testing') {
      await mongoose.connect(MONGO_URI);
      console.log('Database connected!');
    }
  }
  catch (err) {
    console.error('Database Connection failed!', err)
    throw err
  }
}

module.exports = connectDatabase;

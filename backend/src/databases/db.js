const mongoose = require('mongoose');
const { MONGO_URI } = require('../config/env');

// Connect database with mongoose
async function connectDatabase() {
  if (!MONGO_URI) {
    console.warn('MONGO_URI is not set; starting without a database connection.');
    return;
  }

  try{
    await mongoose.connect(MONGO_URI);
    console.log('Database connected!'); 
  }
  catch(err){
    console.error('Database Connection failed!', err)
  }
}

module.exports = connectDatabase;

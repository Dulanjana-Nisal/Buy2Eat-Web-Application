const mongoose = require('mongoose'); 
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

//Before any test files start executing
beforeAll(async () => {
  
  await mongoose.disconnect();

  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri);
});

// Cleans up data between individual tests
afterEach(async () => {
  
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// After all test files are completely finished
afterAll(async () => {
  
  await mongoose.disconnect();
  
  if (mongoServer) {
    await mongoServer.stop();
  }
});

const mongoose = require('mongoose');
const { MongoMemoryReplSet } = require('mongodb-memory-server');

let replSet;

//Before any test files start executing
beforeAll(async () => {

    if (mongoose.connection.readyState !== 0) {
        throw new Error('DB already connected, refusing to run tests');
    }

    replSet = await MongoMemoryReplSet.create({
        replSet: {
            count: 1,
        }
    });
    const mongoUri = replSet.getUri();

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

    if (replSet) {
        await replSet.stop();
    }
});

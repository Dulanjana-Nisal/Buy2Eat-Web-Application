// Mock models
jest.mock('crypto', () => {
    const actualValue = jest.requireActual('crypto');
    const hashCredentials = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue("hashed_reset_token"),
    }
    return {
        ...actualValue,
        createHash: jest.fn().mockReturnValue(hashCredentials),
    }
});

// Applications imports
const request = require('supertest');
const app = require('../../src/server');
const resetPasswordModel = require('../../src/models/resetPasswordModel');
const Users = require('../../src/models/userModel');

// HELPERS
let token = "hashed_reset_token";
const URL = `/api/v1/buy2eat/auth/verify-reset-password/${token}`;
const nowDate = new Date();

const sendRequest = async (url = null) => {
    return await request(app).get(url ? url : URL);
}

const creteModels = async (overwrites = {}) => {
    const user = await Users.create({
        email: 'test@example.com',
        role: 'customer',
    });
    const reset = await resetPasswordModel.create({
        ...{
            user_id: user._id,
            resetPasswordToken: "hashed_reset_token",
            createdAt: nowDate,
            expiredAt: new Date(Date.now() + 15 * 60 * 1000), // set up to 15 minutes
        },
        ...overwrites,
    });

    return { reset }
}

describe("POST /api/v1/buy2eat/auth/verify-reset-password/:token", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("With valid response", () => {
        it("Should return success response when input valid inputs", async () => {
            await creteModels();
            const response = await sendRequest();

            expect(response.statusCode).toBe(200);
            expect(response.body.message).toEqual("Token is ok");
        });
    });

    describe("With invalid response", () => {
        it("Should return error response when token invalid", async () => {
            await creteModels({ resetPasswordToken: "updated_token" });
            const response = await sendRequest();

            expect(response.statusCode).toBe(400);
            expect(response.body.error.message).toEqual("Your reset password URL is expired or wrong URL!. Generate new URL and try again.");
        });

        it("Should return error response when token expired", async () => {
            await creteModels({ expiredAt: new Date(Date.now() - 15 * 60 * 1000) });
            const response = await sendRequest();

            expect(response.statusCode).toBe(400);
            expect(response.body.error.message).toEqual("Your reset password URL is expired or wrong URL!. Generate new URL and try again.");
        });
    });

    describe("With validations", () => {
        it("Should return error response when missing token", async () => {
            await creteModels();
            const response = await sendRequest('/api/v1/buy2eat/auth/verify-reset-password/some');

            expect(response.statusCode).toBe(400);
            expect(response.body.error.details[0].issue).toEqual("Wrong reset password URL!. Please try again.");
        });
    });
});
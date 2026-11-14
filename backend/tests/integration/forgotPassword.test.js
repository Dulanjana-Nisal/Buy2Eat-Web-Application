// mocks modules
jest.mock('../../src/utils/sendEmails', () => {
    return {
        sendEmailResetPassword: jest.fn(),
    }
});

jest.mock('crypto', () => {
    const actualValue = jest.requireActual('crypto');
    const mockHash = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('hashed_reset_token'),
    };

    const mockBites = {
        toString: jest.fn().mockReturnValue("reset_token"),
    }

    return {
        ...actualValue,
        randomBytes: jest.fn().mockReturnValue(mockBites),
        createHash: jest.fn().mockReturnValue(mockHash),
    }
});

// Application imports
const request = require('supertest');
const app = require('../../src/server');
const resetPasswordModel = require('../../src/models/resetPasswordModel');
const Users = require('../../src/models/userModel');
const { sendEmailResetPassword } = require('../../src/utils/sendEmails');

// HELPERS
const URL = "/api/v1/buy2eat/auth/forgot-password";
const nowDate = new Date();

const createUser = async (overWrites = {}) => {
    const userData = {
        email: 'test@example.com',
        role: 'customer',
    }

    return await Users.create({ ...userData, ...overWrites });
}

const createReset = async () => {
    await resetPasswordModel.create(
        {
            user_id: "exist_user_id",
            resetPasswordToken: "stored_hashed_token",
            createdAt: nowDate,
            expiredAt: new Date(Date.now() + 15 * 60 * 1000), // set to 15 minutes
        }
    );
}

const sendRequest = async (email) => {
    return await request(app).post(URL).send({ email });
}

describe("POST /api/v1/buy2eat/auth/forgot-password", () => {

    beforeAll(async () => {
        await createUser();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe("With valid requires", () => {
        it("Should call sendEmailResetPassword and send success response ( not send any resend link )", async () => {
            const response = await sendRequest('test@example.com');
            const resetPasswordModelCalled = await resetPasswordModel.countDocuments();

            expect(response.statusCode).toBe(200);
            expect(resetPasswordModelCalled).toBe(1);
            expect(response.body).not.toHaveProperty("hashResetToken");
            expect(sendEmailResetPassword).toHaveBeenCalledTimes(1);
            expect(sendEmailResetPassword).toHaveBeenCalledWith('test@example.com', `${process.env.CLIENT_URL}/reset-password/reset_token`);
        });

        // it("Should call sendEmailResetPassword and send success response ( already send reset link )", async () => {
        //     await createReset();
        //     const response = await sendRequest('test@example.com');
        //     const resetPasswordModelCalled = await resetPasswordModel.countDocuments();

        //     expect(response.statusCode).toBe(200);
        //     expect(resetPasswordModelCalled).toBe(1);
        //     expect(response.body).not.toHaveProperty("hashResetToken");
        //     expect(sendEmailResetPassword).toHaveBeenCalledTimes(1);
        //     expect(sendEmailResetPassword).toHaveBeenCalledWith('test@example.com', `${process.env.CLIENT_URL}/reset-password/reset_token`);
        // });
    });
});
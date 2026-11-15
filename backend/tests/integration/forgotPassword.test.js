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

const createModels = async (userOverWrites = {}, resetOverWrites = {}) => {
    const userData = {
        email: 'test@example.com',
        role: 'customer',
    }

    const user = await Users.create({ ...userData, ...userOverWrites });
    const reset = await resetPasswordModel.create({
        ...{
            user_id: user._id,
            resetPasswordToken: "stored_hashed_token",
            createdAt: nowDate,
            expiredAt: new Date(Date.now() + 15 * 60 * 1000), // set to 15 minutes
        }, ...resetOverWrites
    });

    return { user, reset }
}

const sendRequest = async (email) => {
    return await request(app).post(URL).send({ email });
}

describe("POST /api/v1/buy2eat/auth/forgot-password", () => {

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    describe("With valid requires", () => {
        it("Should call sendEmailResetPassword and send success response ( not send any resend link )", async () => {
            const { reset } = await createModels();
            await resetPasswordModel.deleteOne({ user_id: reset.user_id });

            const response = await sendRequest('test@example.com');
            const resetPasswordModelCalled = await resetPasswordModel.countDocuments();

            expect(response.statusCode).toBe(200);
            expect(resetPasswordModelCalled).toBe(1);
            expect(response.body).not.toHaveProperty("hashResetToken");
            expect(sendEmailResetPassword).toHaveBeenCalledTimes(1);
            expect(sendEmailResetPassword).toHaveBeenCalledWith('test@example.com', `${process.env.CLIENT_URL}/reset-password/reset_token`);

            const getResetPasswordData = await resetPasswordModel.findOne({ user_id: reset.user_id });

            expect(getResetPasswordData.resetPasswordToken).toEqual('hashed_reset_token');
            expect(getResetPasswordData).toHaveProperty('createdAt');
            expect(getResetPasswordData).toHaveProperty('expiredAt');
        });

        it("Should call sendEmailResetPassword and send success response ( already send reset link )", async () => {
            await createModels(null, { createdAt: new Date(Date.now() - 60 * 1000) });

            const response = await sendRequest('test@example.com');

            expect(response.statusCode).toBe(200);
            expect(response.body).not.toHaveProperty("hashResetToken");
            expect(sendEmailResetPassword).toHaveBeenCalledTimes(1);
            expect(sendEmailResetPassword).toHaveBeenCalledWith('test@example.com', `${process.env.CLIENT_URL}/reset-password/reset_token`);
        });

        it("Should return success response when user not exist", async () => {
            const response = await sendRequest('test@example.com');
            const resetPasswordModelCalled = await resetPasswordModel.countDocuments();

            expect(response.statusCode).toBe(200);
            expect(sendEmailResetPassword).toHaveBeenCalledTimes(0);
            expect(resetPasswordModelCalled).toBe(0);
        });
    });

    describe("With invalid request for not send any resend link users", () => {
        it("Should return success response when entered not registered email", async () => {
            const { reset } = await createModels();
            await resetPasswordModel.deleteOne({ user_id: reset.user_id });

            const response = await sendRequest('unregisterd@example.com');

            expect(response.statusCode).toBe(200);
            expect(sendEmailResetPassword).toHaveBeenCalledTimes(0);

            const getResetPasswordData = await resetPasswordModel.findOne({ user_id: reset.user_id });

            expect(getResetPasswordData).toBe(null);
        });

        it("Should return success response when failed to create resetPasswordModel in database", async () => {
            const { reset } = await createModels();
            await resetPasswordModel.deleteOne({ user_id: reset.user_id });
            jest.spyOn(resetPasswordModel, 'create').mockRejectedValue(new Error("Failed to create resetPassword"));

            const response = await sendRequest('test@example.com');

            expect(response.statusCode).toBe(200);
            expect(sendEmailResetPassword).toHaveBeenCalledTimes(0);

            const getResetPasswordData = await resetPasswordModel.findOne({ user_id: reset.user_id });

            expect(getResetPasswordData).toBe(null);
        });

        it("Should return success response when failed to send reset link via email", async () => {
            const { reset } = await createModels();
            await resetPasswordModel.deleteOne({ user_id: reset.user_id });

            sendEmailResetPassword.mockRejectedValueOnce(new Error("Failed to send reset link"));

            const response = await sendRequest('test@example.com');
            const getResetPasswordData = await resetPasswordModel.findOne({ user_id: reset.user_id });

            expect(response.statusCode).toBe(200);
            expect(getResetPasswordData).toBe(null);
        });
    });

    describe("With invalid request for already send any resend link users", () => {
        it("Should return success response when cooldown time not over yet", async () => {
            const { reset } = await createModels(null, { createdAt: new Date(Date.now() + 60 * 1000) });

            const response = await sendRequest('test@example.com');
            const getResetPasswordData = await resetPasswordModel.findOne({ user_id: reset.user_id });

            expect(response.statusCode).toBe(429);
            expect(getResetPasswordData).not.toBe(null);
            expect(sendEmailResetPassword).toHaveBeenCalledTimes(0);
        });

        it("Should return success response when failed to send reset link via email", async () => {
            const { reset } = await createModels(null, { createdAt: new Date(Date.now() - 60 * 1000) });

            sendEmailResetPassword.mockRejectedValueOnce(new Error("Failed to send reset link"));

            const response = await sendRequest('test@example.com');
            const getResetPasswordData = await resetPasswordModel.findOne({ user_id: reset.user_id });

            expect(response.statusCode).toBe(200);
            expect(getResetPasswordData).not.toBe(null);
        });

        it("Should return success response when failed to create resetPasswordModel in database", async () => {
            const { reset } = await createModels(null, { createdAt: new Date(Date.now() - 60 * 1000) });
            jest.spyOn(resetPasswordModel, 'create').mockRejectedValue(new Error("Failed to create resetPassword"));
            sendEmailResetPassword.mockRejectedValueOnce(new Error("Failed to send reset link"));

            const response = await sendRequest('test@example.com');
            const getResetPasswordData = await resetPasswordModel.findOne({ user_id: reset.user_id });
            
            expect(response.statusCode).toBe(200);
            expect(getResetPasswordData).not.toBe(null);
        });
    });

    describe("With Validations", () => {
        it("Should return error response when missed email", async () => {
            await createModels(null, { createdAt: new Date(Date.now() - 60 * 1000) });

            const response = await sendRequest('');
            
            expect(response.statusCode).toBe(400);
            expect(response.body.error.message).toEqual('Invalid input data');
            expect(sendEmailResetPassword).toHaveBeenCalledTimes(0);
        });

        it("Should return error response when missed email", async () => {
            await createModels(null, { createdAt: new Date(Date.now() - 60 * 1000) });

            const response = await sendRequest('wrong_email');
            
            expect(response.statusCode).toBe(400);
            expect(response.body.error.details[0].issue).toEqual('Invalid email address');
            expect(sendEmailResetPassword).toHaveBeenCalledTimes(0);
        });
    })
});
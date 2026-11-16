// mock modules
jest.mock('crypto', () => {
    const actualValue = jest.requireActual('crypto');
    const mockHash = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('hashed_reset_token'),
    };

    return {
        ...actualValue,
        createHash: jest.fn().mockReturnValue(mockHash),
    }
});

jest.mock('bcryptjs', () => {
    const actualValue = jest.requireActual('bcryptjs');
    return {
        ...actualValue,
        hash: jest.fn().mockResolvedValue("hashed_new_password"),
    }
});

jest.mock('../../src/services/token.service', () => {
    const actualValue = jest.requireActual('../../src/services/token.service');
    return {
        ...actualValue,
        createRefreshToken: jest.fn(actualValue.createRefreshToken),
    };
});

// Application imports
const request = require('supertest');
const app = require('../../src/server');
const resetPasswordModel = require('../../src/models/resetPasswordModel');
const Users = require('../../src/models/userModel');
const refreshTokenModel = require('../../src/models/refreshTokenModel');
const bcrypt = require('bcryptjs');
const { createRefreshToken } = require('../../src/services/token.service');

// HELPERS
const URL = '/api/v1/buy2eat/auth/reset-password';
const nowDate = new Date();

const sendRequest = async (overWrites = {}) => {
    return await request(app).post(URL).send({ ...{ token: 'token_value', newPassword: "new_sample_password" }, ...overWrites });
}

const createDatabaseModels = async (userOverwrites = {}, resetOverwrites = {}, refreshOverwrites = {}) => {
    const user = await Users.create({
        ...{
            email: 'test@example.com',
            role: 'customer',
        },
        ...userOverwrites,
    });

    const reset = await resetPasswordModel.create({
        ...{
            user_id: user._id,
            resetPasswordToken: "hashed_reset_token",
            createdAt: nowDate,
            expiredAt: new Date(Date.now() + 15 * 60 * 1000), // set up to 15 minutes
        },
        ...resetOverwrites,
    });

    const modelPayload = {
        user_id: user._id,
        familyId: "family_id",
        hashToken: "hashed_refresh_token",
        deviceInfo: {
            userAgent: "user_agent",
            ipAddress: "ip_address",
        },
        rememberMe: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // set up to 1 month
    }
    const refresh = await refreshTokenModel.create({ ...modelPayload, ...refreshOverwrites })

    return { user, reset, refresh }
}

// check cookies that generated while running test cases
const cookieChecking = (response) => {
    const cookiesData = response?.headers['set-cookie'] ? response.headers['set-cookie'] : null;
    const refreshCookie = cookiesData ? cookiesData.some(cookiesData => cookiesData.includes("refreshToken=")) : null;

    return { cookiesData, refreshCookie }
}

describe("POST /api/v1/buy2eat/auth/reset-password", () => {

    afterEach(async () => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    describe("With valid response", () => {
        it("Should return success response with valid credentials", async () => {
            const { user, reset, refresh } = await createDatabaseModels();
            const response = await sendRequest();

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('accessToken');
            expect(response.body).not.toHaveProperty('refreshToken');

            const { cookiesData, refreshCookie } = cookieChecking(response);

            expect(cookiesData).toBeDefined();
            expect(refreshCookie).toBe(true);

            const refreshTokenData = await refreshTokenModel.findOne({ user_id: refresh.user_id });
            const resetPasswordData = await resetPasswordModel.findOne({ user_id: reset.user_id });

            expect(refreshTokenData.familyId).toEqual('family_id');
            expect(refreshTokenData.isRevoked).toBe(true);
            expect(resetPasswordData).toBe(null);
            await expect(bcrypt.hash).toHaveBeenCalledTimes(1); // check new password was hashed

            const userData = await Users.findOne({ _id: user._id });

            expect(userData.password).toEqual("hashed_new_password");
        });
    });

    describe("With invalid response", () => {
        it("Should return error response when entered password with less than 8 characters", async () => {
            const response = await sendRequest({ newPassword: "123" });

            expect(response.statusCode).toBe(400);
            expect(response.body.error.message).toEqual("New Password must have more that 8 Numbers!");

            const { cookiesData, refreshCookie } = cookieChecking(response);

            expect(cookiesData).toBe(null);
            expect(refreshCookie).toBe(null);
        });

        it("Should return error response when reset link data missing in db records", async () => {
            const { user } = await createDatabaseModels();
            await resetPasswordModel.deleteMany({});

            const response = await sendRequest();

            expect(response.statusCode).toBe(400);
            expect(response.body.error.message).toEqual("Your reset password link is expired or Invalid token!");

            const { cookiesData, refreshCookie } = cookieChecking(response);

            expect(cookiesData).toBe(null);
            expect(refreshCookie).toBe(null);

            const userData = await Users.findOne({ _id: user._id });

            expect(userData.password).not.toEqual("hashed_new_password");
        });

        it("Should return error response when failed to update user password", async () => {
            const { user, refresh } = await createDatabaseModels();
            jest.spyOn(Users, 'findOneAndUpdate').mockResolvedValue(false);

            const response = await sendRequest();

            expect(response.statusCode).toBe(404);
            expect(response.body.error.message).toEqual("User does not exist!");

            const { cookiesData, refreshCookie } = cookieChecking(response);

            expect(cookiesData).toBe(null);
            expect(refreshCookie).toBe(null);

            const refreshTokenData = await refreshTokenModel.findOne({ user_id: refresh.user_id });

            expect(refreshTokenData.isRevoked).toBe(false);

            const userData = await Users.findOne({ _id: user._id });

            expect(userData.password).not.toEqual("hashed_new_password");
        });

        it("Should return error response when refresh token data not exist on db", async () => {
            const { user } = await createDatabaseModels();
            jest.spyOn(refreshTokenModel, 'findOne').mockResolvedValue(false);

            const response = await sendRequest();

            expect(response.statusCode).toBe(401);
            expect(response.body.error.message).toEqual("Can't Reset your Password!. Please try again later.");

            const { cookiesData, refreshCookie } = cookieChecking(response);

            expect(cookiesData).toBe(null);
            expect(refreshCookie).toBe(null);

            const userData = await Users.findOne({ _id: user._id });

            expect(userData.password).not.toEqual("hashed_new_password");
        });


        it("Should return error response when failed to generate new refresh token", async () => {
            const { user } = await createDatabaseModels();
            createRefreshToken.mockRejectedValueOnce(new Error("Error"));

            const response = await sendRequest();

            expect(response.statusCode).toBe(500);
            expect(response.body.error.message).toEqual("Reset Password Failed!. Please try again later.");

            const { cookiesData, refreshCookie } = cookieChecking(response);

            expect(cookiesData).toBe(null);
            expect(refreshCookie).toBe(null);

            const userData = await Users.findOne({ _id: user._id });

            expect(userData.password).not.toEqual("hashed_new_password");
        });
    });

    describe("With validations", () => {
        it("Should return error response when entered empty inputs", async () => {
            const response = await sendRequest({ token: "", newPassword: "" });

            expect(response.statusCode).toBe(400);
            expect(response.body.error.message).toEqual("Invalid input data");

            const { cookiesData, refreshCookie } = cookieChecking(response);

            expect(cookiesData).toBe(null);
            expect(refreshCookie).toBe(null);
        });

        it("Should return error response when entered non string inputs", async () => {
            const response = await sendRequest({ token: { $ne: null } , newPassword: { $ne: null } });

            expect(response.statusCode).toBe(400);
            expect(response.body.error.message).toEqual("Invalid input data");

            const { cookiesData, refreshCookie } = cookieChecking(response);

            expect(cookiesData).toBe(null);
            expect(refreshCookie).toBe(null);
        });

        it("Should return error response when token value is missing", async () => {
            const response = await sendRequest({ token: "" , newPassword: "sample_password" });

            expect(response.statusCode).toBe(400);
            expect(response.body.error.details[0].issue).toEqual("Please provide token value!");

            const { cookiesData, refreshCookie } = cookieChecking(response);

            expect(cookiesData).toBe(null);
            expect(refreshCookie).toBe(null);
        });
    })
});
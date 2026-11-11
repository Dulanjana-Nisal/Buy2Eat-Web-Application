// application imports
const request = require('supertest');
const app = require('../../src/server');
const Users = require('../../src/models/userModel');
const bcrypt = require('bcryptjs');
const tokenService = require('../../src/services/token.service');

jest.mock('../../src/services/token.service', () => {
    const actualModule = jest.requireActual('../../src/services/token.service')
    return {
        ...actualModule,
        createRefreshToken: jest.fn(),
    }
})

// Helpers for test cases
const URL = '/api/v1/buy2eat/auth/login';

const sampleUser = {
    email: "sample@example.com",
    password: "password123",
    rememberMe: true,
}

const responseSuite = (overWrites = {}) => {
    return request(app).post(URL).send({ ...sampleUser, ...overWrites });
}

const userDatabaseSuite = async (email, password, role) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await Users.create({
        email: email,
        password: hashedPassword,
        role: role,
        agreement: {
            accepted: true,
            version: process.env.AGREEMENT_VERSION,
            acceptedAt: new Date(),
        },
    });
}

// helper function for catch refresh token in inside cookie and return true if cookie exist 
const cookieChecking = (response) => {
    const cookies = response?.headers['set-cookie'] ? response.headers['set-cookie'] : null;
    const cookieTokenData = cookies ? cookies.some(cookie => cookie.includes("refreshToken=")) : null;

    return { cookies, cookieTokenData }
}

// Test case for auth login 
describe("POST /api/v1/buy2eat/auth/login", () => {

    afterEach(() => {
        jest.clearAllMocks();
    })

    describe("With valid credentials", () => {
        it("Should return status code 200 with access token", async () => {
            await userDatabaseSuite(sampleUser.email, sampleUser.password, "customer");

            const response = await responseSuite();
            const { cookies, cookieTokenData } = cookieChecking(response);

            expect(response.statusCode).toBe(200);
            expect(response.body.user).toBeDefined();
            expect(response.body.user).toHaveProperty("accessToken");
            expect(cookies).toBeDefined();
            expect(cookieTokenData).toBe(true);
        });
    });

    describe("With invalid credentials", () => {
        it("Should return status code 200 even input email is not normalized", async () => {
            await userDatabaseSuite(sampleUser.email, sampleUser.password, "customer");

            const response = await responseSuite({ email: "Sample@eXample.COm" });
            const { cookies, cookieTokenData } = cookieChecking(response);

            expect(response.statusCode).toBe(200);
            expect(response.body.user.email).toEqual("sample@example.com");
            expect(response.body.user).toHaveProperty("accessToken");
            expect(cookies).toBeDefined();
            expect(cookieTokenData).toBe(true);
        });

        it("Should return 400 status code when password less that 8 characters", async () => {
            const response = await responseSuite({ password: "123" });

            const { cookies, cookieTokenData } = cookieChecking(response);

            expect(response.statusCode).toBe(400);
            expect(response.body.error.message).toEqual("Password does not meet requirements");
            expect(cookies).toBe(null);
            expect(cookieTokenData).toBe(null);
        });

        it("Should return 401 status code when user dose not exist", async () => {
            await Users.findOne({ email: "nonexistuser@gmail.com" });

            const response = await responseSuite();
            const { cookies, cookieTokenData } = cookieChecking(response);

            expect(response.statusCode).toBe(401);
            expect(response.body.user).not.toBeDefined();
            expect(response.body.error.message).toEqual("Invalid email or password");
            expect(cookies).toBe(null);
            expect(cookieTokenData).toBe(null);
        });

        it("Should return 401 status code when password is wrong", async () => {
            await userDatabaseSuite(sampleUser.email, sampleUser.password, "customer");

            const response = await responseSuite({ password: "wrong_password" });
            const { cookies, cookieTokenData } = cookieChecking(response);

            expect(response.statusCode).toBe(401);
            expect(response.body.user).not.toBeDefined();
            expect(response.body.error.message).toEqual("Invalid email or password");
            expect(cookies).toBe(null);
            expect(cookieTokenData).toBe(null);
        });

        it("Should return 409 status code when failed to create tokens", async () => {
            await userDatabaseSuite(sampleUser.email, sampleUser.password, "customer");

            tokenService.createRefreshToken.mockRejectedValue(new Error("Token Error!"));

            const response = await responseSuite();
            const { cookies, cookieTokenData } = cookieChecking(response);

            expect(response.statusCode).toBe(409);
            expect(response.body.user).not.toBeDefined();
            expect(response.body.error.message).toEqual("Error while generating token!. Try again later.");
            expect(cookies).toBe(null);
            expect(cookieTokenData).toBe(null);
        });
    });

    describe("With failed validations", () => {
        it("Should return 400 status code when missing required inputs", async () => {
            const response = await responseSuite({ email: "", password: "", role: "", agreement: {} });
            const { cookies, cookieTokenData } = cookieChecking(response);

            expect(response.statusCode).toBe(400);
            expect(response.body.error.message).toEqual("Invalid input data");
            expect(response.body.user).not.toBeDefined();
            expect(cookies).toBe(null);
            expect(cookieTokenData).toBe(null);
        });

        it("Should return 400 status code when invalid email", async () => {
            const response = await responseSuite({ email: "invalid_email" });
            const { cookies, cookieTokenData } = cookieChecking(response);

            expect(response.statusCode).toBe(400);
            expect(response.body.error.details[0].issue).toEqual("Invalid email address");
            expect(response.body.user).not.toBeDefined();
            expect(cookies).toBe(null);
            expect(cookieTokenData).toBe(null);
        });

        it("Should return 400 status code when password is missing", async () => {
            const response = await responseSuite({ password: "" });
            const { cookies, cookieTokenData } = cookieChecking(response);

            expect(response.statusCode).toBe(400);
            expect(response.body.error.details[0].issue).toEqual("Password is required");
            expect(response.body.user).not.toBeDefined();
            expect(cookies).toBe(null);
            expect(cookieTokenData).toBe(null);
        });
    });
}); 
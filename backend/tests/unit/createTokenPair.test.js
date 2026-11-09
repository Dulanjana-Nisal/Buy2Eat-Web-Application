// mock imports
jest.mock('../../src/errors/AppError');

// imports
const jwt = require("jsonwebtoken");
const { createTokenPair } = require('../../src/services/token.service');
const AppError = require("../../src/errors/AppError");

// Test token pair creation
describe("Test token pair creation in token service", () => {

    // user sample data
    const userData = {
        _id: "test_id_1",
        email: "user@example.com",
        role: 'customer',
    }

    // before each setup all spyOn implementations
    beforeEach(() => {
        jest.spyOn(jwt, 'sign').mockReturnValueOnce('access_token');  // mock access token using spyOn
        jest.spyOn(jwt, 'sign').mockReturnValueOnce('refresh_token'); // mock refresh token using spyOn
    })

    // after all test suite restore mocks
    afterEach(() => {
        jest.restoreAllMocks();
    })

    // Case 1: with Valid credentials
    it("Should return generated access and refresh tokens", () => {
        const result = createTokenPair(userData, { refreshExpire: null, rememberMe: false });
        expect(result).toEqual({ accessToken: "access_token", refreshToken: "refresh_token" });
    });

    // Case 1: with invalid credentials (refreshExpire = wrong_type)
    it("Should throw custom error response", async () => {
        expect(() => createTokenPair(userData, { refreshExpire: "wrong_type", rememberMe: false })).toThrow();
    })
})
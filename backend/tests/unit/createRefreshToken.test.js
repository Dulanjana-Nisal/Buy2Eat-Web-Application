// import calculateRefreshExpired for mock
jest.mock("../../src/utils/calculateRefreshExpired");

// import crypto and mock it 
jest.mock('crypto', () => {
    const mockHash = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('hashed_token'),
    };

    return {
        randomUUID: jest.fn(),
        createHash: jest.fn().mockReturnValue(mockHash),
    }
});

// import refreshTokenModel schema and mock it
jest.mock("../../src/models/refreshTokenModel", () => {
    return {
        create: jest.fn(),
    }
});

// service dependency imports
const calculateExpired = require('../../src/utils/calculateRefreshExpired');
const crypto = require('crypto');
const refreshTokenModel = require('../../src/models/refreshTokenModel');
const tokenService = require('../../src/services/token.service');

// Test Refresh token creation
describe("Test Refresh token creation in token service", () => {

    // before each should implement all mocks returns
    beforeEach(() => {
        calculateExpired.mockReturnValue({ expiresAt: "expires_At" });
        crypto.randomUUID.mockReturnValue("random_id");
        refreshTokenModel.create.mockResolvedValue({ success: true });
    })

    // after each should clear all mocks
    afterEach(() => {
        jest.clearAllMocks();
    });

    // Case 1: call with valid credentials with session null
    it("Should call createRefreshToken with user modelPayload", async () => {

        // req sample details
        const req = { headers: { "user-agent": "user-agent" }, ip: "ip_address" }

        await tokenService.createRefreshToken(
            req,
            user = { _id: 'user_id' },
            "refreshToken",
        );

        expect(refreshTokenModel.create).toHaveBeenCalledTimes(1);
        expect(calculateExpired).toHaveBeenCalledWith(null, false);
        expect(refreshTokenModel.create).toHaveBeenCalledWith(
            {
                user_id: "user_id",
                familyId: "random_id",
                hashToken: "hashed_token",
                deviceInfo: {
                    userAgent: "user-agent",
                    ipAddress: "ip_address",
                },
                rememberMe: false,
                expiresAt: "expires_At",
            }
        )
    });

    // Case 2: call with valid credentials with session true
    it("Should call createRefreshToken with user modelPayload and session", async () => {

        // req sample details
        const req = { headers: { "user-agent": "user-agent" }, ip: "ip_address" }

        await tokenService.createRefreshToken(
            req,
            user = { _id: 'user_id' },
            "refreshToken",
            {
                session: "session",
            }
        );

        expect(refreshTokenModel.create).toHaveBeenCalledTimes(1);
        expect(calculateExpired).toHaveBeenCalledWith(null, false);
        expect(refreshTokenModel.create).toHaveBeenCalledWith(
            [{
                user_id: "user_id",
                familyId: "random_id",
                hashToken: "hashed_token",
                deviceInfo: {
                    userAgent: "user-agent",
                    ipAddress: "ip_address",
                },
                rememberMe: false,
                expiresAt: "expires_At",
            }], { "session": "session" }
        );
    });

    // Case 3: call with invalid credentials
    it("Should throw Error message", async () => {

        // req sample details
        const req = undefined
        const result = tokenService.createRefreshToken(
            req,
            user = { _id: 'user_id' },
            "refreshToken",
            {
                session: "session",
            }
        );

        await expect(() => result).rejects.toThrow()
    });
})
const calculateExpired = require("../../src/utils/calculateRefreshExpired");

// Test for Refresh token Expired generation
describe("Test Refresh token expired time", () => {

    // after each tern back time in to real time
    afterEach(() => {
        jest.useRealTimers();
    })
    
    // Case 1: With valid credentials with have a refreshExpiry
    it("Should return correct remaining time and expired time for refresh token", () => {
        jest.useFakeTimers();
        jest.setSystemTime( new Date("2026-11-10T12:00:00Z") );

        const now = new Date();
        const refreshExpiry = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const rememberMe = true;
        
        const result = calculateExpired(refreshExpiry, rememberMe);
        expect(result).toEqual({"remainingTimeMs": 86400000, "expiresAt": new Date("2026-11-11T12:00:00.000Z")});
    });

    // Case 1: With valid credentials without have a refreshExpiry
    it("Should return correct remaining time and expired time for refresh token", () => {
        jest.useFakeTimers();
        jest.setSystemTime( new Date("2026-11-10T12:00:00Z") );

        const refreshExpiry = undefined;
        const rememberMe = true;
        
        const result = calculateExpired(refreshExpiry, rememberMe);
        expect(result).toEqual({"remainingTimeMs": 5184000000, "expiresAt": new Date("2027-01-09T12:00:00.000Z")});
    });

    // Case 1: With invalid credentials
    it("Should Throw Error", () => {
        const now = new Date();
        const refreshExpiry = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const rememberMe = false;
        expect(() => calculateExpired(refreshExpiry, rememberMe)).toThrow();
    });
})
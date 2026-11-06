// imports
const maskEmail = require('../../src/utils/maskEmail');

// create a tests for maskEmail.js
describe("Test Mask Email", () => {

    // Test case 1: Valid email
    it("should validate correct coordinates", () => {
        const result = maskEmail("example@sample.com");
        expect(result).toEqual("exa****le@sam***le.com");
    });

    // Test case 2: Invalid email (empty input)
    it("should return false for empty input", () => {
        const result = maskEmail("");
        expect(result).toBe(false);
    });

    // Test case 3: Invalid email (wrong email)
    it("should return false for wrong email", () => {
        const result = maskEmail("wrong email here");
        expect(result).toBe(false);
    });
})
// imports
const validateCoordinates = require('../../src/utils/coordinateValidator');

// create a tests for coordinateValidator.js
describe("Test Coordinate Validator", () => {

    // Test case 1: Valid coordinates
    it("should validate correct coordinates", () => {
        const result = validateCoordinates([6.916513311077062, 81.38820517112659]);
        expect(result).toBe(true);
    });

    // Test case 2: Invalid coordinates (not an array)
    it("should return false for non-array input", () => {
        const result = validateCoordinates("not an array");
        expect(result).toBe(false);
    });

    // Test case 3: Invalid coordinates (wrong length)
    it("should return false for array with wrong length", () => {
        const result = validateCoordinates([6.916513311077062]);
        expect(result).toBe(false);
    });

    // Test case 4: Invalid coordinates (out of range)
    it("should return false for coordinates out of range", () => {
        const result = validateCoordinates([200, 100]);
        expect(result).toBe(false);
    });
})
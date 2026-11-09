// create mock for bcrypt module
jest.mock('bcryptjs', () => {
    return {
        hash: jest.fn(),
    }
});

// create mock for crypto module
jest.mock('crypto', () => {
    return {
        randomInt: jest.fn(),
        randomUUID: jest.fn(),
    }
});

// create mock for registerOtpModel schema
jest.mock("../../src/models/registrationOtpModel", () => {
    return {
        create: jest.fn().mockResolvedValue({ expiresAt: "sample_time" }),
        deleteMany: jest.fn().mockResolvedValue(true),
    }
});

// create mock for maskEmail utils
jest.mock("../../src/utils/maskEmail");

// create mock for sendEmail utils
jest.mock("../../src/utils/sendEmails");

// application imports
const OTPHelper = require('../../src/services/otp.service');
const maskEmail = require('../../src/utils/maskEmail');
const { sendEmailOTP } = require('../../src/utils/sendEmails');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Test OTP service
describe("Test OTPHelper service", () => {

    // beforeEach should implement all mocks
    beforeEach(() => {
        crypto.randomInt.mockReturnValue("123456");
        bcrypt.hash.mockResolvedValue("hash!otp?123");
        crypto.randomUUID.mockReturnValue('randomID');
        maskEmail.mockReturnValue("masked@gmail.com");
        sendEmailOTP.mockResolvedValue(true);
    });

    // afterEach should clear all mock
    afterEach(() => {
        jest.clearAllMocks();
    });

    // case 1: send otp via email and return success message
    it('Should call sendEmail function and return success messages', async () => {

        const result = await OTPHelper({
            normalizedEmail: "user@example.com",
            role: "customer",
            hashedPassword: "hashedPAssword",
            profile_data: {},
            accept_agreement: true,
        });

        expect(result).toEqual(
            {
                success: true,
                message: 'OTP send successfully...',
                verification_id: "randomID",
                masked_email: "masked@gmail.com",
                expiresAt: "sample_time"
            }
        )
        expect(maskEmail).toHaveBeenCalledWith("user@example.com"); // check masked email is called correctly
        expect(bcrypt.hash).toHaveBeenCalledWith("123456", 10); // check hashed password call correct arguments
        expect(sendEmailOTP).toHaveBeenCalledTimes(1); // check sendOtp called once
    });

    // case 2: Failed to send otp if emails is missing 
    it('Should return success: false when email missing ', async () => {

        const result = await OTPHelper({
            normalizedEmail: undefined,
            role: "customer",
            hashedPassword: "hashedPAssword",
            profile_data: {},
            accept_agreement: true,
        });

        expect(result.success).toBe(false);
        expect(sendEmailOTP).toHaveBeenCalledTimes(0);
    });

    // case 3: Failed to send otp if role is incorrect 
    it('Should return success: false when role is incorrect ', async () => {

        const result = await OTPHelper({
            normalizedEmail: "user@example.com",
            role: "incorrect_role",
            hashedPassword: "hashedPAssword",
            profile_data: {},
            accept_agreement: true,
        });

        expect(result.success).toBe(false);
        expect(sendEmailOTP).toHaveBeenCalledTimes(0);
    });
})
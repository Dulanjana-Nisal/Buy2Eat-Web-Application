jest.mock('../../src/services/otp.service', () => {
    return jest.fn()
});

// import application modules
const request = require('supertest');
const app = require('../../src/server');
const OTPHelper = require('../../src/services/otp.service');
const User = require("../../src/models/userModel");

//  ===== Helpers for test cases ===== //
const URL = "/api/v1/buy2eat/auth/register-customer";

let sampleUser;

const responseSuite = (overWrites = {}) => request(app).post(URL).send({...sampleUser, ...overWrites});

const userCreationSuite = async () => {
    await User.create({
        email: "existuser@example.com",
        password: "password123",
        role: "customer",
        agreement: {
            accepted: true,
            version: process.env.AGREEMENT_VERSION,
            acceptedAt: new Date(),
        },
    });
}

//  ===== =================== ===== //

describe("POST /api/v1/buy2eat/auth/register-customer", () => {

    // before every test suite call implement sample user meta data
    beforeEach(() => {
        sampleUser = {
            first_name: "Test",
            last_name: "User",
            email: "sample@example.com",
            password: "password123",
            conformPass: "password123",
            phone_number: "0712165810",
            accept_agreement: true,
        }
    })

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("With valid inputs", () => {
        it("Should send OTP and return 200 status code with success message", async () => {
            OTPHelper.mockResolvedValue({ success: true, message: "OTP send", });

            const response = await responseSuite();

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({ "register_with": "email", "message": "OTP send", "success": true });
            expect(response.body).not.toHaveProperty('password');
            expect(OTPHelper).toHaveBeenCalledTimes(1);
        });
    });

    describe("With invalid inputs", () => {
        it("Should return 400 when password shorter that 8 characters", async () => {
            OTPHelper.mockResolvedValue({ success: true, message: "OTP send", });

            const response = await responseSuite({ password: "123", conformPass: "123" });

            expect(response.statusCode).toBe(400);
            expect(response.body.error.message).toEqual("Password must have at least 8 characters");
            expect(OTPHelper).not.toHaveBeenCalled();
        });

        it("Should return 400 error code when password and confPass mismatch", async () => {
            OTPHelper.mockResolvedValue({ success: true, message: "OTP send", });

            const response = await responseSuite({ password: "12345678", conformPass: "87654321" });

            expect(response.statusCode).toBe(400);
            expect(response.body.error.details[0].issue).toEqual("Passwords do not match");
            expect(OTPHelper).not.toHaveBeenCalled();
        });

        it("Should return 400 error code when agreement not sign", async () => {
            OTPHelper.mockResolvedValue({ success: true, message: "OTP send", });

            const response = await responseSuite({ accept_agreement: false });

            expect(response.statusCode).toBe(400);
            expect(response.body.error.details[0].issue).toEqual("Please agree with Terms of services and Privacy Policy");
            expect(OTPHelper).not.toHaveBeenCalled();
        });

        it("Should Throw 409 error code while email is already registered", async () => {
            OTPHelper.mockResolvedValue({ success: true, message: "OTP send", });

            await userCreationSuite();

            await User.findOne({ email: "existuser@example.com" });

            const response = await responseSuite({ email: "existuser@example.com" });

            expect(response.statusCode).toBe(409);
            expect(response.body.error.message).toEqual("Email is already registered!");
            expect(OTPHelper).not.toHaveBeenCalled();
        });

        it("Should return 502 error code when Send OTP Failed", async () => {
            OTPHelper.mockResolvedValue({ success: false, message: "OTP send failed", });

            const response = await responseSuite();

            expect(response.statusCode).toBe(502);
            expect(response.body.error.message).toEqual("Send OTP Failed!");
        });
    });

    describe("With validations", () => {
        it("Should return 400 error code when invalid credentials", async () => {
            OTPHelper.mockResolvedValue({ success: true, message: "OTP send", });

            const response = await responseSuite({
                first_name: "",
                last_name: "",
                email: "",
                password: "",
                conformPass: "",
                phone_number: "",
                accept_agreement: "",
            });

            expect(response.statusCode).toBe(400);
            expect(response.body.error.message).toEqual("Invalid input data");
            expect(OTPHelper).not.toHaveBeenCalled();
        });

        it("Should return 400 error code while entered Invalid email address", async () => {
            OTPHelper.mockResolvedValue({ success: true, message: "OTP send", });

            const response = await responseSuite({ email: "wrong_email" });

            expect(response.statusCode).toBe(400);
            expect(response.body.error.details[0].issue).toEqual("Invalid email address");
            expect(OTPHelper).not.toHaveBeenCalled();
        });

        it("Should return 400 error code while entered Invalid phone number format", async () => {
            OTPHelper.mockResolvedValue({ success: true, message: "OTP send", });

            const response = await responseSuite({ phone_number: "wrong123" });

            expect(response.statusCode).toBe(400);
            expect(response.body.error.details[0].issue).toEqual("Invalid phone number format");
            expect(OTPHelper).not.toHaveBeenCalled();
        });
    });
});
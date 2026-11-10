// import otp service for mock
jest.mock('../../src/services/otp.service', () => {
    return jest.fn()
});

// import application modules
const request = require('supertest');
const app = require('../../src/server');
const OTPHelper = require('../../src/services/otp.service');
const User = require("../../src/models/userModel");

describe("POST /api/v1/buy2eat/auth/register-seller", () => {
    // sample user data
    let sampleUser;

    // before each should execute original Sample user data set
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

    // afterEach should clear all mock data
    afterEach(() => {
        jest.clearAllMocks();
    });

    // ========== MAIN CONTROLLER ========== //

    // Case 1: Call register seller end point with correct credentials
    it("Should return success message with user data", async () => {
        OTPHelper.mockResolvedValue({ success: true, message: "OTP send", }); // mock OTP helper service

        // call the endpoint
        const response = await request(app).post("/api/v1/buy2eat/auth/register-seller").send(sampleUser);

        expect(response.statusCode).toBe(200); // test status code
        expect(response.body).toEqual({ "register_with": "email", "message": "OTP send", "success": true }); // test return value
        expect(OTPHelper).toHaveBeenCalledTimes(1);
    });

    // Case 2: Call register seller end point with invalid password ( less than 8 characters )
    it("Should Throw 400 status code with with error message", async () => {
        OTPHelper.mockResolvedValue({ success: true, message: "OTP send", }); // mock OTP helper service

        // sample user data
        sampleUser.password = "123";
        sampleUser.conformPass = "123";

        // call the endpoint
        const response = await request(app).post("/api/v1/buy2eat/auth/register-seller").send(sampleUser);

        expect(response.statusCode).toBe(400); // test status code
        expect(response.body.error.message).toEqual("Password must have at least 8 characters"); // test return value
        expect(OTPHelper).not.toHaveBeenCalled(); // test send OTP
    });

    // Case 3: Call register seller end point with invalid password ( password and confPass is not match )
    it("Should Throw 400 error code with 'Passwords do not match' error message", async () => {
        OTPHelper.mockResolvedValue({ success: true, message: "OTP send", }); // mock OTP helper service

        // sample user data
        sampleUser.password = "12345678";
        sampleUser.conformPass = "87654321";

        // call the endpoint
        const response = await request(app).post("/api/v1/buy2eat/auth/register-seller").send(sampleUser);

        expect(response.statusCode).toBe(400); // test status code
        expect(response.body.error.details[0].issue).toEqual("Passwords do not match"); // test return value
        expect(OTPHelper).not.toHaveBeenCalled(); // test send OTP
    });

    // Case 4: Call register seller end point with invalid agreement ( agreement not accepted )
    it("Should Throw 400 error code with 'Please agree with Terms of services and Privacy Policy' error message", async () => {
        OTPHelper.mockResolvedValue({ success: true, message: "OTP send", }); // mock OTP helper service

        // sample user data
        sampleUser.accept_agreement = false;

        // call the endpoint
        const response = await request(app).post("/api/v1/buy2eat/auth/register-seller").send(sampleUser);

        expect(response.statusCode).toBe(400); // test status code
        expect(response.body.error.details[0].issue).toEqual("Please agree with Terms of services and Privacy Policy");
        expect(OTPHelper).not.toHaveBeenCalled(); // test send OTP 
    });

    // Case 5: Call register seller end point with already exist email
    it("Should Throw 409 error code with 'Email is already registered!' error message", async () => {
        OTPHelper.mockResolvedValue({ success: true, message: "OTP send", }); // mock OTP helper service

        // sample user data
        sampleUser.email = "existuser@example.com";

        await User.create({
            email: "existuser@example.com",
            password: "password123",
            role: "seller",
            agreement: {
                accepted: true,
                version: process.env.AGREEMENT_VERSION,
                acceptedAt: new Date(),
            },
        });

        // call database
        await User.findOne({ email: "existuser@example.com" });

        // call the endpoint
        const response = await request(app).post("/api/v1/buy2eat/auth/register-seller").send(sampleUser);

        expect(response.statusCode).toBe(409); // test status code
        expect(response.body.error.message).toEqual("Email is already registered!"); // test return value
        expect(OTPHelper).not.toHaveBeenCalled(); // test send OTP
    });

    // Case 6: Call register seller end point with otp fail
    it("Should Throw 502 error code with 'Send OTP Failed!' error message", async () => {
        OTPHelper.mockResolvedValue({ success: false, message: "OTP send failed", }); // mock OTP helper service

        // call the endpoint
        const response = await request(app).post("/api/v1/buy2eat/auth/register-seller").send(sampleUser);

        expect(response.statusCode).toBe(502); // test status code
        expect(response.body.error.message).toEqual("Send OTP Failed!"); // test return value
    });

    // ========== VALIDATIONS ========== //

    // Case 7: Call register seller end point with invalid credentials
    it("Should Throw 400 error code with validation error message", async () => {
        OTPHelper.mockResolvedValue({ success: true, message: "OTP send", }); // mock OTP helper service

        // sample user data
        sampleUser = {};

        // call the endpoint
        const response = await request(app).post("/api/v1/buy2eat/auth/register-seller").send(sampleUser);

        expect(response.statusCode).toBe(400); // test status code
        expect(response.body.error.message).toEqual("Invalid input data");
        expect(OTPHelper).not.toHaveBeenCalled(); // test send OTP 
    });

    // Case 8: Call register seller end point with invalid credentials ( wrong email type )
    it("Should Throw 400 error code with 'Invalid email address' error message", async () => {
        OTPHelper.mockResolvedValue({ success: true, message: "OTP send", }); // mock OTP helper service

        // sample user data
        sampleUser.email = "wrong_email";

        // call the endpoint
        const response = await request(app).post("/api/v1/buy2eat/auth/register-seller").send(sampleUser);

        expect(response.statusCode).toBe(400); // test status code
        expect(response.body.error.details[0].issue).toEqual("Invalid email address");
        expect(OTPHelper).not.toHaveBeenCalled(); // test send OTP 
    });

    // Case 9: Call register seller end point with invalid credentials ( wrong phone number type )
    it("Should Throw 400 error code with 'Invalid phone number format' error message", async () => {
        OTPHelper.mockResolvedValue({ success: true, message: "OTP send", }); // mock OTP helper service

        // sample user data
        sampleUser.phone_number = "wrong123";

        // call the endpoint
        const response = await request(app).post("/api/v1/buy2eat/auth/register-seller").send(sampleUser);

        expect(response.statusCode).toBe(400); // test status code
        expect(response.body.error.details[0].issue).toEqual("Invalid phone number format");
        expect(OTPHelper).not.toHaveBeenCalled(); // test send OTP 
    });
});
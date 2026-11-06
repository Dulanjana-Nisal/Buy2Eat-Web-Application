const request = require("supertest");
const app = require("../src/server");

// mock authentication token
const OTPHelper = require("../src/services/otp.service");
jest.mock("../src/services/otp.service")

describe("Sample test suite", () => {

    beforeAll(async () => {
        OTPHelper.mockReturnValue({
            success: true,
            message: "OTP sent successfully",
            verification_id: "sample-verification-id",
            masked_email: "sample@example.com",
            expiresAt: new Date(Date.now() + 300000),
        })
    });
    
    it("should pass this sample test", () => {
        expect(true).toBe(true);
    });

    it("Test some api endpoint", async () => {
        const res = await request(app).post("/api/v1/buy2eat/auth/register-customer").send({
            first_name: "John",
            last_name: "Doe",
            email: "john.doe@example.com",
            password: "password123",
            conformPass: "password123",
            phone_number: "+1234567890",
            accept_agreement: true
        })

        expect(res.statusCode).toEqual(200);
    })

    it("Test some wrong api endpoint", async () => {
        const res = await request(app).post("/api/v1/buy2eat/auth/register-customer").send({
            first_name: "John",
            email: "john.doe@example.com",
            password: "password123",
            conformPass: "password123",
            phone_number: "+1234567890",
            accept_agreement: true
        })

        expect(res.statusCode).toEqual(400);
    })
});


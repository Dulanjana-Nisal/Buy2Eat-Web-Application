jest.mock('../../src/utils/sendEmails', () => {
    return {
        resendEmailOTP: jest.fn(),
    }
});

jest.mock('bcryptjs', () => {
    return {
        hash: jest.fn().mockResolvedValue("new_hashed_otp")
    }
});

jest.mock('crypto', () => {
    const actualValue = jest.requireActual('crypto');
    return {
        ...actualValue,
        randomUUID: jest.fn().mockReturnValue("sample_reservation_id"),
    }
})

// application imports
const request = require('supertest');
const app = require('../../src/server');
const registrationOtpModel = require('../../src/models/registrationOtpModel');
const { resendEmailOTP } = require('../../src/utils/sendEmails');
const bcrypt = require('bcryptjs');

// HELPERS
const URL = "/api/v1/buy2eat/auth/resend-otp";
const nowDate = new Date();
const registrationOtpData = {
    verification_id: "verification_id_value",
    email: "example@email.com",
    hash_otp: "123456",
    expiresAt: new Date(nowDate.getTime() + 5 * 60 * 1000), // expires in 5 min
    session_expiresAt: new Date(nowDate.getTime() + 30 * 60 * 1000), // session expires in 30 min
    role: "customer",
    hash_password: "hashed_password",
    accept_agreement: {
        accepted: true,
        version: process.env.AGREEMENT_VERSION,
        acceptedAt: new Date(),
    },
    profile_data: {
        first_name: "first_name",
        last_name: "last_name",
        profile_image: "",
        phone_number: "023456789",
    },
}

const createOtpRegistrationModel = async (overWrites = {}) => {
    await registrationOtpModel.create({ ...registrationOtpData, ...overWrites });
}

const sendRequest = async (requestData) => {
    return await request(app).post(URL).send(requestData);
}

describe("POST /api/v1/buy2eat/auth/resend-otp", () => {

    beforeEach(async () => {
        await createOtpRegistrationModel();
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await registrationOtpModel.deleteMany({});
    });

    describe("With valid credentials", () => {
        it("Should return 200 status code with success message", async () => {
            const response = await sendRequest({ verification_id: "verification_id_value" });

            const updatedOtpModel = await registrationOtpModel.findOne({ verification_id: "verification_id_value" });

            expect(updatedOtpModel.reservation_id).toBe(null);
            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
            expect(resendEmailOTP).toHaveBeenCalledTimes(1);
            expect(updatedOtpModel.hash_otp !== registrationOtpData.hash_otp).toBe(true); // check new otp generated
            expect(bcrypt.hash).toHaveBeenCalledTimes(1);
        });
    });

    describe("With invalid requests", () => {
        it("Should return 404 error when otp meta data not store in database", async () => {           
            const response = await sendRequest({ verification_id: "invalid_verification_id_value" });

            expect(response.statusCode).toBe(404);
            expect(response.body.error.message).toEqual("Failed to resend OTP!. Please try again later.");
            expect(resendEmailOTP).toHaveBeenCalledTimes(0);
        });

        it("Should return 400 error when otp session expired", async () => {
            await registrationOtpModel.updateOne(
                { verification_id: registrationOtpData.verification_id },
                { session_expiresAt: new Date(nowDate.getTime() - 30 * 60 * 1000) }
            ); 
                       
            const response = await sendRequest({ verification_id: "verification_id_value" });

            expect(response.statusCode).toBe(400);
            expect(response.body.error.message).toEqual("OTP session is expired!. Please re register again to get new OTP.");
            expect(resendEmailOTP).toHaveBeenCalledTimes(0);
        });

        it("Should return 429 error when resend count reach max number", async () => {
            await registrationOtpModel.updateOne(
                { verification_id: registrationOtpData.verification_id },
                { resendCount: 4 }
            ); 

            const response = await sendRequest({ verification_id: "verification_id_value" });

            expect(response.statusCode).toBe(429);
            expect(response.body.error.message).toEqual("You have reached the maximum number of OTP resend attempts. Please try again later.");
            expect(resendEmailOTP).toHaveBeenCalledTimes(0);
        });

        it("Should return 429 error when cooldown count not completed yet", async () => {
            await registrationOtpModel.updateOne(
                { verification_id: registrationOtpData.verification_id },
                { lastResendAt: new Date(nowDate.getTime() + 30 * 60 * 1000) }
            ); 

            const response = await sendRequest({ verification_id: "verification_id_value" });

            expect(response.statusCode).toBe(429);
            expect(response.body.error.message).toEqual("You can only request a new OTP once per minute. Please wait before trying again.");
            expect(resendEmailOTP).toHaveBeenCalledTimes(0);
        });

        it("Should return 409 error when failed send otp through email", async () => {
            resendEmailOTP.mockRejectedValueOnce(new Error("Send email failed!"));

            const response = await sendRequest({ verification_id: "verification_id_value" });

            const existOtpData = await registrationOtpModel.findOne({ verification_id: registrationOtpData.verification_id }); 

            expect(response.statusCode).toBe(409);
            expect(response.body.error.message).toEqual("Failed to resend OTP!. Please try again.");
            expect(existOtpData.reservation_id).toBe(null);
        });
    });

    describe("With validations", () => {
        it("Should return validation error when input is empty", async () => {
            const response = await sendRequest({ verification_id: "" });

            expect(response.statusCode).toBe(400);
            expect(response.body.error.details[0].issue).toEqual("Failed to resend OTP!. Please try again later.");
            expect(resendEmailOTP).toHaveBeenCalledTimes(0);
        });

        it("Should return validation error when input non strings ", async () => {
            const response = await sendRequest({ verification_id: { $ne: null } });

            expect(response.statusCode).toBe(400);
            expect(response.body.error.message).toEqual("Invalid input data");
            expect(resendEmailOTP).toHaveBeenCalledTimes(0);
        });
    })
});
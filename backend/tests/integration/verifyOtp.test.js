jest.mock('bcryptjs', () => {
    return {
        compare: jest.fn(),
    }
});

// Applications imports
const request = require('supertest');
const app = require('../../src/server');
const registrationOtpModel = require('../../src/models/registrationOtpModel');
const customerProfileModel = require('../../src/models/customerProfileModel');
const sellerProfileModel = require('../../src/models/sellerProfileModel');
const Users = require('../../src/models/userModel');
const bcrypt = require('bcryptjs');

// MAIN HELPERS
const URL = "/api/v1/buy2eat/auth/verify-otp";
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

const createRegistrationOtp = async (overWrites = {}) => {
    return await registrationOtpModel.create({ ...registrationOtpData, ...overWrites });
}

// helper function for catch refresh token in inside cookie and return true if cookie exist 
const cookieChecking = (response) => {
    const cookies = response?.headers['set-cookie'] ? response.headers['set-cookie'] : false;
    const cookieTokenData = cookies ? cookies.some(cookie => cookie.includes("refreshToken=")) : false;

    return { cookies, cookieTokenData }
}

const triggerResponse = async (otpData) => {
    return await request(app).post(URL).send(otpData);
}

describe("POST /api/v1/buy2eat/auth/verify-otp", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("With valid credentials", () => {
        it("should be return with 201 status code when valid credentials", async () => {
            const otpCreate = await createRegistrationOtp();
            bcrypt.compare.mockResolvedValue(true);

            const response = await triggerResponse({ otp: "123456", verification_id: "verification_id_value" });
            const { cookies, cookieTokenData } = cookieChecking(response);

            expect(response.statusCode).toEqual(201);
            expect(response.body.user).toBeDefined();
            expect(response.body.userProfile).toBeDefined();
            expect(cookies).toBeDefined();
            expect(cookieTokenData).toBe(true);

            const storedOtpData = await registrationOtpModel.findOne({ "_id": otpCreate._id });
            const profileReadCustomer = await customerProfileModel.countDocuments();
            const profileReadSeller = await sellerProfileModel.countDocuments();
            const profileReadUser = await Users.countDocuments();

            expect(storedOtpData).toEqual(null);
            expect(profileReadCustomer).toEqual(1);
            expect(profileReadUser).toEqual(1);
            expect(profileReadSeller).toEqual(0);
        });
    });

    describe("With invalid credentials", () => {
        it("Should return 400 status code when wrong otp format entered", async () => {
            const response = await triggerResponse({ otp: "Wrong_123", verification_id: "verification_id_value" });
            const { cookies, cookieTokenData } = cookieChecking(response);

            expect(response.body.error.details[0].issue).toEqual("OTP in wrong format!");
            expect(response.statusCode).toEqual(400);
            expect(cookies).toBe(false);
            expect(cookieTokenData).toBe(false);
        });

        it("Should return 404 status code when otp is not exist", async () => {
            const response = await triggerResponse({ otp: "123456", verification_id: "verification_id_value" });
            const { cookies, cookieTokenData } = cookieChecking(response);

            expect(response.body.error.message).toEqual("OTP is not exist!");
            expect(response.statusCode).toEqual(404);
            expect(cookies).toBe(false);
            expect(cookieTokenData).toBe(false);
        });

        it("Should return 400 status code when otp is expired", async () => {
            await createRegistrationOtp({ expiresAt: new Date(nowDate.getTime() - 5 * 60 * 1000) });

            const response = await triggerResponse({ otp: "123456", verification_id: "verification_id_value" });
            const { cookies, cookieTokenData } = cookieChecking(response);

            expect(response.body.error.message).toEqual("OTP is Expired!, Please request a new OTP");
            expect(response.statusCode).toEqual(400);
            expect(cookies).toBe(false);
            expect(cookieTokenData).toBe(false);
        });

        it("Should return 400 status code when agreement have not signed", async () => {
            await createRegistrationOtp({ accept_agreement: false });

            const response = await triggerResponse({ otp: "123456", verification_id: "verification_id_value" });
            const { cookies, cookieTokenData } = cookieChecking(response);

            expect(response.body.error.message).toEqual("You'r not agree with Terms of services and Privacy Policy!");
            expect(response.statusCode).toEqual(400);
            expect(cookies).toBe(false);
            expect(cookieTokenData).toBe(false);
        });

        it("Should return 429 status code when attempts exceeded", async () => {
            await createRegistrationOtp({ attempts: 0 });

            const response = await triggerResponse({ otp: "123456", verification_id: "verification_id_value" });
            const { cookies, cookieTokenData } = cookieChecking(response);

            expect(response.body.error.message).toEqual("Maximum attempts exceeded!. Please try again later.");
            expect(response.statusCode).toEqual(429);
            expect(cookies).toBe(false);
            expect(cookieTokenData).toBe(false);
        });

        it("Should return 401 status code when invalid otp entered", async () => {
            await createRegistrationOtp();
            bcrypt.compare.mockResolvedValue(false);

            const response = await triggerResponse({ otp: "654321", verification_id: "verification_id_value" });
            const { cookies, cookieTokenData } = cookieChecking(response);

            expect(response.body.error.message).toEqual("Invalid OTP!. Please try again.");
            expect(response.statusCode).toEqual(401);
            expect(cookies).toBe(false);
            expect(cookieTokenData).toBe(false);
        });
    });

    describe("With transaction failed", () => {
        it("Should throw error when failed to create user", async () => {
            const otpCreate = await createRegistrationOtp();
            jest.spyOn(Users, 'create').mockRejectedValue(new Error("User creation error"));
            bcrypt.compare.mockResolvedValue(true);

            const response = await triggerResponse( { otp: "123456", verification_id: "verification_id_value" });

            const storedOtpData = await registrationOtpModel.findOne({ "_id": otpCreate._id });
            const profileReadCustomer = await customerProfileModel.countDocuments();
            const profileReadSeller = await sellerProfileModel.countDocuments();

            expect(response.statusCode).toBe(500);
            expect(response.body.error.message).toEqual("Something went wrong!. please try again later.");

            expect(storedOtpData).not.toBeNull();
            expect(profileReadCustomer).toEqual(0);
            expect(profileReadSeller).toEqual(0);
        });

        it("Should throw error when failed to create customer profile", async () => {
            const otpCreate = await createRegistrationOtp();
            jest.spyOn(customerProfileModel, 'create').mockRejectedValue(new Error("profile creation error"));
            bcrypt.compare.mockResolvedValue(true);

            const response = await triggerResponse({ otp: "123456", verification_id: "verification_id_value" });

            const storedOtpData = await registrationOtpModel.findOne({ "_id": otpCreate._id });
            const profileReadCustomer = await customerProfileModel.countDocuments();
            const profileReadSeller = await sellerProfileModel.countDocuments();

            expect(response.statusCode).toBe(500);
            expect(response.body.error.message).toEqual("Something went wrong!. please try again later.");

            expect(storedOtpData).not.toBeNull();
            expect(profileReadCustomer).toEqual(0);
            expect(profileReadSeller).toEqual(0);
        });

        it("Should throw error when failed to create seller profile", async () => {
            const otpCreate = await createRegistrationOtp();
            jest.spyOn(sellerProfileModel, 'create').mockRejectedValue(new Error("profile creation error"));
            bcrypt.compare.mockResolvedValue(true);

            const response = await triggerResponse({ otp: "123456", verification_id: "verification_id_value" });

            const storedOtpData = await registrationOtpModel.findOne({ "_id": otpCreate._id });
            const profileReadCustomer = await customerProfileModel.countDocuments();
            const profileReadSeller = await sellerProfileModel.countDocuments();

            expect(response.statusCode).toBe(500);
            expect(response.body.error.message).toEqual("Something went wrong!. please try again later.");

            expect(storedOtpData).not.toBeNull();
            expect(profileReadCustomer).toEqual(0);
            expect(profileReadSeller).toEqual(0);
        });
    });

    describe("With validations", () => {
        it("Should return validation error when inputs are empty", async () => {
            const response = await triggerResponse({ otp: "", verification_id: "" });

            expect(response.statusCode).toBe(400);
            expect(response.body.error.message).toEqual("Invalid input data");
        });

        it("Should return validation error when otp field is empty", async () => {
            const response = await triggerResponse({ otp: "", verification_id: "verification_id_value" });

            expect(response.statusCode).toBe(400);
            expect(response.body.error.details[0].issue).toEqual("Your OTP field is empty!");
        });

        it("Should return validation error when verification id id empty", async () => {
            const response = await triggerResponse({ otp: "123456", verification_id: "" });

            expect(response.statusCode).toBe(400);
            expect(response.body.error.details[0].issue).toEqual("Error while verification!, Please resend OTP and try again.");
        });
    })
});
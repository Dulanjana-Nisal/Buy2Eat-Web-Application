// Mock models
jest.mock('crypto', () => {
    const actualValue = jest.requireActual('crypto');

    const hashToString = {
        toString: jest.fn().mockReturnValue("register_token"),
    }
    const hashCredentials = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue("new_hashed_reset_token"),
    }

    return {
        ...actualValue,
        randomBytes: jest.fn().mockReturnValue(hashToString),
        createHash: jest.fn().mockReturnValue(hashCredentials),
    }
});

// Application imports
const app = require('../../src/server');
const request = require('supertest');
const nock = require('nock');
const Users = require('../../src/models/userModel');
const customerProfileModel = require('../../src/models/customerProfileModel');
const sellerProfileModel = require('../../src/models/sellerProfileModel');
const GoogleRegisterModel = require('../../src/models/googleRegisterModel');
const { OAuth2Client } = require('google-auth-library');

// HELPERS
const URL = '/api/v1/buy2eat/auth/google';

const createUserModel = async (overwrites = {}) => {
    return await Users.create({
        email: "user@gmail.com",
        role: 'customer', // default create user as customer
        ...overwrites,
    });
}

const createUserProfile = async (role = 'customer', user = null) => {
    let userProfile;
    const profileData = {
        user_id: user?._id || "user_id",
        first_name: "User",
        last_name: "Name",
        profile_image: "",
        phone_number: "07123456789",
    }

    role === 'customer' ?
        userProfile = await customerProfileModel.create(profileData)
        :
        userProfile = await sellerProfileModel.create(profileData)

    return { userProfile }
}

const createGoogleRegister = async () => {
    return await GoogleRegisterModel.create({
        google_id: 'sub_id_123',
        email: 'user@gmail.com',
        first_name: "first_name",
        last_name: "last_name",
        profile_image: "https://user_profile_image.com",
        registration_token: "hash_registration_token",
        expiresAt: new Date(Date.now() + 40 * 60 * 1000) // expired in 40 minutes
    });
}

const sendRequest = async (overwrites = {}, nockChange = {}) => {
    // mock axios api call with nock lib
    const nockAxios = nock("https://oauth2.googleapis.com")
        .matchHeader('Content-Type', 'application/json')
        .post("/token", {
            code: "sample_code",
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: 'postmessage',
            grant_type: 'authorization_code'
        })
        .reply(200, {
            id_token: "google_id_token",
            ...nockChange
        });

    const response = await request(app).post(URL).send({ code: 'sample_code', ...overwrites });

    return { nockAxios, response }
}

const cookieChecker = (response) => {
    const cookieData = response.headers['set-cookie'] || [];
    return cookieData.some((cookie) => /(?:^|;\s*)refreshToken=[^;]+/.test(cookie));
}

describe("POST /api/v1/buy2eat/auth/google", () => {

    beforeEach(() => {
        // mocks modules and function
        jest.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockResolvedValue({
            getPayload: () => ({
                email: "user@gmail.com",
                email_verified: true,
                sub: "sub_id_123",
                picture: 'https://user_profile_image.com',
                given_name: "google_first_name",
                family_name: 'google_last_name',
                name: "google_name",
            })
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
        nock.cleanAll();
    });

    describe("With valid response", () => {
        it("Should return success response when user successfully login for already registered users", async () => {
            const user = await createUserModel();
            await createUserProfile('customer', user);

            const { nockAxios, response } = await sendRequest();

            expect(nockAxios.isDone()).toBe(true);// check the google service is running
            expect(response.statusCode).toBe(200);
            expect(response.body.isRegistered).toBe(true);
            expect(cookieChecker(response)).toBe(true);
            expect(response.body.user).toHaveProperty('accessToken');
            expect(response.body.user).not.toHaveProperty('refreshToken');
            expect(response.body.user).not.toHaveProperty('password');

            const updatedProfile = await customerProfileModel.findOne({ user_id: user._id });
            const updatedUser = await Users.findOne({ _id: user._id });

            expect(updatedProfile.profile_image).toEqual("https://user_profile_image.com");
            expect(updatedUser.google_id).toEqual("sub_id_123");
        });

        it("Should return success response when user successfully login for non registered users (already google registered)", async () => {
            const registration = await createGoogleRegister();

            const { nockAxios, response } = await sendRequest();

            expect(nockAxios.isDone()).toBe(true);  // check the google service is running
            expect(response.statusCode).toBe(201);
            expect(response.body.isRegistered).toBe(false);
            expect(response.body.register_token).toEqual("register_token");
            expect(response.body).not.toHaveProperty('refreshToken');
            expect(response.body).not.toHaveProperty('password');
            expect(cookieChecker(response)).toBe(false);

            const googleRegistrationData = await GoogleRegisterModel.findOne({ email: registration.email });

            expect(googleRegistrationData.registration_token).toEqual("new_hashed_reset_token");
        });

        it("Should return success response when user successfully login for non registered users (user not registered in google)", async () => {
            const { nockAxios, response } = await sendRequest();

            expect(nockAxios.isDone()).toBe(true);  // check the google service is running
            expect(response.statusCode).toBe(201);
            expect(response.body.isRegistered).toBe(false);
            expect(response.body.register_token).toEqual("register_token");
            expect(response.body).not.toHaveProperty('refreshToken');
            expect(response.body).not.toHaveProperty('password');
            expect(cookieChecker(response)).toBe(false);

            const googleRegistrationData = await GoogleRegisterModel.findOne({ email: "user@gmail.com" });

            // check that google register data set create in db after successfully trigger google service
            expect(googleRegistrationData).not.toBeNull();
            expect(googleRegistrationData.registration_token).toEqual("new_hashed_reset_token");
            expect(googleRegistrationData.google_id).toEqual("sub_id_123");
            expect(googleRegistrationData.profile_image).toEqual("https://user_profile_image.com");
        });
    });

    describe("With invalid response in third party google service", () => {
        it("Should return error response when code missed", async () => {
            const { response } = await sendRequest({ code: "" });

            expect(response.statusCode).toBe(400);
            expect(response.body.error.message).toEqual("Google authorization code is required!");
            expect(response.body).not.toHaveProperty("register_token");
            expect(response.body).not.toHaveProperty('refreshToken');
            expect(response.body).not.toHaveProperty('password');
            expect(cookieChecker(response)).toBe(false);

            const googleRegistrationData = await GoogleRegisterModel.findOne({ email: "user@gmail.com" });

            // check that google register data set not update or create in db after trigger error in google service
            expect(googleRegistrationData).toBeNull();
        });

        it("Should return error response when google id_token missed", async () => {
            const { response } = await sendRequest(null, { id_token: "" });

            expect(response.statusCode).toBe(400);
            expect(response.body.error.message).toEqual("Google ID token was not received!");
            expect(response.body).not.toHaveProperty("register_token");
            expect(response.body).not.toHaveProperty('refreshToken');
            expect(response.body).not.toHaveProperty('password');
            expect(cookieChecker(response)).toBe(false);

            const googleRegistrationData = await GoogleRegisterModel.findOne({ email: "user@gmail.com" });

            // check that google register data set not update or create in db after trigger error in google service
            expect(googleRegistrationData).toBeNull();
        });
    });

    describe("With invalid response in google auth workflow", () => {
        it("Should return error response when user not verify with google through email", async () => {
            jest.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockResolvedValue({
                getPayload: () => ({
                    email: "user@gmail.com",
                    email_verified: false,
                    sub: "sub_id_123",
                    picture: 'https://user_profile_image.com',
                    given_name: "google_first_name",
                    family_name: 'google_last_name',
                    name: "google_name",
                })
            });

            const { nockAxios, response } = await sendRequest();

            expect(nockAxios.isDone()).toBe(true);// check the google service is running
            expect(response.statusCode).toBe(401);
            expect(response.body.error.message).toEqual("Email is not verified in Google!");
            expect(response.body).not.toHaveProperty("register_token");
            expect(response.body).not.toHaveProperty('refreshToken');
            expect(response.body).not.toHaveProperty('password');
            expect(cookieChecker(response)).toBe(false);

            const googleRegistrationData = await GoogleRegisterModel.findOne({ email: "user@gmail.com" });

            // check that google register data set not update or create in db after trigger error in google service
            expect(googleRegistrationData).toBeNull();
        });

        it("Should return error response when failed to create createGoogleRegister data in db for not registered users", async () => {
            jest.spyOn(GoogleRegisterModel, 'create').mockResolvedValueOnce(false);

            const { nockAxios, response } = await sendRequest();

            expect(nockAxios.isDone()).toBe(true);// check the google service is running
            expect(response.statusCode).toBe(409);
            expect(response.body.error.message).toEqual("Error while google registration!");
            expect(response.body).not.toHaveProperty("register_token");
            expect(response.body).not.toHaveProperty('refreshToken');
            expect(response.body).not.toHaveProperty('password');
            expect(cookieChecker(response)).toBe(false);

            const googleRegistrationData = await GoogleRegisterModel.findOne({ email: "user@gmail.com" });

            // check that google register data set not update or create in db after trigger error in google service
            expect(googleRegistrationData).toBeNull();
        });

        it("Should return error response when if user sub id not equal to google id (google linked with another account)", async () => {
            await createUserModel({ google_id: "incorrect_sub_id" });
            const { nockAxios, response } = await sendRequest();

            expect(nockAxios.isDone()).toBe(true);// check the google service is running
            expect(response.statusCode).toBe(401);
            expect(response.body.error.message).toEqual("Google account linked to another account!");
            expect(response.body).not.toHaveProperty("register_token");
            expect(response.body).not.toHaveProperty('refreshToken');
            expect(response.body).not.toHaveProperty('password');
            expect(cookieChecker(response)).toBe(false);

            const googleRegistrationData = await GoogleRegisterModel.findOne({ email: "user@gmail.com" });

            // check that google register data set not update or create in db after trigger error in google service
            expect(googleRegistrationData).toBeNull();
        });

        it("Should return error response when failed to update user profile (usually profile image)", async () => {
            jest.spyOn(customerProfileModel, 'findOneAndUpdate').mockRejectedValue(new Error("error while update profile"));

            const user = await createUserModel();
            const { nockAxios, response } = await sendRequest();

            expect(nockAxios.isDone()).toBe(true);// check the google service is running
            expect(response.statusCode).toBe(409);
            expect(response.body.error.message).toEqual("Error while update profile!");
            expect(response.body).not.toHaveProperty("register_token");
            expect(response.body).not.toHaveProperty('refreshToken');
            expect(response.body).not.toHaveProperty('password');
            expect(cookieChecker(response)).toBe(false);

            const userData = await Users.findOne({ _id: user._id });

            // check that google register data set not update or create in db after trigger error in google service
            expect(userData.google_id).toBe(undefined);
        });
    });
});
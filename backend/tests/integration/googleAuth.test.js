// Mock models
jest.mock('crypto', () => {
    const actualValue = jest.requireActual('crypto');
    const hashCredentials = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue("hashed_reset_token"),
    }
    return {
        ...actualValue,
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
const { OAuth2Client } = require('google-auth-library');

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

// HELPERS
const URL = '/api/v1/buy2eat/auth/google';
const createUserModel = async () => {
    return await Users.create({
        email: "user@gmail.com",
        role: 'customer', // default create user as customer
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

const sendRequest = async (overwrites = {}) => {
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
            id_token: "google_id_token"
        })
    const response =  await request(app).post(URL).send({ code: 'sample_code', ...overwrites });

    return { nockAxios, response }
}

const cookieChecker = (response) => {
    const cookieData = response.headers['set-cookie'] || [];
    return cookieData.some((cookie) => /(?:^|;\s*)refreshToken=[^;]+/.test(cookie));
}

describe("POST /api/v1/buy2eat/auth/google", () => {

    afterEach(() => {
        nock.cleanAll();
        jest.restoreAllMocks();
    });

    describe("With valid response", () => {
        it("Should return success response when user successfully login for already registered users", async () => {
            const user = await createUserModel();
            await createUserProfile('customer', user);

            const { nockAxios, response } = await sendRequest();

            expect(response.statusCode).toBe(200);
            expect(nockAxios.isDone()).toBe(true);
            expect(cookieChecker(response)).toBe(true);
            expect(response.body.isRegistered).toBe(true);
            expect(response.body.user).toHaveProperty('accessToken');
            expect(response.body.user).not.toHaveProperty('refreshToken');
            expect(response.body.user).not.toHaveProperty('password');

            const updatedProfile = await customerProfileModel.findOne({ user_id: user._id });
            const updatedUser = await Users.findOne({ _id: user._id });

            expect(updatedProfile.profile_image).toEqual("https://user_profile_image.com");
            expect(updatedUser.google_id).toEqual("sub_id_123");
        });
    });

    describe("Should return success response when user successfully login for non registered users", () => {

    });
});
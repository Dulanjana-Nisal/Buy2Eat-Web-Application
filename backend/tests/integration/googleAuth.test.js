
// Application imports
const app = require('../../src/server');
const request = require('supertest');
const nock = require('nock');
const Users = require('../../src/models/userModel');
const customerProfileModel = require('../../src/models/customerProfileModel');
const sellerProfileModel = require('../../src/models/sellerProfileModel');
const { OAuth2Client } = require('google-auth-library');

// HELPERS
const URL = '/api/v1/buy2eat/auth/google';
const createUserModel = async () => {
    const user = await Users.create({
        email,
        role: 'customer', // default create user as customer
    });
    return { user }
}

const createUserProfile = async (role = 'customer', user = null) => {
    let userProfile;
    const profileData = {
        user_id: user._id,
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
    return await request(app).post(URL).send({ code: 'sample_code', ...overwrites });
}

jest.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockResolvedValue({
    email: "user@gmail.com", 
    email_verified: true, 
    sub: false, 
    picture: 'https://user_profile_image.com', 
    given_name: "google_first_name", 
    family_name: 'google_last_name', 
    name: "google_name",
});

describe("POST /api/v1/buy2eat/auth/google", () => {
    
    afterEach(() => {
        nock.clearAll();
        jest.restoreAllMocks();
    });

    describe("With valid response", () => {
        it("Should return success response when user successfully login for how already registered", async () => {

            // mock axios api call with nock lib
            const nockAxios = nock("https://oauth2.googleapis.com")
                .matchHeader('Content-Type', 'application/json')
                .post("/token", {
                    code: "google_code",
                    client_id: process.env.GOOGLE_CLIENT_ID,
                    client_secret: process.env.GOOGLE_CLIENT_SECRET,
                    redirect_uri: 'postmessage',
                    grant_type: 'authorization_code'
                })
                .reply(200, {
                    data: {
                        id_token: "google_id_token"
                    }
                })

            const { user } = await createUserModel();
            await createUserProfile(user);

            const response = await sendRequest();

            expect(response.statusCode).toBe(200);
            expect(nockAxios.isDone()).toBe(true);
        });
    });
});
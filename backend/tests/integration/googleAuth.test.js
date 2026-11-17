
// Application imports
const app = require('../../src/server');
const request = require('supertest');
const Users = require('../../src/models/userModel');
const customerProfileModel = require('../../src/models/customerProfileModel');
const sellerProfileModel = require('../../src/models/sellerProfileModel');

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
    return await request(app).post(URL).send({ code: 'sample_code', ...overwrites});
}

describe("POST /api/v1/buy2eat/auth/google", () => {
    describe("With valid response", () => {
        it("Should return success response when user successfully login for how already registered", async () => {
            const { user } = await createUserModel();
            await createUserProfile(user);

            const response = await sendRequest();

            expectCookies(response.statusCode).toBe(200)
        });
    });
});
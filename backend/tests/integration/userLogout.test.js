const request = require('supertest');
const app = require('../../src/server');
const User = require('../../src/models/userModel');
const RefreshToken = require('../../src/models/refreshTokenModel');
const tokenService = require('../../src/services/token.service');

// ==== Helpers for test cases ==== //
const URL = '/api/v1/buy2eat/auth/logout';
const refreshToken = 'integration-test-refresh-token';

const userCreation = () => {
    const user = User.create({
        email: 'logout@example.com',
        role: 'customer',
    });

    return user;
}

const refreshTokenCreation = (user, hashToken) => {
    return RefreshToken.create({
        user_id: user._id,
        familyId: 'logout-test-family',
        hashToken,
        expiresAt: new Date(Date.now() + 60_000),
    });
}
// ============================== //

describe(`POST /api/v1/buy2eat/auth/logout`, () => {
    describe('With valid conditions', () => {
        it('Should return success, clear the cookie, and update the refresh token model', async () => {
            const user = await userCreation();
            const hashToken = tokenService.hash(refreshToken);

            await refreshTokenCreation(user, hashToken);

            const response = await request(app).post(URL).set('Cookie',`refreshToken=${refreshToken}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);

            const cookies = response.headers['set-cookie'] || [];
            expect(cookies.some((cookie) => /refreshToken=;/.test(cookie))).toBe(true);

            const updatedRefreshToken = await RefreshToken.findOne({ hashToken });
            expect(updatedRefreshToken.isRevoked).toBe(true);
        });
    });

    describe('with invalid credentials', () => {
        it('should return 401 when token is missing', async () => {
            const response = await request(app).post(URL);

            expect(response.statusCode).toBe(401);
            expect(response.body.error.message).toBe('Your Authentication token is missing!');
        });
    });
});
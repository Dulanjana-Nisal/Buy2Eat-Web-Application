jest.mock('jsonwebtoken', () => {
    const actualJwt = jest.requireActual('jsonwebtoken');

    return {
        ...actualJwt,
        verify: jest.fn(actualJwt.verify),
    };
});

jest.mock('../../src/services/token.service', () => {
    const actualService = jest.requireActual('../../src/services/token.service');

    return {
        ...actualService,
        hash: jest.fn(),
        createCookies: jest.fn(actualService.createCookies),
        clearCookie: jest.fn(actualService.clearCookie),
        createTokenPair: jest.fn(actualService.createTokenPair),
        createRefreshToken: jest.fn(actualService.createRefreshToken),
    };
});

// Application imports
const request = require('supertest');
const app = require('../../src/server');
const jwt = require('jsonwebtoken');
const Users = require('../../src/models/userModel');
const RefreshToken = require('../../src/models/refreshTokenModel');
const tokenService = require('../../src/services/token.service');

// HELPERS
const URL = '/api/v1/buy2eat/auth/refresh-token';
const incomingRefreshToken = 'integration-test-refresh-token';
const HASHED_REFRESH_TOKEN = 'stored-hashed-refresh-token';
const FAMILY_ID = 'refresh-token-test-family';
const payloadFor = (user) => ({ _id: user._id.toString() });

const createUser = (email) => Users.create({
    email,
    role: 'customer',
});

const createRefreshToken = (user, overrides = {}) => RefreshToken.create({
    user_id: user._id,
    familyId: FAMILY_ID,
    hashToken: HASHED_REFRESH_TOKEN,
    rememberMe: true,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    ...overrides,
});

const sendRefreshRequest = (token = incomingRefreshToken) => {
    const req = request(app).post(URL);
    return token ? req.set('Cookie', `refreshToken=${token}`) : req;
};

const hasCreatedRefreshCookie = (response) => {
    const cookies = response.headers['set-cookie'] || [];
    return cookies.some((cookie) => /(?:^|;\s*)refreshToken=[^;]+/.test(cookie));
};

const expectNoTokenRotation = () => {
    expect(tokenService.createTokenPair).not.toHaveBeenCalled();
    expect(tokenService.createRefreshToken).not.toHaveBeenCalled();
    expect(tokenService.createCookies).not.toHaveBeenCalled();
};

describe('POST /api/v1/buy2eat/auth/refresh-token', () => {
    beforeEach(() => {
        tokenService.hash.mockReturnValue(HASHED_REFRESH_TOKEN);
        jwt.verify.mockImplementation(() => ({ _id: 'unused-user-id' }));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('With valid response', () => {
        it('Should return success response with valid credentials', async () => {
            const user = await createUser('refresh-valid@example.com');
            const storedToken = await createRefreshToken(user);
            jwt.verify.mockReturnValueOnce(payloadFor(user));

            const response = await sendRefreshRequest();

            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.accessToken).toBeDefined();
            expect(jwt.verify).toHaveBeenCalledWith(
                incomingRefreshToken,
                process.env.REFRESH_SECRET,
                { algorithms: ['HS256'] }
            );
            expect(tokenService.hash).toHaveBeenCalledWith(incomingRefreshToken);
            expect(tokenService.createTokenPair).toHaveBeenCalledTimes(1);
            expect(tokenService.createRefreshToken).toHaveBeenCalledTimes(1);
            expect(tokenService.createCookies).toHaveBeenCalledTimes(1);
            expect(hasCreatedRefreshCookie(response)).toBe(true);

            const updatedToken = await RefreshToken.findById(storedToken._id);
            expect(updatedToken.isRevoked).toBe(true);

            const familyTokens = await RefreshToken.find({ familyId: FAMILY_ID });
            expect(familyTokens).toHaveLength(2);
            expect(familyTokens.some((token) => !token.isRevoked)).toBe(true); // check that generated token is active 
        });
    });

    describe('With invalid response', () => {
        it('Should return error response when refresh token is missing on cookies', async () => {
            const user = await createUser('refresh-missing@example.com');
            const storedToken = await createRefreshToken(user);

            const response = await sendRefreshRequest(null);

            expect(response.statusCode).toBe(401);
            expect(response.body.error.message).toBe('Refresh token is missing.');
            expectNoTokenRotation();
            expect(hasCreatedRefreshCookie(response)).toBe(false);
            expect((await RefreshToken.findById(storedToken._id)).isRevoked).toBe(false);
        });

        it('Should return error response when failed to verify jwt token', async () => {
            const user = await createUser('refresh-invalid-jwt@example.com');
            const storedToken = await createRefreshToken(user);
            jwt.verify.mockImplementationOnce(() => {
                throw new Error('Invalid JWT');
            });

            const response = await sendRefreshRequest();

            expect(response.statusCode).toBe(401);
            expect(response.body.error.message).toBe('Invalid Session!');
            expectNoTokenRotation();
            expect(tokenService.clearCookie).toHaveBeenCalledTimes(1);
            expect(hasCreatedRefreshCookie(response)).toBe(false);
            expect((await RefreshToken.findById(storedToken._id)).isRevoked).toBe(false);
        });
    });

    describe('With failed mongo db transactions', () => {
        it('Should return error response when catch token have been stolen by someone', async () => {
            const user = await createUser('refresh-stolen@example.com');
            const revokedToken = await createRefreshToken(user, { isRevoked: true });
            const familySibling = await createRefreshToken(user, {
                hashToken: 'another-family-token',
                isRevoked: false,
            });
            jwt.verify.mockReturnValueOnce(payloadFor(user));

            const response = await sendRefreshRequest();

            expect(response.statusCode).toBe(401);
            expect(response.body.error.message).toBe('Session is revoked!. Please login back');
            expectNoTokenRotation();
            expect(tokenService.clearCookie).toHaveBeenCalledTimes(1);
            expect(hasCreatedRefreshCookie(response)).toBe(false);

            const familyTokens = await RefreshToken.find({ familyId: FAMILY_ID });
            expect(familyTokens).toHaveLength(2);
            expect(familyTokens.every((token) => token.isRevoked)).toBe(true);
            expect((await RefreshToken.findById(revokedToken._id)).isRevoked).toBe(true);
            expect((await RefreshToken.findById(familySibling._id)).isRevoked).toBe(true);
        });

        it('Should return error response when failed to find refresh token data with valid token', async () => {
            const user = await createUser('refresh-not-found@example.com');
            jwt.verify.mockReturnValueOnce(payloadFor(user));

            const response = await sendRefreshRequest();

            expect(response.statusCode).toBe(401);
            expect(response.body.error.message).toBe('Invalid Session or Session expired!. Please login back.');
            expectNoTokenRotation();
            expect(tokenService.clearCookie).toHaveBeenCalledTimes(1);
            expect(hasCreatedRefreshCookie(response)).toBe(false);
        });

        it('Should return error response when refresh token is expired', async () => {
            const user = await createUser('refresh-expired@example.com');
            await createRefreshToken(user, { expiresAt: new Date(Date.now() - 60 * 1000) });
            jwt.verify.mockReturnValueOnce(payloadFor(user));

            const response = await sendRefreshRequest();

            expect(response.statusCode).toBe(401);
            expect(response.body.error.message).toBe('Session expired!. Please login back.');
            expectNoTokenRotation();
            expect(tokenService.clearCookie).toHaveBeenCalledTimes(1);
            expect(hasCreatedRefreshCookie(response)).toBe(false);
        });

        it('Should return error response when user is not match with refresh token payload', async () => {
            const storedUser = await createUser('refresh-owner@example.com');
            const storedToken = await createRefreshToken(storedUser);
            jwt.verify.mockReturnValueOnce({ _id: '507f1f77bcf86cd799439011' });

            const response = await sendRefreshRequest();

            expect(response.statusCode).toBe(401);
            expect(response.body.error.message).toBe('User not Authorized!');
            expectNoTokenRotation();
            expect(tokenService.clearCookie).toHaveBeenCalledTimes(1);
            expect(hasCreatedRefreshCookie(response)).toBe(false);
            expect((await RefreshToken.findById(storedToken._id)).isRevoked).toBe(false);
        });

        it('Should return error response when refresh token id and db refresh token id is not matched', async () => {
            const storedUser = await createUser('refresh-id-mismatch-owner@example.com');
            const payloadUser = await createUser('refresh-id-mismatch-payload@example.com');
            const storedToken = await createRefreshToken(storedUser);
            jwt.verify.mockReturnValueOnce(payloadFor(payloadUser));

            const response = await sendRefreshRequest();

            expect(response.statusCode).toBe(401);
            expect(response.body.error.message).toBe('Invalid session!. Please login back.');
            expectNoTokenRotation();
            expect(tokenService.clearCookie).toHaveBeenCalledTimes(1);
            expect(hasCreatedRefreshCookie(response)).toBe(false);
            expect((await RefreshToken.findById(storedToken._id)).isRevoked).toBe(false);
        });
    });
});

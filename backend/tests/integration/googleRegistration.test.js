jest.mock('crypto', () => {
    const actualCrypto = jest.requireActual('crypto');

    return {
        ...actualCrypto,
        createHash: jest.fn(() => ({
            update: jest.fn().mockReturnThis(),
            digest: jest.fn().mockReturnValue('registration_hashed_token'),
        })),
    };
});

jest.mock('../../src/services/otp.service', () => jest.fn());

const request = require('supertest');
const app = require('../../src/server');
const OTPHelper = require('../../src/services/otp.service');
const Users = require('../../src/models/userModel');
const GoogleRegisterModel = require('../../src/models/googleRegisterModel');

const URL = '/api/v1/buy2eat/auth/google/register';
const REGISTRATION_TOKEN = 'registration_token';
const GOOGLE_ID = 'google-user-id';
const SAMPLE_EMAIL = 'google-user@example.com';
const OTP_RESPONSE = {
    success: true,
    message: 'OTP send successfully',
    verification_id: 'verification_id',
    masked_email: 'us***23@g***l.m',
    expiresAt: 'expired_time',
};

let sampleRegistration;

const responseSuite = (overwrites = {}) => (
    request(app).post(URL).send({ ...sampleRegistration, ...overwrites })
);

const createGoogleRegisterModel = (overwrites = {}) => GoogleRegisterModel.create({
    google_id: GOOGLE_ID,
    email: SAMPLE_EMAIL,
    first_name: 'Google',
    last_name: 'User',
    registration_token: 'registration_hashed_token',
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    ...overwrites,
});

const createUserModel = (overwrites = {}) => Users.create({
    email: SAMPLE_EMAIL,
    role: 'customer',
    ...overwrites,
});

const expectNoSensitiveData = (response) => {
    for (const field of ['password', 'accessToken', 'refreshToken', 'register_token', 'registration_token']) {
        expect(response.body).not.toHaveProperty(field);
    }

    const responseBody = JSON.stringify(response.body);
    expect(responseBody).not.toContain('registration_hashed_token');
    expect(responseBody).not.toContain(REGISTRATION_TOKEN);
};

describe('POST /api/v1/buy2eat/auth/google/register', () => {
    beforeEach(() => {
        sampleRegistration = {
            registerToken: REGISTRATION_TOKEN,
            role: 'customer',
            phone_number: '0712165810',
            accept_agreement: true,
        };
        OTPHelper.mockResolvedValue(OTP_RESPONSE);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('With valid response', () => {
        it('Should return success response when successfully send otp', async () => {
            const registration = await createGoogleRegisterModel();

            const response = await responseSuite();

            expect(response.statusCode).toBe(200);
            expect(response.body).toMatchObject({
                success: OTP_RESPONSE.success,
                verification_id: OTP_RESPONSE.verification_id,
                masked_email: OTP_RESPONSE.masked_email,
                expiresAt: OTP_RESPONSE.expiresAt,
                register_with: 'google',
            });
            expect(await GoogleRegisterModel.findById(registration._id)).toBeNull();
            expect(OTPHelper).toHaveBeenCalledTimes(1);
            expect(OTPHelper).toHaveBeenCalledWith(expect.objectContaining({
                normalizedEmail: SAMPLE_EMAIL,
                role: 'customer',
                hashedPassword: undefined,
                profile_data: expect.objectContaining({
                    first_name: 'Google',
                    last_name: 'User',
                    phone_number: sampleRegistration.phone_number,
                }),
                accept_agreement: expect.objectContaining({
                    accepted: true,
                    version: process.env.AGREEMENT_VERSION,
                }),
                session: expect.any(Object),
            }));
            expectNoSensitiveData(response);
        });
    });

    describe('With invalid response', () => {
        it('Should return error response when accept_agreement is false or missing', async () => {
            const registration = await createGoogleRegisterModel();

            const response = await responseSuite({ accept_agreement: false });

            expect(response.statusCode).toBe(400);
            expect(response.body.error.message).toBe('Please agree with Terms of services and Privacy Policy');
            expect(await GoogleRegisterModel.findById(registration._id)).not.toBeNull();
            expect(OTPHelper).not.toHaveBeenCalled();
            expectNoSensitiveData(response);
        });

        it('Should return error response when google registration data is not found for valid registration token', async () => {
            const registration = await createGoogleRegisterModel({
                registration_token: 'another_hashed_token',
            });

            const response = await responseSuite();

            expect(response.statusCode).toBe(401);
            expect(response.body.error.message).toBe('Your session timed out. Reconnect Google to save your info.');
            expect(await GoogleRegisterModel.findById(registration._id)).not.toBeNull();
            expect(OTPHelper).not.toHaveBeenCalled();
            expectNoSensitiveData(response);
        });

        it('Should return error response when google registration data is outdated', async () => {
            const registration = await createGoogleRegisterModel({
                expiresAt: new Date(Date.now() - 60 * 1000),
            });

            const response = await responseSuite();

            expect(response.statusCode).toBe(401);
            expect(response.body.error.message).toBe('Your session timed out. Reconnect Google to save your info.');
            expect(await GoogleRegisterModel.findById(registration._id)).not.toBeNull();
            expect(OTPHelper).not.toHaveBeenCalled();
            expectNoSensitiveData(response);
        });

        it('Should return error response when user already registered', async () => {
            const registration = await createGoogleRegisterModel();
            await createUserModel({ email: registration.email });

            const response = await responseSuite();

            expect(response.statusCode).toBe(409);
            expect(response.body.error.message).toBe('User already exist!');
            expect(await GoogleRegisterModel.findById(registration._id)).not.toBeNull();
            expect(OTPHelper).not.toHaveBeenCalled();
            expectNoSensitiveData(response);
        });
    });

    describe('With failed inside transaction', () => {
        it('Should return error response when return success as false in OTPHelper service', async () => {
            const registration = await createGoogleRegisterModel();
            OTPHelper.mockResolvedValue({ success: false, message: 'OTP send failed' });

            const response = await responseSuite();

            expect(response.statusCode).toBe(502);
            expect(response.body.error.message).toBe('Send OTP Failed!');
            expect(await GoogleRegisterModel.findById(registration._id)).not.toBeNull();
            expectNoSensitiveData(response);
        });

        it('Should return error response when trigger error inside transaction', async () => {
            const registration = await createGoogleRegisterModel();
            const consoleError = jest.spyOn(console, 'error').mockImplementation(() => { });
            OTPHelper.mockRejectedValue(new Error('some Error'));

            try {
                const response = await responseSuite();

                expect(response.statusCode).toBe(500);
                expect(await GoogleRegisterModel.findById(registration._id)).not.toBeNull();
                expectNoSensitiveData(response);
            } finally {
                consoleError.mockRestore();
            }
        });
    });

    describe('With validation failures', () => {
        it('Should return error response when all inputs are missing', async () => {
            const registration = await createGoogleRegisterModel();

            const response = await request(app).post(URL).send({});

            expect(response.statusCode).toBe(400);
            expect(response.body.error.message).toBe('Invalid input data');
            expect(await GoogleRegisterModel.findById(registration._id)).not.toBeNull();
            expect(OTPHelper).not.toHaveBeenCalled();
            expectNoSensitiveData(response);
        });

        it('Should return error response when registerToken is missing', async () => {
            const registration = await createGoogleRegisterModel();

            const response = await responseSuite({ registerToken: '' });

            expect(response.statusCode).toBe(400);
            expect(response.body.error.details[0].issue).toBe('RegisterToken is required');
            expect(await GoogleRegisterModel.findById(registration._id)).not.toBeNull();
            expect(OTPHelper).not.toHaveBeenCalled();
            expectNoSensitiveData(response);
        });

        it('Should return error response when invalid role selection', async () => {
            const registration = await createGoogleRegisterModel();

            const response = await responseSuite({ role: 'admin' });

            expect(response.statusCode).toBe(400);
            expect(response.body.error.details[0].issue).toBe('Please select valid role');
            expect(await GoogleRegisterModel.findById(registration._id)).not.toBeNull();
            expect(OTPHelper).not.toHaveBeenCalled();
            expectNoSensitiveData(response);
        });

        it('Should return error response when insert invalid phone number', async () => {
            const registration = await createGoogleRegisterModel();

            const response = await responseSuite({ phone_number: 'invalid-phone' });

            expect(response.statusCode).toBe(400);
            expect(response.body.error.details[0].issue).toBe('Invalid phone number format');
            expect(await GoogleRegisterModel.findById(registration._id)).not.toBeNull();
            expect(OTPHelper).not.toHaveBeenCalled();
            expectNoSensitiveData(response);
        });
    });
});
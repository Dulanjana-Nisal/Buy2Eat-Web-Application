const axios = require('axios');
const { OAuth2Client } = require("google-auth-library");
const { ErrorCode } = require("../constants");
const AppError = require("../errors/AppError");
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = require('../config/env');

// get google client
let client = new OAuth2Client(GOOGLE_CLIENT_ID);

const verifyIdToken = async (idToken) => {
    try {
        return await client.verifyIdToken({
            idToken,
            audience: GOOGLE_CLIENT_ID
        });
    } catch (error) {
        if (!(error instanceof Error) || !error.message.startsWith("No pem found for envelope:")) {
            throw error;
        }

        const refreshedClient = new OAuth2Client(GOOGLE_CLIENT_ID);
        const ticket = await refreshedClient.verifyIdToken({
            idToken,
            audience: GOOGLE_CLIENT_ID
        });
        client = refreshedClient;
        return ticket;
    }
};

const googleTokenService = async (code) => {

    // check google code is exist
    if (!code) {
        throw new AppError(
            ErrorCode.VALIDATION_FIELD_REQUIRED,
            { message: "Google authorization code is required!" },
        );
    }

    // convert authorization code in to google token
    let tokenResponse;
    try {
        tokenResponse = await axios.post(
            'https://oauth2.googleapis.com/token',
            {
                code,
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                redirect_uri: 'postmessage',
                grant_type: 'authorization_code'
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10_000
            }
        )
    }
    catch (err) {
        throw err;
    }

    // get token id
    const { id_token } = tokenResponse.data;

    if (!id_token) {
        throw new AppError(
            ErrorCode.VALIDATION_FIELD_REQUIRED,
            { message: "Google ID token was not received!" },
        );
    }

    // token verification
    const ticket = await verifyIdToken(id_token);

    // get payload form ticket
    return { email, email_verified, sub, picture, given_name, family_name, name } = ticket.getPayload();
}

module.exports = {
    googleTokenService,
}
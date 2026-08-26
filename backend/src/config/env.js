const { config } = require('dotenv');

config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

const { 
    PORT, 
    MONGO_URI, 
    ACCESS_SECRET, 
    REFRESH_SECRET, 
    ACCESS_EXPIRED, 
    REFRESH_EXPIRED,
    EMAIL_USER,
    EMAIL_APP_PASSWORD,
    CLIENT_URL 
} = process.env;

module.exports = { 
    PORT, 
    MONGO_URI, 
    ACCESS_SECRET, 
    REFRESH_SECRET, 
    ACCESS_EXPIRED, 
    REFRESH_EXPIRED,
    EMAIL_USER,
    EMAIL_APP_PASSWORD ,
    CLIENT_URL 
}; 
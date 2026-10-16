const { config } = require('dotenv');
const { z } = require('zod');

config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

// create schema object list for check env variables
const schema = z.object({
    PORT: z.coerce.number().int().min(1).max(65535).default(5000),
    NODE_ENV: z.enum(["development", "production", "testing"]).default("development"),
    MONGO_URI: z.string().min(1).optional(),
    AGREEMENT_VERSION: z.string().min(2, "AGREEMENT_VERSION is required!"),
    ACCESS_SECRET: z.string().min(32, 'ACCESS_SECRET must be at least 32 chars'),
    REFRESH_SECRET: z.string().min(32, 'REFRESH_SECRET must be at least 32 chars'),
    ACCESS_EXPIRED: z.string().default("15m"),
    REFRESH_EXPIRED: z.string().default("7d"),
    EMAIL_USER: z.email('EMAIL_USER must be a valid email').transform((e) => e.toLowerCase().trim()),
    EMAIL_APP_PASSWORD: z.string().min(10, "EMAIL_APP_PASSWORD must be at least 10 chars"),
    GOOGLE_CLIENT_SECRET: z.string().min(24, "GOOGLE_CLIENT_SECRET must be at least 24 chars"),
    GOOGLE_CLIENT_ID: z.string().min(32, "GOOGLE_CLIENT_ID must be at least 32 chars"),
    CLIENT_URL: z.url('CLIENT_URL must be a valid URL'),
});

// pass env variables in to schema object
const parsed = schema.safeParse(process.env);

// if have any issue display and shutdown server
if(!parsed.success){
    for(const result of parsed.error.issues){
        console.error(` - ${result.path.join()}: ${result.message}`);
    }

    // stop and exit from server
    process.exit(1);
}

module.exports = parsed.data;
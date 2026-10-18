const { z } = require("zod");

// validation schema for auth login
const authLoginSchema = z.object(
    {
        body: z.object({
            email: z.string().trim().min(1, "Email is required").email("Invalid email address").max(254, "Email is too long"),
            password: z.string().min(1, "Password is required").max(128, "Password is too long"),
        }).strict(),

        params: z.object({}).strict(),
        query: z.object({}).strict(),
    }
).strict();

// validation schema for googleRegistration
const googleRegistrationSchema = z.object(
    {
        body: z.object({
            registerToken: z.string().min(1, "registerToken is required").max(254, "registerToken is too long"),
            role: z.string().min(1, "role is required").enum(['customer', 'seller']),
            phone_number: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
        }).strict(),

        params: z.object({}).strict(),
        query: z.object({}).strict(),
    }
).strict();

module.exports = {
    authLoginSchema,
    googleRegistrationSchema,
};

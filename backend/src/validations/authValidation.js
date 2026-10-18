const { z } = require("zod");

const authLoginValidateSchema = z.object(
    {
        body: z.object({
            email: z.string().trim().max(100),
            password: z.string().min(6).max(100),
        }).strict(),

        params: z.object({}).strict(),

        query: z.object({}).strict(),
    }
).strict();

module.exports = { authLoginValidateSchema };

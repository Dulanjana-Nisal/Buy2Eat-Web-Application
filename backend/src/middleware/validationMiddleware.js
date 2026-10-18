const { z } = require("zod");

const productListSchema = z.object(
    {
        body: z.object({}).strict(),

        params: z.object({}).strict(),

        query: z.object(
            {
                search: z.string().trim().max(100).optional(),

                page: z.coerce.number().int().min(1).max(10000).default(1),

                limit: z.coerce.number().int().min(1).max(100).default(10),

                sort: z.enum(["price", "name", "createdAt"]).default("createdAt"),

                order: z.enum(["asc", "desc"]).default("desc"),

            }
        ).strict(),
    }
).strict();

module.exports = productListSchema;

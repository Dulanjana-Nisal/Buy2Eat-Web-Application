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
            accept_agreement: z.boolean(),
        }).strict(),

        params: z.object({}).strict(),
        query: z.object({}).strict(),
    }
).strict();

// validation schema for registerCustomer
const RegisterCustomerSchema = z.object(
    {
        body: z.object({
            email: z.string().trim().min(1, "Email is required!").email("Invalid email address").max(254, "Email is too long!"),
            password: z.string().min(1, "Password is required!").max(128, "Password is too long!"),
            first_name: z.string().min(1, "First Name is required!").max(50, "First Name is too long!"),
            last_name: z.string().min(1, "Last Name is required!").max(50, "Last Name is too long!"),
            phone_number: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
            addresses: z.tuple([]),
            profile_image: z.string(),
            favorite_shops: z.tuple([]),
            favorite_foods: z.tuple([]),
            accept_agreement: z.boolean(),
        }).strict(),

        params: z.object({}).strict(),
        query: z.object({}).strict(),
    }
).strict();

// validation schema for RegisterSeller
const RegisterSellerSchema = z.object(
    {
        body: z.object({
            email: z.string().trim().min(1, "Email is required!").email("Invalid email address").max(254, "Email is too long!"),
            password: z.string().min(1, "Password is required!").max(128, "Password is too long!"),
            first_name: z.string().min(1, "First Name is required!").max(50, "First Name is too long!"),
            last_name: z.string().min(1, "Last Name is required!").max(50, "Last Name is too long!"),
            phone_number: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
            profile_image: z.string(),
            accept_agreement: z.boolean(),
        }).strict(),

        params: z.object({}).strict(),
        query: z.object({}).strict(),
    }
).strict();

module.exports = {
    authLoginSchema,
    googleRegistrationSchema,
    RegisterCustomerSchema,
    RegisterSellerSchema
};

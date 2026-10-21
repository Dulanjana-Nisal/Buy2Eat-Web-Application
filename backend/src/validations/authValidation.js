const { z } = require("zod");

// validation schema for authLogin
const authLoginSchema = z.object(
    {
        body: z.object({
            email: z.string().trim().min(1, "Email is required!").email("Invalid email address").max(254, "Email is too long!"),
            password: z.string().min(1, "Password is required").max(128, "Password is too long"),
            rememberMe: z.boolean(),
        }).strict(),

        params: z.object({}).strict(),
        query: z.object({}).strict(),
    }
).strict();

// validation schema for googleRegistration
const googleRegistrationSchema = z.object(
    {
        body: z.object({
            registerToken: z.string().min(1, "RegisterToken is required").max(254, "RegisterToken is too long"),
            role: z.enum(['customer', 'seller'], { error: "Please select valid role" }),
            phone_number: z.string().regex(/^\+?\d{6,16}$/, { message: "Invalid phone number format" }),
            accept_agreement: z.boolean({ error: "You must accept the terms and conditions to proceed" }),
        }).strict(),

        params: z.object({}).strict(),
        query: z.object({}).strict(),
    }
).strict();

// validation schema for registerCustomer
const registerCustomerSchema = z.object(
    {
        body: z.object({
            first_name: z.string()
                        .min(1, "First Name is required!")
                        .max(50, "First Name is too long!")
                        .regex(/^[^<>/*=+\][?"\\]*$/,{ path: ["first_name"], error: "Input filed have wrong symbols" }),

            last_name: z.string()
                        .min(1, "Last Name is required!")
                        .max(50, "Last Name is too long!")
                        .regex(/^[^<>/*=+\][?"\\]*$/,{ path: ["last_name"], error: "Input filed have wrong symbols" }),

            email: z.string().trim().min(1, "Email is required!").email("Invalid email address").max(254, "Email is too long!"),
            password: z.string().min(1, "Password is required!").max(128, "Password is too long!"),
            conformPass: z.string(),
            phone_number: z.string().regex(/^\+?\d{6,16}$/, { message: "Invalid phone number format" }),
            accept_agreement: z.boolean({ error: "You must accept the terms and conditions to proceed" }),
        })
            .refine((data) => data.password === data.conformPass, { path: ["confPass"], message: "Passwords do not match" })
            .strict(),

        params: z.object({}).strict(),
        query: z.object({}).strict(),
    }
).strict();

// validation schema for RegisterSeller
const registerSellerSchema = z.object(
    {
        body: z.object({
            first_name: z.string()
                        .min(1, "First Name is required!")
                        .max(50, "First Name is too long!")
                        .regex(/^[^<>/*=+\][?"\\]*$/,{ path: ["first_name"], error: "Input filed have wrong symbols" }),

            last_name: z.string()
                        .min(1, "Last Name is required!")
                        .max(50, "Last Name is too long!")
                        .regex(/^[^<>/*=+\][?"\\]*$/,{ path: ["last_name"], error: "Input filed have wrong symbols" }),

            email: z.string().trim().min(1, "Email is required!").email("Invalid email address").max(254, "Email is too long!"),
            password: z.string().min(1, "Password is required!").max(128, "Password is too long!"),
            conformPass: z.string(),
            phone_number: z.string().regex(/^\+?\d{6,16}$/, { message: "Invalid phone number format" }),
            accept_agreement: z.boolean({ error: "You must accept the terms and conditions to proceed" }),
        })
            .refine((data) => data.password === data.conformPass, { path: ["confPass"], message: "Passwords do not match" })
            .strict(),

        params: z.object({}).strict(),
        query: z.object({}).strict(),
    }
).strict();

// validation schema for verifyOtp
const verifyOtpSchema = z.object(
    {
        body: z.object({
            otp: z.string().min(1, "Your OTP field is empty!").regex(/^\d{6}$/, { message: "OTP in wrong format!" }),
            verification_id: z.string().min(1, "Error while verification!, Please resend OTP and try again."),
        }).strict(),

        params: z.object({}).strict(),
        query: z.object({}).strict(),
    }
).strict();

// validation schema for resendOtp
const resendOtpSchema = z.object(
    {
        body: z.object({
            verification_id: z.string().min(1, "Failed to resend OTP!. Please try again later."),
        }).strict(),

        params: z.object({}).strict(),
        query: z.object({}).strict(),
    }
).strict();

// validation schema for forgotPassword
const forgotPasswordSchema = z.object(
    {
        body: z.object({
            email: z.string().trim().min(1, "Email field is required!").email("Invalid email address").max(254, "Email is too long!"),
        }).strict(),

        params: z.object({}).strict(),
        query: z.object({}).strict(),
    }
).strict();

// validation schema for resetPassword
const resetPasswordSchema = z.object(
    {
        body: z.object({
            token: z.string().min(1, "Please provide token value!"),
            newPassword: z.string().min(1, "New Password field is required!"),
        }).strict(),

        params: z.object({}).strict(),
        query: z.object({}).strict(),
    }
).strict();

// validation schema for verifyResetPassword
const verifyResetPasswordSchema = z.object(
    {
        body: z.object({}).strict().optional(),

        params: z.object({
            token: z.string().min(1, "Wrong reset password URL!. Please try again."),
        }).strict(),

        query: z.object({}).strict(),
    }
).strict();

module.exports = {
    authLoginSchema,
    googleRegistrationSchema,
    registerCustomerSchema,
    registerSellerSchema,
    verifyOtpSchema,
    resendOtpSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    verifyResetPasswordSchema,
};

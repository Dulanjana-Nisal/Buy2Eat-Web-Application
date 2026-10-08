import api from "../../../app/config/api";
import { ErrorHandler } from "../../../utils/error/errorHandler";

// User Login API
export const userLoginApi = async (loginData) => {
    try {
        const response = await api.post('/auth/login', loginData);
        return response.data;
    }
    catch (error) {
        throw ErrorHandler(error);
    }
}

// Google Auth API
export const googleAuthApi = async (code) => {
    try {
        const response = await api.post('/auth/google', { code: code });
        return response.data;
    }
    catch (error) {
        throw ErrorHandler(error);
    }
}

// Google Registration API
export const googleRegisterApi = async (registerData) => {
    try {
        const response = await api.post('/auth/google/register', registerData);
        return response.data;
    }
    catch (error) {
        throw ErrorHandler(error);
    }
}

// Customer Registration API
export const customerRegistrationApi = async (registerDetails) => {
    try {
        const response = await api.post('/auth/register-customer', registerDetails);
        return response.data;
    }
    catch (error) {
        throw ErrorHandler(error);
    }
}

// Seller Registration API
export const sellerRegistrationApi = async (registerDetails) => {
    try {
        const response = await api.post('/auth/register-seller', registerDetails);
        return response.data;
    }
    catch (error) {
        throw ErrorHandler(error);
    }
}

// Submit OTP API
export const submitOTPApi = async (submitDetails) => {
    try {
        const response = await api.post('/auth/verify-otp', submitDetails);
        return response.data;
    }
    catch (error) {
        throw ErrorHandler(error);
    }
}

// Resend OTP API
export const resendOTPApi = async (verification_id) => {
    try {
        const response = await api.post('/auth/resend-otp', verification_id);
        return response.data;
    }
    catch (error) {
        throw ErrorHandler(error);
    }
}

// Forgot Password API
export const forgotPasswordApi = async (userData) => {
    try {
        const response = await api.post('/auth/forgot-password', userData);
        return response.data;
    }
    catch (error) {
        throw ErrorHandler(error);
    }
}

// Reset Password API
export const resetPasswordApi = async (resetData) => {
    try {
        const response = await api.post('/auth/reset-password', resetData);
        return response.data;
    }
    catch (error) {
        throw ErrorHandler(error);
    }
}

// Reset Password API
export const verifyResetPasswordApi = async (token) => {
    try {
        const response = await api.get(`/auth/verify-reset-password/${token}`);
        return response.data;
    }
    catch (error) {
        throw ErrorHandler(error);
    }
}


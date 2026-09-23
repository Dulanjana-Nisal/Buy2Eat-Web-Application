import api from "../../../app/config/api";

// User Login API
export const userLoginApi = async (loginData) => {
    const response = await api.post('/auth/login', loginData);
    return response.data;
}

// Google Auth API
export const googleAuthApi = async (credentials) => {
    const response = await api.post('/auth/google', { credentials });
    return response.data;
}

// Google Registration API
export const googleRegisterApi = async (registrationToken, role, phone_number) => {
    const response = await api.post('/auth/google/register', { registrationToken, role, phone_number });
    return response.data;
}

// Customer Registration API
export const customerRegistrationApi = async (registerDetails) => {
    const response = await api.post('/auth/register-customer', registerDetails);
    return response.data;
}

// Seller Registration API
export const sellerRegistrationApi = async (registerDetails) => {
    const response = await api.post('/auth/register-seller', registerDetails);
    return response.data;
}

// Submit OTP API
export const submitOTPApi = async (submitDetails) => {
    const response = await api.post('/auth/verify-otp', submitDetails);
    return response.data;
}

// Resend OTP API
export const resendOTPApi = async (verification_id) => {
    const response = await api.post('/auth/resend-otp', verification_id);
    return response.data;
}

// Forgot Password API
export const forgotPasswordApi = async (userData) => {
    const response = await api.post('/auth/forgot-password', userData);
    return response.data;
}

// Reset Password API
export const resetPasswordApi = async (resetData) => {
    const response = await api.post('/auth/reset-password', resetData);
    return response.data;
}

// Reset Password API
export const verifyResetPasswordApi = async (token) => {
    const response = await api.get(`/auth/verify-reset-password/${token}`);
    return response.data;
}


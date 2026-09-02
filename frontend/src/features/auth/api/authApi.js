import api from "../../../app/config/api";

// Customer Registration API
export const customerRegistrationApi = async ( registerDetails ) => {
    const response = await api.post('/auth/register-customer', registerDetails);
    return response.data;
}

// Submit OTP API
export const submitOTPApi = async ( submitDetails ) => {
    const response = await api.post('/auth/verify-otp', submitDetails);
    return response.data;
}

// Resend OTP API
export const resendOTPApi = async ( verification_id ) => {
    const response = await api.post('/auth/resend-otp', verification_id);
    return response.data;
}
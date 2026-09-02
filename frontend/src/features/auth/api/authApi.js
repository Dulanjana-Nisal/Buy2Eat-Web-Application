import api from "../../../app/config/api"

// Customer Registration API
export const customerRegistrationApi = async ( registerDetails ) => {
    const response = await api.post('/auth/register-customer', registerDetails);
    return response.data;
}
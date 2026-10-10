import { useState } from "react"
import { customerRegistrationApi } from "../api/authApi";
import { useNavigate } from "react-router-dom";

// use login custom hook for user login
export const useCustomerRegister = () => {

    // react use states for custom hook
    const [loading, setLoading] = useState(false);
    const [displayError, setDisplayError] = useState(null);

    // Navigation hooks
    const navigate = useNavigate();

    async function register(credentials) {
        // set load to true
        setLoading(true);
        try {
            const result = await customerRegistrationApi(credentials);

            // navigate OTP verification page
            localStorage.setItem('expiredAt', result.expiresAt);
            localStorage.setItem('user', result.expiresAt);
            navigate('/verify-otp', {
                state: {
                    verification_id: result.verification_id,
                    maskEmail: result.masked_email,
                    expiresAt: result.expiresAt,
                    register_with: result.register_with || ''
                }
            })

            return result;
        }
        catch (error) {
            setDisplayError(error);
            throw error;
        }
        finally {
            setLoading(false);
        }
    }

    return { register, loading, displayError }
}
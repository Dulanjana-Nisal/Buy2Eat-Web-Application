import { useState } from "react"
import { customerRegistrationApi, sellerRegistrationApi, userLoginApi } from "../api/authApi";
import { UseAuth } from "../../../app/providers/AuthProvider";
import { useNavigate } from "react-router-dom";

// use login custom hook for user login
export const useUserAuth = () => {

    // react use states for custom hook
    const [loading, setLoading] = useState(false);
    const [displayError, setDisplayError] = useState(null);

    // use custom hooks for storage user data
    const { setUser } = UseAuth();

    // Navigation hooks
    const navigate = useNavigate();

    // user login
    async function login(credentials) {
        // set load to true
        setLoading(true);
        try {
            const result = await userLoginApi(credentials);
            if (result?.success) {
                localStorage.setItem('user', JSON.stringify(result.user));

                // store user data in to user state in UseAuth provider
                setUser(result.user);
                console.log(result, 'User logged!');
            }
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

    // register customer
    async function registerCustomer(credentials) {
        // set load to true
        setLoading(true);
        try {
            const result = await customerRegistrationApi(credentials);

            // navigate OTP verification page
            if (result.success) {
                localStorage.setItem('expiredAt', result.expiresAt);
                navigate('/verify-otp', {
                    state: {
                        verification_id: result.verification_id,
                        maskEmail: result.masked_email,
                        expiresAt: result.expiresAt,
                        register_with: result.register_with || ''
                    }
                });
            }

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

    // Register Seller
    async function registerSeller(credentials) {
        // set load to true
        setLoading(true);
        try {
            const result = await sellerRegistrationApi(credentials);

            // navigate OTP verification page
            if (result.success) {
                localStorage.setItem('expiredAt', result.expiresAt)
                navigate('/verify-otp', {
                    state: {
                        verification_id: result.verification_id,
                        maskEmail: result.masked_email,
                        expiresAt: result.expiresAt,
                        register_with: result.register_with || ''
                    }
                })
            }

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

    return { login, registerCustomer, registerSeller, loading, displayError }
}
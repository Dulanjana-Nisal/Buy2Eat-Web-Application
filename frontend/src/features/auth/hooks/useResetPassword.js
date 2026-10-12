import { useState } from "react"
import { forgotPasswordApi, resetPasswordApi, verifyResetPasswordApi } from "../api/authApi";
import { useNavigate } from "react-router-dom";

export const useResetPassword = () => {

    // react hooks for custom hook
    const [loading, setLoading] = useState(false);
    const [displayError, setDisplayError] = useState(null);
    const [verifying, setVerifying] = useState(false);

    // Navigation hooks
    const navigate = useNavigate();

    // forgot password function for api call 
    const forgotPassword = async (credentials) => {

        // set loading to true
        setLoading(true);

        try {
            // make api call
            const result = await forgotPasswordApi(credentials);

            // Navigate to success page if result success
            navigate("/forgot-password/success", {
                state: { fromForgotPassword: true }
            });

            // store conformation data in session storage
            sessionStorage.setItem("fromForgotPassword", "true");

            return result;
        }
        catch (error) {
            setDisplayError(error);
            return error;
        }
        finally {
            setLoading(false);
        }
    }

    // Verify reset password link
    const verifyResetPassword = async (credentials) => {

        // set verify to true
        setVerifying(true);

        try {
            // make api call
            await verifyResetPasswordApi(credentials);
        }
        catch (err) {
            if (err) {
                navigate('/forgot-password', { replace: true });
            }
            setDisplayError(err);
            return (err);
        }
        finally {
            setVerifying(false);
        }
    }

    // Reset password function for reset password
    const resetPassword = async (credentials) => {

        // set loading tru
        setLoading(true);

        try {
            // make api call
            const resetPasswordResponse = await resetPasswordApi(credentials);

            if (resetPasswordResponse.success) {
                // store conformation data in session storage
                sessionStorage.setItem("fromForgotPassword", "true");

                // navigate success page 
                navigate("/reset-password/success", {
                    state: { fromResetPassword: true }
                });
            }

            return resetPasswordResponse;
        }
        catch (err) {
            setDisplayError(err)
            return err;
        }
        finally {
            setLoading(false);
        }
    }

    return {
        forgotPassword,
        verifyResetPassword,
        resetPassword,
        displayError,
        loading,
        verifying,
    }
}
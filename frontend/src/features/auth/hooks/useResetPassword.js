import { useState } from "react"
import { forgotPasswordApi } from "../api/authApi";
import { useNavigate } from "react-router-dom";

export const useResetPassword = () => {

    // react hooks for custom hook
    const [loading, setLoading] = useState(false);
    const [displayError, setDisplayError] = useState(null);

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
        finally{
            setLoading(false);
        }
    }

    return {
        forgotPassword,
        displayError,
        loading,
    }
}
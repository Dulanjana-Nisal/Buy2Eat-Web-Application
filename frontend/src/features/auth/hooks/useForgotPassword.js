import { useState } from "react"
import { forgotPasswordApi } from "../api/authApi";

export const useForgotPassword = () => {

    const [loading, setLoading] = useState(false);
    const [displayError, setDisplayError] = useState(null);

    const forgotPassword = async (credentials) => {

        // set loading to true
        setLoading(true);

        try{
            // make api call
            const result = await forgotPasswordApi(credentials);
            return result;
        }
        catch(error){
            setDisplayError(error);
            return error;
        }
    }

    return {
        forgotPassword,
        displayError,
        loading,
    }
}
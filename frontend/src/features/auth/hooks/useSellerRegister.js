import { useState } from "react"
import { sellerRegistrationApi } from "../api/authApi";

// use login custom hook for user login
export const useSellerRegister = () => {

    // react use states for custom hook
    const [loading, setLoading] = useState(false);
    const [displayError, setDisplayError] = useState(null);

    async function register(credentials) {
        // set load to true
        setLoading(true);
        try {
            const result = await sellerRegistrationApi(credentials);
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
import { useState } from "react"
import { userLoginApi } from "../api/authApi";
import { UseAuth } from "../../../app/providers/AuthProvider";

// use login custom hook for user login
export const useLogin = () => {

    // react use states for custom hook
    const [loading, setLoading] = useState(false);
    const [displayError, setDisplayError] = useState(null);

    // use custom hooks for storage user data
    const { setUser } = UseAuth();

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

    return { login, loading, displayError }
}
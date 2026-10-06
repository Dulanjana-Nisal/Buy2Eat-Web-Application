import { useState } from "react"
import { userLoginApi } from "../api/authApi";

// use login custom hook for user login
export const useLogin = () => {

    // react use states for custom hook
    const [loading, setLoading] = useState(false);
    const [displayError, setDisplayError] = useState();

    async function login(credentials) {
        // set load to true
        setLoading(true);
        try{
            const result = await userLoginApi(credentials);
            return result;
        }
        catch(error){
            setDisplayError(error);
            throw error;
        }
        finally{
            setLoading(false);
        }
    }

    return { login, loading, displayError } 
}
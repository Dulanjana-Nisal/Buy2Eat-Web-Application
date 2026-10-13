import { useGoogleLogin } from '@react-oauth/google';
import { googleAuthApi, googleRegisterApi } from '../api/authApi';
import { useNavigate } from 'react-router-dom';
import { UseAuth } from '../../../app/providers/AuthProvider';
import { useState } from 'react';

export const useGoogleAuth = () => {

    // react hooks
    const [googleLoginError, setGoogleLoginError] = useState(null);
    const [googleLoginLoading, setGoogleLoginLoading] = useState(null);
    const navigate = useNavigate();

    // use custom hooks for storage user data
    const { setUser } = UseAuth();

    const continueWithGoogle = useGoogleLogin({
        flow: 'auth-code',
        onSuccess: async (codeResponse) => {
            try {
                setGoogleLoginLoading(true);

                const googleAuth = await googleAuthApi(codeResponse.code);

                // if user not registered yet navigate to google-register
                if (!googleAuth?.isRegistered) {
                    return navigate("/google-register", {
                        state: { register_token: googleAuth.register_token }
                    });
                }

                // if user successfully logged store user data in localstorage
                if (googleAuth?.success) {
                    localStorage.setItem('user', JSON.stringify(googleAuth.user));

                    // store user data in to user state in UseAuth provider
                    setUser(googleAuth.user);
                    console.log(googleAuth, 'User logged!');
                }

            }
            catch (err) {
                setGoogleLoginError(err);
                throw err;
            }
            finally {
                setGoogleLoginLoading(false)
            }
        },
        onError: (errorResponse) => {
            setGoogleLoginError(errorResponse);
            return;
        },
        onNonOAuthError: (error) => {
            setGoogleLoginError(error);
            return;
        }
    })

    //registration function
    const registerWithGoogle = async (credentials) => {

        // set loading as true
        setGoogleLoginLoading(true);

        // all google register api
        try {
            const result = await googleRegisterApi(credentials);
            return result;
        }
        catch (err) {
            setGoogleLoginError(err);
            throw err;
        }
        finally {
            setGoogleLoginLoading(false);
        }
    }

    // return the trigger function
    return { continueWithGoogle, registerWithGoogle, googleLoginError, googleLoginLoading };
}
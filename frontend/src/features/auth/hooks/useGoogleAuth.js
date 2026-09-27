import { useGoogleLogin } from '@react-oauth/google';
import { googleAuthApi } from '../api/authApi';
import { useNavigate } from 'react-router-dom';
import { UseAuth } from '../../../app/providers/AuthProvider';

export const useGoogleAuth = () => {

    // react hooks
    const navigate = useNavigate();

    // use custom hooks for storage user data
    const { setUser } = UseAuth();

    const continueWithGoogle = useGoogleLogin({
        flow: 'auth-code',

        onSuccess: async (codeResponse) => {
            try {
                const googleAuth = await googleAuthApi(codeResponse.code);

                // if user auth failed display error
                if (!googleAuth) {
                    return console.log('Something error!')
                }

                // if user not registered yet navigate to google-register
                if (!googleAuth?.isRegistered) {
                    return navigate("/google-register", {
                        state: { register_token: googleAuth.register_token }
                    });
                }

                // if user successfully logged store user data in localstorage
                if(googleAuth?.success){
                    localStorage.setItem('user', JSON.stringify(googleAuth.user));

                    // store user data in to user state in UseAuth provider
                    setUser(googleAuth.user);

                    console.log(googleAuth, 'User logged!');
                }

            }
            catch (err) {
                console.log(err.response)
            }
        }
    })

    // return the trigger function
    return { continueWithGoogle };
}
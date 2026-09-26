import { useGoogleLogin } from '@react-oauth/google';
import { googleAuthApi } from '../api/authApi';
import { useNavigate } from 'react-router-dom';

export const useGoogleAuth = () => {

    // react hooks
    const navigate = useNavigate();

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
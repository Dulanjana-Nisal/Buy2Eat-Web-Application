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
                if (!googleAuth) {
                    return console.log('Something error!')
                }

                if (!googleAuth?.isRegistered) {
                    return navigate("/google-register", {
                        state: { register_token: googleAuth.register_token }
                    });
                }

                console.log(googleAuth, 'User logged!')

            }
            catch (err) {
                console.log(err.response)
            }
        }
    })

    // return the trigger function
    return { continueWithGoogle };
}
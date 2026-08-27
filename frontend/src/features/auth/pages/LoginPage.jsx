import styles from './LoginPage.module.css';
import login_background from '../../../assets/images/login-background.avif';
import { useState } from 'react';
import api from '../../../app/config/api';
import LoginForm from '../components/LoginForm';

function LoginPage() {

    // useStates hooks
    const [loading, setLoading] = useState(false);
    const [loginDetails, setLoginDetails] = useState({"email":"", "password": ""});

    // user login function 
    const userLogin = async (e) => {
        e.preventDefault();

        // call backend user login api
        try {
            setLoading(true);
            await api.post('/auth/login', loginDetails);
            
            // Remove login details
            setLoginDetails({
                email: '',
                password: '',
            })
        }
        catch (err) {
            console.log(err?.response?.data);
        }
        finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div className={styles.section}>
                <div className={styles.container}>
                    {/* Left Panel - Login Form */}
                    <LoginForm
                        loading={loading} 
                        loginDetails={loginDetails}
                        userLogin={userLogin}
                        setLoginDetails={setLoginDetails}
                    />

                    {/* Right Panel - Image & Widgets */}
                    <div className={styles.rightPanel}>
                        <img src={login_background} alt="login_background" />
                    </div>
                </div>
            </div>
        </>
    )
}

export default LoginPage;
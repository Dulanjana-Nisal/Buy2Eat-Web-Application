import { Link, useNavigate } from 'react-router-dom';
import UIbackground from '../components/UIbackground';
import styles from './ForgotPasswordPage.module.css';
import { useState } from 'react';
import { forgotPasswordApi } from '../api/authApi';
import forgot_password_banner from '../../../assets/images/forgot-password.svg';

function ForgotPassword() {

    // useStats hook for UI
    const [loading, setLoading] = useState(false);

    // Navigation hooks
    const navigate = useNavigate();

    // useState hooks for handle data
    const [userData, setUserData] = useState({email: ""})

    // Customer registration function
    const userForgotPassword = async (e) => {
        e.preventDefault();

        setLoading(true)

        try {
            const forgotPassword = await forgotPasswordApi(userData);
            console.log(forgotPassword)
        }
        catch (err) {
            console.log(err?.response?.data)
        }
        finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div className={styles.container}>

                {/* background mini transparent images */}
                <UIbackground />

                {/* Main Form Card */}
                <div className={styles.mainCard}>

                    {/* Left Side: Form */}
                    <div className={styles.formPanel}>
                        <div className={styles.formHeader}>
                            <div className={styles.userIconWrap}>
                                <svg fill="currentColor" viewBox="-10 0 55 38" version="1.1" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>lock-line</title> <path class="clr-i-outline clr-i-outline-path-1" d="M18.09,20.59A2.41,2.41,0,0,0,17,25.14V28h2V25.23a2.41,2.41,0,0,0-.91-4.64Z"></path><path class="clr-i-outline clr-i-outline-path-2" d="M26,15V10.72a8.2,8.2,0,0,0-8-8.36,8.2,8.2,0,0,0-8,8.36V15H7V32a2,2,0,0,0,2,2H27a2,2,0,0,0,2-2V15ZM12,10.72a6.2,6.2,0,0,1,6-6.36,6.2,6.2,0,0,1,6,6.36V15H12ZM9,32V17H27V32Z"></path> <rect x="0" y="0" width="36" height="36" fill-opacity="0"></rect> </g></svg>
                            </div>
                            <div>
                                <h2>Forgot password</h2>
                                <p>Enter your email address to get reset link</p>
                            </div>
                        </div>

                        <form>
                            <div className={styles.formGrid}>

                                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                                    <span className={styles.inputIcon}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                    </span>
                                    <input
                                        type="email"
                                        placeholder="Your Email Address"
                                        onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                                    />
                                </div>

                            </div>

                            <button type="submit" className={styles.submitBtn} onClick={(e) => userForgotPassword(e)} disabled={loading}>
                                {loading ? <span className={styles.spinner} aria-label="Logging in" /> :
                                    <>
                                        Reset Password
                                    </>
                                }
                            </button>
                            <button type="button" className={styles.backBtn} onClick={() => navigate(-1)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="19" y1="12" x2="5" y2="12"></line>
                                    <polyline points="12 19 5 12 12 5"></polyline>
                                </svg>
                                Back
                            </button>

                            <div className={styles.loginPrompt}>
                                New to Buy2Eat? <Link to="/register">Create an account</Link>
                            </div>
                        </form>

                        <img src={forgot_password_banner} alt="left-transparent" className={styles.leftTransparentBanner} />
                    </div>

                </div>

            </div>
        </>
    )
}

export default ForgotPassword;
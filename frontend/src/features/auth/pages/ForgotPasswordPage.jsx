import { Link, useNavigate } from 'react-router-dom';
import UIbackground from '../components/UIbackground';
import styles from './ForgotPasswordPage.module.css';
import { useState } from 'react';
import { customerRegistrationApi } from '../api/authApi';
import forgot_password_banner from '../../../assets/images/forgot-password.svg';

function ForgotPassword() {

    // useStats hook for UI
    const [loading, setLoading] = useState(false);

    // Navigation hooks
    const navigate = useNavigate();

    // useState hooks for handle data
    const [registerDetails, setRegisterDetails] = useState({
        email: "",
        password: "",
        confPass: "",
        first_name: "",
        last_name: "",
        phone_number: "",
        agreement: false,
    })

    // Customer registration function
    const customerRegister = async (e) => {
        e.preventDefault();

        setLoading(true)

        // check password and conform password is same
        if (registerDetails.password !== registerDetails.confPass) {
            setLoading(false)
            return console.error('Passwords are not matched!')
        }

        // check if agreement is sign
        if (!registerDetails.agreement) {
            setLoading(false)
            return console.error("Please agree with Terms of services and Privacy Policy")
        }

        try {
            const registration = await customerRegistrationApi(registerDetails);

            // navigate OTP verification page
            if (registration.success) {
                localStorage.setItem('expiredAt', registration.expiresAt)
                navigate('/verify-otp', {
                    state: {
                        verification_id: registration.verification_id,
                        maskEmail: registration.masked_email,
                        expiresAt: registration.expiresAt
                    }
                })
            }
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
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /><path d="M17 3v4" />
                                    <path d="M15 5h4" />
                                </svg>
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
                                        placeholder="Email Address"
                                        onChange={(e) => setRegisterDetails({ ...registerDetails, email: e.target.value })}
                                    />
                                </div>

                            </div>

                            <button type="submit" className={styles.submitBtn} onClick={(e) => customerRegister(e)} disabled={loading}>
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
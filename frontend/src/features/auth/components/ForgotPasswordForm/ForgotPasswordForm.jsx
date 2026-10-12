import styles from './ForgotPasswordForm.module.css';
import forgot_password_banner from '../../../../assets/images/forgot-password.svg';
import { Link, useNavigate } from 'react-router-dom';
import { useResetPassword } from '../../hooks/useResetPassword';
import { useEffect, useState } from 'react';
import { useCooldownTimer } from '../../hooks/useCooldownTimer';
import { errorCategoryList, getErrorCategory } from '../../../../utils/error/errorCategories';
import ErrorLayout from '../../../../shared/layouts/ErrorLayout/ErrorLayout';

function ForgotPasswordForm() {

    // useState hooks for handle data
    const [userData, setUserData] = useState({ email: "" });
    const [errorDetails, setErrorDetails] = useState({ category: null, errorFields: null, errorFrom: null });

    // Import custom hooks
    const { forgotPassword, displayError, loading } = useResetPassword();
    const {
        isCooldownActive,
        setCooldownUntil,
        cooldownSeconds,
        FORGOT_PASSWORD_COOLDOWN_KEY,
        FORGOT_PASSWORD_COOLDOWN_MS
    } = useCooldownTimer();

    // Navigation hooks
    const navigate = useNavigate();

    // Customer registration function
    const userForgotPassword = async (e) => {
        e.preventDefault();

        if (isCooldownActive) return;

        try {
            const result = await forgotPassword(userData);

            if (result.success) {
                const nextCooldownUntil = Date.now() + FORGOT_PASSWORD_COOLDOWN_MS;
                localStorage.setItem(FORGOT_PASSWORD_COOLDOWN_KEY, String(nextCooldownUntil));
                setCooldownUntil(nextCooldownUntil);
            }

        }
        catch (err) {
            return err;
        }
    }

    // use effect for design errors
    useEffect(() => {
        function formatFunction() {

            // reset all error details before install errors
            setErrorDetails({ category: null, errorFields: null, errorFrom: null });

            const errorCat = getErrorCategory(displayError || null);

            // get error category
            getErrorCategory(displayError);
            setErrorDetails({ category: errorCat || null, errorFields: displayError?.fieldErrors || null, errorFrom: displayError?.message || null });
        }

        formatFunction();

    }, [displayError]);

    return (
        <>
            {/* Form */}
            <div className={styles.formPanel}>
                <div className={styles.formHeader}>
                    <div className={styles.userIconWrap}>
                        <svg fill="currentColor" viewBox="-10 0 55 38" version="1.1" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>lock-line</title> <path className="clr-i-outline clr-i-outline-path-1" d="M18.09,20.59A2.41,2.41,0,0,0,17,25.14V28h2V25.23a2.41,2.41,0,0,0-.91-4.64Z"></path><path className="clr-i-outline clr-i-outline-path-2" d="M26,15V10.72a8.2,8.2,0,0,0-8-8.36,8.2,8.2,0,0,0-8,8.36V15H7V32a2,2,0,0,0,2,2H27a2,2,0,0,0,2-2V15ZM12,10.72a6.2,6.2,0,0,1,6-6.36,6.2,6.2,0,0,1,6,6.36V15H12ZM9,32V17H27V32Z"></path> <rect x="0" y="0" width="36" height="36" fillOpacity="0"></rect> </g></svg>
                    </div>
                    <div>
                        <h2>Forgot password</h2>
                        <p>Enter your email address to get reset link</p>
                    </div>
                </div>

                <form onSubmit={userForgotPassword}>
                    <div className={styles.formGrid}>

                        <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                            <span className={styles.inputIcon}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                            </span>
                            <input
                                type="email"
                                placeholder="Your Email Address"
                                className={errorDetails.errorFields?.email && styles.errorInput}
                                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                                onClick={() => setErrorDetails({ ...errorDetails, errorFields: { ...errorDetails.errorFields, email: null }, errorFrom: null })}
                                required
                            />
                        </div>
                        {
                            (errorDetails.category === errorCategoryList.INPUT && errorDetails.errorFields?.email) && <p className={styles.errorText}>{errorDetails.errorFields?.email}</p>
                        }

                    </div>

                    {isCooldownActive && (
                        <div className={styles.cooldownNotice} role="status" aria-live="polite">
                            <div className={styles.cooldownIcon} aria-hidden="true">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="9" />
                                    <polyline points="12 7 12 12 15 14" />
                                </svg>
                            </div>
                            <div className={styles.cooldownText}>
                                <strong>Reset link requested</strong>
                                <span>Check your inbox. You can request another link in</span>
                            </div>
                            <time className={styles.cooldownTimer} dateTime={`PT${cooldownSeconds}S`}>
                                {Math.floor(cooldownSeconds / 60).toString().padStart(2, '0')}:{(cooldownSeconds % 60).toString().padStart(2, '0')}
                            </time>
                        </div>
                    )}

                    {/* Error message here */}
                    {
                        (errorDetails?.category && errorDetails?.errorFrom && errorDetails?.category !== errorCategoryList.INPUT && errorDetails?.category !== errorCategoryList.UNKNOWN) &&
                        <ErrorLayout message={errorDetails?.errorFrom ?? "Something wrong!"} />
                    }

                    <button type="submit" className={styles.submitBtn} disabled={loading || isCooldownActive}>
                        {loading ? <span className={styles.spinner} aria-label="Sending reset link" /> : isCooldownActive ?
                            <span>Please wait</span> :
                            <>
                                Send Reset Link
                            </>
                        }
                    </button>
                    <button type="button" className={styles.backBtn} onClick={() => navigate('/login')}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        Back to Login
                    </button>

                    <div className={styles.loginPrompt}>
                        New to Buy2Eat? <Link to="/register">Create an account</Link>
                    </div>
                </form>

                <img src={forgot_password_banner} alt="left-transparent" className={styles.leftTransparentBanner} />
            </div>
        </>
    )
}

export default ForgotPasswordForm;
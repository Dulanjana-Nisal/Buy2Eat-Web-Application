import { useEffect, useState } from 'react';
import styles from './ResetPasswordForm.module.css';
import reset_password from '../../../../assets/images/reset-password.svg';
import { useResetPassword } from '../../hooks/useResetPassword';
import { errorCategoryList, getErrorCategory } from '../../../../utils/error/errorCategories';
import ErrorLayout from '../../../../shared/layouts/ErrorLayout/ErrorLayout';
import { useNavigate } from 'react-router-dom';

/** Renders the password-reset fields, strength meter, and submit action. */
function ResetPasswordForm({ resetData, setResetData, passwordStrength }) {

    // useStates hooks
    const [hidePassword, setHidePassword] = useState(true);
    const [hideConfPassword, setHideConfPassword] = useState(true);
    const [errorDetails, setErrorDetails] = useState({ category: null, errorFields: null, errorFrom: null });

    // import custom hooks
    const { resetPassword, loading, displayError } = useResetPassword();

    // navigation hooks
    const navigate = useNavigate();

    // user reset password function 
    const resetCurrentPassword = async (e) => {
        e.preventDefault();

        // check password and conf password is matched
        if (resetData.password !== resetData.confPassword) {
            setErrorDetails({ category: errorCategoryList.INPUT, errorFields: { ...errorDetails.errorFields, confPass: "Passwords are not matched" } });
            return;
        }

        try {
            await resetPassword({ token: resetData.token, newPassword: resetData.password });
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

    console.log(displayError)

    return (
        <>
            <div className={styles.leftPanel}>
                {/* Form container */}
                <div className={styles.formContainer}>
                    <div className={styles.formHeader}>
                        <div className={styles.userIconWrap}>
                            <svg viewBox="-5.5 0 35 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 10V14M10.2676 11L13.7317 13M13.7314 11L10.2673 13 M6.73241 10V14M4.99999 11L8.46409 13M8.46386 11L4.99976 13 M17.2681 10V14M15.5356 11L18.9997 13M18.9995 11L15.5354 13 M22 12C22 15.7712 22 17.6569 20.8284 18.8284C19.6569 20 17.7712 20 14 20H10C6.22876 20 4.34315 20 3.17157 18.8284C2 17.6569 2 15.7712 2 12C2 8.22876 2 6.34315 3.17157 5.17157C4.34315 4 6.22876 4 10 4H14C17.7712 4 19.6569 4 20.8284 5.17157C21.4816 5.82475 21.7706 6.69989 21.8985 8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
                            </svg>
                        </div>
                        <div>
                            <h2>Create New Password</h2>
                            <p>Add new strong and secure password to reset</p>
                        </div>
                    </div>
                    <form className={styles.form} onSubmit={resetCurrentPassword}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="password">New Password</label>
                            <div className={styles.passwordInputContainer}>
                                <input
                                    type={hidePassword ? "password" : "text"}
                                    id="password"
                                    value={resetData.password}
                                    className={errorDetails.errorFields?.newPassword && styles.errorInput}
                                    placeholder="Enter new password"
                                    onChange={(e) => setResetData({ ...resetData, password: e.target.value })}
                                    onClick={() => setErrorDetails({ ...errorDetails, errorFields: { ...errorDetails.errorFields, newPassword: null }, errorFrom: null })}
                                />
                                <button type="button" className={styles.eyeIcon} onClick={() => setHidePassword(!hidePassword)}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                </button>
                                {!hidePassword && (
                                    <button type="button" className={styles.eyeIcon} onClick={() => setHidePassword(!hidePassword)}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <path d="M3 3l18 18"></path>
                                        </svg>
                                    </button>
                                )}
                            </div>
                            {
                                (errorDetails.category === errorCategoryList.INPUT && errorDetails.errorFields?.newPassword) && <p className={styles.errorText}>{errorDetails.errorFields?.newPassword}</p>
                            }

                            <div className={styles.strengthMeter} aria-live="polite">
                                <div className={styles.strengthHeader}>
                                    <span>Password strength</span>
                                    <strong className={styles[`strengthLevel${passwordStrength.score}`]}>
                                        {passwordStrength.label}
                                    </strong>
                                </div>
                                <div
                                    className={styles.strengthBars}
                                    role="meter"
                                    aria-label="Password strength"
                                    aria-valuemin="0"
                                    aria-valuemax="5"
                                    aria-valuenow={passwordStrength.score}
                                    aria-valuetext={passwordStrength.label}
                                >
                                    {[1, 2, 3, 4, 5].map((level) => (
                                        <span
                                            key={level}
                                            className={`${styles.strengthBar} ${styles[`strengthSegment${level}`]} ${level > passwordStrength.score ? styles.strengthBarInactive : ''}`}
                                        />
                                    ))}
                                </div>
                                <span className={styles.strengthHint}>
                                    Use 8+ characters with uppercase, lowercase, numbers, and symbols.
                                </span>
                            </div>
                        </div>
                        <div className={`${styles.inputGroup} ${styles.confPasswordInputGroup}`}>
                            <label htmlFor="confPassword">Conform New Password</label>
                            <div className={styles.passwordInputContainer}>
                                <input
                                    type={hideConfPassword ? "password" : "text"}
                                    id="confPassword"
                                    value={resetData.confPassword}
                                    className={errorDetails.errorFields?.confPass && styles.errorInput}
                                    placeholder="Conform new password"
                                    onChange={(e) => setResetData({ ...resetData, confPassword: e.target.value })}
                                    onClick={() => setErrorDetails({ ...errorDetails, errorFields: { ...errorDetails.errorFields, confPass: null }, errorFrom: null })}
                                />
                                <button type="button" className={styles.eyeIcon} onClick={() => setHideConfPassword(!hideConfPassword)}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                </button>
                                {
                                    !hideConfPassword &&
                                    <button type="button" className={styles.eyeIcon} onClick={() => setHideConfPassword(!hideConfPassword)}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <path d="M3 3l18 18"></path>
                                        </svg>
                                    </button>
                                }
                            </div>
                            {
                                (errorDetails.category === errorCategoryList.INPUT && errorDetails.errorFields?.confPass) && <p className={styles.errorText}>{errorDetails.errorFields?.confPass}</p>
                            }
                        </div>
                        {/* Error message here */}
                        {
                            (errorDetails?.category && errorDetails?.errorFrom && errorDetails?.category !== errorCategoryList.INPUT && errorDetails?.category !== errorCategoryList.UNKNOWN) &&
                            <ErrorLayout message={errorDetails?.errorFrom ?? "Something wrong!"} />
                        }
                        <button type="submit" className={styles.submitButton} onClick={(e) => resetCurrentPassword(e)} disabled={loading}>
                            {loading ? <span className={styles.spinner} aria-label="Logging in" /> :
                                <>
                                    Reset Password
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                </>
                            }
                        </button>
                        {
                            (errorDetails?.category && errorDetails?.errorFrom && errorDetails?.category === errorCategoryList.ACCOUNT && errorDetails?.category !== errorCategoryList.UNKNOWN) &&
                            <button className={styles.resendButton} onClick={() => navigate('/forgot-password')} disabled={loading}>
                                {loading ? <span className={styles.spinner} aria-label="Logging in" /> :
                                    <>
                                        <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                                        </svg>
                                        Resend Link
                                    </>
                                }
                            </button>
                        }
                    </form>
                </div>
                <img src={reset_password} alt="" className={styles.reset_transparent} />
            </div>
        </>
    )
}

export default ResetPasswordForm;

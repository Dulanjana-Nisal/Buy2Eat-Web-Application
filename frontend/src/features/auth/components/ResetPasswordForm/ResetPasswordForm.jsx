import { useState } from 'react';
import styles from './ResetPasswordForm.module.css';
import reset_password from '../../../../assets/images/reset-password.svg';

function ResetPasswordForm({ resetPassword, resetData, setResetData, passwordStrength, loading }) {

    // useStates hooks
    const [hidePassword, setHidePassword] = useState(true);
    const [hideConfPassword, setHideConfPassword] = useState(true);

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
                    <form className={styles.form} onSubmit={resetPassword}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="password">New Password</label>
                            <div className={styles.passwordInputContainer}>
                                <input
                                    type={hidePassword ? "password" : "text"}
                                    id="password"
                                    value={resetData.password}
                                    placeholder="Enter new password"
                                    onChange={(e) => setResetData({ ...resetData, password: e.target.value })}
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
                        <div className={styles.inputGroup}>
                            <label htmlFor="confPassword">Conform New Password</label>
                            <div className={styles.passwordInputContainer}>
                                <input
                                    type={hideConfPassword ? "password" : "text"}
                                    id="confPassword"
                                    value={resetData.confPassword}
                                    placeholder="Conform new password"
                                    onChange={(e) => setResetData({ ...resetData, confPassword: e.target.value })}
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
                        </div>
                        <button type="submit" className={styles.submitButton} onClick={(e) => resetPassword(e)} disabled={loading}>
                            {loading ? <span className={styles.spinner} aria-label="Logging in" /> :
                                <>
                                    Reset Password
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                </>
                            }
                        </button>
                    </form>
                </div>
                <img src={reset_password} alt="" className={styles.reset_transparent} />
            </div>
        </>
    )
}

export default ResetPasswordForm;
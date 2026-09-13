import styles from './ResetPasswordPage.module.css';
import login_background from '../../../../assets/images/customer-register-right-banner.png';
import { useState } from 'react';
import UIbackground from '../../components/UIBackground/UIbackground';
import { useNavigate } from 'react-router-dom';
import reset_password from '../../../../assets/images/reset-password.svg'

// calculate strength of password
const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: 'Not rated' };

    const checks = [
        password.length >= 8,
        password.length >= 12,
        /[a-z]/.test(password),
        /[A-Z]/.test(password),
        /\d/.test(password),
        /[^A-Za-z0-9]/.test(password),
    ];
    const score = Math.min(5, checks.filter(Boolean).length - (password.length < 8 ? 1 : 0));
    const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'];

    return { score: Math.max(1, score), label: labels[Math.max(1, score)] };
};

function ResetPasswordPage() {

    // useStates hooks
    const [hidePassword, setHidePassword] = useState(true);
    const [hideConfPassword, setHideConfPassword] = useState(true);
    const [loading, setLoading] = useState(false);
    const [loginDetails, setLoginDetails] = useState({ "password": "", "confPassword": "" });
    const passwordStrength = getPasswordStrength(loginDetails.password);

    // Navigation hook
    const navigate = useNavigate();

    // user reset password function 
    const resetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setLoading(false);
    }

    return (
        <>
            <div className={styles.section}>

                {/* Transparent mini images */}
                <UIbackground />

                {/* Top Navigation */}
                <nav className={styles.topNav}>
                    <button className={styles.backButton} type='button' onClick={() => navigate(-1)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        Back
                    </button>
                </nav>

                {/* Header Texts */}
                <div className={styles.headerTexts}>
                    <h1 className={styles.mainTitle}>
                        Reset Your <span className={styles.cursiveText}>Password</span>
                    </h1>
                    <p className={styles.subTitle}>
                        Create new password to regain access to your account
                        <svg fill="currentColor" viewBox="0 0 512 512" id="_x30_1" version="1.1" xmlSpace="preserve" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M471.079,77.334c-46.964-52.452-127.837-55.735-177.137-5.541C268.648,97.547,256,131.784,256,166.021 c0-34.237-12.647-68.473-37.942-94.227c-49.3-50.195-130.173-46.912-177.138,5.541c-106.53,118.98,7.88,303.709,194.087,393.846 c13.275,6.426,28.709,6.426,41.985,0C463.2,381.043,577.61,196.314,471.079,77.334z"></path></g></svg>
                    </p>
                </div>

                {/* Main Container */}
                <div className={styles.container}>

                    {/* Left Panel - Reset Form */}
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
                                    <label htmlFor="email">New Password</label>
                                    <div className={styles.passwordInputContainer}>
                                        <input
                                            type={hidePassword ? "password" : "text"}
                                            id="password"
                                            value={loginDetails.password}
                                            placeholder="Enter new password"
                                            onChange={(e) => setLoginDetails({ ...loginDetails, password: e.target.value })}
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
                                    <label htmlFor="email">Conform New Password</label>
                                    <div className={styles.passwordInputContainer}>
                                        <input
                                            type={hideConfPassword ? "password" : "text"}
                                            id="confPassword"
                                            value={loginDetails.confPassword}
                                            placeholder="Conform new password"
                                            onChange={(e) => setLoginDetails({ ...loginDetails, confPassword: e.target.value })}
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

                    {/* Right Panel - Image & Widgets */}
                    <div className={styles.infoPanel}>
                        <h3 className={styles.infoTitle}>
                            Great food is just <br /> <span className={styles.cursiveText}>one tap</span> away.
                        </h3>

                        <div className={styles.featureList}>
                            <div className={styles.featureItem}>
                                <div className={styles.featureIcon}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                </div>
                                <div className={styles.featureText}>
                                    <h4>Discover Local Favorites</h4>
                                    <p>Explore a wide variety of local<br />shops and cuisines.</p>
                                </div>
                            </div>

                            <div className={styles.featureItem}>
                                <div className={styles.featureIcon}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                                </div>
                                <div className={styles.featureText}>
                                    <h4>Fast & Easy Ordering</h4>
                                    <p>Place your order in seconds<br />and enjoy your meal.</p>
                                </div>
                            </div>

                            <div className={styles.featureItem}>
                                <div className={styles.featureIcon}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                </div>
                                <div className={styles.featureText}>
                                    <h4>Track Your Order</h4>
                                    <p>Real-time updates from kitchen<br />to your doorstep.</p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.secureBadge}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>
                            <div>
                                <h5>Your data is secure with us</h5>
                                <p>We never share your information</p>
                            </div>
                        </div>

                        <img src={login_background} alt="banner" className={styles.banner} />
                    </div>
                </div>
            </div>
        </>
    )
}

export default ResetPasswordPage;
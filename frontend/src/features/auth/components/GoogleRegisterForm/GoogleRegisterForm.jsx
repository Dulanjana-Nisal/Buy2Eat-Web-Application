import styles from './GoogleRegisterForm.module.css';
import left_transparent_banner from '../../../../assets/images/google-register.svg';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

function GoogleRegisterForm({ setRegisterDetails, registerDetails, customerRegister, loading }) {
    const [showRoleDetails, setShowRoleDetails] = useState(false);

    useEffect(() => {
        if (!showRoleDetails) return undefined;

        const handleEscape = (event) => {
            if (event.key === 'Escape') setShowRoleDetails(false);
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [showRoleDetails]);

    return (
        <>
            <div className={styles.formPanel}>
                <div className={styles.formHeader}>
                    <div className={styles.userIconWrap}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </div>
                    <div>
                        <h2>Register as a {registerDetails.role === 'seller' ? 'Seller' : 'Customer'}</h2>
                        <p>Fill in your details to complete registration</p>
                    </div>
                </div>

                <form>
                    <div className={styles.formGrid}>

                        <fieldset className={`${styles.roleSelector} ${styles.fullWidth}`}>
                            <legend className={styles.visuallyHidden}>Choose an account type</legend>
                            {['customer', 'seller'].map((role) => (
                                <label
                                    key={role}
                                    className={`${styles.roleOption} ${registerDetails.role === role ? styles.selectedRole : ''}`}
                                >
                                    <input
                                        type="radio"
                                        name="accountType"
                                        value={role}
                                        checked={registerDetails.role === role}
                                        onChange={(e) => setRegisterDetails({ ...registerDetails, role: e.target.value })}
                                    />
                                    <span className={styles.radioMark} aria-hidden="true">
                                        <span />
                                    </span>
                                    <span>{role === 'seller' ? 'Seller' : 'Customer'}</span>
                                </label>
                            ))}
                        </fieldset>

                        <div className={`${styles.roleWarning} ${styles.fullWidth}`} role="note">
                            <svg className={styles.roleWarningIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M10.3 2.9 1.8 17a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 2.9a2 2 0 0 0-3.4 0Z" />
                                <line x1="12" y1="9" x2="12" y2="13" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                            <p>
                                Your role cannot be changed after registration is complete. Read{' '}
                                <button
                                    type="button"
                                    className={styles.roleDetailsTrigger}
                                    onClick={() => setShowRoleDetails(true)}
                                >
                                    more about roles
                                </button>{' '}
                                and select your role carefully.
                            </p>
                        </div>

                        <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                            <span className={styles.inputIcon}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                            </span>
                            <input
                                type="tel"
                                placeholder="Enter Your Phone Number"
                                onChange={(e) => setRegisterDetails({ ...registerDetails, phone_number: e.target.value })}
                            />
                        </div>

                    </div>

                    <label className={styles.termsGroup}>
                        <input
                            type="checkbox"
                            defaultChecked={registerDetails.agreement}
                            onClick={(e) => setRegisterDetails({ ...registerDetails, agreement: e.target.checked })}
                        />
                        <span>I agree to the <a href="#" target='_blank'>Terms of Service</a> and <a href="#" target='_blank'>Privacy Policy</a></span>
                    </label>

                    <button type="submit" className={styles.submitBtn} onClick={(e) => customerRegister(e)} disabled={loading}>
                        {loading ? <span className={styles.spinner} aria-label="Logging in" /> :
                            <>
                                Complete Registration
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                            </>
                        }
                    </button>

                    <div className={styles.loginPrompt}>
                        Already have an account? <Link to="/login">Login here </Link>
                    </div>
                </form>

                <img src={left_transparent_banner} alt="left-transparent" className={styles.leftTransparentBanner} />
            </div>

            {showRoleDetails && (
                <div className={styles.modalOverlay} onClick={() => setShowRoleDetails(false)}>
                    <section
                        className={styles.roleDetailsModal}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="role-details-title"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className={styles.modalHeader}>
                            <div>
                                <span className={styles.modalEyebrow}>Account type</span>
                                <h2 id="role-details-title">Choose the right role</h2>
                            </div>
                            <button
                                type="button"
                                className={styles.modalCloseButton}
                                onClick={() => setShowRoleDetails(false)}
                                aria-label="Close role details"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                                    <path d="M6 6l12 12M18 6 6 18" />
                                </svg>
                            </button>
                        </div>

                        <p className={styles.modalIntro}>Your role determines the tools and account experience available after registration.</p>

                        <div className={styles.roleDetailsList}>
                            <div className={styles.roleDetailsItem}>
                                <div className={styles.roleDetailsIcon} aria-hidden="true">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="8" r="3.5" />
                                        <path d="M5 20c.8-3.3 3.1-5 7-5s6.2 1.7 7 5" />
                                    </svg>
                                </div>
                                <div>
                                    <h3>Customer</h3>
                                    <p>Browse food, place orders, track deliveries, and review your favorite meals.</p>
                                </div>
                            </div>
                            <div className={styles.roleDetailsItem}>
                                <div className={styles.roleDetailsIcon} aria-hidden="true">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 10h18" />
                                        <path d="m5 10 1-5h12l1 5" />
                                        <path d="M4 10v9h16v-9" />
                                        <path d="M9 19v-5h6v5" />
                                    </svg>
                                </div>
                                <div>
                                    <h3>Seller</h3>
                                    <p>Manage your shop, publish menu items, receive orders, and grow your business.</p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.modalReminder}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <circle cx="12" cy="12" r="9" />
                                <path d="M12 11v5M12 8h.01" />
                            </svg>
                            <span>This choice cannot be changed after registration is complete.</span>
                        </div>

                        <button type="button" className={styles.modalDoneButton} onClick={() => setShowRoleDetails(false)}>
                            Got it
                        </button>
                    </section>
                </div>
            )}
        </>
    )
}

export default GoogleRegisterForm;
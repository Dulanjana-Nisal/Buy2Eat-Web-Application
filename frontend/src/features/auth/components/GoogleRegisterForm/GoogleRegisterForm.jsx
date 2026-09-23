import styles from './GoogleRegisterForm.module.css';
import left_transparent_banner from '../../../../assets/images/google-register.svg';
import { Link } from 'react-router-dom';
// import { useState } from 'react';

function GoogleRegisterForm({ setRegisterDetails, registerDetails, customerRegister, loading }) {

    // useStats hook for UI
    // const [hidePass, setHidePass] = useState(true);
    // const [hidePassConform, setHidePassConform] = useState(true);

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
                            <p>Your role cannot be changed after registration is complete. Please select your role carefully.</p>
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
        </>
    )
}

export default GoogleRegisterForm;
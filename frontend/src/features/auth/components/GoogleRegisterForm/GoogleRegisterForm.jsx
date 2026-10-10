import styles from './GoogleRegisterForm.module.css';
import left_transparent_banner from '../../../../assets/images/google-register.svg';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';
import { errorCategoryList, getErrorCategory } from '../../../../utils/error/errorCategories';
import ErrorLayout from '../../../../shared/layouts/ErrorLayout/ErrorLayout';

function GoogleRegisterForm({ navigate, location }) {

    // use states
    const [showRoleDetails, setShowRoleDetails] = useState(false);
    const [registerDetails, setRegisterDetails] = useState({
        role: "",
        phone_number: "",
        accept_agreement: false,
    });
    const [errorDetails, setErrorDetails] = useState({ category: null, errorFields: null, errorFrom: null });

    // load custom hooks
    const { continueWithGoogle, registerWithGoogle, googleLoginError, googleLoginLoading } = useGoogleAuth();


    // Customer registration function
    const customerRegister = async (e) => {
        e.preventDefault();

        // get register token from location state
        const register_token = location.state?.register_token;

        try {
            // all google register api
            const registration = await registerWithGoogle(
                {
                    registerToken: register_token,
                    role: registerDetails.role,
                    phone_number: registerDetails.phone_number,
                    accept_agreement: registerDetails.accept_agreement,
                }
            );

            // navigate OTP verification page
            if (registration.success) {
                localStorage.setItem('expiredAt', registration.expiresAt)
                navigate('/verify-otp', {
                    state: {
                        verification_id: registration.verification_id,
                        maskEmail: registration.masked_email,
                        expiresAt: registration.expiresAt,
                        role: registerDetails.role,
                    }
                })
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

            const errorCat = getErrorCategory(googleLoginError || null);

            // get error category
            getErrorCategory(googleLoginError);
            setErrorDetails({ category: errorCat || null, errorFields: googleLoginError?.fieldErrors || null, errorFrom: googleLoginError?.message || null });
        }

        formatFunction();

    }, [googleLoginError]);

    // clickTerms function 
    const clickTerms = (e) => {
        setRegisterDetails({ ...registerDetails, accept_agreement: e.target.checked });
        setErrorDetails({ ...errorDetails, errorFields: { ...errorDetails.errorFields, termsAccepted: null }, errorFrom: null });
    }

    // reconnectAccount function for Reconnect account
    const reconnectAccount = async (e) => {
        e.preventDefault();

        // clear all navigation data
        navigate(`/register/${registerDetails.role ?? ""}`, {
            replace: true,
            state: null,
        });

        // call google api
        continueWithGoogle();
    }

    // use effect for display roles details.
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
                        {
                            registerDetails.role === 'seller' ?
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="-5.5 0 35 24" stroke-width="1.3" stroke="currentColor" class="size-1">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
                                </svg>
                                :
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                        }

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
                                        className={errorDetails.errorFields?.role && styles.errorInput}
                                        onChange={(e) => setRegisterDetails({ ...registerDetails, role: e.target.value })}
                                        onClick={() => setErrorDetails({ ...errorDetails, errorFields: { ...errorDetails.errorFields, role: null }, errorFrom: null })}
                                    />
                                    <span className={styles.radioMark} aria-hidden="true">
                                        <span />
                                    </span>
                                    <span>{role === 'seller' ? 'Seller' : 'Customer'}</span>
                                </label>
                            ))}
                            {
                                (errorDetails.category === errorCategoryList.INPUT && errorDetails.errorFields?.role) && <p className={styles.errorTextRole}>{errorDetails.errorFields?.role}</p>
                            }
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
                                className={errorDetails.errorFields?.phone_number && styles.errorInput}
                                onChange={(e) => setRegisterDetails({ ...registerDetails, phone_number: e.target.value })}
                                onClick={() => setErrorDetails({ ...errorDetails, errorFields: { ...errorDetails.errorFields, phone_number: null }, errorFrom: null })}
                            />
                        </div>
                        {
                            (errorDetails.category === errorCategoryList.INPUT && errorDetails.errorFields?.phone_number) && <p className={styles.errorText}>{errorDetails.errorFields?.phone_number}</p>
                        }

                    </div>

                    <div className={styles.termsField}>
                        <label className={styles.termsGroup}>
                            <input
                                type="checkbox"
                                defaultChecked={registerDetails.accept_agreement}
                                onClick={(e) => clickTerms(e)}
                            />
                            <span>I agree to the <a href="#" target='_blank'>Terms of Service</a> and <a href="#" target='_blank'>Privacy Policy</a></span>
                        </label>
                        {
                            (errorDetails.category === errorCategoryList.INPUT && errorDetails.errorFields?.termsAccepted) &&
                            <p className={`${styles.errorText} ${styles.termsError}`}>{errorDetails.errorFields.termsAccepted}</p>
                        }
                    </div>

                    {/* Error message here */}
                    {
                        (errorDetails?.category && errorDetails?.errorFrom && errorDetails?.category !== errorCategoryList.INPUT && errorDetails?.category !== errorCategoryList.UNKNOWN) &&
                        <ErrorLayout message={errorDetails?.errorFrom ?? "Something wrong!"} />
                    }

                    {
                        (errorDetails?.category && errorDetails?.errorFrom && errorDetails?.category === errorCategoryList.AUTH && errorDetails?.category !== errorCategoryList.UNKNOWN) &&
                        <button className={styles.socialButton} onClick={(e) => reconnectAccount(e)} disabled={googleLoginLoading}>
                            {googleLoginLoading ? <span className={styles.spinner} aria-label="Logging in" /> :
                                <>
                                    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>

                                    Reconnect Google
                                </>
                            }
                        </button>
                    }

                    <button type="submit" className={styles.submitBtn} onClick={(e) => customerRegister(e)} disabled={googleLoginLoading} >
                        {googleLoginLoading ? <span className={styles.spinner} aria-label="Logging in" /> :
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
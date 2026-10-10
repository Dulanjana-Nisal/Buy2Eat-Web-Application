import styles from './SellerRegisterForm.module.css';
import left_transparent_banner from '../../../../assets/images/seller-card.svg';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';
import { useSellerRegister } from '../../hooks/useSellerRegister';
import { errorCategoryList, getErrorCategory } from '../../../../utils/error/errorCategories';
import ErrorLayout from '../../../../shared/layouts/ErrorLayout/ErrorLayout';

function SellerRegisterForm() {

    // useStats hook for UI
    const [hidePass, setHidePass] = useState(true);
    const [hidePassConform, setHidePassConform] = useState(true);
    const [registerDetails, setRegisterDetails] = useState({
        email: "",
        password: "",
        confPass: "",
        first_name: "",
        last_name: "",
        phone_number: "",
        agreement: false,
    });
    const [errorDetails, setErrorDetails] = useState({ category: null, errorFields: null, errorFrom: null });

    // use custom hook
    const { continueWithGoogle, googleLoginLoading } = useGoogleAuth();
    const { register, loading, displayError } = useSellerRegister();


    // Customer registration function
    const customerRegister = async (e) => {
        e.preventDefault();

        // check password and conform password is same
        if (registerDetails.password !== registerDetails.confPass) {
            setErrorDetails({ category: errorCategoryList.INPUT, errorFields: { ...errorDetails.errorFields, confPass: "Passwords are not matched" } });
            return;
        }

        // call seller register api
        try {
            await register(registerDetails);
        }
        catch (err) {
            return err;
        }
    }

    // use effect for design errors for login
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

    // clickTerms function 
    const clickTerms = (e) => {
        setRegisterDetails({ ...registerDetails, accept_agreement: e.target.checked });
        setErrorDetails({ ...errorDetails, errorFields: { ...errorDetails.errorFields, termsAccepted: null }, errorFrom: null });
    }

    return (
        <>
            <div className={styles.formPanel}>
                <div className={styles.formHeader}>
                    <div className={styles.userIconWrap}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="-8 0 40 24" stroke-width="1.6" stroke="currentColor" class="size-1">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
                        </svg>
                    </div>
                    <div>
                        <h2>Register as a Seller</h2>
                        <p>Fill in your details to get started</p>
                    </div>
                </div>

                <div className={styles.socialAuth}>
                    <button className={styles.socialButton} onClick={() => continueWithGoogle()}>
                        <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </button>
                </div>

                <div className={styles.divider}>
                    <span>Or sign up with email</span>
                </div>

                <form>
                    <div className={styles.formGrid}>

                        <div className={`${styles.inputGroup} ${styles.nameInputGroup}`}>
                            <span className={styles.inputIcon}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            </span>
                            <input
                                type="text"
                                placeholder="First Name"
                                className={errorDetails.errorFields?.first_name && styles.errorInput}
                                onChange={(e) => setRegisterDetails({ ...registerDetails, first_name: e.target.value })}
                                onClick={() => setErrorDetails({ ...errorDetails, errorFields: { ...errorDetails.errorFields, first_name: null } })}
                            />
                            {
                                (errorDetails.category === errorCategoryList.INPUT && errorDetails.errorFields?.first_name) && <p className={styles.errorText}>{errorDetails.errorFields?.first_name}</p>
                            }
                        </div>

                        <div className={`${styles.inputGroup} ${styles.nameInputGroup}`}>
                            <span className={styles.inputIcon}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            </span>
                            <input
                                type="text"
                                placeholder="Last Name"
                                onChange={(e) => setRegisterDetails({ ...registerDetails, last_name: e.target.value })}
                                className={errorDetails.errorFields?.last_name && styles.errorInput}
                                onClick={() => setErrorDetails({ ...errorDetails, errorFields: { ...errorDetails.errorFields, last_name: null }, errorFrom: null })}
                            />
                            {
                                (errorDetails.category === errorCategoryList.INPUT && errorDetails.errorFields?.last_name) && <p className={styles.errorText}>{errorDetails.errorFields?.last_name}</p>
                            }
                        </div>

                        <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                            <span className={styles.inputIcon}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                            </span>
                            <input
                                type="email"
                                placeholder="Email Address"
                                onChange={(e) => setRegisterDetails({ ...registerDetails, email: e.target.value })}
                                className={errorDetails.errorFields?.email && styles.errorInput}
                                onClick={() => setErrorDetails({ ...errorDetails, errorFields: { ...errorDetails.errorFields, email: null }, errorFrom: null })}
                            />
                        </div>
                        {
                            (errorDetails.category === errorCategoryList.INPUT && errorDetails.errorFields?.email) && <p className={styles.errorText}>{errorDetails.errorFields?.email}</p>
                        }

                        <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                            <span className={styles.inputIcon}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                            </span>
                            <input
                                type="tel"
                                placeholder="+94 70 123 4567"
                                onChange={(e) => setRegisterDetails({ ...registerDetails, phone_number: e.target.value })}
                                className={errorDetails.errorFields?.phone_number && styles.errorInput}
                                onClick={() => setErrorDetails({ ...errorDetails, errorFields: { ...errorDetails.errorFields, phone_number: null }, errorFrom: null })}
                            />
                        </div>
                        {
                            (errorDetails.category === errorCategoryList.INPUT && errorDetails.errorFields?.phone_number) && <p className={styles.errorText}>{errorDetails.errorFields?.phone_number}</p>
                        }

                        <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                            <span className={styles.inputIcon}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                            </span>
                            <input
                                type={hidePass ? "password" : 'text'}
                                placeholder="Password"
                                onChange={(e) => setRegisterDetails({ ...registerDetails, password: e.target.value })}
                                className={errorDetails.errorFields?.password && styles.errorInput}
                                onClick={() => setErrorDetails({ ...errorDetails, errorFields: { ...errorDetails.errorFields, password: null }, errorFrom: null })}
                            />
                            {
                                !hidePass ?
                                    <button type="button" className={styles.eyeIcon} onClick={() => setHidePass(!hidePass)}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                    </button>
                                    :
                                    <button type="button" className={styles.eyeIcon} onClick={() => setHidePass(!hidePass)}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12Z" /><circle cx="12" cy="12" r="3" />
                                        </svg>
                                    </button>
                            }
                        </div>
                        {
                            (errorDetails.category === errorCategoryList.INPUT && errorDetails.errorFields?.password) && <p className={styles.errorText}>{errorDetails.errorFields?.password}</p>
                        }

                        <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                            <span className={styles.inputIcon}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                            </span>
                            <input
                                type={hidePassConform ? "password" : 'text'}
                                placeholder="Confirm Password"
                                onChange={(e) => setRegisterDetails({ ...registerDetails, confPass: e.target.value })}
                                className={errorDetails.errorFields?.confPass && styles.errorInput}
                                onClick={() => setErrorDetails({ ...errorDetails, errorFields: { ...errorDetails.errorFields, confPass: null }, errorFrom: null })}
                            />
                            {
                                !hidePassConform ?
                                    <button type="button" className={styles.eyeIcon} onClick={() => setHidePassConform(!hidePassConform)}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                    </button>
                                    :
                                    <button type="button" className={styles.eyeIcon} onClick={() => setHidePassConform(!hidePassConform)}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12Z" /><circle cx="12" cy="12" r="3" />
                                        </svg>
                                    </button>
                            }
                        </div>
                        {
                            (errorDetails.category === errorCategoryList.INPUT && errorDetails.errorFields?.confPass) && <p className={styles.errorText}>{errorDetails.errorFields?.confPass}</p>
                        }

                    </div>
                    <div className={styles.termsField}>
                        <label className={styles.termsGroup}>
                            <input
                                type="checkbox"
                                defaultChecked={registerDetails.accept_agreement}
                                onClick={(e) => clickTerms(e)}
                            />
                            <span>I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></span>
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

                    <button type="submit" className={styles.submitBtn} onClick={(e) => customerRegister(e)} disabled={loading || googleLoginLoading}>
                        {(loading || googleLoginLoading) ? <span className={styles.spinner} aria-label="Logging in" /> :
                            <>
                                Create Account
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

export default SellerRegisterForm;
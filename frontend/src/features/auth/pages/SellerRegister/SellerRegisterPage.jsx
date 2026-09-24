import UIbackground from '../../components/UIBackground/UIbackground';
import styles from './SellerRegisterPage.module.css';
import right_banner from '../../../../assets/images/customer-register-right-banner.png';
import SellerRegisterForm from '../../components/SellerRegisterForm/SellerRegisterForm';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sellerRegistrationApi } from '../../api/authApi';

function SellerRegisterPage() {
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

        // check email is not empty
        if ((registerDetails.email).length < 2) {
            setLoading(false)
            return console.error('Email is required please fill that filed!')
        }

        // check password and conform password is same
        if (registerDetails.password !== registerDetails.confPass) {
            setLoading(false)
            return console.error('Passwords are not matched!')
        }

        // check password length
        if ((registerDetails.password).length < 6) {
            setLoading(false)
            return console.error('Passwords must have more that 6 characters!')
        }

        // check Phone number length
        if ((registerDetails.phone_number).length <= 6) {
            setLoading(false)
            return console.error('Phone number have more that 6 numbers!')
        }

        // check if agreement is sign
        if (!registerDetails.agreement) {
            setLoading(false)
            return console.error("Please agree with Terms of services and Privacy Policy")
        }

        try {

            // call seller register api
            const registration = await sellerRegistrationApi(registerDetails);

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

                {/* Header Texts */}
                <div className={styles.headerTexts}>

                    {/* Top Navigation */}
                    <nav className={styles.topNav}>
                        <button className={styles.backButton} type='button' onClick={() => navigate(-1)}>
                            <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15 4 7 12l8 8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </button>
                    </nav>

                    {/* Header Texts content */}
                    <h1 className={styles.mainTitle}>
                        Create Your <span className={styles.cursiveText}>Seller</span> Account
                    </h1>
                    <p className={styles.subTitle}>
                        Join thousands of food lovers and order your favorite meals
                        <svg fill="currentColor" viewBox="0 0 512 512" id="_x30_1" version="1.1" xmlSpace="preserve" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M471.079,77.334c-46.964-52.452-127.837-55.735-177.137-5.541C268.648,97.547,256,131.784,256,166.021 c0-34.237-12.647-68.473-37.942-94.227c-49.3-50.195-130.173-46.912-177.138,5.541c-106.53,118.98,7.88,303.709,194.087,393.846 c13.275,6.426,28.709,6.426,41.985,0C463.2,381.043,577.61,196.314,471.079,77.334z"></path></g></svg>
                    </p>
                </div>

                {/* Main Form Card */}
                <div className={styles.mainCard}>

                    {/* Left Side: Form */}
                    <SellerRegisterForm
                        setRegisterDetails={setRegisterDetails}
                        registerDetails={registerDetails}
                        customerRegister={customerRegister}
                        loading={loading}
                    />

                    {/* Right Side: Features / Info */}
                    <div className={styles.infoPanel}>
                        <h3 className={styles.infoTitle}>
                            Grow your business <br /> <span className={styles.cursiveText}>one order</span> at a Time.
                        </h3>

                        <div className={styles.featureList}>
                            <div className={styles.featureItem}>
                                <div className={styles.featureIcon}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                </div>
                                <div className={styles.featureText}>
                                    <h4>Reach Local Customers</h4>
                                    <p>Connect with hungry customers<br />and showcase your food locally.</p>
                                </div>
                            </div>

                            <div className={styles.featureItem}>
                                <div className={styles.featureIcon}>
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <rect x="5" y="4" width="14" height="17" rx="2"></rect>
                                        <path d="M9 4V2h6v2"></path>
                                        <polyline points="9 13 11 15 15 11"></polyline>
                                    </svg>
                                </div>
                                <div className={styles.featureText}>
                                    <h4>Manage Orders Easily</h4>
                                    <p>Receive orders instantly, manage<br />menu, and serve customers faster.</p>
                                </div>
                            </div>

                            <div className={styles.featureItem}>
                                <div className={styles.featureIcon}>
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <polyline points="3 17 9 11 13 15 21 7"></polyline>
                                        <polyline points="14 7 21 7 21 14"></polyline>
                                    </svg>
                                </div>
                                <div className={styles.featureText}>
                                    <h4>Grow Your Business</h4>
                                    <p>Build your reputation, attract more<br />customers, and increase your sales.</p>
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

                        <img src={right_banner} alt="banner" className={styles.banner} />
                    </div>

                </div>

            </div>
        </>
    )
}

export default SellerRegisterPage;
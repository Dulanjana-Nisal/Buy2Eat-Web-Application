import styles from './CustomerRegisterPage.module.css';
import { useNavigate } from 'react-router-dom';
import right_banner from '../../../assets/images/customer-register-right-banner.png';
import { useState } from 'react';
import api from '../../../app/config/api';
import UIbackground from '../components/UIbackground';
import CustomerRegisterForm from '../components/CustomerRegisterForm';

function CustomerRegister() {

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
            const registration = await api.post('/auth/register-customer', registerDetails);

            // navigate OTP verification page
            if (registration.data.success) {
                localStorage.setItem('expiredAt', registration.data.expiresAt)
                navigate('/verify-otp', {
                    state: {
                        verification_id: registration.data.verification_id,
                        maskEmail: registration.data.masked_email,
                        expiresAt: registration.data.expiresAt
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
                        Create Your <span className={styles.cursiveText}>Customer</span> Account
                    </h1>
                    <p className={styles.subTitle}>
                        Join thousands of food lovers and order your favorite meals
                        <svg fill="currentColor" viewBox="0 0 512 512" id="_x30_1" version="1.1" xmlSpace="preserve" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M471.079,77.334c-46.964-52.452-127.837-55.735-177.137-5.541C268.648,97.547,256,131.784,256,166.021 c0-34.237-12.647-68.473-37.942-94.227c-49.3-50.195-130.173-46.912-177.138,5.541c-106.53,118.98,7.88,303.709,194.087,393.846 c13.275,6.426,28.709,6.426,41.985,0C463.2,381.043,577.61,196.314,471.079,77.334z"></path></g></svg>
                    </p>
                </div>

                {/* Main Form Card */}
                <div className={styles.mainCard}>

                    {/* Left Side: Form */}
                    <CustomerRegisterForm
                        setRegisterDetails={setRegisterDetails}
                        registerDetails={registerDetails}
                        customerRegister={customerRegister}
                        loading={loading}
                    />

                    {/* Right Side: Features / Info */}
                    <div className={styles.infoPanel}>
                        <h3 className={styles.infoTitle}>
                            Good food is just <br /> <span className={styles.cursiveText}>one tap</span> away.
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

                        <img src={right_banner} alt="banner" className={styles.banner} />
                    </div>

                </div>

            </div>
        </>
    )
}

export default CustomerRegister;
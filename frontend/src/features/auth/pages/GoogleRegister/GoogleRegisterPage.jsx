import styles from './GoogleRegisterPage.module.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import UIbackground from '../../components/UIBackground/UIbackground';
import { googleRegisterApi } from '../../api/authApi';
import GoogleRegisterForm from '../../components/GoogleRegisterForm/GoogleRegisterForm';

function GoogleRegister() {
    // Navigation hooks
    const navigate = useNavigate();
    const location = useLocation();

    // useState hooks for handle data
    const [registerDetails, setRegisterDetails] = useState({
        role: "customer",
        phone_number: "",
        agreement: false,
    })

    // useStats hook for UI
    const [loading, setLoading] = useState(false);

    // use effect get state data from navigate
    useEffect(() => {
        const register_token = location.state?.register_token

        if (!register_token) {
            navigate("/login", { replace: true })
        }
    }, [location.state?.register_token, navigate])

    // Customer registration function
    const customerRegister = async (e) => {
        e.preventDefault();

        // get register token from location state
        const register_token = location.state?.register_token;

        setLoading(true)

        // check if agreement is sign
        if (!registerDetails.agreement) {
            setLoading(false)
            return console.error("Please agree with Terms of services and Privacy Policy")
        }

        try {
            // all google register api
            const registration = await googleRegisterApi(
                {
                    registerToken: register_token,
                    role: registerDetails.role,
                    phone_number: registerDetails.phone_number
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

                {/* Main Form Card */}
                <div className={styles.mainCard}>

                    {/* Left Side: Form */}
                    <GoogleRegisterForm
                        setRegisterDetails={setRegisterDetails}
                        registerDetails={registerDetails}
                        customerRegister={customerRegister}
                        loading={loading}
                    />

                </div>

            </div>
        </>
    )
}

export default GoogleRegister;
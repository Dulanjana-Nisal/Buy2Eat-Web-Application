import styles from './GoogleRegisterPage.module.css';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import UIbackground from '../../components/UIBackground/UIbackground';
import { customerRegistrationApi } from '../../api/authApi';
import GoogleRegisterForm from '../../components/GoogleRegisterForm/GoogleRegisterForm';

function GoogleRegister() {

    // useStats hook for UI
    const [loading, setLoading] = useState(false);

    // Navigation hooks
    const navigate = useNavigate();

    // useState hooks for handle data
    const [registerDetails, setRegisterDetails] = useState({
        email: "",
        role: "customer",
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
            const registration = await customerRegistrationApi(registerDetails);

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
import { useState } from "react";
import { resendOTPApi, submitOTPApi } from "../api/authApi";
import { useNavigate } from "react-router-dom";

export const useOtpAuth = () => {
    const [loading, setLoading] = useState(false);
    const [loadResend, setLoadResend] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState(null);
    
    // navigation state hooks
    const navigate = useNavigate();

    // submit OTP
    const submitOtp = async (credentials) => {

        setLoading(true)

        try {
            const otpVerification = await submitOTPApi(credentials)

            if (otpVerification.success) {
                setVerificationStatus('success');

                // delete all navigation data
                navigate('/register/success', {
                    replace: true,
                    state: {
                        isRegistered: otpVerification.success,
                        role: otpVerification.user?.role || location.state?.role || 'user'
                    }
                })
            } else {
                setVerificationStatus('failure');
            }
        }
        catch (err) {
            setVerificationStatus('failure');
            console.log(err.response?.data)
        }
        finally {
            setLoading(false)
        }
    }

    // Resend OTP
    const resendOtp = async (credentials) => {
        setLoadResend(true)
        try {
            const resentOtpData = await resendOTPApi(credentials);
            localStorage.setItem('expiredAt', resentOtpData.expiresAt);
        }
        catch (err) {
            return err;
        }
        finally {
            setLoadResend(false);
        }
    }

    return {
        submitOtp,
        resendOtp,
        loading,
        loadResend,
        verificationStatus,
    }
}
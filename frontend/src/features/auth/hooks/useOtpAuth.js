import { useState } from "react";
import { resendOTPApi, submitOTPApi } from "../api/authApi";
import { useNavigate } from "react-router-dom";
import { UseAuth } from "../../../app/providers/AuthProvider";

export const useOtpAuth = () => {

    // use states
    const [loading, setLoading] = useState(false);
    const [loadResend, setLoadResend] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState(null);
    const [otpErrors, setOtpErrors] = useState(null);

    // use custom hooks for storage user data
    const { setUser } = UseAuth()

    // navigation state hooks
    const navigate = useNavigate();

    // submit OTP
    const submitOtp = async (credentials) => {

        setLoading(true)

        try {
            const otpVerification = await submitOTPApi(credentials);

            if (otpVerification.success) {
                setVerificationStatus('success');

                // store user data in localstorage
                localStorage.setItem('user', JSON.stringify(otpVerification.user));

                // store user data in to user state in UseAuth provider
                setUser(otpVerification.user);
                console.log(otpVerification, 'User Registered!');

                // delete all navigation data
                navigate('/register/success', {
                    replace: true,
                    state: {
                        isRegistered: otpVerification.success,
                        role: otpVerification.user?.role || location.state?.role || 'user'
                    }
                });
            } else {
                setVerificationStatus('failure');
            }
        }
        catch (err) {
            setOtpErrors(err)
            setVerificationStatus('failure');
            return err;
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
            return resentOtpData;
        }
        catch (err) {
            setOtpErrors(err);
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
        otpErrors,
    }
}
import { useNavigate } from 'react-router-dom';
import UIbackground from '../components/UIbackground';
import styles from './ForgotPasswordPage.module.css';
import { useEffect, useState } from 'react';
import { forgotPasswordApi } from '../api/authApi';
import ForgotPasswordForm from '../components/ForgotPasswordForm';

const FORGOT_PASSWORD_COOLDOWN_KEY = 'forgot-password-cooldown-until';
const FORGOT_PASSWORD_COOLDOWN_MS = 60 * 1000;

function ForgotPassword() {

    // useStats hook for UI
    const [loading, setLoading] = useState(false);
    const [cooldownUntil, setCooldownUntil] = useState(() => {
        const storedDeadline = Number(localStorage.getItem(FORGOT_PASSWORD_COOLDOWN_KEY));
        return Number.isFinite(storedDeadline) && storedDeadline > Date.now() ? storedDeadline : 0;
    });
    const [currentTime, setCurrentTime] = useState(0);

    // Navigation hooks
    const navigate = useNavigate();

    // useState hooks for handle data
    const [userData, setUserData] = useState({email: ""})

    const cooldownSeconds = Math.max(0, Math.ceil((cooldownUntil - currentTime) / 1000));
    const isCooldownActive = cooldownSeconds > 0;

    useEffect(() => {
        const timer = window.setTimeout(() => setCurrentTime(Date.now()), 0);
        return () => window.clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!isCooldownActive) {
            localStorage.removeItem(FORGOT_PASSWORD_COOLDOWN_KEY);
            return undefined;
        }

        const timer = window.setInterval(() => setCurrentTime(Date.now()), 1000);
        return () => window.clearInterval(timer);
    }, [isCooldownActive]);

    useEffect(() => {
        if (cooldownUntil > 0) {
            localStorage.setItem(FORGOT_PASSWORD_COOLDOWN_KEY, String(cooldownUntil));
        }
    }, [cooldownUntil]);

    // Customer registration function
    const userForgotPassword = async (e) => {
        e.preventDefault();

        if (loading || isCooldownActive) return;
        
        setLoading(true)
        
        try {
            await forgotPasswordApi(userData);

            const nextCooldownUntil = Date.now() + FORGOT_PASSWORD_COOLDOWN_MS;
            localStorage.setItem(FORGOT_PASSWORD_COOLDOWN_KEY, String(nextCooldownUntil));
            setCooldownUntil(nextCooldownUntil);
            
            navigate("/forgot-password/success", {
                state: { fromForgotPassword: true }
            });
        }
        catch (err) {
            console.error(err?.response?.data)
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

                    {/* Form */}
                    <ForgotPasswordForm
                        userForgotPassword={userForgotPassword}
                        setUserData={setUserData}
                        userData={userData}
                        isCooldownActive={isCooldownActive}
                        cooldownSeconds={cooldownSeconds}
                        loading={loading}
                        navigate={navigate}
                    />
                </div>

            </div>
        </>
    )
}

export default ForgotPassword;
import { useEffect, useState } from "react";

// Main variables for cooldown calculation
const FORGOT_PASSWORD_COOLDOWN_KEY = 'forgot-password-cooldown-until';
const FORGOT_PASSWORD_COOLDOWN_MS = 60 * 1000;

export const useCooldownTimer = () => {

    // useStats hook for UI
    const [cooldownUntil, setCooldownUntil] = useState(() => {
        const storedDeadline = Number(localStorage.getItem(FORGOT_PASSWORD_COOLDOWN_KEY));
        return Number.isFinite(storedDeadline) && storedDeadline > Date.now() ? storedDeadline : 0;
    });
    const [currentTime, setCurrentTime] = useState(0);

    // create variables for calculate cooldown time
    const cooldownSeconds = Math.max(0, Math.ceil((cooldownUntil - currentTime) / 1000));
    const isCooldownActive = cooldownSeconds > 0;

    useEffect(() => {
        const timer = window.setTimeout(() => setCurrentTime(Date.now()), 0);
        return () => window.clearTimeout(timer);
    }, []);

    // handel cooldown time with localstorage
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

    return{
        isCooldownActive,
        setCooldownUntil,
        cooldownSeconds,
        FORGOT_PASSWORD_COOLDOWN_KEY,
        FORGOT_PASSWORD_COOLDOWN_MS,
    }

}
import { useState } from "react";

export const useHandleOtp = () => {

    // use states
    const [otp, setOtp] = useState(['', '', '', '', '', '']);

    // handel otp input values
    const handleOtpChange = (value, index) => {
        const digits = value.replace(/\D/g, '').slice(0, otp.length - index)
        if (!digits) {
            if (value) return
            const nextOtp = [...otp]
            nextOtp[index] = ''
            setOtp(nextOtp)
            return
        }

        const nextOtp = [...otp]
        digits.split('').forEach((digit, offset) => {
            nextOtp[index + offset] = digit
        })
        setOtp(nextOtp)

        const nextIndex = Math.min(index + digits.length, otp.length - 1)
        document.getElementById(`otp-input-${nextIndex}`)?.focus()
    }

    // handel otp keys
    const handleOtpKeyDown = (event, index) => {
        if (event.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-input-${index - 1}`)
            if (prevInput) prevInput.focus()
        }
    }

    // handle otp past
    const handleOtpPaste = (event, index) => {
        const pastedDigits = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, otp.length - index)
        if (!pastedDigits) return

        event.preventDefault()
        const nextOtp = [...otp]
        pastedDigits.split('').forEach((digit, offset) => {
            nextOtp[index + offset] = digit
        })
        setOtp(nextOtp)

        const nextIndex = Math.min(index + pastedDigits.length, otp.length - 1)
        document.getElementById(`otp-input-${nextIndex}`)?.focus()
    }

    return {
        otp,
        handleOtpChange,
        handleOtpKeyDown,
        handleOtpPaste,
    }
}
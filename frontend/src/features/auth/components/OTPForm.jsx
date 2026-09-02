import { useNavigate } from 'react-router-dom';
import styles from './OTPForm.module.css';
import left_transparent_banner from '../../../assets/images/otp-background.svg';

function OTPForm({ otp, setOtp, secondsLeft, loadResend, resendOtp, verificationStatus, submitOtp, loading, }) {

    // navigation hook
    const navigate = useNavigate();

    // handel otp input values
    const handleOtpChange = (value, index) => {
        if (!/^\d*$/.test(value)) return

        const nextOtp = [...otp]
        nextOtp[index] = value.slice(-1)
        setOtp(nextOtp)

        if (value && index < otp.length - 1) {
            const nextInput = document.getElementById(`otp-input-${index + 1}`)
            if (nextInput) nextInput.focus()
        }
    }

    // handel otp keys
    const handleOtpKeyDown = (event, index) => {
        if (event.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-input-${index - 1}`)
            if (prevInput) prevInput.focus()
        }
    }

    return (
        <>
            <div className={styles.formPanel}>
                <div className={styles.formHeader}>
                    <div className={styles.emailIconWrap}>
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M15 18L17 20L21 16M11 19H6.2C5.0799 19 4.51984 19 4.09202 18.782C3.71569 18.5903 3.40973 18.2843 3.21799 17.908C3 17.4802 3 16.9201 3 15.8V8.2C3 7.0799 3 6.51984 3.21799 6.09202C3.40973 5.71569 3.71569 5.40973 4.09202 5.21799C4.51984 5 5.0799 5 6.2 5H17.8C18.9201 5 19.4802 5 19.908 5.21799C20.2843 5.40973 20.5903 5.71569 20.782 6.09202C21 6.51984 21 7.0799 21 8.2V12M20.6067 8.26229L15.5499 11.6335C14.2669 12.4888 13.6254 12.9165 12.932 13.0827C12.3192 13.2295 11.6804 13.2295 11.0677 13.0827C10.3743 12.9165 9.73279 12.4888 8.44975 11.6335L3.14746 8.09863" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
                    </div>
                    <div>
                        <h2>Enter OTP code</h2>
                        <p>
                            We've sent a 6-digits code to <br />
                            <span> {location.state?.maskEmail || "youremail@domain.com"}</span>
                        </p>
                    </div>
                </div>

                <form>
                    <div className={styles.otpContainer}>
                        <div className={styles.otpInputRow}>
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    id={`otp-input-${index}`}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength="1"
                                    value={digit}
                                    className={styles.otpDigitInput}
                                    onChange={(event) => handleOtpChange(event.target.value, index)}
                                    onKeyDown={(event) => handleOtpKeyDown(event, index)}
                                />
                            ))}
                        </div>

                        <div className={styles.countdownRow}>
                            <span>Didn't receive the code?</span>
                            {
                                secondsLeft === 0 ?
                                    <button
                                        type="button"
                                        className={`${styles.resendButton} ${loadResend ? styles.resendButtonLoading : ''}`}
                                        onClick={() => resendOtp()}
                                        disabled={loadResend}
                                    >
                                        {loadResend ? (
                                            <>
                                                <span className={styles.resendSpinner} aria-label="Resending OTP" />
                                                <span>Sending...</span>
                                            </>
                                        ) : (
                                            <span>Resend</span>
                                        )}
                                    </button>
                                    :
                                    <div type="button" className={styles.resendButton}>
                                        <span className={styles.disableResend}>Resend in</span>{secondsLeft == 60 ? "01.00" : `00: ${String(secondsLeft).padStart(2, "0")}`}
                                    </div>
                            }
                        </div>

                        <div className={styles.securityBadgeRow}>
                            <div className={styles.securityBadgeIcon}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" ><circle cx="12" cy="12" r="9"></circle><polyline points="12 7 12 12 15 14"></polyline>
                                </svg>
                            </div>
                            <span>For your security, this code will expire in 5 minutes.</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={`${styles.submitBtn} ${verificationStatus === 'success' ? styles.submitBtnSuccess : ''}`}
                        onClick={(e) => submitOtp(e)}
                        disabled={loading || verificationStatus === 'success'}
                    >
                        {loading ? <span className={styles.spinner} aria-label="Logging in" /> :
                            verificationStatus === 'success' ?
                                <>
                                    Verified successfully
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </> :
                                <>
                                    Verify Code
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                </>
                        }
                    </button>

                    <div className={styles.divider}>
                        <span>Or need change email</span>
                    </div>

                    <button type="button" className={styles.backRegisterBtn} onClick={() => navigate(-1)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                        </svg>
                        Edit email
                    </button>
                </form>

                <img src={left_transparent_banner} alt="left-transparent" className={styles.leftTransparentBanner} />
            </div>
        </>
    )
}

export default OTPForm;
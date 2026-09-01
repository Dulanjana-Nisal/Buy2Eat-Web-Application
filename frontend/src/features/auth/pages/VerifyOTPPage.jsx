import { useEffect, useState } from 'react';
import styles from './VerifyOTPPage.module.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom'
import mini_leaf from '../../../assets/images/mini_leaf_transparent.webp';
import mini_tomato from '../../../assets/images/tomato-transparent.webp';
import right_banner from '../../../assets/images/customer-register-right-banner.png';
import left_transparent_banner from '../../../assets/images/otp-background.svg';

function VerifyOTPPage() {

    // use states hooks
    const [loading, setLoading] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [secondsLeft, setSecondsLeft] = useState(60);

    // navigation state hooks
    const navigate = useNavigate();
    const location = useLocation();

    // use effect for calculate count down
    useEffect(() => {
        const timer = setInterval(() => {

            const expiresAt = location.state?.expiresAt;
            const nowTime = new Date();

            // convert expireAt in to js Date object
            const expireDate = new Date(expiresAt);

            // calculate created time
            const createdAt = expireDate.setMinutes(expireDate.getMinutes() - 5);
            const createdDate = new Date(createdAt)

            // calculate time difference
            const timeDifference = Math.abs(nowTime.getTime() - createdDate.getTime())

            if(timeDifference < 60000){
                setSecondsLeft((current) => (current > 0 ? Math.trunc((60 - (timeDifference / 1000))) : 0))
            }
            if(timeDifference >= 60000){
                setSecondsLeft(0)
            }

        }, 1000)

        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        // get state data from navigate
        const verificationId = location.state?.verification_id
        console.log(verificationId)
        if (!verificationId) {
            navigate("/register", { replace: true })
        }
    }, [])

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
            <div className={styles.container}>

                {/* background mini transparent images */}
                <img src={mini_leaf} alt="mini_leaf_image" className={styles.mini_leaf_1} />
                <img src={mini_tomato} alt="mini_tomato_image" className={styles.mini_tomato_1} />
                <img src={mini_leaf} alt="mini_leaf_image" className={styles.mini_leaf_2} />
                <img src={mini_tomato} alt="mini_tomato_image" className={styles.mini_tomato_2} />

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
                                            <button type="button" className={styles.resendButton}>
                                                <span>Resend </span>
                                            </button>
                                            :
                                            <div type="button" className={styles.resendButton}>
                                                <span className={styles.disableResend}>Resend in</span> 00:{String(secondsLeft).padStart(2, '0')}
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

                            <button type="submit" className={styles.submitBtn}>
                                {loading ? <span className={styles.spinner} aria-label="Logging in" /> :
                                    <>
                                        Verify Code
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                    </>
                                }
                            </button>

                            <div className={styles.divider}>
                                <span>Or need change email</span>
                            </div>

                            <button type="submit" className={styles.backRegisterBtn}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                                </svg>
                                Edit email
                            </button>
                        </form>

                        <img src={left_transparent_banner} alt="left-transparent" className={styles.leftTransparentBanner} />
                    </div>

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

export default VerifyOTPPage;
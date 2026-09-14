import styles from './ResetPasswordSuccessPage.module.css';
import transparentBackground from '../../../../assets/images/forgot-password-success.svg';
import UIbackground from '../../components/UIBackground/UIbackground';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

function ResetPasswordSuccessPage() {

    // navigation hooks
    const location = useLocation();
    const navigate = useNavigate();

    // check if user is successfully send reset link
    if (!location.state?.fromResetPassword) {
        return <Navigate to='/login' replace />;
    }

    return (
        <>
            <div className={styles.container}>

                {/* Background UI */}
                <UIbackground />

                {/* Card Container */}
                <div className={styles.card}>
                    <div className={styles.iconWrapper}>
                        {/* Success Checkmark with Rays SVG */}
                        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {/* Rays */}
                            <path d="M29.5 41L23.5 41" stroke="#4ADE80" strokeWidth="2.5" strokeLinecap="round" />
                            <path d="M96.5 41L90.5 41" stroke="#4ADE80" strokeWidth="2.5" strokeLinecap="round" />
                            <path d="M36 21.5L31.5 17" stroke="#4ADE80" strokeWidth="2.5" strokeLinecap="round" />
                            <path d="M84 21.5L88.5 17" stroke="#4ADE80" strokeWidth="2.5" strokeLinecap="round" />
                            <path d="M31.5 65L36 60.5" stroke="#4ADE80" strokeWidth="2.5" strokeLinecap="round" />
                            <path d="M88.5 65L84 60.5" stroke="#4ADE80" strokeWidth="2.5" strokeLinecap="round" />

                            {/* Light Green Halo */}
                            <circle cx="60" cy="41" r="32" fill="#F0FDF4" />

                            {/* Main Green Circle */}
                            <circle cx="60" cy="41" r="22" fill="#22C55E" />

                            {/* White Checkmark */}
                            <path d="M52 41.5L57 46.5L68 35.5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>

                    <h2 className={styles.title}>Password Reset Successfully!</h2>

                    <p className={styles.description}>
                        Your password has been reset successfully! You can now log in to your account using your new password. Please make sure to keep your password secure and do not share it with anyone.
                    </p>

                    <button className={styles.primaryButton} type='button' onClick={() => navigate('/login')}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        Back to Login
                    </button>
                    <img src={transparentBackground} alt="" className={styles.transparentBackground} />
                </div>
            </div>
        </>
    )
}

export default ResetPasswordSuccessPage;
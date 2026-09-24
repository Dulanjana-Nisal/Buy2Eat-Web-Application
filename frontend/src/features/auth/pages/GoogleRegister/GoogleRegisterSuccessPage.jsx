import styles from './GoogleRegisterSuccessPage.module.css';
import transparentBackground from '../../../../assets/images/forgot-password-success.svg';
import UIbackground from '../../components/UIBackground/UIbackground';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

/** Renders the reset confirmation for users arriving from a successful reset. */
function GoogleRegisterSuccessPage() {

    // use state hooks
    const [role,setRole] = useState('user');

    // navigation hooks
    const location = useLocation();
    const navigate = useNavigate();

    // check if user is successfully send reset link
    if (!location.state?.isRegistered) {
        return <Navigate to='/login' replace />;
    }

    // check role in registered user
    if(location.state?.role){
        setRole(location.state.role);
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

                    <h2 className={styles.title}>Registration successfully!</h2>
                    <p className={styles.description}>
                        Your registration completed. you can now return to your dashboard to continue working, or use your credentials to log back in anytime. Please keep your login details secure.
                    </p>

                    <button className={styles.primaryButton} type='button' onClick={() => navigate(role === 'seller' ? '/dashboard' : "/")}>
                        {
                            role === 'seller' 
                            ?
                            "Go to Dashboard"
                            :
                            "Go to Marketplace"
                        }
                    </button>
                    <img src={transparentBackground} alt="" className={styles.transparentBackground} />
                </div>
            </div>
        </>
    )
}

export default GoogleRegisterSuccessPage;

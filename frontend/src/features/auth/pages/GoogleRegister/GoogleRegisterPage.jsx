import styles from './GoogleRegisterPage.module.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import GoogleRegisterForm from '../../components/GoogleRegisterForm/GoogleRegisterForm';
import Background from '../../../../shared/components/ui/Background';

function GoogleRegister() {

    // Navigation hooks
    const navigate = useNavigate();
    const location = useLocation();

    // use effect get state data from navigate
    useEffect(() => {
        const register_token = location.state?.register_token;

        if (!register_token) {
            navigate("/login", { replace: true });
        }
    }, [location.state?.register_token, navigate]);

    return (
        <>
            <div className={styles.container}>

                {/* background mini transparent images */}
                <Background />

                {/* Main Form Card */}
                <div className={styles.mainCard}>

                    {/* Left Side: Form */}
                    <GoogleRegisterForm
                        navigate={navigate}
                        location={location}
                    />

                </div>

            </div>
        </>
    )
}

export default GoogleRegister;
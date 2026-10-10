import styles from './ForgotPasswordPage.module.css';
import ForgotPasswordForm from '../../components/ForgotPasswordForm/ForgotPasswordForm';
import Background from '../../../../shared/components/ui/Background';

/** Manages password-reset requests and the resend cooldown. */
function ForgotPassword() {

    return (
        <>
            <div className={styles.container}>

                {/* background mini transparent images */}
                <Background />

                {/* Main Form Card */}
                <div className={styles.mainCard}>

                    {/* Form */}
                    <ForgotPasswordForm />
                </div>

            </div>
        </>
    )
}

export default ForgotPassword;

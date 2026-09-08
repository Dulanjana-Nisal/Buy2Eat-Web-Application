import { useLocation, useNavigate } from 'react-router-dom';
import styles from './ForgotPasswordSuccessPage.module.css';

function ForgotPasswordSuccessPage(){

    // navigation hooks
    const navigate = useNavigate();
    const location = useLocation();

    // check if user is successfully send reset link
    if(location.state?.formForgotPassword !== true){
        navigate("/forgot-password", {replace: true})
    }

    return (
        <>
            <h1 className={styles.container}>Forgot Password Success!</h1>
        </>
    )
}

export default ForgotPasswordSuccessPage;
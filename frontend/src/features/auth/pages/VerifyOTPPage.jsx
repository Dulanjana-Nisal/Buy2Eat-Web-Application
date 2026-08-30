import { useEffect } from 'react';
import Styles from './VerifyOTPPage.module.css';
import { useNavigate, useLocation } from 'react-router-dom';

function VerifyOTPPage() {

    // navigation state hooks
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // get state data from navigate
        const verificationId = location.state?.verification_id
        console.log(verificationId)
        if(!verificationId){
            navigate("/register", { replace: true })
        }
    }, [])

    return(
        <>
            <h1>Verify OTP page</h1>
        </>
    )
}

export default VerifyOTPPage;
import { Routes, Route } from 'react-router-dom';
import LoginPage from '../../features/auth/pages/Login/LoginPage';
import RegisterPage from '../../features/auth/pages/Register/RegisterPage';
import GoogleRegister from '../../features/auth/pages/GoogleRegister/GoogleRegisterPage';
import CustomerRegister from '../../features/auth/pages/CustomerRegister/CustomerRegisterPage';
import SellerRegisterPage from '../../features/auth/pages/SellerRegister/SellerRegisterPage';
import VerifyOTPPage from '../../features/auth/pages/VerifyOTP/VerifyOTPPage';
import ForgotPassword from '../../features/auth/pages/ForgotPassword/ForgotPasswordPage';
import GoogleRegisterSuccessPage from '../../features/auth/pages/GoogleRegister/GoogleRegisterSuccessPage';
import ForgotPasswordSuccessPage from '../../features/auth/pages/ForgotPassword/ForgotPasswordSuccessPage';
import ResetPasswordSuccessPage from '../../features/auth/pages/ResetPassword/ResetPasswordSuccessPage';
import ResetPasswordPage from '../../features/auth/pages/ResetPassword/ResetPasswordPage';
import PublicRoute from './PublicRoute';

function AuthRouters() {
    return (
        <Routes>

            {/* Inside PublicRouter */}
            <Route element={<PublicRoute />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/register/customer" element={<CustomerRegister />} />
                <Route path="/register/seller" element={<SellerRegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
            </Route>
            {/* ------------------- */}

            <Route path="/google-register" element={<GoogleRegister />} />
            <Route path="/verify-otp" element={<VerifyOTPPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/register/success" element={<GoogleRegisterSuccessPage />} />
            <Route path="/forgot-password/success" element={<ForgotPasswordSuccessPage />} />
            <Route path="/reset-password/success" element={<ResetPasswordSuccessPage />} />
        </Routes>
    )
}

export default AuthRouters;
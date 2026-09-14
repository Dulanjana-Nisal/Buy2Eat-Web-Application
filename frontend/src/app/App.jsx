import { BrowserRouter, Route, Routes } from 'react-router-dom'
import CustomerRegister from '../features/auth/pages/CustomerRegister/CustomerRegisterPage';
import LoginPage from '../features/auth/pages/Login/LoginPage';
import RegisterPage from '../features/auth/pages/Register/RegisterPage';
import VerifyOTPPage from '../features/auth/pages/VerifyOTP/VerifyOTPPage';
import ForgotPassword from '../features/auth/pages/ForgotPassword/ForgotPasswordPage';
import ForgotPasswordSuccessPage from '../features/auth/pages/ForgotPassword/ForgotPasswordSuccessPage';
import ResetPassword from '../features/auth/pages/ResetPassword/ResetPasswordPage';
import ResetPasswordSuccessPage from '../features/auth/pages/ResetPassword/ResetPasswordSuccessPage';

/** Renders the application router and its authentication routes. */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register/customer" element={<CustomerRegister />} />
        <Route path="/register/seller" element={<CustomerRegister />} />
        <Route path="/verify-otp" element={<VerifyOTPPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/forgot-password/success" element={<ForgotPasswordSuccessPage />} />
        <Route path="/reset-password/success" element={<ResetPasswordSuccessPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import CustomerRegister from '../features/auth/pages/CustomerRegister/CustomerRegisterPage';
import LoginPage from '../features/auth/pages/Login/LoginPage';
import RegisterPage from '../features/auth/pages/Register/RegisterPage';
import VerifyOTPPage from '../features/auth/pages/VerifyOTP/VerifyOTPPage';
import ForgotPassword from '../features/auth/pages/ForgotPassword/ForgotPasswordPage';
import ForgotPasswordSuccessPage from '../features/auth/pages/ForgotPassword/ForgotPasswordSuccessPage';
import ResetPassword from '../features/auth/pages/ResetPassword/ResetPasswordPage';
import ResetPasswordSuccessPage from '../features/auth/pages/ResetPassword/ResetPasswordSuccessPage';
import SellerRegisterPage from '../features/auth/pages/SellerRegister/SellerRegisterPage';
import GoogleRegister from '../features/auth/pages/GoogleRegister/GoogleRegisterPage';
import GoogleRegisterSuccessPage from '../features/auth/pages/GoogleRegister/GoogleRegisterSuccessPage';

/** Renders the application router and its authentication routes. */
function App() {
  return (
    <BrowserRouter>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/google-register" element={<GoogleRegister />} />
          <Route path="/register/customer" element={<CustomerRegister />} />
          <Route path="/register/seller" element={<SellerRegisterPage />} />
          <Route path="/verify-otp" element={<VerifyOTPPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/google-register/success" element={<GoogleRegisterSuccessPage />} />
          <Route path="/forgot-password/success" element={<ForgotPasswordSuccessPage />} />
          <Route path="/reset-password/success" element={<ResetPasswordSuccessPage />} />
        </Routes>
      </GoogleOAuthProvider>
    </BrowserRouter>
  )
}

export default App

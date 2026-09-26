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

export const AuthRouters = [
    {
        path: '/login',
        element: <LoginPage />,
        guard: 'public'
    },
    {
        path: '/register',
        element: <RegisterPage />,
        guard: 'public'
    },
    {
        path: '/register/customer',
        element: <CustomerRegister />,
        guard: 'public'
    },
    {
        path: '/register/seller',
        element: <SellerRegisterPage />,
        guard: 'public'
    },
    {
        path: '/forgot-password',
        element: <ForgotPassword />,
        guard: 'public'
    },
    {
        path: '/google-register',
        element: <GoogleRegister />
    },
    {
        path: '/verify-otp',
        element: <VerifyOTPPage />
    },
    {
        path: '/reset-password/:token',
        element: <ResetPasswordPage />
    },
    {
        path: '/register/success',
        element: <GoogleRegisterSuccessPage />
    },
    {
        path: '/forgot-password/success',
        element: <ForgotPasswordSuccessPage />
    },
    {
        path: '/reset-password/success',
        element: <ResetPasswordSuccessPage />
    },
]   

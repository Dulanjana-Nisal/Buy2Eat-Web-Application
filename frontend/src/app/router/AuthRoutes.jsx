import {
    LoginPage,
    RegisterPage,
    GoogleRegister,
    CustomerRegister,
    SellerRegisterPage,
    VerifyOTPPage,
    ForgotPassword,
    GoogleRegisterSuccessPage,
    ForgotPasswordSuccessPage,
    ResetPasswordSuccessPage,
    ResetPasswordPage,
} from '../../features/auth';

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

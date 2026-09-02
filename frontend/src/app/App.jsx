import CustomerRegister from '../features/auth/pages/CustomerRegisterPage';
import LoginPage from '../features/auth/pages/LoginPage';
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import RegisterPage from '../features/auth/pages/RegisterPage';
import VerifyOTPPage from '../features/auth/pages/VerifyOTPPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register/customer" element={<CustomerRegister />} />
        <Route path="/register/seller" element={<CustomerRegister />} />
        <Route path="/verify-otp" element={<VerifyOTPPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

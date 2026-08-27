import CustomerRegister from '../features/auth/pages/CustomerRegisterPage';
import LoginPage from '../features/auth/pages/LoginPage';
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import RegisterPage from '../features/auth/pages/RegisterPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register/customer" element={<CustomerRegister />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

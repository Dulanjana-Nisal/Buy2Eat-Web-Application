import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import AuthRouter from './router/AuthRoutes';

/** Renders the application router and its authentication routes. */
function App() {
  return (
    <BrowserRouter>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <Routes>
          <Route path="/*" element={<AuthRouter />} />
        </Routes>
      </GoogleOAuthProvider>
    </BrowserRouter>
  )
}

export default App

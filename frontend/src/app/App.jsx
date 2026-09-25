import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import AuthRouter from './router/AuthRoutes';
import AuthProvider from './providers/AuthProvider';

/** Renders the application router and its authentication routes. */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
          <AuthRouter />
        </GoogleOAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

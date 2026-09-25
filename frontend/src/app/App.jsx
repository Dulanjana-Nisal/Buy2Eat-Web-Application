import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import AuthRouter from './router/AuthRoutes';

/** Renders the application router and its authentication routes. */
function App() {
  return (
    <BrowserRouter>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <AuthRouter />
      </GoogleOAuthProvider>
    </BrowserRouter>
  )
}

export default App

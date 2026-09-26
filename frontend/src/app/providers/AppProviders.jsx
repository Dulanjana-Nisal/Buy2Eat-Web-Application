import { GoogleOAuthProvider } from "@react-oauth/google";
import AuthProvider from "./AuthProvider";
import SocketProvider from "./SocketProvider";
import ThemeProvider from "./ThemeProvider";


function AppProvider({ children }){
    return(
        <SocketProvider>
            <ThemeProvider>
                <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
                    <AuthProvider>
                        { children }
                    </AuthProvider>
                </GoogleOAuthProvider>
            </ThemeProvider>
        </SocketProvider>
    )
}

export default AppProvider;
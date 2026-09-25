import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export default function AuthProvider({ children }){

    // use state hook
    const [user,setUser] = useState(localStorage.getItem('user') || null);

    return(
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export const UseAuth = () => {
    return useContext(AuthContext);
}
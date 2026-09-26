import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export default function AuthProvider({ children }){

    // use state hook
    const [user,setUser] = useState(null);

    // use useEffect
    useEffect(() => {
        const addUserData = () => {
            // add localstorage user data to user
            const userData = localStorage.getItem('user') || null
            setUser(userData ? JSON.parse(userData) : null)
        }

        addUserData();
    }, [])

    return(
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export const UseAuth = () => {
    return useContext(AuthContext);
}
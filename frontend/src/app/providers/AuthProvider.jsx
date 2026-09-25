import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export default function AuthProvider({ children }){

    const [example,setExample] = useState('some example value')

    return(
        <AuthContext.Provider value={{ example, setExample }}>
            {children}
        </AuthContext.Provider>
    )
}

export const UseAuth = () => {
    return useContext(AuthContext);
}
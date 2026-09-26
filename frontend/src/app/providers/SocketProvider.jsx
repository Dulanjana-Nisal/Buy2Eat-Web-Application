import { createContext, useContext } from "react";

const SocketContext = createContext();

export default function SocketProvider({ children }){
    
    const exampleValue='Example Value';

    return(
        <SocketContext.Provider value={{exampleValue}}>
            { children }
        </SocketContext.Provider>
    )
}

export const UseSocket = () => {
    return useContext(SocketContext);
}
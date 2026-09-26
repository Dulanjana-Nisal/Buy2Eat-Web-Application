import { createContext, useContext } from "react";

const SocketContext = createContext();

export default function SocketProvider({ children }){
    
    const exampleValue='Example Value';

    return(
        <SocketContext.Provider values={{exampleValue}}>
            { children }
        </SocketContext.Provider>
    )
}

export const UseApp = () => {
    return useContext(SocketContext)
}
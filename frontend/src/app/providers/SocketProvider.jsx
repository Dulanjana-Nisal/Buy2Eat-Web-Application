import { createContext, useContext } from "react";

const SocketContext = createContext

export default function SocketProvider({ children }){
    
    const exampleValue='Example Value';

    return(
        <SocketContext.provider values={{exampleValue}}>
            { children }
        </SocketContext.provider>
    )
}

export const UseApp = () => {
    return useContext(SocketContext)
}
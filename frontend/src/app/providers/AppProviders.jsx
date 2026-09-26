import { createContext, useContext } from "react";

const AppContext = createContext

export default function AppProvider({ children }){
    
    const exampleValue='Example Value';

    return(
        <AppContext.provider values={{exampleValue}}>
            { children }
        </AppContext.provider>
    )
}

export const UseApp = () => {
    return useContext(AppContext)
}
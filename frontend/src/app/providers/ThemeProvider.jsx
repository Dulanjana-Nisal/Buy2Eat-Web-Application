import { createContext, useContext } from "react";

const ThemeContext = createContext

export default function ThemeProvider({ children }){
    
    const exampleValue='Example Value';

    return(
        <ThemeContext.provider values={{exampleValue}}>
            { children }
        </ThemeContext.provider>
    )
}

export const UseApp = () => {
    return useContext(ThemeContext)
}
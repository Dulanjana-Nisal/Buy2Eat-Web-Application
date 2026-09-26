import { createContext, useContext } from "react";

const ThemeContext = createContext();

export default function ThemeProvider({ children }){
    
    const exampleValue='Example Value';

    return(
        <ThemeContext.Provider values={{exampleValue}}>
            { children }
        </ThemeContext.Provider>
    )
}

export const UseApp = () => {
    return useContext(ThemeContext)
}
import { createContext, useContext } from "react";

const ThemeContext = createContext();

export default function ThemeProvider({ children }){
    
    const exampleValue='Example Value';

    return(
        <ThemeContext.Provider value={{exampleValue}}>
            { children }
        </ThemeContext.Provider>
    )
}

export const UseTheme = () => {
    return useContext(ThemeContext)
}
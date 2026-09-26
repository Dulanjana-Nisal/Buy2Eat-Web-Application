import { Navigate } from "react-router-dom";
import { UseAuth } from "../providers/AuthProvider";

function PublicRoute({ children }){
    
    // use UseAuth context for validate route
    const { user } = UseAuth();

    if (user){
        return <Navigate to='/' replace />
    }
    
    return children
}

export default PublicRoute;
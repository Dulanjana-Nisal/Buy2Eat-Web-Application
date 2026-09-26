import { Navigate, Outlet } from "react-router-dom";
import { UseAuth } from "../providers/AuthProvider";

function PublicRoute(){
    // use UseAuth context for validate route
    const { user } = UseAuth();

    if (user){
        return <Navigate to='/' replace />
    }
    
    return <Outlet />
}

export default PublicRoute;
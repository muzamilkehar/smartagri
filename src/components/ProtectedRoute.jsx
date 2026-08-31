import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";   

// Protects any routes that require login

const ProtectedRoute = ({children, adminOnly = false}) => {
    const {isLoggedIn, isAdmin} = useAuth();

    // Not logged in + go to sign in
    if(!isLoggedIn) {
        return <Navigate to="/signin" replace />;
    }

    // Admin only page but user is not admin-> go to dashboard
    if(adminOnly && !isAdmin) {
        return <Navigate to="/dashboard" replace/>;
    }
    return children;
};

export default ProtectedRoute;
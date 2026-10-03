import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";   

// Protects any routes that require login

const ProtectedRoute = ({children, adminOnly = false}) => {
    const {isLoggedIn, isAdmin, authLoading} = useAuth();

    // Still checking for an existing session (e.g. right after a page
    // refresh) — wait instead of redirecting, or a valid session would
    // briefly bounce the user to /signin before it's confirmed.
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            </div>
        );
    }

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
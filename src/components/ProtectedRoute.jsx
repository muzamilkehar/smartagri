import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, adminOnly = false, farmerOnly = false }) => {
    const { isLoggedIn, isAdmin, isFarmer, authLoading } = useAuth();

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (!isLoggedIn) return <Navigate to="/signin" replace />;
    if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;
    if (farmerOnly && !isFarmer) return <Navigate to="/dashboard" replace />;

    return children;
};

export default ProtectedRoute;
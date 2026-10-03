import { createContext, useContext, useEffect, useState } from "react";
import { loginUser, registerUser, loginWithGoogle, getCurrentUser, logoutUser } from "../services/authAPI";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    // On app load, try to restore a session from the backend's httpOnly
    // auth cookie (mock mode just resolves immediately with no user).
    useEffect(() => {
        (async () => {
            const result = await getCurrentUser();
            if (result.success) setCurrentUser(result.user);
            setAuthLoading(false);
        })();
    }, []);

    const login = async (email, password) => {
        const result = await loginUser(email, password);
        if (result.success) setCurrentUser(result.user);
        return result;
    };

    const register = async (formData) => {
        const result = await registerUser(formData);
        if (result.success) setCurrentUser(result.user);
        return result;
    };

    const loginGoogle = async (googleProfile) => {
        const result = await loginWithGoogle(googleProfile);
        if (result.success) setCurrentUser(result.user);
        return result;
    };

    const logout = async () => {
        await logoutUser();
        setCurrentUser(null);
    };

    const isAdmin = currentUser?.role === "admin";
    const isUser = currentUser?.role === "user";
    const isLoggedIn = !!currentUser;

    return (
        <AuthContext.Provider value={{
            currentUser, authLoading, login, register, loginGoogle, logout, isAdmin, isUser, isLoggedIn
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
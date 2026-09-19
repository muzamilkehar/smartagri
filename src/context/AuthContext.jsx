import { createContext, useContext, useState } from "react";
import { loginUser, registerUser, loginWithGoogle } from "../services/authAPI";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);

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

    const logout = () => setCurrentUser(null);

    const isAdmin = currentUser?.role === "admin";
    const isUser = currentUser?.role === "user";
    const isLoggedIn = !!currentUser;

    return (
        <AuthContext.Provider value={{ currentUser, login, register, loginGoogle, logout, isAdmin, isUser, isLoggedIn }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
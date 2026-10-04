import { createContext, useContext, useEffect, useState } from "react";
import { loginUser, registerUser, loginWithGoogle, getCurrentUser, logoutUser } from "../services/authAPI";
import { updateFarmerCity, updateFarmerPhoto, removeFarmerPhoto } from "../services/farmerAPI";
import { updateAdminAccount, updateAdminPhoto, removeAdminPhoto } from "../services/adminAPI";
import { toastInfo } from "../utils/toast";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

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

    const updateProfile = async (city) => {
        const result = await updateFarmerCity(city);
        if (result.success) setCurrentUser((prev) => ({ ...prev, ...result.user }));
        return result;
    };

    const updateAdmin = async (payload) => {
        const result = await updateAdminAccount(payload);
        if (result.success) setCurrentUser((prev) => ({ ...prev, ...result.user }));
        return result;
    };

    const updatePhoto = async (blobOrFile) => {
        const result = currentUser?.role === "admin"
            ? await updateAdminPhoto(blobOrFile)
            : await updateFarmerPhoto(blobOrFile);
        if (result.success) setCurrentUser((prev) => ({ ...prev, ...result.user }));
        return result;
    };

    const removePhoto = async () => {
        const result = currentUser?.role === "admin"
            ? await removeAdminPhoto()
            : await removeFarmerPhoto();
        if (result.success) setCurrentUser((prev) => ({ ...prev, photoURL: null }));
        return result;
    };

    /* Re-fetch current user — used after email verification to sync isEmailVerified */
    const refreshUser = async () => {
        const result = await getCurrentUser();
        if (result.success) {
            setCurrentUser(result.user);
            return { success: true, user: result.user };
        }
        return { success: false };
    };

    const logout = async () => {
        await logoutUser();
        setCurrentUser(null);
        toastInfo("You've been signed out.");
    };

    const isAdmin = currentUser?.role === "admin";
    const isFarmer = currentUser?.role === "farmer";
    const isUser = isFarmer;
    const isLoggedIn = !!currentUser;

    return (
        <AuthContext.Provider value={{
            currentUser,
            authLoading,
            login,
            register,
            loginGoogle,
            logout,
            updateProfile,
            updateAdmin,
            updatePhoto,
            removePhoto,
            refreshUser,
            isAdmin,
            isFarmer,
            isUser,
            isLoggedIn
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
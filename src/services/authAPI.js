import { apiClient, markRefreshAlive } from "./apiClient";
import { readErrorMessage } from "./apiError";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const USE_MOCK = !BASE_URL; // no backend URL set -> fall back to mock data

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const ROLE_HINT_KEY = "kisanai_role_hint";
const setRoleHint = (role) => localStorage.setItem(ROLE_HINT_KEY, role);
const clearRoleHint = () => localStorage.removeItem(ROLE_HINT_KEY);

/**
 * Backend sends roles as "ADMIN" / "FARMER" (also possibly "USER" historically).
 * Frontend uses lowercase: "admin" / "farmer".
 * Anything that isn't admin is treated as farmer.
 */
const normalizeRole = (rawRole) => {
    const r = String(rawRole || "").toUpperCase();
    return r === "ADMIN" ? "admin" : "farmer";
};

const normalizeUser = (apiUser) => ({
    id: apiUser.id,
    fullName: apiUser.fullName,
    email: apiUser.email,
    role: normalizeRole(apiUser.role),
    username: apiUser.username || "",
    phoneNumber: apiUser.phoneNumber || "",
    isEmailVerified: !!apiUser.isEmailVerified,
    photoURL: apiUser.profileImageUrl || null,
    city: apiUser.farmer?.city || ""
});

// ---- mock/demo accounts, used only while USE_MOCK is true ----
let mockUsers = [
    { id: 1, email: "admin@smartagri.com", password: "Admin@123", role: "admin",  fullName: "Admin User" },
    { id: 2, email: "user@smartagri.com",  password: "User@123",  role: "farmer", fullName: "Muzamil Kehar" }
];

const toSafeUser = (user) => {
    const { password: _, ...safeUser } = user;
    return safeUser;
};

export const loginUser = async (email, password) => {
    if (USE_MOCK) {
        await delay(600);
        const found = mockUsers.find((u) => u.email === email && u.password === password);
        if (!found) return { success: false, error: "Invalid email or password." };
        return { success: true, user: toSafeUser(found), token: "mock-token" };
    }

    try {
        const res = await apiClient.post("/auth/signin", { email, password });
        const user = normalizeUser(res.data.user);
        setRoleHint(user.role);
        markRefreshAlive();
        return { success: true, user, token: res.data.accessToken };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not reach the server. Please try again.") };
    }
};

export const registerUser = async ({ fullName, email, password }) => {
    if (USE_MOCK) {
        await delay(600);
        const emailTaken = mockUsers.some((u) => u.email.toLowerCase() === email.toLowerCase());
        if (emailTaken) return { success: false, error: "An account with this email already exists." };

        const newUser = { id: mockUsers.length + 1, fullName, email, password, role: "farmer" };
        mockUsers.push(newUser);

        return { success: true, user: toSafeUser(newUser), token: "mock-token" };
    }

    try {
        const res = await apiClient.post("/auth/signup", { fullName, email, password });
        const user = normalizeUser(res.data.user);
        setRoleHint(user.role);
        markRefreshAlive();

        // If the backend doesn't set the access cookie on signup, ask for
        // one now so the very next dashboard call is authenticated.
        if (!res.data.accessToken) {
            await apiClient.post("/auth/refresh").catch(() => {});
        }

        return { success: true, user, token: res.data.accessToken };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not reach the server. Please try again.") };
    }
};

export const loginWithGoogle = async ({ credential, fullName, email, photoURL }) => {
    if (USE_MOCK) {
        await delay(400);
        let user = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (!user) {
            user = { id: mockUsers.length + 1, fullName, email, password: null, role: "farmer", photoURL };
            mockUsers.push(user);
        }
        const safeUser = toSafeUser(user);
        return { success: true, user: { ...safeUser, photoURL: safeUser.photoURL || photoURL }, token: "mock-token" };
    }

    try {
        const res = await apiClient.post("/auth/google", { idToken: credential });
        const user = normalizeUser(res.data.user);
        setRoleHint(user.role);
        markRefreshAlive();
        return { success: true, user, token: res.data.accessToken };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Google sign-in failed. Please try again.") };
    }
};

export const getCurrentUser = async () => {
    if (USE_MOCK) return { success: false };

    const roleHint = localStorage.getItem(ROLE_HINT_KEY);
    if (!roleHint) return { success: false };

    try {
        // roleHint is normalized to "admin" | "farmer"
        const endpoint = roleHint === "admin" ? "/admin/account" : "/farmer/account";
        const res = await apiClient.get(endpoint);
        markRefreshAlive();
        return { success: true, user: normalizeUser(res.data.data) };
    } catch {
        clearRoleHint();
        return { success: false };
    }
};

export const logoutUser = async () => {
    clearRoleHint();
    sessionStorage.removeItem("kisanai_refresh_dead");
    if (USE_MOCK) return;

    try {
        await apiClient.post("/auth/logout");
    } catch {
        // Already logged out / token already invalid — nothing more to do
    }
};

export const forgotPassword = async (email) => {
    if (USE_MOCK) {
        await delay(600);
        return { success: true, message: "If an account exists, a password reset email has been sent." };
    }

    try {
        const res = await apiClient.post("/auth/forget-password", { email });
        // resetLink only exists because real email sending isn't wired up yet —
        // useful for testing now, drop it once your backend actually sends email.
        return { success: true, message: res.data.message, resetLink: res.data.resetLink };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not send reset link. Please try again.") };
    }
};

export const resetPassword = async (token, password) => {
    if (USE_MOCK) {
        await delay(600);
        return { success: true };
    }

    try {
        await apiClient.post("/auth/reset-password", { token, password });
        return { success: true };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not reset your password. The link may have expired.") };
    }
};

export const changePassword = async (currentPassword, newPassword) => {
    if (USE_MOCK) return { success: true };

    try {
        await apiClient.patch("/auth/change-password", { currentPassword, newPassword });
        return { success: true };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not change password.") };
    }
};
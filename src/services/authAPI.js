// src/services/authAPI.js
//
// ── REAL BACKEND CONTRACT (KisanAI, deployed) ─────────────────────────────
// Base URL: import.meta.env.VITE_API_BASE_URL
//
// POST /auth/signup   body: { fullName, email, password }
//   -> 201 { success: true, user: {...}, accessToken }
//   -> 409 { success: false, message: "User already exist with this email." }
//   -> 400 { errors: { field: [msg] } }
//
// POST /auth/signin   body: { email, password }
//   -> 200 { success: true, user: {...}, accessToken }
//   -> 401 { success: false, message: "Email or Password is invalid!" }
//
// POST /auth/google   body: { idToken }
//   -> 200 { success: true, user: {...}, accessToken }
//
// POST /auth/logout     (authenticated) -> revokes refresh token, clears cookies
// GET  /farmer/account  (FARMER only)   -> { success, data: {...} }
// GET  /admin/account   (ADMIN only)    -> { success, data: {...} }
//
// Auth is cookie-based (access_token / refresh_token, httpOnly) — apiClient
// sends them automatically via withCredentials, and auto-refreshes an
// expired access token, retrying the request once.
// ───────────────────────────────────────────────────────────────────────

import { apiClient } from "./apiClient";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const USE_MOCK = !BASE_URL; // no backend URL set -> fall back to mock data

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const ROLE_HINT_KEY = "kisanai_role_hint";
const setRoleHint = (role) => localStorage.setItem(ROLE_HINT_KEY, role);
const clearRoleHint = () => localStorage.removeItem(ROLE_HINT_KEY);

// The rest of the app only ever sees this shape, whether the data came
// from the real backend or the mock — role is lowercased to match the
// "admin" / "user" checks already used throughout the dashboard.
const normalizeUser = (apiUser) => ({
    id: apiUser.id,
    fullName: apiUser.fullName,
    email: apiUser.email,
    role: apiUser.role === "ADMIN" ? "admin" : "user",
    photoURL: apiUser.profileImageUrl || null
});

const readErrorMessage = (error) => {
    const data = error.response?.data;
    const firstFieldError = data?.errors && Object.values(data.errors)[0]?.[0];
    return data?.message || firstFieldError || "Could not reach the server. Please try again.";
};

// ---- mock/demo accounts, used only while USE_MOCK is true ----
let mockUsers = [
    { id: 1, email: "admin@smartagri.com", password: "Admin@123", role: "admin", fullName: "Admin User" },
    { id: 2, email: "user@smartagri.com",  password: "User@123",  role: "user",  fullName: "Muzamil Kehar" }
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
        return { success: true, user, token: res.data.accessToken };
    } catch (error) {
        return { success: false, error: readErrorMessage(error) };
    }
};

export const registerUser = async ({ fullName, email, password }) => {
    if (USE_MOCK) {
        await delay(600);
        const emailTaken = mockUsers.some((u) => u.email.toLowerCase() === email.toLowerCase());
        if (emailTaken) return { success: false, error: "An account with this email already exists." };

        const newUser = { id: mockUsers.length + 1, fullName, email, password, role: "user" };
        mockUsers.push(newUser);

        return { success: true, user: toSafeUser(newUser), token: "mock-token" };
    }

    try {
        const res = await apiClient.post("/auth/signup", { fullName, email, password });
        const user = normalizeUser(res.data.user);
        setRoleHint(user.role);
        return { success: true, user, token: res.data.accessToken };
    } catch (error) {
        return { success: false, error: readErrorMessage(error) };
    }
};

export const loginWithGoogle = async ({ credential, fullName, email, photoURL }) => {
    if (USE_MOCK) {
        await delay(400);
        let user = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (!user) {
            user = { id: mockUsers.length + 1, fullName, email, password: null, role: "user", photoURL };
            mockUsers.push(user);
        }
        const safeUser = toSafeUser(user);
        return { success: true, user: { ...safeUser, photoURL: safeUser.photoURL || photoURL }, token: "mock-token" };
    }

    try {
        const res = await apiClient.post("/auth/google", { idToken: credential });
        const user = normalizeUser(res.data.user);
        setRoleHint(user.role);
        return { success: true, user, token: res.data.accessToken };
    } catch (error) {
        return { success: false, error: readErrorMessage(error) };
    }
};

// Restores a session after a page refresh. The tokens live in httpOnly
// cookies we can't read from JS — the role hint just tells us which
// "who am I" endpoint to call; the cookie (sent automatically by
// apiClient) is what actually authenticates the request.
export const getCurrentUser = async () => {
    if (USE_MOCK) return { success: false };

    const roleHint = localStorage.getItem(ROLE_HINT_KEY);
    if (!roleHint) return { success: false };

    try {
        const endpoint = roleHint === "admin" ? "/admin/account" : "/farmer/account";
        const res = await apiClient.get(endpoint);
        return { success: true, user: normalizeUser(res.data.data) };
    } catch {
        clearRoleHint();
        return { success: false };
    }
};

export const logoutUser = async () => {
    clearRoleHint();
    if (USE_MOCK) return;

    try {
        await apiClient.post("/auth/logout");
    } catch {
        // Already logged out / token already invalid — nothing more to do
    }
};
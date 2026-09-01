// src/services/authAPI.js
//
// ── API CONTRACT — share this with your backend dev ──────────────────────
// POST {BASE_URL}/auth/login     body: { email, password }
//   -> { success: true, user: { id, fullName, email, role, photoURL }, token }
//   -> { success: false, error: "Invalid email or password" }
//
// POST {BASE_URL}/auth/register  body: { fullName, email, password }
//   -> { success: true, user: { id, fullName, email, role, photoURL }, token }
//   -> { success: false, error: "Email already exists" }
//
// POST {BASE_URL}/auth/google    body: { credential }  (the raw Google ID token — nothing else)
//   -> { success: true, user: { id, fullName, email, role, photoURL }, token }
//   -> { success: false, error: "Google sign-in failed" }
//
// ⚠️ Security note for whoever builds /auth/google: verify `credential`
// server-side with Google (e.g. google-auth-library, or Google's tokeninfo
// endpoint) before trusting the name/email inside it. Never trust a
// client-decoded JWT payload for real authentication.
// ───────────────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const USE_MOCK = !BASE_URL; // no backend URL set yet -> fall back to mock data

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Strips the password before a user object leaves this file
const toSafeUser = (user) => {
    const { password: _, ...safeUser } = user;
    return safeUser;
};

// ---- mock/demo accounts, used only while USE_MOCK is true ----
let mockUsers = [
    { id: 1, email: "admin@smartagri.com", password: "Admin@123", role: "admin", fullName: "Admin User" },
    { id: 2, email: "user@smartagri.com",  password: "User@123",  role: "user",  fullName: "Muzamil Kehar" }
];

export const loginUser = async (email, password) => {
    if (USE_MOCK) {
        await delay(600); // simulate network latency
        const found = mockUsers.find((u) => u.email === email && u.password === password);
        if (!found) return { success: false, error: "Invalid email or password." };
        return { success: true, user: toSafeUser(found), token: "mock-token" };
    }

    try {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        return await res.json();
    } catch (error) {
        console.error("Login API error:", error);
        return { success: false, error: "Could not reach the server. Please try again." };
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
        const res = await fetch(`${BASE_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fullName, email, password })
        });
        return await res.json();
    } catch (error) {
        console.error("Register API error:", error);
        return { success: false, error: "Could not reach the server. Please try again." };
    }
};

export const loginWithGoogle = async ({ credential, fullName, email, photoURL }) => {
    if (USE_MOCK) {
        await delay(400);

        // Find-or-create: if this email already has an account (even a
        // password one), just log into it. Otherwise create a new one.
        let user = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (!user) {
            user = { id: mockUsers.length + 1, fullName, email, password: null, role: "user", photoURL };
            mockUsers.push(user);
        }

        const safeUser = toSafeUser(user);
        return { success: true, user: { ...safeUser, photoURL: safeUser.photoURL || photoURL }, token: "mock-token" };
    }

    try {
        const res = await fetch(`${BASE_URL}/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ credential }) // only the token — see note above
        });
        return await res.json();
    } catch (error) {
        console.error("Google login API error:", error);
        return { success: false, error: "Could not reach the server. Please try again." };
    }
};
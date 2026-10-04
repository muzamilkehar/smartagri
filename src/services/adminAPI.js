import { apiClient } from "./apiClient";
import { readErrorMessage } from "./apiError";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const USE_MOCK = !BASE_URL;

const normalizeAdminAccount = (apiUser) => ({
    id: apiUser.id,
    fullName: apiUser.fullName,
    username: apiUser.username || "",
    email: apiUser.email,
    phoneNumber: apiUser.phoneNumber || "",
    photoURL: apiUser.profileImageUrl || null,
    role: "admin",
    isEmailVerified: !!apiUser.isEmailVerified
});

/* GET /admin/account */
export const getAdminAccount = async () => {
    if (USE_MOCK) return { success: false };
    try {
        const res = await apiClient.get("/admin/account");
        return { success: true, user: normalizeAdminAccount(res.data.data) };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not load admin account.") };
    }
};

/* PATCH /admin/update — fullName, username, phoneNumber, profileImage */
export const updateAdminAccount = async ({ fullName, username, phoneNumber, profileImage }) => {
    if (USE_MOCK) return { success: true, user: {} };

    const formData = new FormData();
    if (fullName) formData.append("fullName", fullName);
    if (username) formData.append("username", username);
    if (phoneNumber) formData.append("phoneNumber", phoneNumber);
    if (profileImage) formData.append("profileImage", profileImage);

    try {
        const res = await apiClient.patch("/admin/update", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return { success: true, user: normalizeAdminAccount(res.data.data) };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not update admin account.") };
    }
};

/* PATCH /admin/profile-image — just the photo */
export const updateAdminPhoto = async (blobOrFile) => {
    if (USE_MOCK) {
        const url = URL.createObjectURL(blobOrFile);
        return { success: true, user: { photoURL: url } };
    }

    const formData = new FormData();
    formData.append("profileImage", blobOrFile, "profile.jpg");

    try {
        const res = await apiClient.patch("/admin/profile-image", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        // Response: { success, message, data: { id, profileImageUrl, profileImagePublicId } }
        return { success: true, user: { photoURL: res.data.data.profileImageUrl } };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not update profile image.") };
    }
};

/* DELETE /admin/profile-image */
export const removeAdminPhoto = async () => {
    if (USE_MOCK) return { success: true, user: { photoURL: null } };
    try {
        await apiClient.delete("/admin/profile-image");
        return { success: true, user: { photoURL: null } };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not remove profile image.") };
    }
};
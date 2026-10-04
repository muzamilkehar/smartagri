import { apiClient } from "./apiClient";
import { readErrorMessage } from "./apiError";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const USE_MOCK = !BASE_URL;

const PHOTO_FIELD = "profileImage";

const normalizeFarmerAccount = (apiUser) => ({
    fullName: apiUser.fullName,
    email: apiUser.email,
    photoURL: apiUser.profileImageUrl || null,
    city: apiUser.farmer?.city || "",
    province: apiUser.farmer?.province || "",
    district: apiUser.farmer?.district || "",
    village: apiUser.farmer?.village || "",
    preferredLanguage: apiUser.farmer?.preferredLanguage || "en"
});

/* PATCH /farmer/account — city (used by Profile page) */
export const updateFarmerCity = async (city) => {
    if (USE_MOCK) return { success: true, user: { city } };

    const formData = new FormData();
    formData.append("city", city);

    try {
        const res = await apiClient.patch("/farmer/account", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return { success: true, user: normalizeFarmerAccount(res.data.data) };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not update your city. Please try again.") };
    }
};

/* PATCH /farmer/account — profileImage */
export const updateFarmerPhoto = async (blobOrFile) => {
    if (USE_MOCK) {
        const url = URL.createObjectURL(blobOrFile);
        return { success: true, user: { photoURL: url } };
    }

    const formData = new FormData();
    formData.append(PHOTO_FIELD, blobOrFile, "profile.jpg");

    try {
        const res = await apiClient.patch("/farmer/account", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return { success: true, user: normalizeFarmerAccount(res.data.data) };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not save your photo. Please try again.") };
    }
};

/* DELETE /farmer/account/profile-image */
export const removeFarmerPhoto = async () => {
    if (USE_MOCK) return { success: true, user: { photoURL: null } };
    try {
        await apiClient.delete("/farmer/account/profile-image");
        return { success: true, user: { photoURL: null } };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not remove your photo.") };
    }
};
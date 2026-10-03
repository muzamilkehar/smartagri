// src/services/farmerAPI.js
//
// Confirmed against the KisanAI Postman collection:
// PATCH /farmer/account (multipart/form-data, all fields optional)
//   -> { success, message, data: { ...full updated account, including nested farmer: {city, province, ...} } }
// Returns the full profile directly, so no follow-up GET is needed.

import { apiClient } from "./apiClient";
import { readErrorMessage } from "./apiError";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const USE_MOCK = !BASE_URL;

const normalizeFarmerAccount = (apiUser) => ({
    fullName: apiUser.fullName,
    email: apiUser.email,
    photoURL: apiUser.profileImageUrl || null,
    city: apiUser.farmer?.city || ""
});

export const updateFarmerCity = async (city) => {
    if (USE_MOCK) {
        return { success: true, user: { city } };
    }

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
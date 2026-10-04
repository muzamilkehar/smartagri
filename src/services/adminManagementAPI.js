import { apiClient } from "./apiClient";
import { readErrorMessage } from "./apiError";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const USE_MOCK = !BASE_URL;

/* GET /admin/management/farmers */
export const getAllFarmers = async () => {
    if (USE_MOCK) return { success: true, farmers: [] };
    try {
        const res = await apiClient.get("/admin/management/farmers");
        return { success: true, farmers: res.data.data || [], count: res.data.count };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not load farmers."), farmers: [] };
    }
};

/* GET /admin/management/:id */
export const getFarmerDetails = async (farmerId) => {
    if (USE_MOCK) return { success: false, error: "Not available in demo mode." };
    try {
        const res = await apiClient.get(`/admin/management/${farmerId}`);
        return { success: true, farmer: res.data.data };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not load farmer details.") };
    }
};

/* DELETE /admin/management/:id */
export const deleteFarmer = async (farmerId) => {
    if (USE_MOCK) return { success: true };
    try {
        await apiClient.delete(`/admin/management/${farmerId}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not delete farmer.") };
    }
};

/* GET /admin/management/system-settings */
export const getSystemSettings = async () => {
    if (USE_MOCK) return { success: true, settings: [] };
    try {
        const res = await apiClient.get("/admin/management/system-settings");
        return { success: true, settings: res.data.settings || [] };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not load system settings."), settings: [] };
    }
};

/* PUT /admin/management/system-settings/single — single upsert */
export const upsertSystemSetting = async (setting) => {
    if (USE_MOCK) {
        return { success: true, setting: { ...setting, id: "mock", updatedAt: new Date().toISOString(), createdAt: new Date().toISOString() } };
    }
    try {
        const res = await apiClient.put("/admin/management/system-settings/single", setting);
        return { success: true, setting: res.data.setting };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not save setting.") };
    }
};

/* PUT /admin/management/system-settings — bulk upsert */
export const upsertManySystemSettings = async (settings) => {
    if (USE_MOCK) return { success: true, settings };
    try {
        const res = await apiClient.put("/admin/management/system-settings", { settings });
        return { success: true, settings: res.data.settings };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not save settings.") };
    }
};

/* DELETE /admin/management/settings/:key */
export const deleteSystemSetting = async (key) => {
    if (USE_MOCK) return { success: true };
    try {
        await apiClient.delete(`/admin/management/settings/${key}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not delete setting.") };
    }
};
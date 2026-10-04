import { apiClient } from "./apiClient";
import { readErrorMessage } from "./apiError";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const USE_MOCK = !BASE_URL;

/* Generic GET that unwraps response.data.data */
const get = async (path, fallback = null) => {
    if (USE_MOCK) return { success: true, data: fallback };
    try {
        const res = await apiClient.get(path);
        return { success: true, data: res.data.data };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not load analytics.") };
    }
};

export const getAdminDashboard        = () => get("/admin/analytics/dashboard", null);
export const getAdminOverview         = () => get("/admin/analytics/overview", null);
export const getUserAnalytics         = () => get("/admin/analytics/users", null);
export const getFarmerAnalytics       = () => get("/admin/analytics/farmers", null);
export const getFieldAnalyticsAdmin   = () => get("/admin/analytics/fields", null);
export const getCropAnalyticsAdmin    = () => get("/admin/analytics/crops", null);
export const getDiseaseAnalyticsAdmin = () => get("/admin/analytics/diseases", null);
export const getYieldAnalyticsAdmin   = () => get("/admin/analytics/yield", null);
export const getSoilAnalyticsAdmin    = () => get("/admin/analytics/soil", null);
export const getWeatherAnalyticsAdmin = () => get("/admin/analytics/weather", null);
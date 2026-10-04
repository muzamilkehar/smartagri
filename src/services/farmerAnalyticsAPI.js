import { apiClient } from "./apiClient";
import { readErrorMessage } from "./apiError";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const USE_MOCK = !BASE_URL;

const MOCK_DASHBOARD = {
    statistics: {
        fields: 0,
        crops: { total: 0, active: 0, planned: 0, harvested: 0, failed: 0 },
        predictions: { disease: 0, yield: 0 }
    },
    recent: { fields: [], crops: [], diseasePredictions: [], yieldPredictions: [] }
};

export const getFarmerDashboard = async () => {
    if (USE_MOCK) return { success: true, data: MOCK_DASHBOARD };

    try {
        const res = await apiClient.get("/farmer/analytics/dashboard");
        return { success: true, data: res.data.data };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not load your dashboard.") };
    }
};

export const getCropAnalytics = async () => {
    if (USE_MOCK) return { success: true, data: null };
    try {
        const res = await apiClient.get("/farmer/analytics/crops");
        return { success: true, data: res.data.data };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not load crop analytics.") };
    }
};

export const getYieldAnalytics = async () => {
    if (USE_MOCK) return { success: true, data: null };
    try {
        const res = await apiClient.get("/farmer/analytics/yield");
        return { success: true, data: res.data.data };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not load yield analytics.") };
    }
};

export const getFieldAnalytics = async () => {
    if (USE_MOCK) return { success: true, data: null };
    try {
        const res = await apiClient.get("/farmer/analytics/fields");
        return { success: true, data: res.data.data };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not load field analytics.") };
    }
};

export const getSoilAnalytics = async () => {
    if (USE_MOCK) return { success: true, data: null };
    try {
        const res = await apiClient.get("/farmer/analytics/soil");
        return { success: true, data: res.data.data };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not load soil analytics.") };
    }
};
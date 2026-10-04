import { apiClient } from "./apiClient";
import { readErrorMessage } from "./apiError";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const USE_MOCK = !BASE_URL;

const MOCK_YIELD = 5.8;

export const predictYieldSaved = async (cropId, usage) => {
    if (USE_MOCK) {
        return {
            success: true,
            prediction: {
                id: "mock",
                predictedYield: MOCK_YIELD,
                yieldUnit: "tons",
                predictionDate: new Date().toISOString(),
                inputData: usage
            },
            weather: { temperature: 28, humidity: 55, rainfall: 2, windSpeed: 6 }
        };
    }

    try {
        const res = await apiClient.post("/yield/predict", { cropId, ...usage });
        return { success: true, prediction: res.data.data.prediction, weather: res.data.data.weather };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not predict yield.") };
    }
};

export const predictYieldStandalone = async (features) => {
    if (USE_MOCK) {
        return { success: true, prediction: MOCK_YIELD };
    }

    try {
        const res = await apiClient.post("/predict/yield", features);
        return { success: true, prediction: res.data.data.prediction };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not predict yield.") };
    }
};

export const getYieldHistory = async (page = 1, limit = 10) => {
    if (USE_MOCK) return { success: true, predictions: [] };

    try {
        const res = await apiClient.get(`/yield?page=${page}&limit=${limit}`);
        return { success: true, predictions: res.data.data || [], pagination: res.data.pagination };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not load yield history."), predictions: [] };
    }
};

export const deleteYieldPrediction = async (id) => {
    if (USE_MOCK) return { success: true };

    try {
        await apiClient.delete(`/yield/${id}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not delete prediction.") };
    }
};
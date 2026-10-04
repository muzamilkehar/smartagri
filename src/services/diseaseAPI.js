import { apiClient } from "./apiClient";
import { readErrorMessage } from "./apiError";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const USE_MOCK = !BASE_URL;

const MOCK_PREDICTION = {
    diseaseName: "wheat_mite",
    confidence: 92.4,
    treatment: {
        treatment: ["This is a demo result — connect VITE_API_BASE_URL to get real predictions."],
        prevention: ["This is a demo result — connect VITE_API_BASE_URL to get real predictions."]
    }
};

export const predictDiseaseSaved = async (image, cropId, model) => {
    if (USE_MOCK) {
        return { success: true, prediction: { ...MOCK_PREDICTION, id: "mock", predictionDate: new Date().toISOString() } };
    }

    const formData = new FormData();
    formData.append("image", image);
    formData.append("cropId", cropId);
    if (model) formData.append("model", model);

    try {
        const res = await apiClient.post("/disease/predict", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return { success: true, prediction: res.data.data };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not analyze image.") };
    }
};

export const predictDiseaseQuick = async (image) => {
    if (USE_MOCK) {
        return { success: true, prediction: { model: "demo", prediction: MOCK_PREDICTION.diseaseName, confidence: MOCK_PREDICTION.confidence } };
    }

    const formData = new FormData();
    formData.append("image", image);

    try {
        const res = await apiClient.post("/predict/disease", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return { success: true, prediction: res.data.prediction };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not analyze image.") };
    }
};

export const getDiseaseHistory = async (page = 1, limit = 10) => {
    if (USE_MOCK) return { success: true, predictions: [] };

    try {
        const res = await apiClient.get(`/disease?page=${page}&limit=${limit}`);
        return { success: true, predictions: res.data.data || [], pagination: res.data.pagination };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not load prediction history."), predictions: [] };
    }
};

export const deleteDiseasePrediction = async (id) => {
    if (USE_MOCK) return { success: true };

    try {
        await apiClient.delete(`/disease/${id}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not delete prediction.") };
    }
};
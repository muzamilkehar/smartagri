import { apiClient } from "./apiClient";
import { readErrorMessage } from "./apiError";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const USE_MOCK = !BASE_URL;

const MOCK_SAVED = {
    id: "mock",
    diseaseName: "wheat_mite",
    confidence: 90.51,
    imageUrl: "https://res.cloudinary.com/dv16dtrcz/image/upload/v1790427730/kisanai/disease/wheat_mite/demo.jpg",
    treatment: {
        treatment: [
            "Confirm the pest before applying treatment.",
            "Monitor mite populations and crop damage regularly.",
            "Use an appropriate locally recommended pest-control product when treatment is justified."
        ],
        prevention: [
            "Monitor the crop regularly for mite populations.",
            "Inspect plants regularly for early signs of mite damage.",
            "Maintain proper crop management and plant health."
        ]
    },
    predictionDate: new Date().toISOString()
};

const MOCK_QUICK = {
    model: "EfficientNet-B0",
    prediction: "wheat_aphid",
    confidence: 60.42
};

/* ---------------------------------------------------------------
   POST /disease/predict  — save prediction
   Falls back to POST /predict/disease on 5xx server errors.
   --------------------------------------------------------------- */
export const predictDiseaseSaved = async (image, cropId, model) => {
    if (USE_MOCK) {
        return { success: true, prediction: MOCK_SAVED, saved: true };
    }

    const formData = new FormData();
    formData.append("image", image);
    formData.append("cropId", cropId);
    if (model) formData.append("model", model);

    try {
        const res = await apiClient.post("/disease/predict", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return { success: true, prediction: res.data.data, saved: true };
    } catch (saveError) {
        const status = saveError.response?.status;

        // 5xx → backend bug. Fall back to the quick endpoint so user still gets a result.
        if (status >= 500) {
            console.warn("[diseaseAPI] /disease/predict failed with", status, "— falling back to /predict/disease.");
            try {
                const fallbackFd = new FormData();
                fallbackFd.append("image", image);
                const res = await apiClient.post("/predict/disease", fallbackFd, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                return {
                    success: true,
                    prediction: res.data.prediction,
                    saved: false,
                    fallback: true
                };
            } catch (fallbackError) {
                return {
                    success: false,
                    error: readErrorMessage(fallbackError, "Could not analyze image.")
                };
            }
        }

        // 4xx → real validation/auth error, do NOT fall back.
        return {
            success: false,
            error: readErrorMessage(saveError, "Could not analyze image.")
        };
    }
};


export const predictDiseaseQuick = async (image) => {
    if (USE_MOCK) {
        return { success: true, prediction: MOCK_QUICK };
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


export const getDiseaseById = async (id) => {
    if (USE_MOCK) return { success: false, error: "Not available in demo mode." };
    try {
        const res = await apiClient.get(`/disease/${id}`);
        return { success: true, prediction: res.data.data };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not load prediction.") };
    }
};


export const getDiseaseHistory = async (page = 1, limit = 10) => {
    if (USE_MOCK) return { success: true, predictions: [], pagination: null };
    try {
        const res = await apiClient.get(`/disease?page=${page}&limit=${limit}`);
        return {
            success: true,
            predictions: res.data.data || [],
            pagination: res.data.pagination,
            count: res.data.count
        };
    } catch (error) {
        return {
            success: false,
            error: readErrorMessage(error, "Could not load prediction history."),
            predictions: []
        };
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


export const deleteAllDiseasePredictions = async () => {
    if (USE_MOCK) return { success: true, deletedCount: 0 };
    try {
        const res = await apiClient.delete(`/disease/all`);
        return { success: true, deletedCount: res.data.deletedCount };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not delete all predictions.") };
    }
};
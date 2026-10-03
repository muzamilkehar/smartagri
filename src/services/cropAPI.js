// src/services/cropAPI.js
//
// Confirmed against the KisanAI Postman collection:
//
// POST   /crops/field/{fieldId}     -> { success, message, crop: {...} }
// GET    /crops/field/{fieldId}     -> { success, message, crops: [...], pagination: {...} }
// GET    /crops/{cropId}            -> { success, message, crop: {..., field: {...}} }
// PATCH  /crops/{cropId}            -> { success, message, crop: {...} }
// DELETE /crops/{cropId}            -> { success, message }
// DELETE /crops/field/{fieldId}/all -> { success, message, deletedCount }

import { apiClient } from "./apiClient";
import { readErrorMessage } from "./apiError";

export const addCrop = async (fieldId, crop) => {
    try {
        const res = await apiClient.post(`/crops/field/${fieldId}`, crop);
        return { success: true, crop: res.data.crop };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not add crop.") };
    }
};

export const getCropsForField = async (fieldId) => {
    try {
        const res = await apiClient.get(`/crops/field/${fieldId}`);
        return { success: true, crops: res.data.crops || [], pagination: res.data.pagination };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not load crops."), crops: [] };
    }
};

export const updateCrop = async (cropId, updates) => {
    try {
        const res = await apiClient.patch(`/crops/${cropId}`, updates);
        return { success: true, crop: res.data.crop };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not update crop.") };
    }
};

export const deleteCrop = async (cropId) => {
    try {
        await apiClient.delete(`/crops/${cropId}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not delete crop.") };
    }
};
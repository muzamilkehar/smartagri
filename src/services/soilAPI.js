import { apiClient } from "./apiClient";
import { readErrorMessage } from "./apiError";

export const addSoilData = async (fieldId, reading) => {
    try {
        const res = await apiClient.post(`/soil-data/field/${fieldId}`, reading);
        return { success: true, soilData: res.data.soilData };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not add soil reading.") };
    }
};

export const getSoilDataForField = async (fieldId) => {
    try {
        const res = await apiClient.get(`/soil-data/field/${fieldId}`);
        return { success: true, soilData: res.data.soilData || [], pagination: res.data.pagination };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not load soil data."), soilData: [] };
    }
};

export const getSoilDataById = async (id) => {
    try {
        const res = await apiClient.get(`/soil-data/${id}`);
        return { success: true, soilData: res.data.soilData };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not load soil reading.") };
    }
};

export const updateSoilData = async (soilDataId, updates) => {
    try {
        const res = await apiClient.patch(`/soil-data/${soilDataId}`, updates);
        return { success: true, soilData: res.data.soilData };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not update soil reading.") };
    }
};

export const deleteSoilData = async (soilDataId) => {
    try {
        await apiClient.delete(`/soil-data/${soilDataId}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not delete soil reading.") };
    }
};

export const deleteAllSoilDataForField = async (fieldId) => {
    try {
        const res = await apiClient.delete(`/soil-data/field/${fieldId}/all`);
        return { success: true, deletedCount: res.data.deletedCount };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not delete all soil data.") };
    }
};

/* IoT endpoint — updates only soil moisture for the latest reading */
export const updateSoilMoistureIoT = async (fieldId, soilMoisture) => {
    try {
        const res = await apiClient.patch(`/soil-data/${fieldId}/soil-moisture`, { soilMoisture });
        return { success: true, soilData: res.data.soilData };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not update soil moisture.") };
    }
};
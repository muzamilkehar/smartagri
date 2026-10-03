import { apiClient } from "./apiClient";
import { readErrorMessage } from "./apiError";

export const addField = async (field) => {
    try {
        const res = await apiClient.post("/field/add-field", field);
        return { success: true, field: res.data.field };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not add field.") };
    }
};

export const getFields = async (page = 1, limit = 10) => {
    try {
        const res = await apiClient.get(`/field/fields?page=${page}&limit=${limit}`);
        return { success: true, fields: res.data.fields || [], pagination: res.data.pagination };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not load your fields."), fields: [] };
    }
};

export const updateField = async (fieldId, updates) => {
    try {
        const res = await apiClient.patch(`/field/${fieldId}`, updates);
        return { success: true, field: res.data.field };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not update field.") };
    }
};

export const deleteField = async (fieldId) => {
    try {
        await apiClient.delete(`/field/${fieldId}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not delete field.") };
    }
};
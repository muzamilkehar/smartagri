import { apiClient } from "./apiClient";
import { readErrorMessage } from "./apiError";

/* GET /iot-devices */
export const getIotDevices = async () => {
    try {
        const res = await apiClient.get("/iot-devices");
        return { success: true, devices: res.data.data || [] };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not load IoT devices."), devices: [] };
    }
};

/* POST /iot-devices/:deviceCode/request-reading */
export const requestIotReading = async (deviceCode) => {
    try {
        const res = await apiClient.post(`/iot-devices/${deviceCode}/request-reading`);
        return { success: true, data: res.data.data };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not fetch reading. Ensure device is online.") };
    }
};

/* PATCH /iot-devices/:deviceCode/assign-field */
export const assignIotToField = async (deviceCode, fieldId) => {
    try {
        const res = await apiClient.patch(`/iot-devices/${deviceCode}/assign-field`, { fieldId });
        return { success: true, data: res.data.data };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not assign device to field.") };
    }
};
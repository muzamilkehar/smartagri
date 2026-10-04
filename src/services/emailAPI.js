import { apiClient } from "./apiClient";
import { readErrorMessage } from "./apiError";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const USE_MOCK = !BASE_URL;

/* POST /email/send-email */
export const sendVerificationEmail = async (email) => {
    if (USE_MOCK) {
        return { success: true, message: "Demo: OTP sent." };
    }

    try {
        const res = await apiClient.post("/email/send-email", { email });
        return { success: true, message: res.data.message };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not send verification code.") };
    }
};

/* POST /email/verify-otp */
export const verifyEmailOtp = async (email, otp) => {
    if (USE_MOCK) {
        return { success: true, message: "Demo: OTP verified." };
    }

    try {
        const res = await apiClient.post("/email/verify-otp", { email, otp: Number(otp) });
        return { success: true, message: res.data.message };
    } catch (error) {
        return { success: false, error: readErrorMessage(error, "Could not verify code.") };
    }
};
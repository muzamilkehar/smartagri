export const readErrorMessage = (error, fallback = "Something went wrong. Please try again.") => {
    // Network error (no response)
    if (!error?.response) {
        console.error("[apiError] Network error:", error?.message || error);
        return "Network error — please check your connection and try again.";
    }

    const { status, data } = error.response;

    // Log full response for debugging
    console.error(`[apiError] ${status}:`, data);

    // 500 with no useful body
    if (status >= 500) {
        return data?.message || fallback || "Server error. Please try again in a moment.";
    }

    // 400/422 validation errors from zod
    const firstFieldError = data?.errors && Object.values(data.errors)[0]?.[0];
    if (firstFieldError) return firstFieldError;

    return data?.message || fallback;
};
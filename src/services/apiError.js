export const readErrorMessage = (error, fallback = "Something went wrong. Please try again.") => {
    const data = error.response?.data;
    const firstFieldError = data?.errors && Object.values(data.errors)[0]?.[0];
    return data?.message || firstFieldError || fallback;
}
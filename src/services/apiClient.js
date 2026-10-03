// src/services/apiClient.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const apiClient = axios.create({
    baseURL: BASE_URL,
    withCredentials: true // sends/receives the access_token & refresh_token cookies
});

// If a request comes back with an expired access token, refresh it once
// via the cookie-based /auth/refresh endpoint, then retry the original
// request. If the refresh also fails, let the error through.
let isRefreshing = false;
let pendingQueue = [];

const resolveQueue = (error) => {
    pendingQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve()));
    pendingQueue = [];
};

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const { config, response } = error;
        const isAuthEndpoint = config?.url?.startsWith("/auth/");

        if (response?.status !== 401 || isAuthEndpoint || config._retried) {
            return Promise.reject(error);
        }

        if (isRefreshing) {
            // Another request already triggered a refresh — wait for it
            return new Promise((resolve, reject) => {
                pendingQueue.push({ resolve, reject });
            }).then(() => apiClient(config));
        }

        config._retried = true;
        isRefreshing = true;

        try {
            await apiClient.post("/auth/refresh");
            isRefreshing = false;
            resolveQueue(null);
            return apiClient(config);
        } catch (refreshError) {
            isRefreshing = false;
            resolveQueue(refreshError);
            return Promise.reject(refreshError);
        }
    }
);
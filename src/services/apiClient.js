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

// Once we know refresh is dead, stop hammering the endpoint on every
// subsequent 401 until the user logs in again.
const REFRESH_DEAD_KEY = "kisanai_refresh_dead";
export const markRefreshAlive = () => sessionStorage.removeItem(REFRESH_DEAD_KEY);
export const markRefreshDead = () => sessionStorage.setItem(REFRESH_DEAD_KEY, "1");
const isRefreshDead = () => sessionStorage.getItem(REFRESH_DEAD_KEY) === "1";

const resolveQueue = (error) => {
    pendingQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve()));
    pendingQueue = [];
};

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const { config, response } = error;
        const isAuthEndpoint = config?.url?.startsWith("/auth/");

        if (
            response?.status !== 401 ||
            isAuthEndpoint ||
            config._retried ||
            isRefreshDead()
        ) {
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
            markRefreshAlive();
            resolveQueue(null);
            return apiClient(config);
        } catch (refreshError) {
            isRefreshing = false;
            markRefreshDead();
            resolveQueue(refreshError);
            return Promise.reject(refreshError);
        }
    }
);
import { apiClient } from "./apiClient";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const USE_MOCK = !BASE_URL;

// Mock fallback — talks to OpenWeatherMap directly so this page still
// works with no backend running.
const MOCK_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const MOCK_BASE_URL = "https://api.openweathermap.org/data/2.5";
const MOCK_CITY = "Shikarpur, PK";

export const getFarmerWeather = async () => {
    if (USE_MOCK) {
        try {
            const res = await fetch(
                `${MOCK_BASE_URL}/weather?q=${MOCK_CITY}&appid=${MOCK_API_KEY}&units=metric`
            );
            if (!res.ok) throw new Error("Weather fetch failed");
            const data = await res.json();

            return {
                success: true,
                weather: {
                    city: data.name,
                    temperature: data.main?.temp,
                    humidity: data.main?.humidity,
                    windSpeed: Math.round((data.wind?.speed || 0) * 3.6),
                    weather: data.weather?.[0]?.description || "—",
                    rainProbability: 0,
                    fiveDayRainfall: 0
                }
            };
        } catch (error) {
            console.error("Mock weather error:", error);
            return { success: false, error: "Could not load weather right now." };
        }
    }

    try {
        const res = await apiClient.get("/weather");
        return { success: true, weather: res.data.weather };
    } catch (error) {
        const message = error.response?.data?.message || "Could not load weather right now.";
        const needsCity = message.toLowerCase().includes("city");
        return { success: false, error: message, needsCity };
    }
};
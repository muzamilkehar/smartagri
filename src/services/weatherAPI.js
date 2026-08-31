const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5";

export const getWeatherByCity = async (city = "Shikarpur, PK") => {
    try{
        const response = await fetch(
            `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`
        );

        if(!response.ok) throw new Error("Weather fetch failed");
        return await response.json();
    }
    catch (error) {
        console.error("Weather API Error:", error);
        return null;
    }
};


// Get 5 day forecast
export const getForecastByCity = async (city = "Shikarpur,PK") => {
    try {
        const response = await fetch(
            `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`
        );
        if(!response.ok) throw new Error("Forecast fetch failed");
        return await response.json();
    }
    catch (error){
        console.error("Forecast API error:", error);
        return null;
    }
};


// Get weather by coordinates
export const getWeatherByCoord = async (lat, lon) => {
    try {
        const response = await fetch(
            `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        if (!response.ok) throw new Error("Weather fetch failed");
        return await response.json();
    }
    catch (error) {
        console.error("Weather API error:", error);
        return null;
    }
};
import { useState, useEffect } from "react";
import { MdWbSunny, MdCloud, MdWater, MdAir,MdLocationOn, MdSearch, MdSunny } from "react-icons/md";
import { WiHumidity } from "react-icons/wi";
import {getWeatherByCity, getForecastByCity} from "../services/weatherAPI";

const getWeatherIcon = (code) => {
    if(code >= 200 && code < 300) return <MdCloud className="text-gray-400 text-2xl" />;
    if(code >= 300 && code < 400) return <MdWater className="text-blue-400 text-2xl" />;
    if(code >= 500 && code < 600) return <MdWater className="text-blue-500 text-2xl" />;
    if(code >= 600 && code < 700) return <MdCloud className="text-blue-200 text-2xl" />;
    if(code >= 800 && code < 801) return <MdWbSunny className="text-yellow-500 text-2xl" />;

    return <MdCloud className="text-gray-400 text-2xl" />;
};

const getLargeWeatherIcon = (code) => {
    if (code === 800) return <MdWbSunny className="text-8xl text-yellow-300 opacity-80" />;
    return <MdCloud className="text-8xl text-white opacity-80" />
};

const Weather = () => {

    const [weather, setWeather] = useState(null);
    const [forecast, setForecast] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [city, setCity] = useState("Shikarpur, PK");
    const [inputCity, setInputCity] = useState("");

    const fetchWeather = async (cityName) => {
        setLoading(true);
        setError("");
        try {
            const [weatherData, forecastData ] = await Promise.all([
                getWeatherByCity(cityName),
                getForecastByCity(cityName)
            ]);

            if(!weatherData || weatherData.cod === "404") {
                setError("City Not Found. Please try again later.");
                setLoading(false);
                return;
            }

            setWeather(weatherData);

            // Get reading per day from forecast
            if(forecastData?.list) {
                const daily = forecastData.list.filter((_, index) => index % 8 === 0).slice(0, 7);
                setForecast(daily);
            }
        } 
        catch (err) {
            setError("Failed to fetch weather. Check your API key.");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchWeather(city);
    }, [city]);

    const handleSearch = (e) => {
        e.preventDefault();
        if(!inputCity.trim()) return;
        setCity(inputCity.trim());
        fetchWeather(inputCity.trim());
        setInputCity("");
    };

    // Get user location
    const handleLocationClick = () => {
        if (!navigator.geolocation) return;
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const { getWeatherByCoord} = await import("../services/weatherAPI");
                const data = await getWeatherByCoord(latitude, longitude);
                if(data) {
                    setWeather(data);
                    setCity(data.name);
                }
                setLoading(false);
            },
            () => {
                setError("Location access denied.");
                setLoading(false);
            }
        );
    };

    // Loading state
    if(loading) { 
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Weather Forecast</h1>
                <p className="text-gray-500 text-sm mt-1">Fetching real-time weather data...</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) =>(
                    <div key={i} className="bg-gray-100 rounded-2xl h-28 animate-pulse" />
                ))}
            </div>
            <div className="bg-gray-100 rounded-2xl h-48 animate-pulse" />
        </div>
    );
}


return (
    <div className="space-y-6">

        {/* Header + Search */}
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Weather Forecast </h1>
            <p className="text-gray-500 text-sm mt-1">Real-time weather data powered by OpenWeatherMap.</p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <input 
                type="text"
                value={inputCity}
                onChange={(e) => setInputCity(e.target.value)}
                placeholder="Search City..."
                className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm outline-none 
                focus:border-primary-500 focus:ring-2 focus:ring-primary-100 bg-white w-44"
                />
            </div>
            <button
            type="submit"
            className="bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-medium 
            hover:bg-primary-700 transition-colors"
            >
                Search
            </button>
            <button
            type="button"
            onClick={handleLocationClick}
            className="border border-gray-200 text-gray-600 px-3 py-2 rounded-xl hover:bg-gray-50
            transition-colors"
            title="Use my location"
            >
                <MdLocationOn className="text-lg" />
            </button>
            </form>
        </div>

        {/* Error Message */}

        {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
            {error}
        </div>
        )}

        {weather && (
            <>
            {/* Current Weather banner */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-400 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full" />
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-1 mb-1">
                            <MdLocationOn className="text-blue-200 text-sm" />
                            <p className="text-blue-100 text-sm">
                                {weather.name},{weather.sys?.country}
                            </p>
                        </div>
                        <p className="text-6xl font-bold mb-1">
                            {Math.round(weather.main?.temp)}°C
                        </p>
                        <p className="text-blue-100 text-sm capitalize">
                            {weather.weather?.[0]?.description} · Feels Like {Math.round(weather.main?.feels_like)}°C
                        </p>
                    </div>
                    {getLargeWeatherIcon(weather.weather?.[0]?.id)}
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    {
                        label: "Humidity",
                        value: `${weather.main?.humidity}%`,
                        icon:  <MdWater className="text-blue-500 text-xl" />,
                        bg:    "bg-blue-50"
                    },

                    {
                        label: "Wind Speed",
                        value: `${Math.round(weather.wind?.speed * 3.6)} km/h`,
                        icon:  <MdAir className="text-gray-500 text-xl" />,
                        bg:    "bg-gray-50"
                    },

                    {
                        label: "Pressure",
                        value: `${weather.main?.pressure} hPa`,
                        icon:  <MdCloud className="text-cyan-500 text-xl" />,
                        bg:    "bg-cyan-50"
                    },

                    {
                        label: "Visibility",
                        value: `${((weather.visibility || 0) / 1000).toFixed(1)} km`,
                        icon:  <MdWbSunny className="text-yellow-500 text-xl" />,
                        bg:    "bg-yellow-50"
                    }
                ].map((item) => (
                    <div key={item.label} className={`${item.bg} rounded-2xl p-4 border border-white`}>
                        <div className="mb-2">{item.icon}</div>
                        <p className="text-gray-800 font-bold text-lg">{item.value}</p>
                        <p className="text-gray-500 text-xs">{item.label}</p>
                    </div>
                ))}
            </div>

            {/* 7 Days Forecast */}
            {forecast.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="text-gray-800 font-bold text-base mb-4">5-Day Forecast</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                        {forecast.map((day, i) =>(
                            <div
                            key={i}
                            className="flex flex-col items-center bg-gray-50 rounded-xl p-3 hover:bg-primary-50 transition-colors"
                            >
                                <p className="text-gray-500 text-xs font-medium mb-2">
                                    {new Date(day.dt * 1000).toLocaleDateString("en-US", {weekday: "short"})}
                                </p>
                                {getWeatherIcon(day.weather?.[0]?.id)}
                                <p className="text-gray-500 text-xs mt-1 capitalize">
                                    {day.weather?.[0]?.description?.split(" ")[0]}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Agriculutre Tips based on weather */}
            <div className="bg-primary-50 border border-primary-100 rounded-2xl p-5">
                <h2 className="text-primary-800 font-bold text-base mb-3">
                    🌱 Farming Recommendations
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                        {
                            title: "Temperature",
                            value: `${Math.round(weather.main?.temp)}°C`,
                            tip: weather.main?.temp > 35
                                ? "Too hot — water crops in early morning or evening."
                                : weather.main?.temp < 10
                                ? "Too cold — protect sensitive crops from frost."
                                : "Ideal temperature for most crops."
                        },

                        {
                            title: "Humidity",
                            value: `${weather.main?.humidity}%`,
                            tip: weather.main?.humidity > 80
                                ? "High humidity — watch for fungal diseases."
                                : weather.main?.humidity < 30
                                ? "Low humidity — increase irrigation frequency."
                                : "Good humidity levels for farming.",
                        },

                        {
                            title: "Wind",
                            value: `${Math.round(weather.wind?.speed * 3.6)} km/h`,
                            tip: weather.wind?.speed * 3.6 > 40
                                ? "Strong winds — secure crops and avoid spraying."
                                : "Calm winds — good day for pesticide application.",
                        }
                    ].map((item) => (
                        <div key={item.title} className="bg-white rounded-xl p-4 border border-primary-100">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-primary-700 font-semibold text-sm">{item.title}</p>
                                <p className="text-primary-600 font-bold text-sm">{item.value}</p>
                            </div>
                            <p className="text-gray-600 text-xs leading-relaxed">{item.tip}</p>
                        </div>
                    ))}
                </div>
            </div>
            </>
        )}
    </div>
    );
};

export default Weather;
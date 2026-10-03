import { useEffect, useState } from "react";
import { MdWbSunny, MdCloud, MdWater, MdAir, MdLocationOn, MdGrain } from "react-icons/md";
import { Link } from "react-router-dom";
import { getFarmerWeather } from "../services/weatherAPI";

const getWeatherIcon = (description = "") => {
    const d = description.toLowerCase();
    if (d.includes("rain") || d.includes("drizzle")) return <MdWater className="text-blue-300 text-8xl opacity-80" />;
    if (d.includes("cloud")) return <MdCloud className="text-white text-8xl opacity-80" />;
    if (d.includes("clear") || d.includes("sun")) return <MdWbSunny className="text-yellow-300 text-8xl opacity-80" />;
    return <MdCloud className="text-white text-8xl opacity-80" />;
};

const Weather = () => {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [needsCity, setNeedsCity] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError("");
            setNeedsCity(false);

            const result = await getFarmerWeather();

            if (result.success) {
                setWeather(result.weather);
            } else if (result.needsCity) {
                setNeedsCity(true);
            } else {
                setError(result.error || "Could not load weather right now.");
            }
            setLoading(false);
        };
        load();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Weather Forecast</h1>
                    <p className="text-gray-500 text-sm mt-1">Fetching your farm's weather...</p>
                </div>
                <div className="bg-gray-100 rounded-2xl h-48 animate-pulse" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-gray-100 rounded-2xl h-28 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Weather Forecast</h1>
                <p className="text-gray-500 text-sm mt-1">Live weather for your farm's registered location.</p>
            </div>

            {needsCity && (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3 rounded-xl flex items-center justify-between gap-3">
                    <span>Add your city to your profile to see weather for your farm.</span>
                    <Link to="/dashboard/profile" className="font-semibold underline whitespace-nowrap">
                        Update Profile
                    </Link>
                </div>
            )}

            {error && !needsCity && (
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
                                    <p className="text-blue-100 text-sm">{weather.city}</p>
                                </div>
                                <p className="text-6xl font-bold mb-1">
                                    {Math.round(weather.temperature)}°C
                                </p>
                                <p className="text-blue-100 text-sm capitalize">{weather.weather}</p>
                            </div>
                            {getWeatherIcon(weather.weather)}
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: "Humidity", value: `${weather.humidity}%`, icon: <MdWater className="text-blue-500 text-xl" />, bg: "bg-blue-50" },
                            { label: "Wind Speed", value: `${weather.windSpeed} km/h`, icon: <MdAir className="text-gray-500 text-xl" />, bg: "bg-gray-50" },
                            { label: "Rain Chance", value: `${weather.rainProbability}%`, icon: <MdGrain className="text-cyan-500 text-xl" />, bg: "bg-cyan-50" },
                            { label: "5-Day Rainfall", value: `${weather.fiveDayRainfall} mm`, icon: <MdWbSunny className="text-yellow-500 text-xl" />, bg: "bg-yellow-50" }
                        ].map((item) => (
                            <div key={item.label} className={`${item.bg} rounded-2xl p-4 border border-white`}>
                                <div className="mb-2">{item.icon}</div>
                                <p className="text-gray-800 font-bold text-lg">{item.value}</p>
                                <p className="text-gray-500 text-xs">{item.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Farming Recommendations */}
                    <div className="bg-primary-50 border border-primary-100 rounded-2xl p-5">
                        <h2 className="text-primary-800 font-bold text-base mb-3">🌱 Farming Recommendations</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                                {
                                    title: "Temperature",
                                    value: `${Math.round(weather.temperature)}°C`,
                                    tip: weather.temperature > 35
                                        ? "Too hot — water crops in early morning or evening."
                                        : weather.temperature < 10
                                        ? "Too cold — protect sensitive crops from frost."
                                        : "Ideal temperature for most crops."
                                },
                                {
                                    title: "Humidity",
                                    value: `${weather.humidity}%`,
                                    tip: weather.humidity > 80
                                        ? "High humidity — watch for fungal diseases."
                                        : weather.humidity < 30
                                        ? "Low humidity — increase irrigation frequency."
                                        : "Good humidity levels for farming."
                                },
                                {
                                    title: "Rainfall",
                                    value: `${weather.fiveDayRainfall} mm / 5 days`,
                                    tip: weather.fiveDayRainfall > 20
                                        ? "Heavy rain expected — delay fertilizer and pesticide application."
                                        : weather.fiveDayRainfall === 0
                                        ? "No rain expected — plan irrigation accordingly."
                                        : "Light rain expected — monitor field drainage."
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
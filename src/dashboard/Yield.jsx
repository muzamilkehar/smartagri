import { useState } from "react";
import {GiWheat} from "react-icons/gi";
import {FaSeedling} from "react-icons/fa";
import {MdAnalytics} from "react-icons/md";

const crops = ["Wheat", "Rice", "Maize", "Soybean", "Cotton", "Sugarcane", "Potato", "Tomato"];

const Yield = () => {
    const [formData, setFormData] = useState({
        crop: "",
        area: "",
        rainfall: "",
        temperature: "",
        humidity: "",
    });

    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const e = {};
        if(!formData.crop) e.crop = "Crop is required";
        if(!formData.area) e.area = "Area is required";
        if(!formData.rainfall) e.rainfall = "Rainfall is required";
        if(!formData.temperature) e.temperature = "Temperature is required";
        if(!formData.humidity) e.humidity = "Humidity is required";
        return e;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) =>({...prev, [name]: value}));
        if(errors[name]) setErrors((prev) => ({...prev, [name]: ""}));
    };

    const handlePredict = (e) => {
        e.preventDefault();
        const validateErrors = validate();
        if(Object.keys(validateErrors).length > 0) {
            setErrors(validateErrors);
            return;
        }
        setIsLoading(true);
        setTimeout(() =>{
            setIsLoading(false);
            const baseYield = Math.floor(Math.random() * 3000) + 200;
            setResult({
                yield: `${baseYield} kg`,
                perAcre: `${Math.floor(baseYield / formData.area)} kg/acre`,
                rating: "Good",
                season: "Rabi 2025-26"
            });
        }, 1800)
    };

    const inputClass = (field) =>
        `w-full px-4 py-3 rounded-xl border text-sm text-gray-800 outline-none transition-all duration-200 bg-gray-50
    ${errors[field] ? "border-red-400 focus:ring-2 focus:ring-red-100" : "border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:bg-white"}`;

    return (
        <div className="space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Crop Yield Prediction</h1>
                <p className="text-gray-500 text-sm mt-1">
                    Enter your field data to predict expected crop yield.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Input Form */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="text-gray-800 font-semibold text-base mb-5 flex items-center gap-2">
                        <FaSeedling className="text-gray-600"/>
                        Field Parameters.
                    </h2>

                    <form onSubmit={handlePredict} className="space-y-4">

                        {/* Crop */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Crop Name</label>
                            <select
                            name="crop"
                            value={formData.crop}
                            onChange={handleChange}
                            className={inputClass("crop")}
                            >
                                <option value="">Select Crop</option>
                                {crops.map((c) => <option key={c}>{c}</option>)}
                            </select>
                            {errors.crop && <p className="text-red-500 text-xs mt-1">{errors.crop}</p>}
                        </div>

                        {/* Area */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Area (acres)</label>
                            <input
                            type="number" name="area" value={formData.area} onChange={handleChange}
                            placeholder="e.g 5" className={inputClass("area")}
                            />
                                {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area}</p>}
                        </div>

                        {/* Rainfall */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Rainfall (mm)</label>
                            <input 
                            type="number" name="rainfall" value={formData.rainfall} onChange={handleChange}
                            placeholder="e.g. 200" className={inputClass("rainfall")}
                            />
                            {errors.rainfall && <p className="text-red-500 text-sm mt-1">{errors.rainfall}</p>}
                        </div>

                        {/* Temperature + Humidity*/}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Temp (°C)</label>
                                <input 
                                type="number" name="temperature" value={formData.temperature} onChange={handleChange}
                                placeholder="e.g. 30" className={inputClass("temperature")}
                                />
                                {errors.temperature && <p className="text-red-500 text-xs mt-1">{errors.temperature}</p>}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Humidity (%)</label>
                                <input 
                                type="number" name="humidity" value={formData.humidity} onChange={handleChange}
                                placeholder="e.g. 65" className={inputClass("humidity")}
                                />
                                {errors.humidity && <p className="text-red-500 text-xs mt-1">{errors.humidity}</p>}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-3 rounded-xl font-semibold text-sm text-white flex items-center
                            justify-center gap-2 transition-all duration-300 ${isLoading ? 
                                "bg-primary-400 cursor-not-allowed"
                                :"bg-primary-600  hover:bg-primary-700 hover:shadow-lg"}`}
                        >
                            {isLoading ? (
                                <>
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>    
                                </svg>
                                Predicting...
                                </>
                            ): (
                                <>
                                <MdAnalytics className="text-lg"/>
                                Predict Yield
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Result */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="text-gray-800 font-semibold text-base mb-5 flex items-center gap-2">
                        <GiWheat className="text-amber-500 text-xl"/>
                        Predict Result
                    </h2>

                    {result ? (
                        <div className="space-y-4">
                            {/* Main yield */}
                            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-6 text-center
                            border border-primary-200">
                                <p className="text-primary-600 text-sm font-medium mb-1">Expected Yield</p>
                                <p className="text-4xl font-bold text-primary-700 mb-1">{result.yield}</p>
                                <p className="text-primary-500 text-sm">{result.perAcre}</p>
                            </div>

                            {/* Details */}
                            {[
                                {label: "Crop", value: formData.crop},
                                {label: "Area", value: `${formData.area} acres`},
                                {label: "Yield Rating", value: result.rating},
                                {label: "Season", value: result.season}
                            ].map((item) =>(
                                <div key={item.label} className="flex justify-between items-center py-2 border-b border-gray-50">  
                                <span className="text-gray-500 text-sm">{item.label}</span>
                                <span className="text-gray-800 font-semibold text-sm">{item.value}</span>
                                </div>
                            ))}

                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                                <p className="text-amber-700 text-xs leading-relaxed">
                                    This prediction is based on provided parameters. Actual yield may vary
                                    depending on soil quality, farming practices, and weather conditions.
                                </p>
                            </div>
                        </div>
                    ):(
                        <div className="flex flex-col items-center justify-center h-40 text-center">
                            <GiWheat className="text-5xl text-gray-200 mb-3"/>
                            <p className="text-gray-400 text-sm">
                                Fill in the parameters and click Predict Yield
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    
};


export default Yield;
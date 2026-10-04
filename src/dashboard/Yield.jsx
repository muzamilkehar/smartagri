import { useState, useEffect } from "react";
import { GiWheat } from "react-icons/gi";
import { MdDelete, MdTrendingUp } from "react-icons/md";
import { getFields } from "../services/fieldAPI";
import { getCropsForField } from "../services/cropAPI";
import { predictYieldSaved, predictYieldStandalone, getYieldHistory, deleteYieldPrediction } from "../services/yieldAPI";
import { toastSuccess, toastError } from "../utils/toast";

const REGIONS = ["CENTRAL", "NORTH", "EAST", "WEST", "SOUTH"];
const SOIL_TYPES = ["SANDY", "CLAY", "LOAMY", "SILTY", "PEATY", "CHALKY", "OTHER"];
const IRRIGATION_TYPES = ["RAINFED", "CANAL", "TUBE_WELL", "WELL", "DRIP", "SPRINKLER", "OTHER"];
const SEASONS = ["RABI", "KHARIF", "ZAID"];
const CROP_TYPES = ["WHEAT", "RICE", "MAIZE", "COTTON", "SUGARCANE", "POTATO"];

const selectClass = "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 bg-gray-50 focus:bg-white";
const inputClass = selectClass;
const labelClass = "text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block";

const emptyUsageForm = { Fertilizer_Used: "", Pesticide_Used: "", Sunlight_Hours: "" };

const emptyStandaloneForm = {
    N: "", P: "", K: "", Soil_pH: "", Soil_Moisture: "", Organic_Carbon: "",
    Temperature: "", Humidity: "", Rainfall: "", Sunlight_Hours: "", Wind_Speed: "", Altitude: "",
    Fertilizer_Used: "", Pesticide_Used: "",
    Season: "KHARIF", Soil_Type: "LOAMY", Region: "WEST", Crop_Type: "WHEAT", Irrigation_Type: "CANAL"
};

const Yield = () => {
    const [mode, setMode] = useState("save"); // "save" | "quick"

    const [fields, setFields] = useState([]);
    const [selectedFieldId, setSelectedFieldId] = useState("");
    const [crops, setCrops] = useState([]);
    const [selectedCropId, setSelectedCropId] = useState("");
    const [loadingSetup, setLoadingSetup] = useState(true);

    const [usageForm, setUsageForm] = useState(emptyUsageForm);
    const [standaloneForm, setStandaloneForm] = useState(emptyStandaloneForm);

    const [isPredicting, setIsPredicting] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");

    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    useEffect(() => {
        const init = async () => {
            setLoadingSetup(true);
            const result = await getFields();
            if (result.success) {
                setFields(result.fields);
                if (result.fields.length > 0) setSelectedFieldId(result.fields[0].id);
            }
            setLoadingSetup(false);
        };
        init();
        loadHistory();
    }, []);

    useEffect(() => {
        if (!selectedFieldId) { setCrops([]); setSelectedCropId(""); return; }
        const loadCrops = async () => {
            const result = await getCropsForField(selectedFieldId);
            const list = result.success ? result.crops : [];
            setCrops(list);
            setSelectedCropId(list.length > 0 ? list[0].id : "");
        };
        loadCrops();
    }, [selectedFieldId]);

    const loadHistory = async () => {
        setLoadingHistory(true);
        const result = await getYieldHistory();
        if (result.success) setHistory(result.predictions);
        setLoadingHistory(false);
    };

    const handleUsageChange = (e) => {
        const { name, value } = e.target;
        setUsageForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleStandaloneChange = (e) => {
        const { name, value } = e.target;
        setStandaloneForm((prev) => ({ ...prev, [name]: value }));
    };

    const handlePredictSaved = async (e) => {
        e.preventDefault();
        if (!selectedCropId) {
            setError("Select a field and crop first, or switch to Quick Check.");
            return;
        }
        if (usageForm.Fertilizer_Used === "" || usageForm.Pesticide_Used === "" || usageForm.Sunlight_Hours === "") {
            setError("Fertilizer used, pesticide used, and sunlight hours are all required.");
            return;
        }

        setIsPredicting(true);
        setError("");
        setResult(null);

        const usage = {
            Fertilizer_Used: Number(usageForm.Fertilizer_Used),
            Pesticide_Used: Number(usageForm.Pesticide_Used),
            Sunlight_Hours: Number(usageForm.Sunlight_Hours)
        };

        const response = await predictYieldSaved(selectedCropId, usage);
        setIsPredicting(false);

        if (response.success) {
            setResult({ saved: true, ...response });
            toastSuccess("Prediction saved to your records.");
            loadHistory();
        } else {
            toastError(response.error);
        }
    };

    const handlePredictStandalone = async (e) => {
        e.preventDefault();
        const missing = Object.entries(standaloneForm).find(([, v]) => v === "");
        if (missing) {
            setError(`${missing[0].replace(/_/g, " ")} is required.`);
            return;
        }

        setIsPredicting(true);
        setError("");
        setResult(null);

        const payload = {};
        Object.entries(standaloneForm).forEach(([key, value]) => {
            const isEnum = ["Season", "Soil_Type", "Region", "Crop_Type", "Irrigation_Type"].includes(key);
            payload[key] = isEnum ? value : Number(value);
        });

        const response = await predictYieldStandalone(payload);
        setIsPredicting(false);

        if (response.success) {
            setResult({ saved: false, prediction: response.prediction });
            toastSuccess("Prediction completed.");
        } else {
            toastError(response.error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this prediction?")) return;
        const response = await deleteYieldPrediction(id);
        if (response.success) {
            setHistory((prev) => prev.filter((p) => p.id !== id));
            toastSuccess("Prediction deleted.");
        } else {
            toastError(response.error);
        }
    };

    const predictedValue = result?.saved ? result.prediction?.predictedYield : result?.prediction;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Yield Prediction</h1>
                <p className="text-gray-500 text-sm mt-1">Estimate your expected harvest yield.</p>
            </div>

            <div className="inline-flex bg-gray-100 rounded-xl p-1">
                <button
                onClick={() => { setMode("save"); setResult(null); setError(""); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === "save" ? "bg-white text-primary-700 shadow-sm" : "text-gray-500"}`}
                >
                    Save to My Records
                </button>
                <button
                onClick={() => { setMode("quick"); setResult(null); setError(""); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === "quick" ? "bg-white text-primary-700 shadow-sm" : "text-gray-500"}`}
                >
                    Quick Check
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    {mode === "save" ? (
                        <>
                            <h2 className="text-gray-800 font-semibold text-base mb-1">From Your Field Data</h2>
                            <p className="text-gray-400 text-xs mb-4">
                                Soil, crop, field, and weather details are pulled automatically from your records — just tell us about usage this season.
                            </p>

                            {loadingSetup ? (
                                <p className="text-gray-400 text-xs">Loading your fields...</p>
                            ) : fields.length === 0 ? (
                                <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs px-3 py-2.5 rounded-xl">
                                    Add a field and crop first to use this, or switch to Quick Check.
                                </div>
                            ) : (
                                <form onSubmit={handlePredictSaved} className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className={labelClass}>Field</label>
                                            <select value={selectedFieldId} onChange={(e) => setSelectedFieldId(e.target.value)} className={selectClass}>
                                                {fields.map((f) => <option key={f.id} value={f.id}>{f.name || "Unnamed Field"}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Crop</label>
                                            <select value={selectedCropId} onChange={(e) => setSelectedCropId(e.target.value)} className={selectClass} disabled={crops.length === 0}>
                                                {crops.length === 0
                                                    ? <option value="">No crops in this field</option>
                                                    : crops.map((c) => <option key={c.id} value={c.id}>{c.cropName} ({c.season})</option>)
                                                }
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className={labelClass}>Fertilizer (kg)</label>
                                            <input type="number" step="0.1" min="0" name="Fertilizer_Used" value={usageForm.Fertilizer_Used} onChange={handleUsageChange} className={inputClass} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Pesticide (L)</label>
                                            <input type="number" step="0.1" min="0" name="Pesticide_Used" value={usageForm.Pesticide_Used} onChange={handleUsageChange} className={inputClass} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Sunlight (hrs/day)</label>
                                            <input type="number" step="0.1" min="0" max="24" name="Sunlight_Hours" value={usageForm.Sunlight_Hours} onChange={handleUsageChange} className={inputClass} />
                                        </div>
                                    </div>

                                    {error && <p className="text-red-500 text-xs">{error}</p>}

                                    <button
                                    type="submit"
                                    disabled={isPredicting || !selectedCropId}
                                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors text-white flex items-center justify-center gap-2
                                        ${isPredicting || !selectedCropId ? "bg-gray-300 cursor-not-allowed" : "bg-primary-600 hover:bg-primary-700"}`}
                                    >
                                        <MdTrendingUp className="text-lg" />
                                        {isPredicting ? "Predicting..." : "Predict Yield"}
                                    </button>
                                </form>
                            )}
                        </>
                    ) : (
                        <>
                            <h2 className="text-gray-800 font-semibold text-base mb-1">Full Manual Input</h2>
                            <p className="text-gray-400 text-xs mb-4">
                                No field or crop needed — enter every value yourself. Nothing is saved.
                            </p>

                            <form onSubmit={handlePredictStandalone} className="space-y-4">
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 mb-2">Soil</p>
                                    <div className="grid grid-cols-3 gap-3 mb-3">
                                        <div><label className={labelClass}>N</label><input type="number" step="0.01" name="N" value={standaloneForm.N} onChange={handleStandaloneChange} className={inputClass} /></div>
                                        <div><label className={labelClass}>P</label><input type="number" step="0.01" name="P" value={standaloneForm.P} onChange={handleStandaloneChange} className={inputClass} /></div>
                                        <div><label className={labelClass}>K</label><input type="number" step="0.01" name="K" value={standaloneForm.K} onChange={handleStandaloneChange} className={inputClass} /></div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div><label className={labelClass}>Soil pH</label><input type="number" step="0.1" name="Soil_pH" value={standaloneForm.Soil_pH} onChange={handleStandaloneChange} className={inputClass} /></div>
                                        <div><label className={labelClass}>Moisture %</label><input type="number" step="0.1" name="Soil_Moisture" value={standaloneForm.Soil_Moisture} onChange={handleStandaloneChange} className={inputClass} /></div>
                                        <div><label className={labelClass}>Org. Carbon</label><input type="number" step="0.01" name="Organic_Carbon" value={standaloneForm.Organic_Carbon} onChange={handleStandaloneChange} className={inputClass} /></div>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold text-gray-500 mb-2">Weather & Field</p>
                                    <div className="grid grid-cols-3 gap-3 mb-3">
                                        <div><label className={labelClass}>Temp (°C)</label><input type="number" step="0.1" name="Temperature" value={standaloneForm.Temperature} onChange={handleStandaloneChange} className={inputClass} /></div>
                                        <div><label className={labelClass}>Humidity %</label><input type="number" step="0.1" name="Humidity" value={standaloneForm.Humidity} onChange={handleStandaloneChange} className={inputClass} /></div>
                                        <div><label className={labelClass}>Rainfall (mm)</label><input type="number" step="0.1" name="Rainfall" value={standaloneForm.Rainfall} onChange={handleStandaloneChange} className={inputClass} /></div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div><label className={labelClass}>Wind (km/h)</label><input type="number" step="0.1" name="Wind_Speed" value={standaloneForm.Wind_Speed} onChange={handleStandaloneChange} className={inputClass} /></div>
                                        <div><label className={labelClass}>Sunlight (hrs)</label><input type="number" step="0.1" name="Sunlight_Hours" value={standaloneForm.Sunlight_Hours} onChange={handleStandaloneChange} className={inputClass} /></div>
                                        <div><label className={labelClass}>Altitude (m)</label><input type="number" step="1" name="Altitude" value={standaloneForm.Altitude} onChange={handleStandaloneChange} className={inputClass} /></div>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold text-gray-500 mb-2">Crop & Usage</p>
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <div>
                                            <label className={labelClass}>Crop Type</label>
                                            <select name="Crop_Type" value={standaloneForm.Crop_Type} onChange={handleStandaloneChange} className={selectClass}>
                                                {CROP_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Season</label>
                                            <select name="Season" value={standaloneForm.Season} onChange={handleStandaloneChange} className={selectClass}>
                                                {SEASONS.map((s) => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3 mb-3">
                                        <div>
                                            <label className={labelClass}>Soil Type</label>
                                            <select name="Soil_Type" value={standaloneForm.Soil_Type} onChange={handleStandaloneChange} className={selectClass}>
                                                {SOIL_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Region</label>
                                            <select name="Region" value={standaloneForm.Region} onChange={handleStandaloneChange} className={selectClass}>
                                                {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Irrigation</label>
                                            <select name="Irrigation_Type" value={standaloneForm.Irrigation_Type} onChange={handleStandaloneChange} className={selectClass}>
                                                {IRRIGATION_TYPES.map((i) => <option key={i} value={i}>{i.replace("_", " ")}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div><label className={labelClass}>Fertilizer (kg)</label><input type="number" step="0.1" name="Fertilizer_Used" value={standaloneForm.Fertilizer_Used} onChange={handleStandaloneChange} className={inputClass} /></div>
                                        <div><label className={labelClass}>Pesticide (L)</label><input type="number" step="0.1" name="Pesticide_Used" value={standaloneForm.Pesticide_Used} onChange={handleStandaloneChange} className={inputClass} /></div>
                                    </div>
                                </div>

                                {error && <p className="text-red-500 text-xs">{error}</p>}

                                <button
                                type="submit"
                                disabled={isPredicting}
                                className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors text-white flex items-center justify-center gap-2
                                    ${isPredicting ? "bg-gray-300 cursor-not-allowed" : "bg-primary-600 hover:bg-primary-700"}`}
                                >
                                    <MdTrendingUp className="text-lg" />
                                    {isPredicting ? "Predicting..." : "Predict Yield"}
                                </button>
                            </form>
                        </>
                    )}
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="text-gray-800 font-semibold text-base mb-4 flex items-center gap-2">
                        <GiWheat className="text-primary-600" />
                        Predicted Yield
                    </h2>

                    {result ? (
                        <div className="space-y-4">
                            <div className="bg-gradient-to-br from-primary-600 to-primary-500 rounded-2xl p-6 text-white text-center">
                                <p className="text-4xl font-bold mb-1">
                                    {predictedValue?.toFixed(2)}
                                    <span className="text-lg font-normal ml-1">{result.prediction?.yieldUnit || "tons"}</span>
                                </p>
                                <p className="text-primary-100 text-xs">
                                    {result.saved ? "Saved to your prediction history" : "Quick Check — not saved"}
                                </p>
                            </div>

                            {result.saved && result.weather && (
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: "Temperature", value: `${result.weather.temperature}°C` },
                                        { label: "Humidity", value: `${result.weather.humidity}%` },
                                        { label: "Rainfall", value: `${result.weather.rainfall} mm` },
                                        { label: "Wind Speed", value: `${result.weather.windSpeed} km/h` }
                                    ].map((w) => (
                                        <div key={w.label} className="bg-gray-50 rounded-xl p-3">
                                            <p className="text-gray-400 text-xs">{w.label}</p>
                                            <p className="text-gray-800 font-semibold text-sm">{w.value}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-center">
                            <GiWheat className="text-5xl text-gray-200 mb-3" />
                            <p className="text-gray-400 text-sm">Fill in the form and predict to see your expected yield.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-gray-800 font-bold text-base">Prediction History</h2>
                </div>
                {loadingHistory ? (
                    <div className="p-6 space-y-3">
                        {[1, 2].map((i) => <div key={i} className="bg-gray-100 rounded-xl h-14 animate-pulse" />)}
                    </div>
                ) : history.length === 0 ? (
                    <p className="text-gray-400 text-sm p-6">No saved predictions yet.</p>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {history.map((p) => (
                            <div key={p.id} className="flex items-center justify-between p-4">
                                <div>
                                    <p className="text-gray-800 font-semibold text-sm">
                                        {p.predictedYield?.toFixed(2)} {p.yieldUnit || "tons"}
                                        {p.crop?.cropName && <span className="text-gray-400 font-normal"> · {p.crop.cropName}</span>}
                                    </p>
                                    <p className="text-gray-400 text-xs">
                                        {p.crop?.field?.name ? `${p.crop.field.name} · ` : ""}
                                        {new Date(p.predictionDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <button onClick={() => handleDelete(p.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" aria-label="Delete">
                                    <MdDelete className="text-sm" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Yield;
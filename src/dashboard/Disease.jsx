import { useState, useEffect } from "react";
import { MdOutlineImageSearch, MdOutlineSearch, MdUpload, MdDelete, MdExpandMore, MdExpandLess } from "react-icons/md";
import { FaLeaf, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { getFields } from "../services/fieldAPI";
import { getCropsForField } from "../services/cropAPI";
import { predictDiseaseSaved, predictDiseaseQuick, getDiseaseHistory, deleteDiseasePrediction } from "../services/diseaseAPI";

const selectClass = "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 bg-gray-50 focus:bg-white";
const labelClass = "text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block";

const confidenceColor = (c) => (c >= 80 ? "text-red-600" : c >= 50 ? "text-orange-600" : "text-gray-600");

const Disease = () => {
    const [mode, setMode] = useState("save"); // "save" | "quick"

    const [fields, setFields] = useState([]);
    const [selectedFieldId, setSelectedFieldId] = useState("");
    const [crops, setCrops] = useState([]);
    const [selectedCropId, setSelectedCropId] = useState("");
    const [loadingSetup, setLoadingSetup] = useState(true);

    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");

    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

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
        const result = await getDiseaseHistory();
        if (result.success) setHistory(result.predictions);
        setLoadingHistory(false);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImage(file);
        setPreview(URL.createObjectURL(file));
        setResult(null);
        setError("");
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (!file) return;
        setImage(file);
        setPreview(URL.createObjectURL(file));
        setResult(null);
        setError("");
    };

    const handleAnalyze = async () => {
        if (!image) return;
        if (mode === "save" && !selectedCropId) {
            setError("Select a field and crop first, or switch to Quick Check.");
            return;
        }

        setIsAnalyzing(true);
        setResult(null);
        setError("");

        const response = mode === "save"
            ? await predictDiseaseSaved(image, selectedCropId)
            : await predictDiseaseQuick(image);

        setIsAnalyzing(false);

        if (response.success) {
            setResult({ ...response.prediction, saved: mode === "save" });
            if (mode === "save") loadHistory();
        } else {
            setError(response.error);
        }
    };

    const handleReset = () => {
        setImage(null);
        setPreview(null);
        setResult(null);
        setError("");
    };

    const handleDeleteHistory = async (id) => {
        if (!window.confirm("Delete this prediction?")) return;
        const response = await deleteDiseasePrediction(id);
        if (response.success) {
            setHistory((prev) => prev.filter((p) => p.id !== id));
        } else {
            alert(response.error);
        }
    };

    const diseaseName = result?.diseaseName || result?.prediction || "";
    const confidence = result?.confidence;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Plant Disease Detection</h1>
                <p className="text-gray-500 text-sm mt-1">Upload a plant image to detect disease.</p>
            </div>

            <div className="inline-flex bg-gray-100 rounded-xl p-1">
                <button
                onClick={() => { setMode("save"); setResult(null); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === "save" ? "bg-white text-primary-700 shadow-sm" : "text-gray-500"}`}
                >
                    Save to My Records
                </button>
                <button
                onClick={() => { setMode("quick"); setResult(null); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === "quick" ? "bg-white text-primary-700 shadow-sm" : "text-gray-500"}`}
                >
                    Quick Check
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="text-gray-800 font-semibold text-base mb-4 flex items-center gap-2">
                        <MdUpload className="text-primary-600 text-xl" />
                        Upload Plant Image
                    </h2>

                    {mode === "save" && (
                        loadingSetup ? (
                            <p className="text-gray-400 text-xs mb-4">Loading your fields...</p>
                        ) : fields.length === 0 ? (
                            <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs px-3 py-2.5 rounded-xl mb-4">
                                Add a field and crop first to save predictions, or use Quick Check instead.
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 mb-4">
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
                        )
                    )}

                    <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center
                    hover:border-primary-400 transition-colors cursor-pointer mb-4"
                    onClick={() => document.getElementById("imageInput").click()}
                    >
                        {preview ? (
                            <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                        ) : (
                            <div className="py-8">
                                <MdOutlineSearch className="text-5xl text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm font-medium">Drop your image here or click to browse</p>
                                <p className="text-gray-400 text-xs mt-1">Supports JPG, PNG, WEBP</p>
                            </div>
                        )}
                    </div>

                    <input id="imageInput" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

                    {error && <p className="text-red-500 text-xs mb-3">{error}</p>}

                    <div className="flex gap-3">
                        <button
                        onClick={handleAnalyze}
                        disabled={!image || isAnalyzing || (mode === "save" && !selectedCropId)}
                        className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex
                            items-center justify-center gap-2 text-white
                            ${!image || isAnalyzing || (mode === "save" && !selectedCropId) ? "bg-gray-300 cursor-not-allowed" : "bg-primary-600 hover:bg-primary-700 hover:shadow-lg"}`}
                        >
                            {isAnalyzing ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    </svg>
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <MdOutlineImageSearch className="text-lg" />
                                    Analyze Image
                                </>
                            )}
                        </button>
                        {image && (
                            <button onClick={handleReset} className="px-4 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
                                Reset
                            </button>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="text-gray-800 font-semibold text-base mb-4 flex items-center gap-2">
                        <FaLeaf className="text-primary-600" />
                        Detection Result
                    </h2>

                    {result ? (
                        <div className="space-y-4">
                            <div className={`flex items-center gap-2 p-3 rounded-xl ${confidence >= 50 ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"}`}>
                                {confidence >= 50
                                    ? <FaExclamationTriangle className="text-red-600 text-lg" />
                                    : <FaCheckCircle className="text-green-600 text-lg" />
                                }
                                <div>
                                    <p className="font-bold text-sm text-gray-800 capitalize">{diseaseName.replace(/_/g, " ")}</p>
                                    <p className={`text-xs font-medium ${confidenceColor(confidence)}`}>Confidence: {confidence?.toFixed(1)}%</p>
                                </div>
                            </div>

                            {result.saved && (
                                <p className="text-xs text-primary-600 font-medium">✓ Saved to your prediction history</p>
                            )}

                            {result.treatment?.treatment?.length > 0 && (
                                <div className="bg-primary-50 border border-primary-100 rounded-xl p-4">
                                    <p className="text-primary-700 font-semibold text-xs mb-2">Treatment</p>
                                    <ul className="text-primary-600 text-xs leading-relaxed list-disc list-inside space-y-1">
                                        {result.treatment.treatment.map((t, i) => <li key={i}>{t}</li>)}
                                    </ul>
                                </div>
                            )}

                            {result.treatment?.prevention?.length > 0 && (
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                                    <p className="text-blue-700 font-semibold text-xs mb-2">Prevention</p>
                                    <ul className="text-blue-600 text-xs leading-relaxed list-disc list-inside space-y-1">
                                        {result.treatment.prevention.map((t, i) => <li key={i}>{t}</li>)}
                                    </ul>
                                </div>
                            )}

                            {!result.saved && (
                                <p className="text-gray-400 text-xs">
                                    Quick Check results aren't saved and don't include treatment details. Switch to "Save to My Records" for full guidance.
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-center">
                            <MdOutlineImageSearch className="text-5xl text-gray-200 mb-3" />
                            <p className="text-gray-400 text-sm">Upload an image and click Analyze to see results.</p>
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
                        {[1, 2].map((i) => <div key={i} className="bg-gray-100 rounded-xl h-16 animate-pulse" />)}
                    </div>
                ) : history.length === 0 ? (
                    <p className="text-gray-400 text-sm p-6">No saved predictions yet.</p>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {history.map((p) => (
                            <div key={p.id} className="p-4">
                                <div className="flex items-center gap-3">
                                    <img src={p.imageUrl} alt={p.diseaseName} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-gray-800 font-semibold text-sm capitalize truncate">{p.diseaseName?.replace(/_/g, " ")}</p>
                                        <p className="text-gray-400 text-xs">
                                            {p.crop?.cropName ? `${p.crop.cropName} · ` : ""}
                                            {new Date(p.predictionDate).toLocaleDateString()} · {p.confidence?.toFixed(1)}% confidence
                                        </p>
                                    </div>
                                    <button onClick={() => setExpandedId(expandedId === p.id ? null : p.id)} className="p-1.5 text-gray-400 hover:text-primary-600 transition-colors" aria-label="Toggle details">
                                        {expandedId === p.id ? <MdExpandLess /> : <MdExpandMore />}
                                    </button>
                                    <button onClick={() => handleDeleteHistory(p.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" aria-label="Delete">
                                        <MdDelete className="text-sm" />
                                    </button>
                                </div>
                                {expandedId === p.id && (
                                    <div className="mt-3 pl-16 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {p.treatment?.treatment?.length > 0 && (
                                            <div className="bg-primary-50 rounded-xl p-3">
                                                <p className="text-primary-700 font-semibold text-xs mb-1">Treatment</p>
                                                <ul className="text-primary-600 text-xs list-disc list-inside space-y-0.5">
                                                    {p.treatment.treatment.map((t, i) => <li key={i}>{t}</li>)}
                                                </ul>
                                            </div>
                                        )}
                                        {p.treatment?.prevention?.length > 0 && (
                                            <div className="bg-blue-50 rounded-xl p-3">
                                                <p className="text-blue-700 font-semibold text-xs mb-1">Prevention</p>
                                                <ul className="text-blue-600 text-xs list-disc list-inside space-y-0.5">
                                                    {p.treatment.prevention.map((t, i) => <li key={i}>{t}</li>)}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Disease;
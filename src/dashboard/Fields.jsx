import { useState, useEffect } from "react";
import {
    MdAdd, MdEdit, MdDelete, MdExpandMore, MdExpandLess,
    MdTerrain, MdGrass, MdClose, MdScience, MdMyLocation, MdLocationOn
} from "react-icons/md";
import { addField, getFields, updateField, deleteField } from "../services/fieldAPI";
import { addCrop, getCropsForField, updateCrop, deleteCrop } from "../services/cropAPI";
import { addSoilData, getSoilDataForField } from "../services/soilAPI";
import { toastSuccess, toastError } from "../utils/toast";

const AREA_UNITS = ["ACRE", "HECTARE"];
const REGIONS = ["CENTRAL", "NORTH", "EAST", "WEST", "SOUTH"];
const SOIL_TYPES = ["SANDY", "CLAY", "LOAMY", "SILTY", "PEATY", "CHALKY", "OTHER"];
const IRRIGATION_TYPES = ["RAINFED", "CANAL", "TUBE_WELL", "WELL", "DRIP", "SPRINKLER", "OTHER"];
const SEASONS = ["RABI", "KHARIF", "ZAID"];
const CROP_TYPES = ["WHEAT", "RICE", "MAIZE", "COTTON", "SUGARCANE", "POTATO"];
const CROP_STATUSES = ["PLANNED", "ACTIVE", "HARVESTED", "FAILED"];

const emptyFieldForm = { 
    name: "", area: "", areaUnit: "ACRE", city: "", province: "", region: "", 
    soilType: "", irrigationType: "", altitude: "", latitude: "", longitude: "" 
};
const emptyCropForm = { cropName: "WHEAT", season: "KHARIF", plantingDate: "", expectedHarvestDate: "", area: "", areaUnit: "ACRE", status: "ACTIVE" };
const emptySoilForm = { nitrogen: "", phosphorus: "", potassium: "", soilPH: "", soilMoisture: "", organicCarbon: "" };

const statusColor = (status) => ({
    PLANNED: "bg-gray-100 text-gray-600",
    ACTIVE: "bg-green-100 text-green-700",
    HARVESTED: "bg-blue-100 text-blue-700",
    FAILED: "bg-red-100 text-red-600"
}[status] || "bg-gray-100 text-gray-600");

const selectClass = "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 bg-gray-50 focus:bg-white";
const inputClass = selectClass;
const labelClass = "text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block";

const Fields = () => {
    const [fields, setFields] = useState([]);
    const [expandedFieldCrops, setExpandedFieldCrops] = useState(null);
    const [expandedFieldSoil, setExpandedFieldSoil] = useState(null);
    const [cropsByField, setCropsByField] = useState({});
    const [soilByField, setSoilByField] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showFieldModal, setShowFieldModal] = useState(false);
    const [editingFieldId, setEditingFieldId] = useState(null);
    const [fieldForm, setFieldForm] = useState(emptyFieldForm);
    const [fieldFormError, setFieldFormError] = useState("");
    const [savingField, setSavingField] = useState(false);
    const [gettingLocation, setGettingLocation] = useState(false);

    const [showCropModal, setShowCropModal] = useState(false);
    const [cropFieldId, setCropFieldId] = useState(null);
    const [editingCropId, setEditingCropId] = useState(null);
    const [cropForm, setCropForm] = useState(emptyCropForm);
    const [cropFormError, setCropFormError] = useState("");
    const [savingCrop, setSavingCrop] = useState(false);

    const [showSoilModal, setShowSoilModal] = useState(false);
    const [soilFieldId, setSoilFieldId] = useState(null);
    const [soilForm, setSoilForm] = useState(emptySoilForm);
    const [savingSoil, setSavingSoil] = useState(false);

    const loadFields = async () => {
        setLoading(true);
        setError("");
        const result = await getFields();
        if (result.success) setFields(result.fields);
        else setError(result.error);
        setLoading(false);
    };

    useEffect(() => { loadFields(); }, []);

    const toggleCrops = async (fieldId) => {
        if (expandedFieldCrops === fieldId) { setExpandedFieldCrops(null); return; }
        setExpandedFieldCrops(fieldId);
        setExpandedFieldSoil(null);
        if (!cropsByField[fieldId]) {
            const result = await getCropsForField(fieldId);
            setCropsByField((prev) => ({ ...prev, [fieldId]: result.success ? result.crops : [] }));
        }
    };

    const toggleSoil = async (fieldId) => {
        if (expandedFieldSoil === fieldId) { setExpandedFieldSoil(null); return; }
        setExpandedFieldSoil(fieldId);
        setExpandedFieldCrops(null);
        if (!soilByField[fieldId]) {
            const result = await getSoilDataForField(fieldId);
            setSoilByField((prev) => ({ ...prev, [fieldId]: result.success ? result.soilData : [] }));
        }
    };

    const openAddField = () => {
        setEditingFieldId(null);
        setFieldForm(emptyFieldForm);
        setFieldFormError("");
        setShowFieldModal(true);
    };

    const openEditField = (field) => {
        setEditingFieldId(field.id);
        setFieldForm({
            name: field.name || "", area: field.area ?? "", areaUnit: field.areaUnit || "ACRE",
            city: field.city || "", province: field.province || "", region: field.region || "",
            soilType: field.soilType || "", irrigationType: field.irrigationType || "",
            altitude: field.altitude ?? "", latitude: field.latitude ?? "", longitude: field.longitude ?? ""
        });
        setFieldFormError("");
        setShowFieldModal(true);
    };

    const handleFieldFormChange = (e) => {
        const { name, value } = e.target;
        setFieldForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) { toastError("Geolocation is not supported by your browser."); return; }
        setGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFieldForm((prev) => ({
                    ...prev,
                    latitude: position.coords.latitude.toFixed(6),
                    longitude: position.coords.longitude.toFixed(6)
                }));
                setGettingLocation(false);
                toastSuccess("Live location captured!");
            },
            (error) => {
                setGettingLocation(false);
                toastError("Could not get location. Please ensure location permissions are allowed.");
                console.error(error);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const handleSaveField = async (e) => {
        e.preventDefault();
        
        // STRICT VALIDATION TO PREVENT BACKEND 500 ERROR
        if (!fieldForm.area || Number(fieldForm.area) <= 0) return setFieldFormError("Area is required.");
        if (!fieldForm.city.trim() || !fieldForm.province.trim()) return setFieldFormError("City and Province are required.");
        if (!fieldForm.soilType || !fieldForm.irrigationType) return setFieldFormError("Soil Type and Irrigation are required.");
        if (!fieldForm.altitude) return setFieldFormError("Altitude is required.");
        if (!editingFieldId && !fieldForm.region) return setFieldFormError("Please select a Region.");
        
        // Crucial for the ML model to work
        if (!fieldForm.latitude || !fieldForm.longitude) {
            return setFieldFormError("Please click 'Get Live Location' to capture coordinates.");
        }

        setSavingField(true);
        setFieldFormError("");

        const payload = { 
            ...fieldForm, 
            area: Number(fieldForm.area),
            altitude: Number(fieldForm.altitude),
            latitude: Number(fieldForm.latitude),
            longitude: Number(fieldForm.longitude)
        };
        
        if (editingFieldId) delete payload.region; 

        const result = editingFieldId ? await updateField(editingFieldId, payload) : await addField(payload);
        setSavingField(false);

        if (result.success) {
            setShowFieldModal(false);
            loadFields();
            toastSuccess(editingFieldId ? "Field updated." : "Field added.");
        } else {
            setFieldFormError(result.error);
            toastError(result.error);
        }
    };

    const handleDeleteField = async (fieldId) => {
        if (!window.confirm("Delete this field and all of its crops? This can't be undone.")) return;
        const result = await deleteField(fieldId);
        if (result.success) {
            setFields((prev) => prev.filter((f) => f.id !== fieldId));
            toastSuccess("Field deleted.");
        } else toastError(result.error);
    };

    const openAddCrop = (fieldId) => {
        setCropFieldId(fieldId);
        setEditingCropId(null);
        setCropForm(emptyCropForm);
        setCropFormError("");
        setShowCropModal(true);
    };

    const openEditCrop = (fieldId, crop) => {
        setCropFieldId(fieldId);
        setEditingCropId(crop.id);
        setCropForm({
            cropName: crop.cropName || "WHEAT", season: crop.season || "KHARIF",
            plantingDate: crop.plantingDate ? crop.plantingDate.slice(0, 10) : "",
            expectedHarvestDate: crop.expectedHarvestDate ? crop.expectedHarvestDate.slice(0, 10) : "",
            area: crop.area ?? "", areaUnit: crop.areaUnit || "ACRE", status: crop.status || "ACTIVE"
        });
        setCropFormError("");
        setShowCropModal(true);
    };

    const handleCropFormChange = (e) => {
        const { name, value } = e.target;
        setCropForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveCrop = async (e) => {
        e.preventDefault();
        setSavingCrop(true);
        setCropFormError("");

        const payload = { ...cropForm };
        if (payload.area === "") delete payload.area; else payload.area = Number(payload.area);
        if (!payload.plantingDate) delete payload.plantingDate;
        if (!payload.expectedHarvestDate) delete payload.expectedHarvestDate;

        const result = editingCropId ? await updateCrop(editingCropId, payload) : await addCrop(cropFieldId, payload);
        setSavingCrop(false);

        if (result.success) {
            setShowCropModal(false);
            toastSuccess(editingCropId ? "Crop updated." : "Crop added.");
            const refreshed = await getCropsForField(cropFieldId);
            setCropsByField((prev) => ({ ...prev, [cropFieldId]: refreshed.success ? refreshed.crops : [] }));
        } else {
            setCropFormError(result.error);
            toastError(result.error);
        }
    };

    const handleDeleteCrop = async (fieldId, cropId) => {
        if (!window.confirm("Delete this crop?")) return;
        const result = await deleteCrop(cropId);
        if (result.success) {
            setCropsByField((prev) => ({ ...prev, [fieldId]: (prev[fieldId] || []).filter((c) => c.id !== cropId) }));
            toastSuccess("Crop deleted.");
        } else toastError(result.error);
    };

    const openAddSoil = (fieldId) => {
        setSoilFieldId(fieldId);
        setSoilForm(emptySoilForm);
        setShowSoilModal(true);
    };

    const handleSoilFormChange = (e) => {
        const { name, value } = e.target;
        setSoilForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveSoil = async (e) => {
        e.preventDefault();
        setSavingSoil(true);

        const payload = { recordedAt: new Date().toISOString() };
        Object.entries(soilForm).forEach(([key, value]) => {
            if (value !== "") payload[key] = Number(value);
        });

        const result = await addSoilData(soilFieldId, payload);
        setSavingSoil(false);

        if (result.success) {
            setShowSoilModal(false);
            toastSuccess("Soil data added successfully.");
            const refreshed = await getSoilDataForField(soilFieldId);
            setSoilByField((prev) => ({ ...prev, [soilFieldId]: refreshed.success ? refreshed.soilData : [] }));
            setExpandedFieldSoil(soilFieldId);
            setExpandedFieldCrops(null);
        } else toastError(result.error || "Could not add soil data.");
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Loading fields...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">My Fields</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage your fields, crops, and soil data.</p>
                </div>
                <button onClick={openAddField} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors">
                    <MdAdd className="text-lg" /> Add Field
                </button>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {fields.map((field) => (
                    <div key={field.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                        <div className="p-5">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="text-gray-800 font-bold text-base">{field.name || "Unnamed Field"}</h3>
                                    <p className="text-gray-500 text-xs mt-0.5">
                                        {field.area} {field.areaUnit?.toLowerCase()} · {field.city}, {field.province} {field.altitude ? `· Alt: ${field.altitude}m` : ""}
                                    </p>
                                    {field.latitude && field.longitude && (
                                        <p className="text-gray-400 text-[11px] mt-1 flex items-center gap-1"><MdLocationOn /> {field.latitude}, {field.longitude}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => openEditField(field)} className="p-2 text-gray-400 hover:text-primary-600 rounded-lg"><MdEdit /></button>
                                    <button onClick={() => handleDeleteField(field.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg"><MdDelete /></button>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {field.soilType && <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-medium capitalize">{field.soilType.toLowerCase()} soil</span>}
                                {field.irrigationType && <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium capitalize">{field.irrigationType.toLowerCase().replace("_", " ")}</span>}
                                {field.region && <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium capitalize">{field.region.toLowerCase()}</span>}
                            </div>

                            <div className="flex items-center gap-4 mt-2 border-t border-gray-100 pt-4">
                                <button onClick={() => toggleCrops(field.id)} className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700">
                                    <MdGrass /> Crops {expandedFieldCrops === field.id ? <MdExpandLess /> : <MdExpandMore />}
                                </button>
                                <button onClick={() => toggleSoil(field.id)} className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
                                    <MdScience /> Soil Data {expandedFieldSoil === field.id ? <MdExpandLess /> : <MdExpandMore />}
                                </button>
                                <button onClick={() => openAddSoil(field.id)} className="flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700 ml-auto">
                                    <MdAdd /> Add Soil Reading
                                </button>
                            </div>
                        </div>

                        {expandedFieldCrops === field.id && (
                            <div className="border-t border-gray-100 bg-gray-50 p-5 space-y-3">
                                {!cropsByField[field.id] ? <p className="text-gray-400 text-xs">Loading crops...</p> : cropsByField[field.id].length === 0 ? <p className="text-gray-400 text-xs">No crops added.</p> : cropsByField[field.id].map((crop) => (
                                    <div key={crop.id} className="flex items-center justify-between bg-white rounded-xl p-3 border border-gray-100">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-gray-800 font-semibold text-sm capitalize">{crop.cropName?.toLowerCase()}</p>
                                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor(crop.status)}`}>{crop.status}</span>
                                            </div>
                                            <p className="text-gray-400 text-xs mt-0.5 capitalize">{crop.season?.toLowerCase()} season</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => openEditCrop(field.id, crop)} className="p-1.5 text-gray-400 hover:text-primary-600"><MdEdit className="text-sm" /></button>
                                            <button onClick={() => handleDeleteCrop(field.id, crop.id)} className="p-1.5 text-gray-400 hover:text-red-500"><MdDelete className="text-sm" /></button>
                                        </div>
                                    </div>
                                ))}
                                <button onClick={() => openAddCrop(field.id)} className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700"><MdAdd /> Add Crop</button>
                            </div>
                        )}

                        {expandedFieldSoil === field.id && (
                            <div className="border-t border-gray-100 bg-blue-50/30 p-5 space-y-3">
                                {!soilByField[field.id] ? <p className="text-gray-400 text-xs">Loading soil data...</p> : soilByField[field.id].length === 0 ? <p className="text-gray-400 text-xs">No soil readings saved yet.</p> : soilByField[field.id].map((soil, index) => (
                                    <div key={soil.id || index} className="bg-white rounded-xl p-3 border border-gray-100">
                                        <p className="text-xs text-gray-400 mb-2">Recorded: {new Date(soil.recordedAt || Date.now()).toLocaleDateString()}</p>
                                        <div className="grid grid-cols-3 gap-2 text-sm">
                                            <div><span className="text-gray-500 text-xs block">N</span><span className="font-semibold text-gray-800">{soil.nitrogen ?? "—"}</span></div>
                                            <div><span className="text-gray-500 text-xs block">P</span><span className="font-semibold text-gray-800">{soil.phosphorus ?? "—"}</span></div>
                                            <div><span className="text-gray-500 text-xs block">K</span><span className="font-semibold text-gray-800">{soil.potassium ?? "—"}</span></div>
                                            <div><span className="text-gray-500 text-xs block">pH Level</span><span className="font-semibold text-gray-800">{soil.soilPH ?? "—"}</span></div>
                                            <div><span className="text-gray-500 text-xs block">Moisture</span><span className="font-semibold text-gray-800">{soil.soilMoisture ? `${soil.soilMoisture}%` : "—"}</span></div>
                                            <div><span className="text-gray-500 text-xs block">Org. Carbon</span><span className="font-semibold text-gray-800">{soil.organicCarbon ?? "—"}</span></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Modals... */}
            {showFieldModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-800">{editingFieldId ? "Edit Field" : "Add Field"}</h3>
                            <button onClick={() => setShowFieldModal(false)} className="text-gray-400 hover:text-gray-600"><MdClose /></button>
                        </div>
                        <form onSubmit={handleSaveField} className="space-y-3">
                            <div><label className={labelClass}>Field Name</label><input type="text" name="name" value={fieldForm.name} onChange={handleFieldFormChange} placeholder="e.g. West Farm Field" className={inputClass} /></div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className={labelClass}>Area *</label><input type="number" step="0.01" min="0" name="area" value={fieldForm.area} onChange={handleFieldFormChange} placeholder="1" className={inputClass} /></div>
                                <div><label className={labelClass}>Unit</label><select name="areaUnit" value={fieldForm.areaUnit} onChange={handleFieldFormChange} className={selectClass}>{AREA_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}</select></div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className={labelClass}>City *</label><input type="text" name="city" value={fieldForm.city} onChange={handleFieldFormChange} placeholder="e.g. Shikarpur" className={inputClass} /></div>
                                <div><label className={labelClass}>Province *</label><input type="text" name="province" value={fieldForm.province} onChange={handleFieldFormChange} placeholder="e.g. Sindh" className={inputClass} /></div>
                            </div>
                            
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-xs font-medium text-blue-800 uppercase tracking-wide">GPS Coordinates *</label>
                                    <button type="button" onClick={handleGetLocation} disabled={gettingLocation} className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 disabled:opacity-50">
                                        <MdMyLocation className={gettingLocation ? "animate-spin" : ""} /> {gettingLocation ? "Locating..." : "Get Live Location"}
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mt-2">
                                    <input type="text" name="latitude" value={fieldForm.latitude} onChange={handleFieldFormChange} placeholder="Latitude" className="w-full px-3 py-2 rounded-lg border border-blue-200 text-sm bg-white" readOnly />
                                    <input type="text" name="longitude" value={fieldForm.longitude} onChange={handleFieldFormChange} placeholder="Longitude" className="w-full px-3 py-2 rounded-lg border border-blue-200 text-sm bg-white" readOnly />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div><label className={labelClass}>Soil Type *</label><select name="soilType" value={fieldForm.soilType} onChange={handleFieldFormChange} className={selectClass}><option value="">Select...</option>{SOIL_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
                                <div><label className={labelClass}>Irrigation *</label><select name="irrigationType" value={fieldForm.irrigationType} onChange={handleFieldFormChange} className={selectClass}><option value="">Select...</option>{IRRIGATION_TYPES.map((i) => <option key={i} value={i}>{i.replace("_", " ")}</option>)}</select></div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {!editingFieldId && <div><label className={labelClass}>Region *</label><select name="region" value={fieldForm.region} onChange={handleFieldFormChange} className={selectClass}><option value="">Select...</option>{REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}</select></div>}
                                <div><label className={labelClass}>Altitude (m) *</label><input type="number" step="1" min="0" name="altitude" value={fieldForm.altitude} onChange={handleFieldFormChange} placeholder="e.g. 150" className={inputClass} /></div>
                            </div>

                            {fieldFormError && <p className="text-red-500 text-xs">{fieldFormError}</p>}
                            <button type="submit" disabled={savingField} className={`w-full py-2.5 rounded-xl text-sm font-semibold text-white ${savingField ? "bg-primary-400" : "bg-primary-600 hover:bg-primary-700"}`}>{savingField ? "Saving..." : editingFieldId ? "Save Changes" : "Add Field"}</button>
                        </form>
                    </div>
                </div>
            )}

            {showCropModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold text-gray-800">{editingCropId ? "Edit Crop" : "Add Crop"}</h3><button onClick={() => setShowCropModal(false)} className="text-gray-400 hover:text-gray-600"><MdClose /></button></div>
                        <form onSubmit={handleSaveCrop} className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className={labelClass}>Crop</label><select name="cropName" value={cropForm.cropName} onChange={handleCropFormChange} className={selectClass}>{CROP_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
                                <div><label className={labelClass}>Season</label><select name="season" value={cropForm.season} onChange={handleCropFormChange} className={selectClass}>{SEASONS.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className={labelClass}>Planting Date</label><input type="date" name="plantingDate" value={cropForm.plantingDate} onChange={handleCropFormChange} className={inputClass} /></div>
                                <div><label className={labelClass}>Expected Harvest</label><input type="date" name="expectedHarvestDate" value={cropForm.expectedHarvestDate} onChange={handleCropFormChange} className={inputClass} /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className={labelClass}>Area (optional)</label><input type="number" step="0.01" min="0" name="area" value={cropForm.area} onChange={handleCropFormChange} placeholder="0.5" className={inputClass} /></div>
                                <div><label className={labelClass}>Unit</label><select name="areaUnit" value={cropForm.areaUnit} onChange={handleCropFormChange} className={selectClass}>{AREA_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}</select></div>
                            </div>
                            <div><label className={labelClass}>Status</label><select name="status" value={cropForm.status} onChange={handleCropFormChange} className={selectClass}>{CROP_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
                            {cropFormError && <p className="text-red-500 text-xs">{cropFormError}</p>}
                            <button type="submit" disabled={savingCrop} className={`w-full py-2.5 rounded-xl text-sm font-semibold text-white ${savingCrop ? "bg-primary-400" : "bg-primary-600 hover:bg-primary-700"}`}>{savingCrop ? "Saving..." : editingCropId ? "Save Changes" : "Add Crop"}</button>
                        </form>
                    </div>
                </div>
            )}

            {showSoilModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold text-gray-800">Add Soil Data</h3><button onClick={() => setShowSoilModal(false)} className="text-gray-400 hover:text-gray-600"><MdClose /></button></div>
                        <form onSubmit={handleSaveSoil} className="space-y-3">
                            <div className="grid grid-cols-3 gap-3">
                                <div><label className={labelClass}>Nitrogen (N)</label><input type="number" step="0.01" min="0" name="nitrogen" value={soilForm.nitrogen} onChange={handleSoilFormChange} className={inputClass} /></div>
                                <div><label className={labelClass}>Phosphorus (P)</label><input type="number" step="0.01" min="0" name="phosphorus" value={soilForm.phosphorus} onChange={handleSoilFormChange} className={inputClass} /></div>
                                <div><label className={labelClass}>Potassium (K)</label><input type="number" step="0.01" min="0" name="potassium" value={soilForm.potassium} onChange={handleSoilFormChange} className={inputClass} /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className={labelClass}>Soil pH (0–14)</label><input type="number" step="0.1" min="0" max="14" name="soilPH" value={soilForm.soilPH} onChange={handleSoilFormChange} className={inputClass} /></div>
                                <div><label className={labelClass}>Moisture % (0–100)</label><input type="number" step="0.1" min="0" max="100" name="soilMoisture" value={soilForm.soilMoisture} onChange={handleSoilFormChange} className={inputClass} /></div>
                            </div>
                            <div><label className={labelClass}>Organic Carbon</label><input type="number" step="0.01" min="0" name="organicCarbon" value={soilForm.organicCarbon} onChange={handleSoilFormChange} className={inputClass} /></div>
                            <button type="submit" disabled={savingSoil} className={`w-full py-2.5 rounded-xl text-sm font-semibold text-white mt-2 ${savingSoil ? "bg-primary-400" : "bg-amber-600 hover:bg-amber-700"}`}>{savingSoil ? "Saving..." : "Save Soil Data"}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Fields;
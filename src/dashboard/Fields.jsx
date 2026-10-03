import { useState, useEffect } from "react";
import {
    MdAdd, MdEdit, MdDelete, MdExpandMore, MdExpandLess,
    MdTerrain, MdGrass, MdClose
} from "react-icons/md";
import {
    addField, getFields, updateField, deleteField
} from "../services/fieldAPI";
import {
    addCrop, getCropsForField, updateCrop, deleteCrop
} from "../services/cropAPI";

const AREA_UNITS = ["ACRE", "HECTARE"];
const REGIONS = ["CENTRAL", "NORTH", "EAST", "WEST", "SOUTH"];
const SOIL_TYPES = ["SANDY", "CLAY", "LOAMY", "SILTY", "PEATY", "CHALKY", "OTHER"];
const IRRIGATION_TYPES = ["RAINFED", "CANAL", "TUBE_WELL", "WELL", "DRIP", "SPRINKLER", "OTHER"];
const SEASONS = ["RABI", "KHARIF", "ZAID"];
const CROP_TYPES = ["WHEAT", "RICE", "MAIZE", "COTTON", "SUGARCANE", "POTATO"];
const CROP_STATUSES = ["PLANNED", "ACTIVE", "HARVESTED", "FAILED"];

const emptyFieldForm = { name: "", area: "", areaUnit: "ACRE", city: "", province: "", region: "", soilType: "", irrigationType: "" };
const emptyCropForm = { cropName: "WHEAT", season: "KHARIF", plantingDate: "", expectedHarvestDate: "", area: "", areaUnit: "ACRE", status: "ACTIVE" };

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
    const [cropsByField, setCropsByField] = useState({}); // fieldId -> array | undefined
    const [expandedField, setExpandedField] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Field modal
    const [showFieldModal, setShowFieldModal] = useState(false);
    const [editingFieldId, setEditingFieldId] = useState(null);
    const [fieldForm, setFieldForm] = useState(emptyFieldForm);
    const [fieldFormError, setFieldFormError] = useState("");
    const [savingField, setSavingField] = useState(false);

    // Crop modal
    const [showCropModal, setShowCropModal] = useState(false);
    const [cropFieldId, setCropFieldId] = useState(null);
    const [editingCropId, setEditingCropId] = useState(null);
    const [cropForm, setCropForm] = useState(emptyCropForm);
    const [cropFormError, setCropFormError] = useState("");
    const [savingCrop, setSavingCrop] = useState(false);

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
        if (expandedField === fieldId) {
            setExpandedField(null);
            return;
        }
        setExpandedField(fieldId);
        if (!cropsByField[fieldId]) {
            const result = await getCropsForField(fieldId);
            setCropsByField((prev) => ({ ...prev, [fieldId]: result.success ? result.crops : [] }));
        }
    };

    /* ---------- Field modal ---------- */
    const openAddField = () => {
        setEditingFieldId(null);
        setFieldForm(emptyFieldForm);
        setFieldFormError("");
        setShowFieldModal(true);
    };

    const openEditField = (field) => {
        setEditingFieldId(field.id);
        setFieldForm({
            name: field.name || "",
            area: field.area ?? "",
            areaUnit: field.areaUnit || "ACRE",
            city: field.city || "",
            province: field.province || "",
            region: field.region || "",
            soilType: field.soilType || "",
            irrigationType: field.irrigationType || ""
        });
        setFieldFormError("");
        setShowFieldModal(true);
    };

    const handleFieldFormChange = (e) => {
        const { name, value } = e.target;
        setFieldForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveField = async (e) => {
        e.preventDefault();
        if (!fieldForm.area || Number(fieldForm.area) <= 0) {
            setFieldFormError("Area is required and must be greater than 0.");
            return;
        }

        setSavingField(true);
        setFieldFormError("");

        const payload = { ...fieldForm, area: Number(fieldForm.area) };
        if (editingFieldId) delete payload.region; // not updatable per README
        Object.keys(payload).forEach((key) => {
            if (payload[key] === "") delete payload[key];
        });

        const result = editingFieldId
            ? await updateField(editingFieldId, payload)
            : await addField(payload);

        setSavingField(false);

        if (result.success) {
            setShowFieldModal(false);
            loadFields();
        } else {
            setFieldFormError(result.error);
        }
    };

    const handleDeleteField = async (fieldId) => {
        if (!window.confirm("Delete this field and all of its crops? This can't be undone.")) return;
        const result = await deleteField(fieldId);
        if (result.success) {
            setFields((prev) => prev.filter((f) => f.id !== fieldId));
        } else {
            alert(result.error);
        }
    };

    /* ---------- Crop modal ---------- */
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
            cropName: crop.cropName || "WHEAT",
            season: crop.season || "KHARIF",
            plantingDate: crop.plantingDate ? crop.plantingDate.slice(0, 10) : "",
            expectedHarvestDate: crop.expectedHarvestDate ? crop.expectedHarvestDate.slice(0, 10) : "",
            area: crop.area ?? "",
            areaUnit: crop.areaUnit || "ACRE",
            status: crop.status || "ACTIVE"
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
        if (payload.area === "") delete payload.area;
        else payload.area = Number(payload.area);
        if (!payload.plantingDate) delete payload.plantingDate;
        if (!payload.expectedHarvestDate) delete payload.expectedHarvestDate;

        const result = editingCropId
            ? await updateCrop(editingCropId, payload)
            : await addCrop(cropFieldId, payload);

        setSavingCrop(false);

        if (result.success) {
            setShowCropModal(false);
            const refreshed = await getCropsForField(cropFieldId);
            setCropsByField((prev) => ({ ...prev, [cropFieldId]: refreshed.success ? refreshed.crops : [] }));
        } else {
            setCropFormError(result.error);
        }
    };

    const handleDeleteCrop = async (fieldId, cropId) => {
        if (!window.confirm("Delete this crop?")) return;
        const result = await deleteCrop(cropId);
        if (result.success) {
            setCropsByField((prev) => ({
                ...prev,
                [fieldId]: (prev[fieldId] || []).filter((c) => c.id !== cropId)
            }));
        } else {
            alert(result.error);
        }
    };

    /* ---------- Render ---------- */

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">My Fields</h1>
                    <p className="text-gray-500 text-sm mt-1">Loading your fields...</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="bg-gray-100 rounded-2xl h-40 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">My Fields</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage your fields and the crops growing in each one.</p>
                </div>
                <button
                onClick={openAddField}
                className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium
                hover:bg-primary-700 transition-colors"
                >
                    <MdAdd className="text-lg" /> Add Field
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                    {error}
                </div>
            )}

            {!error && fields.length === 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                    <MdTerrain className="text-5xl text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium mb-1">No fields yet</p>
                    <p className="text-gray-400 text-sm mb-4">Add your first field to start tracking crops, soil, and predictions.</p>
                    <button
                    onClick={openAddField}
                    className="bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors"
                    >
                        Add Field
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {fields.map((field) => (
                    <div key={field.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                        <div className="p-5">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="text-gray-800 font-bold text-base">{field.name || "Unnamed Field"}</h3>
                                    <p className="text-gray-500 text-xs mt-0.5">
                                        {field.area} {field.areaUnit?.toLowerCase()}
                                        {field.city ? ` · ${field.city}` : ""}
                                        {field.province ? `, ${field.province}` : ""}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => openEditField(field)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" aria-label="Edit field">
                                        <MdEdit />
                                    </button>
                                    <button onClick={() => handleDeleteField(field.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" aria-label="Delete field">
                                        <MdDelete />
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {field.soilType && (
                                    <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-medium capitalize">
                                        {field.soilType.toLowerCase()} soil
                                    </span>
                                )}
                                {field.irrigationType && (
                                    <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium capitalize">
                                        {field.irrigationType.toLowerCase().replace("_", " ")}
                                    </span>
                                )}
                                {field.region && (
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium capitalize">
                                        {field.region.toLowerCase()}
                                    </span>
                                )}
                            </div>

                            <button
                            onClick={() => toggleCrops(field.id)}
                            className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                            >
                                <MdGrass />
                                Crops
                                {expandedField === field.id ? <MdExpandLess /> : <MdExpandMore />}
                            </button>
                        </div>

                        {expandedField === field.id && (
                            <div className="border-t border-gray-100 bg-gray-50 p-5 space-y-3">
                                {!cropsByField[field.id] ? (
                                    <p className="text-gray-400 text-xs">Loading crops...</p>
                                ) : cropsByField[field.id].length === 0 ? (
                                    <p className="text-gray-400 text-xs">No crops added to this field yet.</p>
                                ) : (
                                    cropsByField[field.id].map((crop) => (
                                        <div key={crop.id} className="flex items-center justify-between bg-white rounded-xl p-3 border border-gray-100">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-gray-800 font-semibold text-sm capitalize">{crop.cropName?.toLowerCase()}</p>
                                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor(crop.status)}`}>
                                                        {crop.status}
                                                    </span>
                                                </div>
                                                <p className="text-gray-400 text-xs mt-0.5 capitalize">
                                                    {crop.season?.toLowerCase()} season
                                                    {crop.plantingDate ? ` · planted ${crop.plantingDate.slice(0, 10)}` : ""}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => openEditCrop(field.id, crop)} className="p-1.5 text-gray-400 hover:text-primary-600 transition-colors" aria-label="Edit crop">
                                                    <MdEdit className="text-sm" />
                                                </button>
                                                <button onClick={() => handleDeleteCrop(field.id, crop.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" aria-label="Delete crop">
                                                    <MdDelete className="text-sm" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                                <button
                                onClick={() => openAddCrop(field.id)}
                                className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
                                >
                                    <MdAdd /> Add Crop
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* ---------- Add/Edit Field Modal ---------- */}
            {showFieldModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-800">
                                {editingFieldId ? "Edit Field" : "Add Field"}
                            </h3>
                            <button onClick={() => setShowFieldModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close">
                                <MdClose />
                            </button>
                        </div>

                        <form onSubmit={handleSaveField} className="space-y-3">
                            <div>
                                <label className={labelClass}>Field Name</label>
                                <input type="text" name="name" value={fieldForm.name} onChange={handleFieldFormChange}
                                placeholder="e.g. West Farm Field" className={inputClass} />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelClass}>Area *</label>
                                    <input type="number" step="0.01" min="0" name="area" value={fieldForm.area} onChange={handleFieldFormChange}
                                    placeholder="1" className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Unit</label>
                                    <select name="areaUnit" value={fieldForm.areaUnit} onChange={handleFieldFormChange} className={selectClass}>
                                        {AREA_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelClass}>City</label>
                                    <input type="text" name="city" value={fieldForm.city} onChange={handleFieldFormChange}
                                    placeholder="e.g. Shikarpur" className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Province</label>
                                    <input type="text" name="province" value={fieldForm.province} onChange={handleFieldFormChange}
                                    placeholder="e.g. Sindh" className={inputClass} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelClass}>Soil Type</label>
                                    <select name="soilType" value={fieldForm.soilType} onChange={handleFieldFormChange} className={selectClass}>
                                        <option value="">Not set</option>
                                        {SOIL_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Irrigation</label>
                                    <select name="irrigationType" value={fieldForm.irrigationType} onChange={handleFieldFormChange} className={selectClass}>
                                        <option value="">Not set</option>
                                        {IRRIGATION_TYPES.map((i) => <option key={i} value={i}>{i.replace("_", " ")}</option>)}
                                    </select>
                                </div>
                            </div>

                            {!editingFieldId && (
                                <div>
                                    <label className={labelClass}>Region</label>
                                    <select name="region" value={fieldForm.region} onChange={handleFieldFormChange} className={selectClass}>
                                        <option value="">Not set</option>
                                        {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                            )}

                            {fieldFormError && <p className="text-red-500 text-xs">{fieldFormError}</p>}

                            <button
                            type="submit"
                            disabled={savingField}
                            className={`w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-colors
                                ${savingField ? "bg-primary-400 cursor-not-allowed" : "bg-primary-600 hover:bg-primary-700"}`}
                            >
                                {savingField ? "Saving..." : editingFieldId ? "Save Changes" : "Add Field"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ---------- Add/Edit Crop Modal ---------- */}
            {showCropModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-800">
                                {editingCropId ? "Edit Crop" : "Add Crop"}
                            </h3>
                            <button onClick={() => setShowCropModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close">
                                <MdClose />
                            </button>
                        </div>

                        <form onSubmit={handleSaveCrop} className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelClass}>Crop</label>
                                    <select name="cropName" value={cropForm.cropName} onChange={handleCropFormChange} className={selectClass}>
                                        {CROP_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Season</label>
                                    <select name="season" value={cropForm.season} onChange={handleCropFormChange} className={selectClass}>
                                        {SEASONS.map((s) => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelClass}>Planting Date</label>
                                    <input type="date" name="plantingDate" value={cropForm.plantingDate} onChange={handleCropFormChange} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Expected Harvest</label>
                                    <input type="date" name="expectedHarvestDate" value={cropForm.expectedHarvestDate} onChange={handleCropFormChange} className={inputClass} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelClass}>Area (optional)</label>
                                    <input type="number" step="0.01" min="0" name="area" value={cropForm.area} onChange={handleCropFormChange}
                                    placeholder="0.5" className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Unit</label>
                                    <select name="areaUnit" value={cropForm.areaUnit} onChange={handleCropFormChange} className={selectClass}>
                                        {AREA_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Status</label>
                                <select name="status" value={cropForm.status} onChange={handleCropFormChange} className={selectClass}>
                                    {CROP_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            {cropFormError && <p className="text-red-500 text-xs">{cropFormError}</p>}

                            <button
                            type="submit"
                            disabled={savingCrop}
                            className={`w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-colors
                                ${savingCrop ? "bg-primary-400 cursor-not-allowed" : "bg-primary-600 hover:bg-primary-700"}`}
                            >
                                {savingCrop ? "Saving..." : editingCropId ? "Save Changes" : "Add Crop"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Fields;
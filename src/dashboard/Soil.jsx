import { useState, useEffect } from "react";
import { MdAdd, MdEdit, MdDelete, MdClose, MdTerrain, MdScience, MdSensors, MdWaterDrop, MdSync } from "react-icons/md";
import { getFields } from "../services/fieldAPI";
import { addSoilData, getSoilDataForField, updateSoilData, deleteSoilData } from "../services/soilAPI";
import { getIotDevices, requestIotReading, assignIotToField } from "../services/iotAPI";
import { toastSuccess, toastError } from "../utils/toast";

const emptyForm = { nitrogen: "", phosphorus: "", potassium: "", soilPH: "", soilMoisture: "", organicCarbon: "", recordedAt: "" };

const selectClass = "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 bg-gray-50 focus:bg-white";
const inputClass = selectClass;
const labelClass = "text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block";

const toDatetimeLocal = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const phLabel = (ph) => {
    if (ph == null) return "";
    if (ph < 6) return "Acidic";
    if (ph > 7.5) return "Alkaline";
    return "Neutral";
};

const Soil = () => {
    const [activeTab, setActiveTab] = useState("manual"); // "manual" | "iot"

    const [fields, setFields] = useState([]);
    const [selectedFieldId, setSelectedFieldId] = useState("");
    const [readings, setReadings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingReadings, setLoadingReadings] = useState(false);
    const [error, setError] = useState("");

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [formError, setFormError] = useState("");
    const [saving, setSaving] = useState(false);

    // IoT State
    const [iotDevices, setIotDevices] = useState([]);
    const [loadingIot, setLoadingIot] = useState(false);
    const [requestingDevice, setRequestingDevice] = useState(null);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            const result = await getFields();
            if (result.success) {
                setFields(result.fields);
                if (result.fields.length > 0) setSelectedFieldId(result.fields[0].id);
            } else {
                setError(result.error);
            }
            setLoading(false);
        };
        init();
    }, []);

    // Load IoT devices when tab changes
    useEffect(() => {
        if (activeTab === "iot") {
            loadIotDevices();
        }
    }, [activeTab]);

    const loadIotDevices = async () => {
        setLoadingIot(true);
        const result = await getIotDevices();
        if (result.success) setIotDevices(result.devices);
        setLoadingIot(false);
    };

    const loadReadings = async (fieldId) => {
        if (!fieldId) return;
        setLoadingReadings(true);
        setError("");
        const result = await getSoilDataForField(fieldId);
        if (result.success) setReadings(result.soilData);
        else setError(result.error);
        setLoadingReadings(false);
    };

    useEffect(() => {
        if (selectedFieldId && activeTab === "manual") loadReadings(selectedFieldId);
    }, [selectedFieldId, activeTab]);

    // ---------------- IOT HANDLERS ----------------
    const handleRequestReading = async (device) => {
        if (!device.fieldId) {
            toastError("Please assign this device to a field first.");
            return;
        }
        
        setRequestingDevice(device.deviceCode);
        const result = await requestIotReading(device.deviceCode);
        
        if (result.success) {
            toastSuccess(`Reading received from ${device.name}!`);
            // If the current selected field matches the device's field, refresh the data
            if (selectedFieldId === device.fieldId) {
                loadReadings(device.fieldId);
            }
        } else {
            toastError(result.error);
        }
        setRequestingDevice(null);
    };

    const handleAssignField = async (deviceCode, fieldId) => {
        const result = await assignIotToField(deviceCode, fieldId);
        if (result.success) {
            toastSuccess("Device assigned to field successfully.");
            loadIotDevices(); // reload to show updated fieldId
        } else {
            toastError(result.error);
        }
    };

    // ---------------- MANUAL HANDLERS ----------------
    const openAdd = () => {
        setEditingId(null);
        setForm({ ...emptyForm, recordedAt: toDatetimeLocal(new Date().toISOString()) });
        setFormError("");
        setShowModal(true);
    };

    const openEdit = (reading) => {
        setEditingId(reading.id);
        setForm({
            nitrogen: reading.nitrogen ?? "",
            phosphorus: reading.phosphorus ?? "",
            potassium: reading.potassium ?? "",
            soilPH: reading.soilPH ?? "",
            soilMoisture: reading.soilMoisture ?? "",
            organicCarbon: reading.organicCarbon ?? "",
            recordedAt: toDatetimeLocal(reading.recordedAt)
        });
        setFormError("");
        setShowModal(true);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        const checks = [
            ["nitrogen", 0, Infinity], ["phosphorus", 0, Infinity],
            ["potassium", 0, Infinity], ["organicCarbon", 0, Infinity],
            ["soilPH", 0, 14], ["soilMoisture", 0, 100]
        ];
        for (const [key, min, max] of checks) {
            if (form[key] === "") continue;
            const n = Number(form[key]);
            if (Number.isNaN(n) || n < min || n > max) {
                return `${key} must be ${max === Infinity ? "0 or greater" : `between ${min} and ${max}`}.`;
            }
        }
        return "";
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const validationError = validate();
        if (validationError) return setFormError(validationError);

        setSaving(true);
        setFormError("");

        const payload = {};
        Object.entries(form).forEach(([key, value]) => {
            if (value === "") return;
            payload[key] = key === "recordedAt" ? new Date(value).toISOString() : Number(value);
        });

        const result = editingId
            ? await updateSoilData(editingId, payload)
            : await addSoilData(selectedFieldId, payload);

        setSaving(false);

        if (result.success) {
            setShowModal(false);
            toastSuccess(editingId ? "Soil Reading updated." : "Soil Reading added.");
            loadReadings(selectedFieldId);
        } else {
            setFormError(result.error);
            toastError(result.error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this soil reading?")) return;
        const result = await deleteSoilData(id);
        if (result.success) {
            setReadings((prev) => prev.filter((r) => r.id !== id));
            toastSuccess("Soil Reading deleted.");
        } else {
            toastError(result.error);
        }
    };

    const latest = readings.length
        ? [...readings].sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt))[0]
        : null;

    if (loading) {
        return (
            <div className="space-y-6">
                <div><h1 className="text-2xl font-bold text-gray-800">Soil Monitoring</h1></div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => <div key={i} className="bg-gray-100 rounded-2xl h-28 animate-pulse" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Soil Monitoring</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage manual readings and live IoT sensor data.</p>
                </div>
                
                {/* TABS */}
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button onClick={() => setActiveTab("manual")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "manual" ? "bg-white text-primary-700 shadow-sm" : "text-gray-500"}`}>
                        Manual Data
                    </button>
                    <button onClick={() => setActiveTab("iot")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "iot" ? "bg-white text-primary-700 shadow-sm" : "text-gray-500"}`}>
                        <MdSensors /> IoT Sensors
                    </button>
                </div>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}

            {/* ========================================================= */}
            {/* TAB 1: MANUAL DATA (Your existing implementation)         */}
            {/* ========================================================= */}
            {activeTab === "manual" && (
                <>
                    <div className="flex items-center gap-2 mb-4">
                        <select value={selectedFieldId} onChange={(e) => setSelectedFieldId(e.target.value)} className="px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-primary-500 bg-white">
                            {fields.map((f) => <option key={f.id} value={f.id}>{f.name || "Unnamed Field"}</option>)}
                        </select>
                        <button onClick={openAdd} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors">
                            <MdAdd className="text-lg" /> Add Reading
                        </button>
                    </div>
                    
                    {/* Display latest manual reading & history... (Keep your existing manual UI here) */}
                    {latest ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                            {[
                                { label: "Nitrogen (N)", value: latest.nitrogen, unit: "mg/kg" },
                                { label: "Phosphorus (P)", value: latest.phosphorus, unit: "mg/kg" },
                                { label: "Potassium (K)", value: latest.potassium, unit: "mg/kg" },
                                { label: "Soil pH", value: latest.soilPH, unit: "", sub: phLabel(latest.soilPH) },
                                { label: "Moisture", value: latest.soilMoisture, unit: "%" },
                                { label: "Organic Carbon", value: latest.organicCarbon, unit: "%" }
                            ].map((stat) => (
                                <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-4">
                                    <p className="text-gray-500 text-xs font-medium mb-1">{stat.label}</p>
                                    <p className="text-gray-800 font-bold text-xl">{stat.value ?? "—"}{stat.value != null && <span className="text-xs text-gray-400 font-normal ml-0.5">{stat.unit}</span>}</p>
                                    {stat.sub && <p className="text-primary-600 text-xs font-medium mt-0.5">{stat.sub}</p>}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                            <MdScience className="text-5xl text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-600 font-medium mb-1">No manual readings yet</p>
                            <button onClick={openAdd} className="bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors mt-4">Add Reading</button>
                        </div>
                    )}
                    
                    {/* History Table... (Keep your existing history table here) */}
                </>
            )}

            {/* ========================================================= */}
            {/* TAB 2: IOT SENSORS (New Implementation)                   */}
            {/* ========================================================= */}
            {activeTab === "iot" && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">Registered IoT devices connected to your account.</p>
                        <button onClick={loadIotDevices} className="text-sm flex items-center gap-1 text-primary-600 hover:text-primary-700">
                            <MdSync className={loadingIot ? "animate-spin" : ""} /> Refresh
                        </button>
                    </div>

                    {loadingIot ? (
                        <div className="bg-gray-100 rounded-2xl h-32 animate-pulse" />
                    ) : iotDevices.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                            <MdSensors className="text-5xl text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-600 font-medium mb-1">No IoT devices registered</p>
                            <p className="text-gray-400 text-sm">Contact your administrator to register a sensor.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {iotDevices.map(device => (
                                <div key={device.id} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-gray-800 font-bold text-base">{device.name}</h3>
                                            <p className="text-gray-400 text-xs font-mono">{device.deviceCode}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${device.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {device.status}
                                        </span>
                                    </div>
                                    
                                    <div className="bg-gray-50 rounded-xl p-3 text-sm">
                                        <p className="text-gray-500 text-xs mb-1">Assigned Field</p>
                                        {device.fieldId ? (
                                            <p className="font-medium text-gray-800">{fields.find(f => f.id === device.fieldId)?.name || "Unknown Field"}</p>
                                        ) : (
                                            <div className="mt-1">
                                                <p className="text-red-500 text-xs mb-2">Not assigned to any field!</p>
                                                <select onChange={(e) => handleAssignField(device.deviceCode, e.target.value)} className="w-full px-2 py-1.5 text-xs rounded border border-gray-200 bg-white outline-none">
                                                    <option value="">Assign to Field...</option>
                                                    {fields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                                </select>
                                            </div>
                                        )}
                                    </div>

                                    <button 
                                        onClick={() => handleRequestReading(device)}
                                        disabled={!device.fieldId || requestingDevice === device.deviceCode}
                                        className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2
                                            ${(!device.fieldId || requestingDevice === device.deviceCode) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-primary-600 text-white hover:bg-primary-700'}`}
                                    >
                                        {requestingDevice === device.deviceCode ? (
                                            <><MdSync className="animate-spin text-lg" /> Requesting...</>
                                        ) : (
                                            <><MdWaterDrop className="text-lg" /> Request Reading</>
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Manual Add/Edit Modal ... (Keep your existing modal code here) */}
        </div>
    );
};

export default Soil;
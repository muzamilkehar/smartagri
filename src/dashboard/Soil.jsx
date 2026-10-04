import { useState, useEffect } from "react";
import { MdAdd, MdEdit, MdDelete, MdClose, MdTerrain, MdScience } from "react-icons/md";
import { getFields } from "../services/fieldAPI";
import { addSoilData, getSoilDataForField, updateSoilData, deleteSoilData } from "../services/soilAPI";
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
    const [fields, setFields] = useState([]);
    const [selectedFieldId, setSelectedFieldId] = useState("");
    const [readings, setReadings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingReadings, setLoadingReadings] = useState(false);
    const [error, setError] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [formError, setFormError] = useState("");
    const [saving, setSaving] = useState(false);

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
        if (selectedFieldId) loadReadings(selectedFieldId);
    }, [selectedFieldId]);

    const latest = readings.length
        ? [...readings].sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt))[0]
        : null;

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
        if (validationError) {
            setFormError(validationError);
            return;
        }

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

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Soil Monitoring</h1>
                    <p className="text-gray-500 text-sm mt-1">Loading your fields...</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => <div key={i} className="bg-gray-100 rounded-2xl h-28 animate-pulse" />)}
                </div>
            </div>
        );
    }

    if (fields.length === 0) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Soil Monitoring</h1>
                    <p className="text-gray-500 text-sm mt-1">Track soil nutrients and pH for each of your fields.</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                    <MdTerrain className="text-5xl text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium mb-1">No fields yet</p>
                    <p className="text-gray-400 text-sm">Add a field first — soil readings are recorded per field.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Soil Monitoring</h1>
                    <p className="text-gray-500 text-sm mt-1">Nutrient and pH readings for your fields.</p>
                </div>
                <div className="flex items-center gap-2">
                    <select
                    value={selectedFieldId}
                    onChange={(e) => setSelectedFieldId(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-primary-500 bg-white"
                    >
                        {fields.map((f) => (
                            <option key={f.id} value={f.id}>{f.name || "Unnamed Field"}</option>
                        ))}
                    </select>
                    <button
                    onClick={openAdd}
                    className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors"
                    >
                        <MdAdd className="text-lg" /> Add Reading
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
            )}

            {loadingReadings ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => <div key={i} className="bg-gray-100 rounded-2xl h-28 animate-pulse" />)}
                </div>
            ) : latest ? (
                <>
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
                                <p className="text-gray-800 font-bold text-xl">
                                    {stat.value ?? "—"}
                                    {stat.value != null && <span className="text-xs text-gray-400 font-normal ml-0.5">{stat.unit}</span>}
                                </p>
                                {stat.sub && <p className="text-primary-600 text-xs font-medium mt-0.5">{stat.sub}</p>}
                            </div>
                        ))}
                    </div>
                    <p className="text-gray-400 text-xs">
                        Latest reading recorded {new Date(latest.recordedAt).toLocaleString()}
                    </p>
                </>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                    <MdScience className="text-5xl text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium mb-1">No soil readings yet</p>
                    <p className="text-gray-400 text-sm mb-4">Add your first reading for this field.</p>
                    <button onClick={openAdd} className="bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors">
                        Add Reading
                    </button>
                </div>
            )}

            {readings.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-gray-800 font-bold text-base">Reading History</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    {["Recorded", "N", "P", "K", "pH", "Moisture", "Org. Carbon", ""].map((h) => (
                                        <th key={h} className="text-left text-xs font-semibold text-gray-500 px-6 py-3 uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {[...readings].sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt)).map((r) => (
                                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{new Date(r.recordedAt).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-800">{r.nitrogen ?? "—"}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-800">{r.phosphorus ?? "—"}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-800">{r.potassium ?? "—"}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-800">{r.soilPH ?? "—"}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-800">{r.soilMoisture != null ? `${r.soilMoisture}%` : "—"}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-800">{r.organicCarbon ?? "—"}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 justify-end">
                                                <button onClick={() => openEdit(r)} className="p-1.5 text-gray-400 hover:text-primary-600 transition-colors" aria-label="Edit reading">
                                                    <MdEdit className="text-sm" />
                                                </button>
                                                <button onClick={() => handleDelete(r.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" aria-label="Delete reading">
                                                    <MdDelete className="text-sm" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-800">{editingId ? "Edit Reading" : "Add Soil Reading"}</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close">
                                <MdClose />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-3">
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className={labelClass}>Nitrogen (N)</label>
                                    <input type="number" step="0.01" min="0" name="nitrogen" value={form.nitrogen} onChange={handleFormChange} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Phosphorus (P)</label>
                                    <input type="number" step="0.01" min="0" name="phosphorus" value={form.phosphorus} onChange={handleFormChange} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Potassium (K)</label>
                                    <input type="number" step="0.01" min="0" name="potassium" value={form.potassium} onChange={handleFormChange} className={inputClass} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelClass}>Soil pH (0–14)</label>
                                    <input type="number" step="0.1" min="0" max="14" name="soilPH" value={form.soilPH} onChange={handleFormChange} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Moisture % (0–100)</label>
                                    <input type="number" step="0.1" min="0" max="100" name="soilMoisture" value={form.soilMoisture} onChange={handleFormChange} className={inputClass} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelClass}>Organic Carbon</label>
                                    <input type="number" step="0.01" min="0" name="organicCarbon" value={form.organicCarbon} onChange={handleFormChange} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Recorded At</label>
                                    <input type="datetime-local" name="recordedAt" value={form.recordedAt} onChange={handleFormChange} className={inputClass} />
                                </div>
                            </div>

                            {formError && <p className="text-red-500 text-xs">{formError}</p>}

                            <button
                            type="submit"
                            disabled={saving}
                            className={`w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-colors
                                ${saving ? "bg-primary-400 cursor-not-allowed" : "bg-primary-600 hover:bg-primary-700"}`}
                            >
                                {saving ? "Saving..." : editingId ? "Save Changes" : "Add Reading"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Soil;
import { useState, useEffect } from "react";
import { MdAdd, MdDelete, MdEdit, MdClose, MdSettings } from "react-icons/md";
import { getSystemSettings, upsertSystemSetting, deleteSystemSetting } from "../services/adminManagementAPI";
import { toastSuccess, toastError } from "../utils/toast";

const inputClass = "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 bg-gray-50 focus:bg-white";
const labelClass = "text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block";

const emptyForm = { key: "", description: "", category: "NOTIFICATIONS", valueJson: "{}" };

const SystemSettings = () => {
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingKey, setEditingKey] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [formError, setFormError] = useState("");
    const [saving, setSaving] = useState(false);

    const load = async () => {
        setLoading(true);
        const result = await getSystemSettings();
        if (result.success) setSettings(result.settings);
        else setError(result.error);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const openAdd = () => {
        setEditingKey(null);
        setForm(emptyForm);
        setFormError("");
        setShowModal(true);
    };

    const openEdit = (setting) => {
        setEditingKey(setting.key);
        setForm({
            key: setting.key,
            description: setting.description || "",
            category: setting.category || "NOTIFICATIONS",
            valueJson: JSON.stringify(setting.value, null, 2)
        });
        setFormError("");
        setShowModal(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.key.trim()) {
            setFormError("Key is required.");
            return;
        }

        let parsedValue;
        try {
            parsedValue = JSON.parse(form.valueJson);
        } catch {
            setFormError('Value must be valid JSON — e.g. {"cooldown": 12}');
            return;
        }

        setSaving(true);
        setFormError("");

        const result = await upsertSystemSetting({
            key: form.key.trim(),
            value: parsedValue,
            description: form.description.trim(),
            category: form.category.trim() || "GENERAL"
        });

        setSaving(false);

        if (result.success) {
            setShowModal(false);
            toastSuccess(editingKey ? "Setting updated." : "Setting added.");
            load();
        } else {
            setFormError(result.error);
            toastError(resule.error || "Could not save the setting. Please try again.");
        }
    };

    const handleDelete = async (key) => {
        if (!window.confirm(`Delete setting "${key}"?`)) return;
        const result = await deleteSystemSetting(key);
        if (result.success) {
            setSettings((prev) => prev.filter((s) => s.key !== key));
            toastSuccess("Setting deleted.");
        } else {
            toastError(result.error || "Could not delete the setting. Please try again.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">System Settings</h1>
                    <p className="text-gray-500 text-sm mt-1">Platform-wide configuration — Admin only.</p>
                </div>
                <button
                onClick={openAdd}
                className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                    <MdAdd className="text-lg" /> Add Setting
                </button>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}

            {loading ? (
                <div className="space-y-3">
                    {[1, 2].map((i) => <div key={i} className="bg-gray-100 rounded-2xl h-24 animate-pulse" />)}
                </div>
            ) : settings.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                    <MdSettings className="text-5xl text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium mb-1">No settings configured yet</p>
                    <p className="text-gray-400 text-sm">Add your first platform setting.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {settings.map((s) => (
                        <div key={s.key} className="bg-white rounded-2xl border border-gray-100 p-5">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-gray-800 font-semibold text-sm">{s.key}</p>
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{s.category}</span>
                                    </div>
                                    {s.description && <p className="text-gray-400 text-xs mt-1">{s.description}</p>}
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => openEdit(s)} className="p-1.5 text-gray-400 hover:text-primary-600 transition-colors" aria-label="Edit setting">
                                        <MdEdit className="text-sm" />
                                    </button>
                                    <button onClick={() => handleDelete(s.key)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" aria-label="Delete setting">
                                        <MdDelete className="text-sm" />
                                    </button>
                                </div>
                            </div>
                            <pre className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600 overflow-x-auto">
                                {JSON.stringify(s.value, null, 2)}
                            </pre>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-800">{editingKey ? "Edit Setting" : "Add Setting"}</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close">
                                <MdClose />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-3">
                            <div>
                                <label className={labelClass}>Key</label>
                                <input
                                type="text" name="key" value={form.key} onChange={handleChange}
                                placeholder="e.g. weather_alert_thresholds"
                                disabled={!!editingKey}
                                className={`${inputClass} ${editingKey ? "cursor-not-allowed opacity-60" : ""}`}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Category</label>
                                <input type="text" name="category" value={form.category} onChange={handleChange} placeholder="NOTIFICATIONS" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Description</label>
                                <input type="text" name="description" value={form.description} onChange={handleChange} placeholder="What this setting controls" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Value (JSON)</label>
                                <textarea
                                name="valueJson" value={form.valueJson} onChange={handleChange} rows={5}
                                className={`${inputClass} font-mono text-xs`}
                                placeholder='{"cooldown": 12, "cooldownUnit": "hours"}'
                                />
                            </div>

                            {formError && <p className="text-red-500 text-xs">{formError}</p>}

                            <button
                            type="submit"
                            disabled={saving}
                            className={`w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-colors
                                ${saving ? "bg-primary-400 cursor-not-allowed" : "bg-primary-600 hover:bg-primary-700"}`}
                            >
                                {saving ? "Saving..." : "Save Setting"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SystemSettings;
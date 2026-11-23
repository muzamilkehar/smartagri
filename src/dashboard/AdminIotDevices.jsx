import { useState, useEffect } from "react";
import { MdAdd, MdSensors, MdClose, MdAssignmentInd } from "react-icons/md";
// FIXED: Changed ../../ to ../ for services and utils
import { 
    getAllIotDevices, 
    registerIotDevice, 
    assignIotDevice, 
    getAllFarmers, 
    getFarmerDetails 
} from "../services/adminManagementAPI";
import { toastSuccess, toastError } from "../utils/toast";

const inputClass = "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 bg-gray-50 focus:bg-white";
const labelClass = "text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block";

const AdminIotDevices = () => {
    const [devices, setDevices] = useState([]);
    const [farmers, setFarmers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState("register"); // "register" | "assign"
    const [selectedDevice, setSelectedDevice] = useState(null);
    
    // Form State
    const [formData, setFormData] = useState({ name: "", userId: "", fieldId: "" });
    const [farmerFields, setFarmerFields] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [devRes, farmRes] = await Promise.all([
            getAllIotDevices(),
            getAllFarmers()
        ]);
        if (devRes.success) setDevices(devRes.devices);
        if (farmRes.success) setFarmers(farmRes.farmers);
        setLoading(false);
    };

    const handleFarmerChange = async (userId) => {
        setFormData(prev => ({ ...prev, userId, fieldId: "" }));
        if (!userId) { setFarmerFields([]); return; }
        
        const farmer = farmers.find(f => f.user?.id === userId);
        if (farmer) {
            const details = await getFarmerDetails(farmer.id);
            if (details.success) {
                setFarmerFields(details.farmer.fields || []);
            }
        }
    };

    const openRegisterModal = () => {
        setModalMode("register");
        setSelectedDevice(null);
        setFormData({ name: "", userId: "", fieldId: "" });
        setFarmerFields([]);
        setShowModal(true);
    };

    const openAssignModal = (device) => {
        setModalMode("assign");
        setSelectedDevice(device);
        setFormData({ name: device.name, userId: device.userId || "", fieldId: device.fieldId || "" });
        setFarmerFields([]);
        if (device.userId) {
            handleFarmerChange(device.userId);
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return toastError("Device name is required.");
        
        setSaving(true);
        let result;

        if (modalMode === "register") {
            result = await registerIotDevice(formData.name, formData.userId, formData.fieldId);
        } else {
            result = await assignIotDevice(selectedDevice.deviceCode, formData.userId, formData.fieldId);
        }

        setSaving(false);

        if (result.success) {
            setShowModal(false);
            toastSuccess(modalMode === "register" ? "Device registered!" : "Device assigned successfully!");
            loadData();
        } else {
            toastError(result.error);
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Loading IoT devices...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">IoT Device Management</h1>
                    <p className="text-gray-500 text-sm mt-1">Register hardware and assign sensors to farmers.</p>
                </div>
                <button onClick={openRegisterModal} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors">
                    <MdAdd className="text-lg" /> Register New Device
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {devices.length === 0 ? (
                    <div className="col-span-full bg-white rounded-2xl border border-gray-100 p-10 text-center">
                        <MdSensors className="text-5xl text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-600 font-medium">No devices registered yet.</p>
                    </div>
                ) : (
                    devices.map(device => (
                        <div key={device.id} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-gray-800 font-bold text-base">{device.name}</h3>
                                    <p className="text-gray-400 text-xs font-mono">{device.deviceCode}</p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${device.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {device.status}
                                </span>
                            </div>
                            
                            <div className="bg-gray-50 rounded-xl p-3 text-sm">
                                <p className="text-gray-500 text-xs mb-1">Assigned To</p>
                                <p className="font-medium text-gray-800">
                                    {device.farmer?.user?.fullName || "Unassigned"}
                                </p>
                                {device.field && (
                                    <p className="text-gray-500 text-xs mt-1">Field: {device.field.name}</p>
                                )}
                            </div>

                            <button onClick={() => openAssignModal(device)} className="w-full flex items-center justify-center gap-2 py-2 border border-primary-600 text-primary-600 rounded-xl text-sm font-medium hover:bg-primary-50 transition-colors">
                                <MdAssignmentInd /> Reassign Device
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <div className="flex justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-800">
                                {modalMode === "register" ? "Register New IoT Device" : "Assign IoT Device"}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><MdClose /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className={labelClass}>Device Name</label>
                                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Field A Sensor" className={inputClass} disabled={modalMode === "assign"} />
                                {modalMode === "assign" && <p className="text-xs text-gray-400 mt-1">Device Code: {selectedDevice.deviceCode}</p>}
                            </div>
                            <div>
                                <label className={labelClass}>Assign to Farmer</label>
                                <select value={formData.userId} onChange={e => handleFarmerChange(e.target.value)} className={inputClass}>
                                    <option value="">Select a Farmer...</option>
                                    {farmers.map(f => (
                                        <option key={f.user?.id} value={f.user?.id}>{f.user?.fullName} ({f.user?.email})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Assign to Field (Optional)</label>
                                <select value={formData.fieldId} onChange={e => setFormData({...formData, fieldId: e.target.value})} className={inputClass} disabled={!formData.userId || farmerFields.length === 0}>
                                    <option value="">Select a Field...</option>
                                    {farmerFields.map(f => (
                                        <option key={f.id} value={f.id}>{f.name}</option>
                                    ))}
                                </select>
                            </div>
                            <button type="submit" disabled={saving} className={`w-full py-3 rounded-xl text-sm font-semibold text-white ${saving ? 'bg-primary-400' : 'bg-primary-600 hover:bg-primary-700'}`}>
                                {saving ? "Saving..." : modalMode === "register" ? "Register Device" : "Save Assignment"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminIotDevices;
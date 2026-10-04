import { useState, useEffect } from "react";
import { FaUser, FaUserShield, FaEnvelope, FaTrash, FaMapMarkerAlt, FaCheckCircle } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { useAuth } from "../context/AuthContext";
import { getAllFarmers, getFarmerDetails, deleteFarmer } from "../services/adminManagementAPI";
import { toastSuccess, toastError } from "../utils/toast";

const Users = () => {
    const { isAdmin } = useAuth();
    const [farmers, setFarmers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedFarmer, setSelectedFarmer] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const result = await getAllFarmers();
            if (result.success) setFarmers(result.farmers);
            else setError(result.error);
            setLoading(false);
        };
        load();
    }, []);

    const openDetails = async (farmerId) => {
        setLoadingDetails(true);
        setSelectedFarmer({ id: farmerId });
        const result = await getFarmerDetails(farmerId);
        setLoadingDetails(false);
        if (result.success) setSelectedFarmer(result.farmer);
        else {
            toastError(result.error || "Could not fetch farmer details. Please try again.");
            setSelectedFarmer(null);
        }
    };

    const handleDelete = async (farmerId, e) => {
        e?.stopPropagation();
        if (!window.confirm("Delete this farmer? This can't be undone.")) return;
        const result = await deleteFarmer(farmerId);
        if (result.success) {
            setFarmers((prev) => prev.filter((f) => f.id !== farmerId));
            if (selectedFarmer?.id === farmerId) setSelectedFarmer(null);
            toastSuccess("Farmer deleted successfully.");
        } else {
            toastError(result.error || "Could not delete the farmer. Please try again.");
        }
    };

    if (!isAdmin) return null;

    const totalFields = farmers.reduce((sum, f) => sum + (f._count?.fields || 0), 0);
    const verifiedCount = farmers.filter((f) => f.user?.isEmailVerified).length;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
                <p className="text-gray-500 text-sm mt-1">Manage all registered farmers — Admin only.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: "Total Farmers", value: farmers.length, color: "bg-primary-50 text-primary-600", icon: <FaUser /> },
                    { label: "Email Verified", value: verifiedCount, color: "bg-green-50 text-green-600", icon: <FaCheckCircle /> },
                    { label: "Total Fields", value: totalFields, color: "bg-purple-50 text-purple-600", icon: <FaUserShield /> }
                ].map((stat) => (
                    <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5">
                        <div className={`${stat.color} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>{stat.icon}</div>
                        <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                        <p className="text-gray-500 text-sm">{stat.label}</p>
                    </div>
                ))}
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-gray-800 font-bold text-base">All Farmers</h2>
                </div>
                {loading ? (
                    <div className="p-6 space-y-3">
                        {[1, 2, 3].map((i) => <div key={i} className="bg-gray-100 rounded-xl h-14 animate-pulse" />)}
                    </div>
                ) : farmers.length === 0 ? (
                    <p className="text-gray-400 text-sm p-6">No farmers registered yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    {["Farmer", "Email", "Location", "Verified", "Fields", "Scans", ""].map((h) => (
                                        <th key={h} className="text-left text-xs font-semibold text-gray-500 px-6 py-3 uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {farmers.map((f) => (
                                    <tr key={f.id} onClick={() => openDetails(f.id)} className="hover:bg-gray-50 transition-colors cursor-pointer">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold bg-primary-500">
                                                    {f.user?.fullName?.[0]?.toUpperCase() || "?"}
                                                </div>
                                                <span className="text-sm font-medium text-gray-800">{f.user?.fullName || "Unnamed"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                                <FaEnvelope className="text-gray-400 text-xs" />
                                                {f.user?.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{f.city || "—"}</td>
                                        <td className="px-6 py-4">
                                            {f.user?.isEmailVerified ? (
                                                <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold">Verified</span>
                                            ) : (
                                                <span className="bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full text-xs font-semibold">Unverified</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-800">{f._count?.fields ?? 0}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-800">{f._count?.diseasePredictions ?? 0}</td>
                                        <td className="px-6 py-4">
                                            <button onClick={(e) => handleDelete(f.id, e)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" aria-label="Delete farmer">
                                                <FaTrash className="text-xs" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {selectedFarmer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-800">Farmer Details</h3>
                            <button onClick={() => setSelectedFarmer(null)} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close">
                                <MdClose />
                            </button>
                        </div>

                        {loadingDetails ? (
                            <p className="text-gray-400 text-sm">Loading...</p>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <p className="text-gray-800 font-bold text-lg">{selectedFarmer.user?.fullName}</p>
                                    <p className="text-gray-500 text-sm">{selectedFarmer.user?.email}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-gray-50 rounded-xl p-3">
                                        <p className="text-gray-400 text-xs">Fields</p>
                                        <p className="text-gray-800 font-semibold text-sm">{selectedFarmer.fields?.length ?? 0}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-3">
                                        <p className="text-gray-400 text-xs">Location</p>
                                        <p className="text-gray-800 font-semibold text-sm">{selectedFarmer.city || "Not set"}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-3">
                                        <p className="text-gray-400 text-xs">Disease Scans</p>
                                        <p className="text-gray-800 font-semibold text-sm">{selectedFarmer.predictionCounts?.diseasePredictions ?? 0}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-3">
                                        <p className="text-gray-400 text-xs">Yield Predictions</p>
                                        <p className="text-gray-800 font-semibold text-sm">{selectedFarmer.predictionCounts?.yieldPredictions ?? 0}</p>
                                    </div>
                                </div>

                                {selectedFarmer.fields?.length > 0 && (
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 mb-2">Fields</p>
                                        <div className="space-y-2">
                                            {selectedFarmer.fields.map((field) => (
                                                <div key={field.id} className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                                                    <FaMapMarkerAlt className="text-gray-400 text-xs" />
                                                    <p className="text-gray-700 text-sm">{field.name}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <button
                                onClick={() => handleDelete(selectedFarmer.id)}
                                className="w-full py-2.5 rounded-xl text-sm font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
                                >
                                    Delete This Farmer
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
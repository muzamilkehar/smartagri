import { useState, useEffect } from "react";
import { MdPeople, MdOutlineImageSearch, MdTerrain, MdWaterDrop } from "react-icons/md";
import { GiWheat } from "react-icons/gi";
import { FaLeaf } from "react-icons/fa";
import { getAdminDashboard, getDiseaseAnalyticsAdmin } from "../services/adminAnalyticsAPI";

const AdminAnalytics = () => {
    const [dashboard, setDashboard] = useState(null);
    const [diseaseStats, setDiseaseStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const [dashResult, diseaseResult] = await Promise.all([getAdminDashboard(), getDiseaseAnalyticsAdmin()]);
            if (dashResult.success) setDashboard(dashResult.data);
            else setError(dashResult.error);
            if (diseaseResult.success) setDiseaseStats(diseaseResult.data);
            setLoading(false);
        };
        load();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Platform Analytics</h1>
                    <p className="text-gray-500 text-sm mt-1">Loading platform-wide statistics...</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => <div key={i} className="bg-gray-100 rounded-2xl h-28 animate-pulse" />)}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div><h1 className="text-2xl font-bold text-gray-800">Platform Analytics</h1></div>
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
            </div>
        );
    }

    const stats = dashboard?.stats || {};

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Platform Analytics</h1>
                <p className="text-gray-500 text-sm mt-1">Platform-wide statistics across all farmers.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: "Total Users", value: stats.totalUsers, icon: <MdPeople className="text-2xl" />, color: "bg-purple-50 text-purple-600", border: "border-purple-100" },
                    { label: "Total Farmers", value: stats.totalFarmers, icon: <FaLeaf className="text-2xl" />, color: "bg-primary-50 text-primary-600", border: "border-primary-100" },
                    { label: "Total Fields", value: stats.totalFields, icon: <MdTerrain className="text-2xl" />, color: "bg-amber-50 text-amber-600", border: "border-amber-100" },
                    { label: "Total Crops", value: stats.totalCrops, icon: <GiWheat className="text-2xl" />, color: "bg-green-50 text-green-600", border: "border-green-100" },
                    { label: "Active Crops", value: stats.activeCrops, icon: <GiWheat className="text-2xl" />, color: "bg-green-50 text-green-600", border: "border-green-100" },
                    { label: "Disease Scans", value: stats.totalDiseasePredictions, icon: <MdOutlineImageSearch className="text-2xl" />, color: "bg-red-50 text-red-600", border: "border-red-100" },
                    { label: "Yield Predictions", value: stats.totalYieldPredictions, icon: <GiWheat className="text-2xl" />, color: "bg-blue-50 text-blue-600", border: "border-blue-100" },
                    { label: "Soil Records", value: stats.totalSoilRecords, icon: <MdWaterDrop className="text-2xl" />, color: "bg-cyan-50 text-cyan-600", border: "border-cyan-100" }
                ].map((stat) => (
                    <div key={stat.label} className={`bg-white rounded-2xl p-5 border ${stat.border}`}>
                        <div className={`${stat.color} p-2.5 rounded-xl w-fit mb-3`}>{stat.icon}</div>
                        <p className="text-2xl font-bold text-gray-800 mb-0.5">{stat.value ?? 0}</p>
                        <p className="text-gray-500 text-xs font-medium">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <h3 className="text-gray-800 font-semibold text-sm mb-3">Recent Farmers</h3>
                    {(!dashboard?.recentFarmers || dashboard.recentFarmers.length === 0) ? (
                        <p className="text-gray-400 text-xs">No farmers yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {dashboard.recentFarmers.map((f) => (
                                <div key={f.id} className="bg-gray-50 rounded-xl p-3">
                                    <p className="text-gray-800 font-medium text-sm">{f.user?.fullName}</p>
                                    <p className="text-gray-400 text-xs">{f.city || "Location not set"}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <h3 className="text-gray-800 font-semibold text-sm mb-3">Disease Distribution</h3>
                    {(!diseaseStats?.diseaseDistribution || diseaseStats.diseaseDistribution.length === 0) ? (
                        <p className="text-gray-400 text-xs">No disease predictions yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {diseaseStats.diseaseDistribution.map((d) => (
                                <div key={d.diseaseName} className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                                    <p className="text-gray-800 font-medium text-sm capitalize">{d.diseaseName.replace(/_/g, " ")}</p>
                                    <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-semibold">{d.count}</span>
                                </div>
                            ))}
                            {diseaseStats.averageConfidence != null && (
                                <p className="text-gray-400 text-xs mt-2">Average confidence: {diseaseStats.averageConfidence.toFixed(1)}%</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-gray-800 font-bold text-base">Recent Disease Scans (All Farmers)</h2>
                </div>
                {(!dashboard?.recentDiseasePredictions || dashboard.recentDiseasePredictions.length === 0) ? (
                    <p className="text-gray-400 text-sm p-6">No disease scans yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    {["Farmer", "Crop", "Disease", "Confidence", "Date"].map((h) => (
                                        <th key={h} className="text-left text-xs font-semibold text-gray-500 px-6 py-3 uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {dashboard.recentDiseasePredictions.map((p) => (
                                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-800">{p.farmer?.user?.fullName || "—"}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{p.crop?.cropName || "—"}</td>
                                        <td className="px-6 py-4 text-sm text-gray-800 capitalize">{p.diseaseName?.replace(/_/g, " ")}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{p.confidence?.toFixed(1)}%</td>
                                        <td className="px-6 py-4 text-xs text-gray-400">{new Date(p.predictionDate).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAnalytics;
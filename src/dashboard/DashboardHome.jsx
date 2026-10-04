import { useState, useEffect } from "react";
import {
    MdOutlineImageSearch,
    MdWaterDrop,
    MdWbSunny,
    MdPeople,
    MdTerrain,
    MdArrowForward,
    MdBarChart,
    MdRefresh
} from "react-icons/md";
import { GiWheat } from "react-icons/gi";
import { FaLeaf, FaUserShield, FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getFarmerDashboard } from "../services/farmerAnalyticsAPI";
import { getAdminDashboard } from "../services/adminAnalyticsAPI";
import { toastError } from "../utils/toast";
import EmailVerificationBanner from "../components/EmailVerificationBanner";

const confidenceBadge = (c) => {
    if (c >= 80) return { label: "High Risk", className: "bg-red-100 text-red-700" };
    if (c >= 50) return { label: "Medium Risk", className: "bg-orange-100 text-orange-700" };
    return { label: "Low Risk", className: "bg-green-100 text-green-700" };
};

const DashboardHome = () => {
    const { isAdmin, currentUser } = useAuth();

    const [farmerDashboard, setFarmerDashboard] = useState(null);
    const [adminDashboard, setAdminDashboard]   = useState(null);
    const [loading, setLoading]                 = useState(true);
    const [error, setError]                     = useState("");

    const loadFarmer = async () => {
        setLoading(true);
        setError("");
        const res = await getFarmerDashboard();
        if (res.success) setFarmerDashboard(res.data);
        else { setFarmerDashboard(null); setError(res.error || "Could not load your dashboard."); }
        setLoading(false);
    };

    const loadAdmin = async () => {
        setLoading(true);
        setError("");
        const res = await getAdminDashboard();
        if (res.success) setAdminDashboard(res.data);
        else { setAdminDashboard(null); setError(res.error || "Could not load admin dashboard."); }
        setLoading(false);
    };

    useEffect(() => {
        if (isAdmin) loadAdmin();
        else loadFarmer();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAdmin]);

    const firstName = currentUser?.fullName?.split(" ")[0] || "there";

    /* ============================================================
       ADMIN VIEW
       ============================================================ */
    if (isAdmin) {
        const stats = adminDashboard?.stats || {};
        const recentFarmers = adminDashboard?.recentFarmers || [];
        const recentDiseasePredictions = adminDashboard?.recentDiseasePredictions || [];
        const recentYieldPredictions = adminDashboard?.recentYieldPredictions || [];

        const adminStats = [
            { label: "Total Users",           value: stats.totalUsers,              icon: <MdPeople className="text-2xl" />,             color: "bg-purple-50 text-purple-600", border: "border-purple-100" },
            { label: "Total Farmers",         value: stats.totalFarmers,            icon: <FaLeaf className="text-2xl" />,               color: "bg-primary-50 text-primary-600", border: "border-primary-100" },
            { label: "Total Fields",          value: stats.totalFields,             icon: <MdTerrain className="text-2xl" />,            color: "bg-amber-50 text-amber-600",   border: "border-amber-100" },
            { label: "Total Crops",           value: stats.totalCrops,              icon: <GiWheat className="text-2xl" />,              color: "bg-green-50 text-green-600",   border: "border-green-100" },
            { label: "Active Crops",          value: stats.activeCrops,             icon: <GiWheat className="text-2xl" />,              color: "bg-green-50 text-green-600",   border: "border-green-100" },
            { label: "Disease Scans",         value: stats.totalDiseasePredictions, icon: <MdOutlineImageSearch className="text-2xl" />, color: "bg-red-50 text-red-600",       border: "border-red-100" },
            { label: "Yield Predictions",     value: stats.totalYieldPredictions,   icon: <MdWbSunny className="text-2xl" />,            color: "bg-blue-50 text-blue-600",     border: "border-blue-100" },
            { label: "Soil Records",          value: stats.totalSoilRecords,        icon: <MdWaterDrop className="text-2xl" />,          color: "bg-cyan-50 text-cyan-600",     border: "border-cyan-100" }
        ];

        return (
            <div className="space-y-6">
                <EmailVerificationBanner />
                {/* Role badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                    <FaUserShield /> Administrator Account
                </div>

                {/* Hero */}
                <div className="rounded-2xl p-6 text-white relative overflow-hidden bg-gradient-to-br from-purple-800 to-purple-600">
                    <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
                    <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <FaLeaf className="text-green-300" />
                            <span className="text-sm text-purple-200">Smart Agriculture Platform.</span>
                        </div>
                        <h1 className="text-2xl font-bold mb-1">Hi there! {firstName}! 🌱</h1>
                        <p className="text-sm text-purple-200">
                            You have full admin access. Monitoring all platform activity.
                        </p>
                        <div className="mt-4 flex items-center gap-3 flex-wrap">
                            <div className="bg-white/20 rounded-xl px-3 py-2">
                                <p className="text-white text-xs font-medium">
                                    {stats.totalFarmers ?? 0} Farmers
                                </p>
                            </div>
                            <div className="bg-white/20 rounded-xl px-3 py-2">
                                <p className="text-white text-xs font-medium">
                                    {stats.totalFields ?? 0} Fields
                                </p>
                            </div>
                            <div className="bg-white/20 rounded-xl px-3 py-2">
                                <p className="text-white text-xs font-medium">All Systems Live</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Refresh + error */}
                <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">Live platform-wide statistics.</p>
                    <button
                    onClick={loadAdmin}
                    className="flex items-center gap-1.5 text-xs font-medium text-purple-600 hover:text-purple-700
                    bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                        <MdRefresh className="text-base" /> Refresh
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                        {error}
                    </div>
                )}

                {/* Stat cards */}
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="bg-gray-100 rounded-2xl h-28 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {adminStats.map((stat) => (
                            <div key={stat.label} className={`bg-white rounded-2xl p-5 border ${stat.border} hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5`}>
                                <div className={`${stat.color} p-2.5 rounded-xl w-fit mb-3`}>{stat.icon}</div>
                                <p className="text-2xl font-bold text-gray-800 mb-0.5">{stat.value ?? 0}</p>
                                <p className="text-gray-500 text-xs font-medium">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Recent Farmers + Recent Yield Predictions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl border border-gray-100 p-5">
                        <h3 className="text-gray-800 font-semibold text-sm mb-3">Recent Farmers</h3>
                        {recentFarmers.length === 0 ? (
                            <p className="text-gray-400 text-xs">No farmers yet.</p>
                        ) : (
                            <div className="space-y-2">
                                {recentFarmers.map((f) => (
                                    <div key={f.id} className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                                            {f.user?.fullName?.[0]?.toUpperCase() || "?"}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-gray-800 font-medium text-sm truncate">
                                                {f.user?.fullName || "Unnamed"}
                                            </p>
                                            <p className="text-gray-400 text-xs truncate">
                                                {f.user?.email || "No email"}
                                                {f.city ? ` · ${f.city}` : ""}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 p-5">
                        <h3 className="text-gray-800 font-semibold text-sm mb-3">Recent Yield Predictions</h3>
                        {recentYieldPredictions.length === 0 ? (
                            <p className="text-gray-400 text-xs">No yield predictions yet.</p>
                        ) : (
                            <div className="space-y-2">
                                {recentYieldPredictions.map((p) => (
                                    <div key={p.id} className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                                        <div className="min-w-0">
                                            <p className="text-gray-800 font-medium text-sm capitalize truncate">
                                                {p.crop?.cropName?.toLowerCase() || "—"}
                                                {p.crop?.field?.name ? <span className="text-gray-400 font-normal"> · {p.crop.field.name}</span> : null}
                                            </p>
                                            <p className="text-gray-400 text-xs">
                                                {new Date(p.predictionDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                                            {p.predictedYield?.toFixed(2)} {p.yieldUnit || "tons"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Disease Scans across platform */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-gray-800 font-bold text-base">Recent Disease Scans (All Farmers)</h2>
                        <Link
                        to="/dashboard/admin-analytics"
                        className="text-xs font-medium text-purple-600 hover:text-purple-700 transition-colors"
                        >
                            View Analytics →
                        </Link>
                    </div>
                    {recentDiseasePredictions.length === 0 ? (
                        <p className="text-gray-400 text-sm p-6">No disease scans yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {["Farmer", "Crop", "Disease", "Confidence", "Date"].map((h) => (
                                            <th key={h} className="text-left text-xs font-semibold text-gray-500 px-6 py-3 uppercase tracking-wide">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {recentDiseasePredictions.map((p) => {
                                        const badge = confidenceBadge(p.confidence);
                                        return (
                                            <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 text-sm font-medium text-gray-800">
                                                    {p.farmer?.user?.fullName || "—"}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {p.crop?.cropName || "—"}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-800 capitalize">
                                                    {p.diseaseName?.replace(/_/g, " ")}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {p.confidence?.toFixed(2)}%
                                                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${badge.className}`}>
                                                        {badge.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-gray-400">
                                                    {new Date(p.predictionDate).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    /* ============================================================
       FARMER VIEW (unchanged from before)
       ============================================================ */
    const stats = farmerDashboard ? [
        { label: "My Fields",         value: farmerDashboard.statistics.fields,              icon: <MdTerrain className="text-2xl" />,            color: "bg-primary-50 text-primary-600", border: "border-primary-100", link: "/dashboard/fields" },
        { label: "Active Crops",      value: farmerDashboard.statistics.crops.active,        icon: <GiWheat className="text-2xl" />,              color: "bg-amber-50 text-amber-600",   border: "border-amber-100",   link: "/dashboard/fields" },
        { label: "Disease Scans",     value: farmerDashboard.statistics.predictions.disease, icon: <MdOutlineImageSearch className="text-2xl" />, color: "bg-red-50 text-red-600",       border: "border-red-100",     link: "/dashboard/disease" },
        { label: "Yield Predictions", value: farmerDashboard.statistics.predictions.yield,   icon: <MdWbSunny className="text-2xl" />,            color: "bg-blue-50 text-blue-600",     border: "border-blue-100",    link: "/dashboard/yield" }
    ] : [];

    return (
        <div className="space-y-6">
            <EmailVerificationBanner />

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-700">
                <FaUser /> Farmer Account
            </div>

            <div className="rounded-2xl p-6 text-white relative overflow-hidden bg-gradient-to-br from-primary-800 to-primary-600">
                <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full" />
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <FaLeaf className="text-green-300" />
                        <span className="text-sm text-primary-200">Smart Agriculture Platform.</span>
                    </div>
                    <h1 className="text-2xl font-bold mb-1">Hi there! {firstName}! 🌱</h1>
                    <p className="text-sm text-primary-200">Welcome to your personal farming dashboard</p>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => <div key={i} className="bg-gray-100 rounded-2xl h-28 animate-pulse" />)}
                </div>
            ) : error || !farmerDashboard ? (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                    {error || "Could not load your dashboard."} Please refresh the page, and if the problem persists, sign out and sign in again.
                </div>
            ) : farmerDashboard.statistics.fields === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                    <MdTerrain className="text-5xl text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-700 font-semibold mb-1">Let's get your farm set up</p>
                    <p className="text-gray-400 text-sm mb-4">Add your first field to start tracking crops, soil, disease, and yield.</p>
                    <Link to="/dashboard/fields" className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors">
                        Add a Field <MdArrowForward />
                    </Link>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.map((stat) => (
                            <Link
                            to={stat.link}
                            key={stat.label}
                            className={`bg-white rounded-2xl p-5 border ${stat.border} hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 block`}
                            >
                                <div className={`${stat.color} p-2.5 rounded-xl w-fit mb-3`}>{stat.icon}</div>
                                <p className="text-2xl font-bold text-gray-800 mb-0.5">{stat.value}</p>
                                <p className="text-gray-500 text-xs font-medium">{stat.label}</p>
                            </Link>
                        ))}
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-gray-800 font-bold text-base">My Recent Disease Scans</h2>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-100 text-primary-700">
                                {farmerDashboard.recent.diseasePredictions.length} scans
                            </span>
                        </div>

                        {farmerDashboard.recent.diseasePredictions.length === 0 ? (
                            <p className="text-gray-400 text-sm p-6">No disease scans yet.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            {["Crop", "Disease", "Confidence", "Risk", "Date"].map((h) => (
                                                <th key={h} className="text-left text-xs font-semibold text-gray-500 px-6 py-3 uppercase tracking-wide">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {farmerDashboard.recent.diseasePredictions.map((p) => {
                                            const badge = confidenceBadge(p.confidence);
                                            return (
                                                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{p.crop?.cropName || "—"}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-800 capitalize">{p.diseaseName?.replace(/_/g, " ")}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">{p.confidence?.toFixed(2)}%</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badge.className}`}>{badge.label}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-gray-400">{new Date(p.predictionDate).toLocaleDateString()}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="bg-white rounded-2xl border border-gray-100 p-5">
                            <h3 className="text-gray-800 font-semibold text-sm mb-3">Recent Fields</h3>
                            {farmerDashboard.recent.fields.length === 0 ? (
                                <p className="text-gray-400 text-xs">No fields yet.</p>
                            ) : (
                                <div className="space-y-2">
                                    {farmerDashboard.recent.fields.map((f) => (
                                        <div key={f.id} className="bg-gray-50 rounded-xl p-3">
                                            <p className="text-gray-800 font-medium text-sm">{f.name}</p>
                                            <p className="text-gray-400 text-xs">{f.area} {f.areaUnit?.toLowerCase()} · {f.soilType?.toLowerCase()}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 p-5">
                            <h3 className="text-gray-800 font-semibold text-sm mb-3">Recent Crops</h3>
                            {farmerDashboard.recent.crops.length === 0 ? (
                                <p className="text-gray-400 text-xs">No crops yet.</p>
                            ) : (
                                <div className="space-y-2">
                                    {farmerDashboard.recent.crops.map((c) => (
                                        <div key={c.id} className="bg-gray-50 rounded-xl p-3">
                                            <p className="text-gray-800 font-medium text-sm capitalize">
                                                {c.cropName?.toLowerCase()} <span className="text-gray-400 font-normal">· {c.field?.name}</span>
                                            </p>
                                            <p className="text-gray-400 text-xs capitalize">{c.season?.toLowerCase()} · {c.status?.toLowerCase()}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default DashboardHome;
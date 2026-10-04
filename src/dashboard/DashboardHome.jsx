import { useState, useEffect } from "react";
import { MdOutlineImageSearch, MdWaterDrop, MdWbSunny, MdPeople, MdTerrain, MdArrowForward } from "react-icons/md";
import { GiWheat } from "react-icons/gi";
import { FaLeaf, FaUserShield, FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getFarmerDashboard } from "../services/farmerAnalyticsAPI";

const confidenceBadge = (c) => {
    if (c >= 80) return { label: "High Risk", className: "bg-red-100 text-red-700" };
    if (c >= 50) return { label: "Medium Risk", className: "bg-orange-100 text-orange-700" };
    return { label: "Low Risk", className: "bg-green-100 text-green-700" };
};

// Admin stats/scans stay as placeholders until the Admin Analytics module is built
const adminStats = [
    { label: "Total Disease Scans",    value: "128", change: "+12 this week", icon: <MdOutlineImageSearch className="text-2xl" />, color: "bg-red-50 text-red-600",    border: "border-red-100"    },
    { label: "Total Yield Predictions",value: "45",  change: "+5 this week",  icon: <GiWheat className="text-2xl" />,             color: "bg-amber-50 text-amber-600", border: "border-amber-100" },
    { label: "Sensor Readings",  value: "1,240",change: "Live updating", icon: <MdWaterDrop className="text-2xl" />,         color: "bg-blue-50 text-blue-600",   border: "border-blue-100"  },
    { label: "Total Users",      value: "2",   change: "All time",      icon: <MdPeople className="text-2xl" />, color: "bg-purple-50 text-purple-600",border: "border-purple-100"}
];
const adminRecentScans = [
    { plant: "Tomato", disease: "Early Bright",    status: "Diseased", date: "Today, 10:30 AM", severity: "High" },
    { plant: "Wheat",  disease: "Healthy",         status: "Healthy",  date: "Today, 09:15 AM", severity: "None" },
    { plant: "Cotton", disease: "Leaf Curl Virus", status: "Diseased", date: "Yesterday 4:00 PM", severity: "Medium" }
];

const DashboardHome = () => {
    const { isAdmin, currentUser } = useAuth();
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isAdmin) { setLoading(false); return; }
        const load = async () => {
            setLoading(true);
            const result = await getFarmerDashboard();
            if (result.success) setDashboard(result.data);
            setLoading(false);
        };
        load();
    }, [isAdmin]);

    const stats = dashboard ? [
        { label: "My Fields", value: dashboard.statistics.fields, icon: <MdTerrain className="text-2xl" />, color: "bg-primary-50 text-primary-600", border: "border-primary-100", link: "/dashboard/fields" },
        { label: "Active Crops", value: dashboard.statistics.crops.active, icon: <GiWheat className="text-2xl" />, color: "bg-amber-50 text-amber-600", border: "border-amber-100", link: "/dashboard/fields" },
        { label: "Disease Scans", value: dashboard.statistics.predictions.disease, icon: <MdOutlineImageSearch className="text-2xl" />, color: "bg-red-50 text-red-600", border: "border-red-100", link: "/dashboard/disease" },
        { label: "Yield Predictions", value: dashboard.statistics.predictions.yield, icon: <MdWbSunny className="text-2xl" />, color: "bg-blue-50 text-blue-600", border: "border-blue-100", link: "/dashboard/yield" }
    ] : [];

    const firstName = currentUser?.fullName?.split(" ")[0] || "";

    return (
        <div className="space-y-6">

            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold
                ${isAdmin ? "bg-purple-100 text-purple-700" : "bg-primary-100 text-primary-700"}`}>
                {isAdmin ? <><FaUserShield />Administrator Account</> : <><FaUser />User Account</>}
            </div>

            <div className={`rounded-2xl p-6 text-white relative overflow-hidden
                ${isAdmin ? "bg-gradient-to-br from-purple-800 to-purple-600" : "bg-gradient-to-br from-primary-800 to-primary-600"}`}>
                <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full" />
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <FaLeaf className="text-green-300" />
                        <span className={`text-sm ${isAdmin ? "text-purple-200" : "text-primary-200"}`}>
                            Smart Agriculture Platform.
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold mb-1">Hi there! {firstName}! 🌱</h1>
                    <p className={`text-sm ${isAdmin ? "text-purple-200" : "text-primary-200"}`}>
                        {isAdmin ? "You have full admin access. Monitoring all platform activity." : "Welcome to your personal farming dashboard"}
                    </p>
                    {isAdmin && (
                        <div className="mt-4 flex items-center gap-4">
                            <div className="bg-white/20 rounded-xl px-3 py-2"><p className="text-white text-xs font-medium">2 Active Users</p></div>
                            <div className="bg-white/20 rounded-xl px-3 py-2"><p className="text-white text-xs font-medium">All System Live</p></div>
                        </div>
                    )}
                </div>
            </div>

            {isAdmin ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {adminStats.map((stat) => (
                            <div key={stat.label} className={`bg-white rounded-2xl p-5 border ${stat.border} hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5`}>
                                <div className={`${stat.color} p-2.5 rounded-xl w-fit mb-3`}>{stat.icon}</div>
                                <p className="text-2xl font-bold text-gray-800 mb-0.5">{stat.value}</p>
                                <p className="text-gray-500 text-xs font-medium">{stat.label}</p>
                                <p className="text-primary-500 text-xs mt-1">{stat.change}</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h2 className="text-gray-800 font-bold text-base">All Recent Disease Scans</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {["Plant", "Disease", "Status", "Severity", "Date"].map((h) => (
                                            <th key={h} className="text-left text-xs font-semibold text-gray-500 px-6 py-3 uppercase tracking-wide">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {adminRecentScans.map((scan, i) => (
                                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-800">{scan.plant}</td>
                                            <td className="px-6 py-4 text-sm text-gray-800">{scan.disease}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${scan.status === "Healthy" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{scan.status}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${scan.severity === "None" ? "bg-green-100 text-green-700" : scan.severity === "Low" ? "bg-yellow-100 text-yellow-700" : scan.severity === "Medium" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"}`}>{scan.severity}</span>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-400">{scan.date}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => <div key={i} className="bg-gray-100 rounded-2xl h-28 animate-pulse" />)}
                </div>
            ) : dashboard.statistics.fields === 0 ? (
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
                                {dashboard.recent.diseasePredictions.length} scans
                            </span>
                        </div>

                        {dashboard.recent.diseasePredictions.length === 0 ? (
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
                                        {dashboard.recent.diseasePredictions.map((p) => {
                                            const badge = confidenceBadge(p.confidence);
                                            return (
                                                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{p.crop?.cropName || "—"}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-800 capitalize">{p.diseaseName?.replace(/_/g, " ")}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">{p.confidence?.toFixed(1)}%</td>
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
                            {dashboard.recent.fields.length === 0 ? (
                                <p className="text-gray-400 text-xs">No fields yet.</p>
                            ) : (
                                <div className="space-y-2">
                                    {dashboard.recent.fields.map((f) => (
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
                            {dashboard.recent.crops.length === 0 ? (
                                <p className="text-gray-400 text-xs">No crops yet.</p>
                            ) : (
                                <div className="space-y-2">
                                    {dashboard.recent.crops.map((c) => (
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
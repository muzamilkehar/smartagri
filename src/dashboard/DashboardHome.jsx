import { MdOutlineImageSearch, MdWaterDrop, MdWbSunny, MdPeople } from "react-icons/md";
import { GiWheat } from "react-icons/gi";
import { FaArrowUp, FaLeaf, FaUserShield, FaUser } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";


const recentScans = [
    {plant: "Tomato", disease: "Early Bright",      status: "Diseased", date: "Today, 10:30 AM", severity: "High"},
    {plant: "Wheat",  disease: "Healthy",           status: "Healthy",  date: "Today, 09:15 AM", severity:"None"},
    {plant: "Cotton", disease: "Leaf Curl Virus",   status: "Diseased", date: "Yesterday 4:00 PM", severity:"Medium" }

];

const myScans = [
    {plant: "Tomato", disease: "Early Blight", status: "Diseased", date: "Today 10:30 AM", severity: "High" },
    {plant: "Wheat", disease: "Healthy", status: "Healthy", date: "Yesterday", severity: "None"}
];


const DashboardHome = () => {
    const {isAdmin, currentUser } = useAuth();

    // Admin sees all stats, user sees limited stats 

    const adminStats = [
        { label: "Total Disease Scans",    value: "128", change: "+12 this week", icon: <MdOutlineImageSearch className="text-2xl" />, color: "bg-red-50 text-red-600",    border: "border-red-100"    },
        { label: "Total Yield Predictions",value: "45",  change: "+5 this week",  icon: <GiWheat className="text-2xl" />,             color: "bg-amber-50 text-amber-600", border: "border-amber-100" },
        { label: "Sensor Readings",  value: "1,240",change: "Live updating", icon: <MdWaterDrop className="text-2xl" />,         color: "bg-blue-50 text-blue-600",   border: "border-blue-100"  },
        { label: "Total Users",      value: "2",   change: "All time",      icon: <MdPeople className="text-2xl" />, color: "bg-purple-50 text-purple-600",border: "border-purple-100"}
    ];

    const userStats = [
        { label: "My Disease Scans",    value: "2",  change: "+1 this week", icon: <MdOutlineImageSearch className="text-2xl" />, color: "bg-red-50 text-red-600",    border: "border-red-100"   },
        { label: "My Yield Predictions",value: "3",  change: "This Month", icon: <GiWheat className="text-2xl" />,     color: "bg-amber-50 text-amber-600", border: "border-amber-100" },
        { label: "Sensor Readings",     value: "240", change: "Live updating", icon: <MdWaterDrop className="text-2xl" />,         color: "bg-blue-50 text-blue-600",   border: "border-blue-100"  },
        { label: "Weather Updates",     value: "30",  change: "Last 30 days", icon: <MdWbSunny className="text-2xl" />,           color: "bg-yellow-50 text-yellow-600",border: "border-yellow-100"}

    ];

    const displayStats = isAdmin? adminStats : userStats;
    const displayScans = isAdmin? recentScans: myScans; 

    
    return (
        <div className="space-y-6">

            {/* Role Badge */}
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold
                ${isAdmin
                    ? "bg-purple-100 text-purple-700" : "bg-primary-100 text-primary-700"
                }`}>
                    {isAdmin
                    ? <><FaUserShield />Administrator Account</>
                    : <><FaUser />User Account  </>
                }
                </div>

                {/* Welcome Banner */}

                <div className={`rounded-2xl p-6 text-white relative  overflow-hidden
                    ${isAdmin
                        ? "bg-gradient-to-br from-purple-800 to-purple-600" : "bg-gradient-to-br from-primary-800 to-primary-600"
                    }`}>
                        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
                        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <FaLeaf className="text-green-300"/>
                                <span className={`text-sm ${isAdmin ? "text-purple-200" : "text-primary-200"}`}>
                                    Smart Agriculture Platform.
                                </span>
                            </div>
                            <h1 className="text-2xl font-bold mb-1">
                                Hi there! {currentUser?.firstName}! 🌱
                            </h1>
                            <p className={`text-sm ${isAdmin? "text-purple-200": "text-primary-200"}`}>
                                {isAdmin
                                ? "You have full admin access. Monitoring all platform activity." : "Welcome to your personal farming dashboard"}
                            </p>

                            {/* Admin sees extra info banner */}
                            {isAdmin && (
                                <div className="mt-4 flex items-center gap-4">
                                    <div className="bg-white/20 rounded-xl px-3 py-2">
                                    <p className="text-white text-xs font-medium">2 Active Users</p>
                                    </div>
                                    <div className="bg-white/20 rounded-xl px-3 py-2">
                                    <p className="text-white text-xs font-medium">All System Live</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats Cards */}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {displayStats.map((stat) => ( 
                            <div
                            key={stat.label}
                            className={`bg-white rounded-2xl p-5 border ${stat.border} hover:shadow-lg transition-all
                            duration-300 hover:-translate-y-0.5`}
                            > 
                            <div className="flex items-center justify-between mb-3">
                                <div className={`${stat.color} p-2.5 rounded-xl`}>
                                    {stat.icon}
                                </div>
                                <span className="flex items-center gap-1 text-green-500 text-xs font-medium">
                                    <FaArrowUp className="text-xs"/>
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-gray-800 mb-0.5">{stat.value}</p>
                            <p className="text-gray-500 text-xs font-medium">{stat.label}</p>
                            <p className="text-primary-500 text-xs mt-1">{stat.change}</p>
                            </div>
                        ))}
                    </div>

                    {/* Admin sees all scans, Users sees only their own */}

                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-gray-800 font-bold text-base">
                                {isAdmin ? "All Recent Disease Scans" : "My Recent Disease Scan"}
                            </h2>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full
                                ${isAdmin
                                    ? "bg-purple-100 text-purple-700" : "bg-primary-100 text-primary-700"
                                }`}>
                                    {isAdmin ? `${recentScans.length}` : `${myScans.length} scans`}
                                </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {["Plant", "Disease", "Status", "Severity", "Date"].map((h) =>(
                                            <th key={h} className="text-left text-xs font-semibold text-gray-500 px-6 py-3 uppercase tracking-wide">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {displayScans.map((scan, i) =>(
                                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-800">{scan.plant}</td>
                                            <td className="px-6 py-4 text-sm text-gray-800">{scan.disease}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                                                    ${scan.status === "Healthy"? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                                        {scan.status}
                                                    </span>
                                                 </td>
                                                 <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold 
                                                        ${scan.severity === "None" ? "bg-green-100 text-green-700" :
                                                            scan.severity === "Low"? "bg-yellow-100 text-yellow-700" :
                                                            scan.severity === "Medium" ? "bg-orange-100 text-orange-700":
                                                            "bg-red-100 text-red-700"
                                                        }`}>
                                                            {scan.severity  }
                                                        </span>
                                                 </td>
                                                 <td className="px-6 py-4 text-xs text-gray-400">{scan.date}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* User sees upgrade notice */}

                            {!isAdmin && (
                                <div className="px-6 py-4 bg-primary-50 border-t border-primary-100">
                                    <p className="text-primary-600 text-xs">
                                        Showing your personal scans only. Contact admin for platform-wide data.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

        </div>
    );
};

export default DashboardHome;
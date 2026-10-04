import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GiPlantSeed, GiWheat } from "react-icons/gi";

import { MdDashboard, MdOutlineImageSearch, MdWaterDrop,
        MdWbSunny, MdPerson, MdMenu, MdClose, MdPeople,
        MdTerrain, MdBarChart, MdSettings
} from "react-icons/md";

import { FaSignOutAlt, FaUserShield, FaUser } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const getInitials = (name = "") =>
    name.trim().split(/\s+/).map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "U";

const DashboardLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { currentUser, logout, isAdmin } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Role-gated navigation:
    //   Farmer  → Dashboard, My Fields, Disease, Yield, Soil, Weather, Profile
    //   Admin   → Dashboard, User Management, Platform Analytics, System Settings, Profile
    const navItems = [
        { label: "Dashboard",          icon: <MdDashboard />,          path: "/dashboard",                 roles: ["admin", "farmer"] },
        // Farmer-only tools
        { label: "My Fields",          icon: <MdTerrain />,            path: "/dashboard/fields",          roles: ["farmer"] },
        { label: "Disease Detection",  icon: <MdOutlineImageSearch />, path: "/dashboard/disease",         roles: ["farmer"] },
        { label: "Yield Prediction",   icon: <GiWheat />,              path: "/dashboard/yield",           roles: ["farmer"] },
        { label: "Soil Monitoring",    icon: <MdWaterDrop />,          path: "/dashboard/soil",            roles: ["farmer"] },
        { label: "Weather Forecast",   icon: <MdWbSunny />,            path: "/dashboard/weather",         roles: ["farmer"] },
        // Admin-only tools
        { label: "User Management",    icon: <MdPeople />,             path: "/dashboard/users",           roles: ["admin"] },
        { label: "Platform Analytics", icon: <MdBarChart />,           path: "/dashboard/admin-analytics", roles: ["admin"] },
        { label: "System Settings",    icon: <MdSettings />,           path: "/dashboard/settings",        roles: ["admin"] },
        // Shared
        { label: "Profile",            icon: <MdPerson />,             path: "/dashboard/profile",         roles: ["admin", "farmer"] }
    ];

    const visibleItems = navItems.filter((item) =>
        item.roles.includes(currentUser?.role)
    );

    const handleLogout = async () => {
        await logout();
        navigate("/signin", { replace: true });
    };

    const firstName = currentUser?.fullName?.split(" ")[0] || "User";
    const roleLabel = isAdmin ? "Admin" : "Farmer";

    return (
        <div className="min-h-screen flex bg-gray-50">

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 h-full z-40 bg-primary-900 text-white flex
                flex-col transition-transform duration-300 w-64 ${isSidebarOpen ?
                    "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
            >

                {/* Logo */}
                <div className="flex items-center gap-3 px-4 py-5 border-b border-primary-700">
                    <div className="bg-white/20 p-2 rounded-xl flex-shrink-0">
                        <GiPlantSeed className="text-white text-xl" />
                    </div>
                    <div>
                        <p className="text-white font-bold text-sm leading-none">SmartAgri</p>
                        <p className="text-primary-300 text-xs">AI Platform</p>
                    </div>
                </div>

                {/* Role Badge */}
                <div className="px-4 py-3 border-b border-primary-700">
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${isAdmin ?
                        "bg-purple-500/20" : "bg-primary-500/20"}`}>
                        {isAdmin ? <FaUserShield className="text-purple-300 text-sm" />
                        : <FaUser className="text-primary-300 text-sm" />}
                        <div className="min-w-0">
                            <p className="text-white text-xs font-semibold truncate">
                                {currentUser?.fullName || "User"}
                            </p>
                            <p className={`text-xs capitalize font-medium ${isAdmin ?
                            "text-purple-300" : "text-primary-300"}`}>
                                {roleLabel}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 py-3 space-y-1 px-2 overflow-y-auto">
                    {visibleItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsSidebarOpen(false)}
                            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200
                                ${isActive ? "bg-white/20 text-white" : "text-primary-300 hover:bg-white/10 hover:text-white"}`}
                            >
                                <span className="text-xl flex-shrink-0">{item.icon}</span>
                                <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                                {isActive && (
                                    <span className="ml-auto w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="px-2 py-4 border-t border-primary-700">
                    <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl w-full text-primary-300 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200"
                    >
                        <FaSignOutAlt className="text-xl flex-shrink-0" />
                        <span className="text-sm font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:ml-64">

                {/* Top Bar */}
                <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4
                flex items-center justify-between sticky top-0 z-20">

                    <button
                    className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        {isSidebarOpen ? <MdClose className="text-xl" /> : <MdMenu className="text-xl" />}
                    </button>

                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <p className="text-gray-600 text-sm font-medium">
                            Welcome back,{" "}
                            <span className="text-primary-600 font-semibold">{firstName}</span>
                            {isAdmin && (
                                <span className="ml-2 bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                                    Admin
                                </span>
                            )}
                        </p>
                    </div>

                    <Link
                    to="/dashboard/profile"
                    aria-label="Open profile"
                    className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm text-white font-bold text-sm overflow-hidden
                        transition-transform hover:scale-105
                        ${isAdmin ? "bg-gradient-to-br from-purple-400 to-purple-600"
                                  : "bg-gradient-to-br from-primary-400 to-primary-600"}`}
                    >
                        {currentUser?.photoURL ? (
                            <img
                            src={currentUser.photoURL}
                            alt={currentUser.fullName || "Profile"}
                            className="w-full h-full object-cover"
                            />
                        ) : (
                            getInitials(currentUser?.fullName)
                        )}
                    </Link>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
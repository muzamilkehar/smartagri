import {FaUser, FaUserShield, FaEnvelope} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const allUsers = [
    {
        id: 1,
        name: "Admin User",
        email: "admin@smartagri.com",
        role: "admin",
        joined: "June 2026",
        scans: 128,
        status: "Active",
    },

    { 
        id: 2,
        name: "Muzamil Kehar",
        email: "user@smartagri.com",
        role: "user",
        joined: "Aug 2026",
        scans: 34,
        status: "Active"

    },
];

const Users = () => {
    const {isAdmin} =  useAuth();

    if(!isAdmin) return null;

    return (
        <div className="space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
                <p className="text-gray-500 text-sm mt-1">
                    Manage all registered users - Admin only.
                </p>
            </div>

            {/* Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: "Total Users",  value: "2",  color: "bg-primary-50 text-primary-600", icon: <FaUser /> },
                    { label: "Admins",       value: "1",  color: "bg-purple-50 text-purple-600",   icon: <FaUserShield /> },
                    { label: "Active Users", value: "2",  color: "bg-green-50 text-green-600",     icon: <FaUser /> },
                ].map((stat) =>(
                    <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5">
                        <div className={`${stat.color} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
                            {stat.icon}
                        </div>
                        <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                        <p className="text-gray-500 text-sm">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Users Table */}

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-gray-800 font-bold text-base">All Users</h2>
                </div>
                <div className="overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                {["User","Email", "Role", "Joined", "Scans", "Status"].map((h) => (
                                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-6 py-3 uppercase tracking-wide">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {allUsers.map((user) =>(
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs
                                                font-bold ${user.role === "admin" ? "bg-purple-500" : "bg-primary-500"}`}>
                                                    {user.name[0]}
                                                </div>
                                                <span className="text-sm font-medium text-gray-800">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                            <FaEnvelope className="text-gray-400 text-xs"/>
                                            {user.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${user.role === "admin"
                                            ? "bg-purple-100 text-purple-700" : "bg-primary-100 text-primary-700"
                                        }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{user.joined}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{user.scans}</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                                            {user.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Users;
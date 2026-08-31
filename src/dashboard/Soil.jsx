import{MdWaterDrop, MdThermostat, MdWater} from "react-icons/md";
import {FaWifi} from "react-icons/fa";
import { GiGroundSprout } from "react-icons/gi";


const sensors = [
    {
        label: "Soil Moisture",
        value: 68,
        unit: "%",
        icon: <MdWaterDrop className="text-2xl" />,
        color: "text-blue-600",
        bg: "bg-blue-50",
        bar: "bg-blue-500",
        status: "Optimal",
        statusColor: "text-green-600 bg-green-50", 
    },
    
    {
        label:  "Water Level",
        value:  45,
        unit:   "%",
        icon:   <MdWater className="text-2xl" />,
        color:  "text-cyan-600",
        bg:     "bg-cyan-50",
        bar:    "bg-cyan-500",
        status: "Low",
        statusColor: "text-orange-600 bg-orange-50",
    },

    {
        label:  "Soil Temperature",
        value:  72,
        unit:   "°C",
        icon:   <MdThermostat className="text-2xl" />,
        color:  "text-red-600",
        bg:     "bg-red-50",
        bar:    "bg-red-500",
        status: "High",
        statusColor: "text-red-600 bg-red-50",
    },

    {
        label:  "Humidity",
        value:  58,
        unit:   "%",
        icon:   <GiGroundSprout className="text-2xl" />,
        color:  "text-green-600",
        bg:     "bg-green-50",
        bar:    "bg-green-500",
        status: "Optimal",
        statusColor: "text-green-600 bg-green-50",
    },
];


const Soil = () => {
    return(
        <div className="space-y-6">

            {/* Header */}

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Soil Monitoring</h1>
                    <p className="text-gray-500 text-sm mt-1">Real-time Iot Sensor data from your field.</p>
                </div>
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-2 rounded-xl cursor-pointer">
                    <FaWifi className="text-green-600 text-sm animate-pulse" />
                    <span className="text-green-700 text-xs font-semibold ">Live</span>
                </div>
            </div>

            {/* Sensor Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {sensors.map((sensor, index) =>(
                    <div
                    key={sensor.label}
                    className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-all duration-300"
                    >
                        {/* Icon + Status */}
                        <div className="flex items-center justify-between mb-4">
                            <div className={`${sensor.bg} ${sensor.color} p-2.5 rounded-xl`}>
                                {sensor.icon}
                            </div>
                            <span className={`${sensor.statusColor} text-xs font-semibold px-2.5 py-1 rounded-full`}>
                                {sensor.status}
                            </span>
                        </div>

                        {/* Value */}
                        <p className="text-3xl font-bold text-gray-800 mb-0.5">
                            {sensor.value}
                            <span className="text-lg text-gray-400 font-normal">{sensor.unit}</span>
                        </p>
                        <p className="text-gray-500 text-xs font-medium mb-4">{sensor.label}</p>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div
                            className={`h-full rounded-full ${sensor.bar} transition-all duration-1000`}
                            style={{width: `${sensor.value}%`}}
                        /> 
                            
                        </div>
                    </div>
                ))}
            </div>

            {/* Sensor Table */}

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-gray-800 font-bold text-base">Sensor History</h2>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                {["Time", "Moisture", "Water Level", "Temperature", "Humidity", "Status"].map((h) => (
                                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-6 py-3 uppercase tracking-wide">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {[
                                { time: "10:00 AM", moisture: "68%", water: "45%", temp: "27°C", humidity: "58%", status: "Normal"  },
                                { time: "09:00 AM", moisture: "71%", water: "48%", temp: "26°C", humidity: "60%", status: "Normal"  },
                                { time: "08:00 AM", moisture: "65%", water: "42%", temp: "25°C", humidity: "55%", status: "Normal"  },
                                { time: "07:00 AM", moisture: "60%", water: "38%", temp: "24°C", humidity: "52%", status: "Warning" },
                                { time: "06:00 AM", moisture: "55%", water: "35%", temp: "23°C", humidity: "50%", status: "Warning" }
                            ].map((row, i) => (
                                <tr key={i} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-500">{row.time}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{row.moisture}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{row.water}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{row.temp}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{row.humidity}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                                            ${row.status === "Normal" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                                                {row.status}
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


export default Soil;
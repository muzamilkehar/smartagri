import { Link } from "react-router-dom";
import { MdOutlineImageSearch } from "react-icons/md";
import { GiWheat } from "react-icons/gi";
import { FaWater, FaCloudSun, FaArrowRight } from "react-icons/fa";


const features = [
    {
        icon: <MdOutlineImageSearch className="text-4xl text-primary-600"/>,
        title: "AI Disease Detector",
        color: "from-primary-50 to-primary-100",
        accent: "bg-primary-600",
        points:[
            "Upload any plant image",
            "Instant disease diagnosis",
            "Treatment Recommendations"
        ],
    },

    {
        icon: <GiWheat className="text-4xl text-amber-600"/>,
        title: "Crop Yield Prediction",
        color: "from-amber-50 to-amber-100",
        accent: "bg-amber-500",
        points: [
            "Enter field parameters",
            "AI yield estimation",
            "Season planning insights",
        ],
    },

    {
        icon: <FaWater className="text-4xl text-blue-600"/>,
        title: "Soil Monitoring",
        color: "from-blue-50 to-blue-100",
        accent: "bg-blue-500",
        points: [

            "Real-time moisture data",
            "Water level tracking",
            "IoT sensor integration",

        ],
    },

    {
        icon: <FaCloudSun className="text-4xl text-yellow-500"/>,
        title: "Weather Forecast",
        color: "from-yellow-50 to-yellow-100",
        accent: "bg-yellow-500",
        points: [
            "Live weather updates",
            "Rain probability alerts",
            "7-day forecast view",

        ],
    },

];


const FeaturesSection = () => {
    
    return( 
        <section id="features" className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">


        {/* Header Section*/}

        <div className="text-center mb-16">
            <span className="text-primary-600 font-semibold text-sm uppercase tracking-widest">
            Core Features
            </span>

        <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mt-2 mb-4">
            Everything You Need
        </h2>

        <p className="text-gray-500 max-w-2xl mx-auto text-base">
            Four AI Powerful Tools built Specifically for modern agriculture.
        </p>

        <div className="w-16 h-1 bg-primary-500 mx-auto mt-6 rounded-full"/>
        </div>
    
    {/* Feature Cards*/}

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature) => (
            <div

            key={feature.title}
            className={`bg-gradient-to-br ${feature.color} rounded-2xl p-6 hover:shadow-xl transition-all
            duration-300 hover:-translate-y-2 border border-white`}
            >
    
    
    {/* Icons*/}

    <div className="mb-5">
        {feature.icon}
    </div>


    {/* Title*/}

    <h3 className="text-gray-800 font-bold text-base mb-4">
        {feature.title}
    </h3>

    {/* Points*/}

    <ul className="space-y-2 mb-6">
        {feature.points.map((point) =>(
            <li key={point} className="flex items-center gap-2 text-sm text-gray-600">
                <span className={`w-1.5 h-1.5 rounded-full ${feature.accent} flex-shrink-0`}/>
                {point}
            </li>
        ))}
    </ul>


    <Link
        to="/signup"
        className="flex items-center gap-1 text-sm font-medium text-primary-700 hover:text-primary-900 transition-colors group">
            Try Now
        <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform"/>    
    </Link>
        </div>
        ))}
    </div>
        </div>
    </section>

    );

};


export default FeaturesSection;
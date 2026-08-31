import { FaBug, FaSeedling, FaWater, FaCloudSun } from "react-icons/fa";


const feature = [
    {
        icon:<FaBug className="text-3xl text-primary-600" />,
        title: "Plant Dieses Detection",
        description:
                "Upload a photo of your plant and our AI model instantly identifies diseases, tells you the severity, and recommends the best treatment — saving your crops before it's too late.",
            bg: "bg-primary-50",
            border: "border-primary-200"
    },

    {
        icon:<FaSeedling className="text-3xl text-green-600"/>,
        title: "Crop Yield Prediction",
        description:
            "Enter your field data like area, rainfall, and temperature. Our machine learning model predicts how much yield you can expect this season with high accuracy.",
        bg: "bg-green-50",
        border: "border-green-200",

    },

    {
        icon: <FaWater className="text-3xl text-blue-600" />,
        title: "Soil Monitoring",
        description:
            "Access hyperlocal weather forecasts including temperature, humidity, rainfall probability, and wind speed to plan your farming activities effectively.",
        bg: "bg-blue-50",
        border: "border-blue-200",
    },

    


];



const AboutSection = () => {
    return (
        <section id="about" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        
        {/* Section Header  */}

        <div className="text-center mb-16">
            <span className="text-primary-600 font-semibold text-sm uppercase tracking-widest">
                What We Offer
            </span>

            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mt-2 mb-4">
             About Out Platform
            </h2>

            <p className="text-gray-500 max-w-2xl mx-auto text-base leading-relaxed ">
             Our AI-powered smart agriculture platform brings cutting-edge technology
            directly to farmers, making precision agriculture accessible to everyone.
            </p>

            <div className="w-16 h-1 bg-primary-500 mx-auto mt-6 rounded-full" />
        </div>


        {/* Feature Cards  */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {feature.map((feature) => ( 
            <div 
                key={feature.title}
                className={`${feature.bg} ${feature.border} border rounded-2xl p-6 hover:shadow-lg transition-all duration-300 
                hover:-translate-y-1 group`}
            >

            <div className="mb-4 p-3 bg-white rounded-xl w-fit shadow-sm group-hover:shadow-md transition-shadow">
            {feature.icon}
            </div>

        <h3 className="text-gray-800 font-semibold text-base mb-2">
            {feature.title}
        </h3>
        
        <p className="text-gray-500 text-sm leading-relaxed">
            {feature.description}
        </p>
         </div>
    ))}
   
   </div>
    </div>
     </section>

    );
};

export default AboutSection;
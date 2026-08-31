import {Link} from "react-router-dom";  
import {FaLeaf, FaChevronDown, FaSun} from "react-icons/fa";
import {GiWheat, GiWaterDrop} from "react-icons/gi";
import farmVideo from "..//assets/farm-video.mp4";


const HeroSection = () => {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

            {/* Background Video */}
            <video 
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-0"
            >
                <source src={farmVideo} type="video/mp4"/>
            </video>

            {/*Background Overlay - keeps text readble over video*/}
            <div className="absolute inset-0 bg-none z-10"/>

            {/* Floating Icons */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
                <FaLeaf 
                className="absolute top-20 left-10 text-primary-300 text-4xl opacity-40 animate-bounce"
                style={{animationDelay: "0s", animationDuration: "3s"}}
                />

                <GiWheat 
                className="absolute top-40 right-20 text-primary-300 text-5xl opacity-40 animate-bounce"
                style={{ animationDelay: "1s", animationDuration: "4s"}}
                />

                <GiWaterDrop 
                className="absolute bottom-40 left-20 text-primary-300 text-4xl opacity-40 animate-bounce"
                style={{animationDelay: "1.5s", animationDuration: "3.5s"}}
                />

                <FaSun 
                className="absolute bottom-20 right-10 text-yellow-300 text-6xl opacity-40 animate-bounce"
                style={{animationDelay: "0.5s", animationDuration: "4s"}}
                />
            </div>

            {/* Main Content - Highest Layer */}
            <div className="relative z-30 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">

                {/* Badge */}

                <div className="inline-flex items-center gap-2 bg-white/10 backgrop-blur-sm 
                border border-white/20 rounded-full px-4 py-2 mb-6">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
                    <span className="text-white text-sm font-medium">
                    AI-Powered Agriculture Platform
                    </span>
                </div>

                {/* Main Heading */}
                <h1 className="text-4xl ms:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                    Smart Agriculture
                    <span className="block text-green-300 mt-2">
                        Assistant
                    </span>
                </h1>

                {/* Subheading */}

                <p className="text-white text-lg sm:text-xl max-w-3xl mx-auto mb-10 leading-relaxed">
                    AI-Powered Plant Disease Detection, Crop Yield Prediction,
                    and Soil Monitoring System — helping farmers grow smarter.
                </p>

                {/* Buttons */}

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">

                    <Link
                       to="/signup"
                       className="bg-white text-green-600 hover:bg-primary-50 px-8 py-3 rounded-xl font-semibold
                       text-base transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 w-full sm:w-auto
                       text-center"
                    >
                     Get Started
                    </Link>
                <a
                 href="#about"
                 className="border border-white/40 text-white hover:bg-white/10 px-8 py-3 rounded-xl font-semibold
                 text-base transition-all duration-300 w-full sm:w-auto text-center backgrop-blur-sm"
                 >
                    Learn More
                </a>
                </div>

                {/* Starts row */}

                <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
                    {[
                        { value: "95%", label: "Detection Accuracy" },
                        { value: "10K+", label: "Plants Analyzed" },
                        { value: "4", label: "Smart Features" },
                        
                    ].map((stat) =>(
                            <div key={stat.label} className="text-center">
                                <p className="text-2xl font-bold  text-white">{stat.value}</p>
                                <p className="text-primary-200 text-xs mt-1">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/*Soil Indicator */}

            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-30">
            <a href="#about" className="text-white/60 hover:text-white transition-colors">
                <FaChevronDown className="text-2xl"/>
            </a>
            </div>
        </section>
    );
};

export default HeroSection;
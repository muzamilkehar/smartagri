import { Link } from "react-router-dom";
import { GiPlantSeed} from "react-icons/gi";
import { FaGithub, FaLinkedin, FaTwitter, FaEnvelope } from "react-icons/fa";

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-400">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

                {/* Brand */}
                <div className="lg:col-span-1">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="bg-primary-600 p-2 rounded-lg">
                            <GiPlantSeed className="text-white text-lg"/>
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm">Smart Agri</p>
                            <p className="text-gray-500 text-xs">AI Platform</p>
                        </div>
                    </div>

                    <p className="text-sm leading-relaxed text-gray-500 mb-4">
                        AI-powered smart agriculture platform helping farmers detect
                        diseases, predict yields, and monitor soil conditions.
                    </p>

                    <div className="flex items-center gap-3">
                        {[
                            {icon: <FaGithub />, href: "https://github.com/muzamilkehar"},
                            {icon: <FaLinkedin />, href: "https://www.linkedin.com/in/muzamil-kehar2004/"},
                            {icon: <FaTwitter />, href: "https://github.com/muzamilkehar"},
                            {icon: <FaEnvelope />, href: "https://github.com/muzamilkehar"},
                        ].map((social, i) => (
                            <a 
                            key={i}
                            rel="noopener noreferrer"
                            href={social.href}
                            target="_blank"
                            className="w-8 h-8 bg-gray-800 hover:bg-primary-600 rounded-lg flex items-center
                            justify-center text-sm transition-colors duration-200 "
                            >
                                {social.icon}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 className="text-white font-semibold text-sm mb-4">Quick Links</h4>
                    <ul className="space-y-2">
                        {[
                            {label: "Home", to: "/"},
                            {label: "About", to: "/#about"},
                            {label: "Features", to: "/#features"},
                            {label: "Team", to: "/#team"},
                            {label: "Contact", to: "/#contact"},
                        ].map((link) => (
                            <li key={link.label}>
                                <a href={link.to}
                                className="text-sm hover:text-primary-400 transition-colors"
                                >
                                    {link.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>


                {/* Contact Info */}
                <div>
                    <h4 className="text-white font-semibold text-sm mb-4 ">Contact Info</h4>
                    <ul className="space-y-3 text-sm">
                        <li>📧 smartagri@project.com</li>
                        <li>📞 +92 300 1234567</li>
                        <li>📍 Shikarpur Sindh, Pakistan</li>
                    </ul>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row
            items-center justify-between gap-4">
                <p className="text-xs text-gray-600 ">
                    @ {new Date().getFullYear()} SmartAgri Platform. All rights reserved
                </p>
                <div className="flex items-center gap-4 text-xs">
                    <a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-primary-400 transition-colors">Terms of Use</a>
                </div>
            </div>
        </div>        
        </footer>
    );
};


export default Footer;
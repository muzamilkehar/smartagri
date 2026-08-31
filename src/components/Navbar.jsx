import {useState, useEffect} from "react";
import {Link} from "react-router-dom";
import {GiPlantSeed} from "react-icons/gi";
import {HiMenu, HiX} from "react-icons/hi";

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled , setIsScrolled] = useState(false);

    // detect scrool to add shadow to navbar

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        {label: "Home", to: "/"},
        {label: "About", to: "/#about"},
        {label: "Our Team", to: "/#team"},
        {label: "Contact", to: "/#contact"},
    ];


    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-300 
            ${isScrolled ? 'shadow-md' : "shadow-sm"
        }`}
      >

        <div className= "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">

            {/* Left Logo Selection */}
            <Link to="/" className="flex items-center gap-2 group">
                <div className= "bg-primary-600 p-2 rounded-lg group-hover:bg-primary-700 transition-colors">
                    <GiPlantSeed className="text-white text-xl"/>
            </div>
            <div className="leading-tight">
                <p className="text-primary-700 font-bold text-sm leading-none">Smart Agri</p>
                <p className="text-gray-400 text-xs leading-none">AI Platform</p>
            </div>
            </Link>


            {/* Center Nav Menu (For Desktop ) */}

            <div className="hidden md:flex items-center gap-8">
                {navLinks.map((link) => (
                    <a
                        key={link.label}
                        href={link.to}
                        className="text-gray-600 hover:text-primary-600 font-medium text-sm transition-colors duraction-200 relative group"
                        >
                        {link.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-500 group-hover:w-full transition-all duration-300"/>
                    </a>

                ))}
            </div>


            {/*Right Buttons (For Desktop ) */}
            
            <div className="hidden md:flex items-center gap-3">
                <Link 
                to="/signin"
                className="text-primary-600 border border-primary-600 hover:bg-primary-50 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                    Sign In
                </Link>
                
                <Link
                to="/signup"
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200"
                > Sign Up 
                </Link>
                </div>

            {/* Mobile HamBurger Button */}
            <button
                className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle Menu"
                >
                    {isMenuOpen ? <HiX className="text-2xl"/> : <HiMenu className="text-2xl"/>}
                    </button>
            </div>
        </div>


        {/* Mobile: Dropdown Menu */}

        { isMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-4 pt-2 shadow-lg">
                <div className="flex flex-col gap-1">

                    {navLinks.map((link) => ( 
                        <a
                            key={link.label}
                            href={link.to}
                            onClick={() => setIsMenuOpen(false)}
                            className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 px-3 py-2 rounded-lg font-medium text-sm transition-colors"
                        >
                            {link.label}
                        </a>
                    ))}
                <hr className="my-2 border-gray-100"/>
                <Link
                to="/signin"
                onClick={() => setIsMenuOpen(false)}
                    className="text-center  text-primary-600 border border-primary-600 hover:bg-primary-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    > 
                        Sign In
                        </Link>
                <Link
                to="/signup"
                onClick={() => setIsMenuOpen(false)}
                className="text-center bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                > 
                Sign Up
                </Link>
            </div>
        </div>
        )}
        </nav>
    );
};
                

export default Navbar;
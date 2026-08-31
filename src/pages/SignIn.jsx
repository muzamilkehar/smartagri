    import {useState} from "react";
    import { Link, useNavigate} from "react-router-dom";
    import { GiPlantSeed} from "react-icons/gi";
    import { FaEnvelope, FaLock, FaEye, FaEyeSlash,
            FaCheckCircle, FaTimesCircle, FaLeaf
    } from "react-icons/fa";

    import { MdAgriculture } from "react-icons/md";
    import { GiWheat } from "react-icons/gi";
    import { useAuth } from "../context/AuthContext";



    /* Reusable Input Field */

    const InputField = ({
        label, name, type, value, onChange,
        error, placeholder, icon, rightElement
    }) => (
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
                {label}
            </label>

            <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base">
                {icon}
                </div>

                <input 
                type={type || "text"}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full pl-10 pr-10 py-3 rounded-xl border text-sm text-gray-800 outline-none
                    transition-all duration-200 bg-gray-50 ${error ?
                        "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    :"border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:bg-white"}`}
                />
                {rightElement && (
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                        {rightElement}
                    </div>
                )}
                </div>

                {error &&(
                    <p className="text-red-500 text-xs flex items-center gap-1">
                        <FaTimesCircle className="flex-shrink-0"/> {error}
                    </p>
                )}
            </div>
        );


        /* Main Single Component */

        const SignIn = () => {
            const navigate = useNavigate();
            const {login} = useAuth();
            
            const [formData, setFormData] = useState({
                email: "",
                password: ""
            });

            const [errors, setErrors] = useState({});
            const [showPassword, setShowPassword] = useState(false);
            const [rememberMe, setRememberMe] = useState(false);
            const [isSubmitting, setIsSubmitting] = useState(false);
            const [isSuccess, setIsSuccess] = useState(false);
            const [loginError, setLoginError] = useState("");


            /* Validation */

            const validate = () => {
                const e = {};
                if(!formData.email.trim())
                    e.email = "Email is required";
                else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
                    e.email = "Please enter a valid email.";

                if(!formData.password)
                    e.password = "Password is required.";
                else if(formData.password.length < 8)
                    e.password = "Password must be at least 8 characters"
                return e;
            };

            /* Handlers */

            const handleChange = (e) => {
                const {name, value} = e.target;
                setFormData((prev) => ({...prev, [name]: value}));
                if(errors[name]) setErrors((prev) => ({...prev, [name]: ""}));
                if(loginError) setLoginError("");
            };

            const handleSubmit = (e) => {
                e.preventDefault();
                const validationErrors = validate();
                if(Object.keys(validationErrors).length > 0) {
                    setErrors(validationErrors);
                    return;
                }
            
                setIsSubmitting(true);
                setLoginError("");


                setTimeout(() => {
                    const result    = login(formData.email, formData.password);

                    if(result.success) {
                        setIsSubmitting(false);
                        setIsSuccess(true);
                        setTimeout(() => navigate("/dashboard", {replace: true}), 2000);
                    }
                    else {
                        setIsSubmitting(false);
                        setLoginError("Invalid email or password, Please try again.");
                    }
                }, 1500);
                
            };
            

            /* Success Screen */
            if(isSuccess) { 
                return (
                    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800
                    to-primary-600 flex items-center justify-center px-4">
                        <div className="bg-white rounded-xl p-10 max-w-sm w-full text-center shadow-2xl">
                            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-5">
                                <FaCheckCircle className="text-primary-600 text-4xl"/>
                            </div>

                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                Welcome Back!
                            </h2>

                            <p className="text-gray-500 text-sm mb-1">
                                Signed in as{" "}
                            
                            <span className="font-semibold text-primary-600">
                                {formData.email}
                            </span>
                            </p>

                            <p className="text-gray-400 text-xs">
                                Redirecting to yourdashboard...
                            </p>

                            <div className="mt-6 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                <div className="h-full bg-primary-500 rounded-full animate-[loading_2s_linear_forwards]" />
                            </div>
                        </div>
                    </div>
                );
            }
             

        


        /* Main Render */

        return (
            <div className="min-h-screen flex">

                {/* Left Panel */}
                <div className="hidden lg:flex lg:w-5/12 min-h-screen bg-gradient-to-br from-primary-900
                via-primary-800 to-primary-600 relative overflow-hidden flex-col items-center justify-center p-12">

                    {/* Background Circles */}
                    <div className="absolute -top-24 left-24 w-72 h-72 bg-primary-500 rounded-full opacity-20" />
                    <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-primary-400 rounded-full opacity-20  "/>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-700 rounded-full opacity-10"/>

                    {/* Floating Icons */}

                    <FaLeaf 
                    className="absolute top-16 left-12 text-primary-300 text-3xl opacity-40 animate-bounce"
                    style={{animationDuration:"3s"}}
                    />

                    <GiPlantSeed 
                    className="absolute top-32 right-16 text-primary-300 text-4xl opacity-40 animate-bounce"
                    style={{animationDuration:"4s", animationDelay:"1s"}}
                    />

                    <GiWheat 
                    className="absolute bottom-32 left-16 text-primary-300 text-3xl opacity-40 animate-bounce"
                    style={{animationDuration:"3.5s", animationDelay:"2s"}}
                    />

                    <MdAgriculture 
                    className="absolute bottom-16 right-12 text-primary-300 text-5xl opacity-40 animate-bounce"
                    style={{animationDuration:"4s", animationDelay:"0.5s"}}
                    />


                    {/* Content */}

                    <div className="relative z-10 text-center">
                       
                        {/* Logo */}
                        <div className="flex items-center justify-center gap-3 mb-8">
                            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                            <GiPlantSeed className="text-white text-3xl" />
                            </div>

                            <div className="text-left">
                                <p className="text-white font-bold text-xl leading-none">SmartAgri</p>
                                <p className="text-primary-200 text-sm">AI Platform</p>
                            </div>
                        </div>  

                        <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
                            Welcome Back to <br />
                            <span className="text-green-300">Smart Farming</span>
                        </h2>

                        <p className="text-primary-200 text-sm leading-relaxed mb-10 max-w-xs mx-auto">
                            Sign in to access your dashboard, monitor your crops, and get real-time 
                            AI insights for your farm.
                        </p>

                        {/* Stats */}
                        {[
                            {value: "95%", label:"Disease Detection Accuray"},
                            {value: "10k+", label:"Plants Analyzed"},
                            {value: "4", label:"AI-Powered Tools"}
                        ].map((stat) =>( 
                            <div
                            key={stat.label}
                            className="flex items-center justify-between bg-white/10 backdrop-blur-sm border
                            border-white/20 rounded-xl px-4 py-3 mb-3"
                            >

                                <span className="text-white text-sm font-medium">{stat.label}</span>
                                <span className="text-green-300 font-bold text-base">{stat.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

            {/* Right Panel (Form) */}
                <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-16 bg-white overflow-y-auto">

                    {/* Mobile Logo */}
                    <div className="flex items-center gap-2 mb-8 lg:hidden">
                        <div className="bg-primary-600 p-2 rounded-xl">
                            <GiPlantSeed className="text-white text-xl" />
                        </div>

                        <div>
                            <p className="text-primary-700 font-bold text-base leading-none">SmartAgri</p>
                            <p className="text-gray-400 text-xs ">AI Platform</p>
                        </div>
                        </div>

                            {/* Heading */}
                            <div className="mb-8">
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">
                                    Sign in to your account
                                </h1>
                                <p className="text-gray-500 text-sm">
                                    Don't have an account?{" "}
                                    <Link
                                    to="/signup"
                                    className="text-primary-600 font-semibold hover:text-primary-700 transition-colors"
                                    >
                                        Create one free
                                    </Link>
                                </p>
                            </div>

                            {/* Global Login Error */}

                            {loginError && (
                                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600
                                text-sm px-4 py-3 rounded-xl mb-5">
                                    <FaTimesCircle className="flex-shrink-0" />
                                    {loginError}
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">

                                {/* Email */}

                                <InputField
                                    label="Email Address"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="admin@smartagri.com"
                                    icon={<FaEnvelope/>}
                                    error={errors.email}
                                />

                                {/* Password */}

                                <InputField 
                                label="Password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                icon={<FaLock/>}
                                error={errors.password}
                                rightElement={
                                    <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-gray-400 hover:text-gray-600 transtion-colors"
                                    aria-label="Toggle password visibility"
                                    >

                                        {showPassword ? <FaEyeSlash /> : <FaEye/>}
                                    </button>
                                }
                            />

                            {/* Remember me + forgot password */}
                            <div className="flex items-center justify-between ">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className="relative">
                                        <input type="checkbox" 
                                        checked={rememberMe}
                                        onChange={() => setRememberMe(!rememberMe)}
                                        className="sr-only"
                                        />

                                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors
                                            ${rememberMe ? "bg-primary-600 border-primary-600" : "border-gray-300 group-hover:border-primary-400"}
                                            `}>

                                                {rememberMe && (
                                                    <svg className="w-2.5 h-2.5 text-white " fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                                                    </svg>
                                                )}
                                        </div>
                                    </div>
                                    <span className="text-sm text-gray-600 "> Remember Me  </span>
                                </label>

                                <Link
                                to="/forgot-password"
                                className="text-sm text-primary-600  hover:text-primary-700 font-medium transition-colors"
                                >
                                Forgot password?
                                </Link>
                            </div>

                                {/* Submit Button */}
                                <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 flex
                                    items-center justify-center gap-2 shadow-lg text-white ${isSubmitting ?
                                        "bg-primary-400 cursor-not-allowed" : "bg-primary-600 hover:bg-primary-700 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                                    }`}
                                >

                                    {isSubmitting ? (
                                        <>
                                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        </svg>
                                        Signing in...
                                        </>
                                    ): (
                                        "Sign In "
                                    )}
                                </button>

                                {/* Dummy credentials hint */}
                                
                                </form>

                            {/* Footer */}

                            <p className="text-xs text-gray-400 mt-8">
                                @ {new Date().getFullYear()} SmartAgri Platform
                            </p>                        
                        </div>  
                    </div>
                    

                
            
        );

    };



    export default SignIn;

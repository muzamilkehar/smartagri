import { useState } from "react";
import { Link, useNavigate} from "react-router-dom";
import {GiPlantSeed} from "react-icons/gi";

import {FaUser, FaEnvelope, FaLock, FaEye, FaCheckCircle,
        FaTimesCircle, FaLeaf, FaSeedling,   
        FaEyeSlash} from "react-icons/fa";

import {MdAgriculture} from "react-icons/md"
import { useAuth } from "../context/AuthContext";
import GoogleSignInButton from "../components/GoogleSignInButton";




{/* Password Strength Helper */}

const getPasswordStrength = (password) => {
    let score = 0;
    const check = {
        length: password.length >=8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number:    /[0-9]/.test(password),
        special:   /[^A-Za-z0-9]/.test(password)
    };
    score = Object.values(check).filter(Boolean).length;


    if(score <= 1)  return {label: "Very Weak", color: "bg-red-500",    width: "w-1/5", textColor: "text-red-500"};
    if(score === 2) return {label: "Weak",      color: "bg-orange-500", width: "w-2/5", textColor: "text-orange-500"};
    if(score === 3) return {label: "Fair",      color: "bg-yellow-500", width: "w-3/5", textColor: "text-yellow-500"};
    if(score === 4) return {label: "Strong",    color: "bg-blue-500",   width: "w-4/5", textColor: "text-blue-500"};
    return             {label: "Very Strong",   color: "bg-green-500",  width: "w-full", textColor: "text-blue-500" };

};


const passwordChecks = [
    {key: "length",     label: "At least 8 characters", test: (p) => p.length >= 8},
    {key: "lowercase",  label: "One lowercase letter", test:(p) => /[a-z]/.test(p)},
    {key: "uppercase",  label: "One uppercase letter",  test: (p) => /[A-Z]/.test(p)},
    {key: "number",     label: "One number",             test: (p) => /[0-9]/.test(p)},
    {key: "special",    label: "One special character", test: (p) => /[^A-Za-z0-9]/.test(p)}
];


{/* Reusbale input field */}

const InputField = ({
    label, name, type = "text", value, onChange, error,
     placeholder, icon, rightElement
}) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400
            text-base">
                {icon}
            </div>
            <input 
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`w-full pl-10 pr-10 py-3 rounded-xl border text-sm text-gray-800
                outline-none transition-all duration-200 bg-gray-50 ${error
                    ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    : "border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:bg-white"
                }` } 
            />
            {rightElement && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    {rightElement}
                    </div>
            )}
        </div>
        {error && (
            <p className="text-red-500 text-xs flex items-center gap-1">
                <FaTimesCircle className="flex-shrink-0"/>
                {error}
            </p>
        )}
    </div>
);


{/* Main Sign up Component */}

const SignUp = () => {
    const navigate = useNavigate();
    const { register, loginGoogle } = useAuth();

    const [formData, setFormData] = useState({
        fullName: "",
        email: "", password: "", confirmPassword: ""
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfrim, setShowConfirm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [focusedPassword, setFocusPassword] = useState(false);
    const [signupError, setSignupError] = useState("");

    const strength = getPasswordStrength(formData.password);


    /* Validation */
    const validate = () => {
        const e = {};
        if(!formData.fullName.trim())
            e.fullName = "Full Name is required";
        else if(formData.fullName.trim().length < 3)
            e.fullName = "Please enter your full name";

        if(!formData.email.trim())
            e.email = "Email is required";
        else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
            e.email = "Please enter a valid email";

        if(!formData.password.trim())
            e.password = "Password is required"
        else if(formData.password.length < 8)
            e.password = "Password must be at least 8 characters";

        if(!formData.confirmPassword.trim())
            e.confirmPassword = "Please confirm your password"
        else if(formData.password !== formData.confirmPassword)
            e.confirmPassword = "Password does not match!";

            return e;
    };

    /* Handlers */
    
    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData((prev) => ({...prev, [name]: value}));
        if(errors[name]) setErrors((prev) => ({...prev, [name]: ""}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validateErrors = validate();
        if(Object.keys(validateErrors).length > 0){
            setErrors(validateErrors);
            return;
        }

        setIsSubmitting(true);
        setSignupError("");

        const result = await register({
            fullName: formData.fullName.trim(),
            email: formData.email.trim(),
            password: formData.password
        });

        if (result.success) {
            setIsSubmitting(false);
            setIsSuccess(true);
            setTimeout(() => navigate("/dashboard", {replace: true}), 2500);
        } else {
            setIsSubmitting(false);
            setSignupError(result.error || "Something went wrong. Please try again.");
        }
    };

    /* Google Sign-In handlers */

    const handleGoogleSuccess = async (googleProfile) => {
        const result = await loginGoogle(googleProfile);
        if (result.success) {
            navigate("/dashboard", { replace: true });
        } else {
            setSignupError(result.error || "Google sign-in failed. Please try again.");
        }
    };

    const handleGoogleError = (message) => setSignupError(message);
    

    /* Success Screen */

    if(isSuccess){
        const firstName = formData.fullName.trim().split(" ")[0];
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800
            to-primary-600 flex items-center justify-center px-4">
                <div className="bg-white rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl
                animate-pulse-once">
                    <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center
                    mx-auto mb-5">
                        <FaCheckCircle className="text-primary-600 text-4xl"/>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2 ">Account Create</h2>
                    <p className="text-gray-500 text-sm mb-1">
                        Welcome to SmartAgri, <span className="font-semibold text-primary-600">
                            {firstName}
                        </span>
                    </p>
                    <p className="text-gray-400 text-xs">Redirecting you to sign in...</p>
                    <div className="mt-6 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div className="h-full bg-primary-500 rounded-full animate-[loading_2.5s_linear_forwards]"/>
                    </div>
                </div>
            </div>
        );
    };


        /* Main Header */
        
        return (
            <div className="min-h-screen flex">

                {/* Left Panel (Decrotive desktop - only) */}

                <div className="hidden lg:flex lg:w-5/12 min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600  
                relative overflow-hidden flex-col items-center justify-center p-12">

                    {/* Background Circle */}
                    <div className="absolute -top-24 -left-24 w-72 h-72 bg-primary-500 rounded-full opacity-20" />
                    <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-primary-400 rounded-full opacity-20"/>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-700
                    rounded-full opacity-10"/>

                    {/* Floating Icons */}
                    <FaLeaf className="absolute top-16 left-12 text-primary-300 text-3xl opacity-40 animate-bounce"
                    style={{animationDuration: "3s"}}/>

                    <GiPlantSeed className="absolute top-32 right-16  text-primary-300 text-4xl opacity-40 animate-bounce"
                    style={{animationDuration: "4s", animationDelay:"1s"}}/>

                    <FaSeedling className="absolute bottom-32 left-16 text-primary-300 text-3xl opacity-40 animate-bounce"
                    style={{animationDuration: "3.5s", animationDelay:"1s"}}/>

                    <MdAgriculture className="absolute bottom-16 right-12 text-primary-300 text-5xl opacity-40 animate-bounce"
                    style={{animationDuration:"4s", animationDelay:"0.5s"}}/>

                    {/* Content */}

                    <div className="relative z-10 text-center">
                        <div className="flex items-center justify-center gap-3 mb-8">
                            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                            <GiPlantSeed className="text-white text-3xl"/>
                            </div>
                            <div className="text-left">
                                <p className="text-white font-bold text-xl leading-none">SmartAgri</p>
                                <p className="text-primary-200 text-sm">AI Platform</p>
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
                            Join The Future <br />

                            <span className="text-green-300">Smart Farming</span>
                        </h2>
                            <p className="text-green-200 text-sm leading-relaxed mb-10 max-w-xs mx-auto">
                                Create your free account and get instance access to AI-Powered plant disease
                                detection, yield prediction and soil monitoring.
                            </p>

                        {/* Feature pills */}

                        {[
                            {icon: <FaLeaf />, label: "Plant Disease Detection."},
                            {icon: <GiPlantSeed />, label: "Crop Yield Prediction."},
                            {icon: <MdAgriculture />, label: "Soil & Water Monitoring."}
                        ].map((f) =>(
                            <div
                            key={f.label}
                            className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20
                            rounded-xl px-4 py-3 mb-3 text-left"
                            > 

                            <span className="text-green-300 text-base">{f.icon}</span>
                            <span className="text-white text-sm font-medium">{f.label}</span>
                            <FaCheckCircle className="text-green-400 text-sm ml-auto"/>
                            </div>
                        ))}                
                    </div>
                </div>

                {/* Right Panel (Form) */}

                <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-16
                bg-white overflow-y-auto">

                    {/*Mobile Logo */}
                    <div className="flex items-center gap-2 mb-8 lg:hidden">
                        <div className="bg-primary-600 p-2 rounded-xl">
                            <GiPlantSeed className="text-white text-xl"/>
                        </div>
                        <div>
                        <p className="text-primary-700 font-bold text-base leading-none">SmartAgri</p>
                        <p className="text-gray-400 text-xs">AI Platform</p>
                        </div>
                    </div>       
                

                {/*Heading */}
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">
                        Create your account
                    </h1>

                    <p className="text-gray-500 text-sm">
                        Already have an account?{" "}
                        <Link
                        to="/signin"
                        className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">
                            Sign in here
                        </Link>
                    </p>
                </div>

                {/* Google Sign In */}
                <GoogleSignInButton onSuccess={handleGoogleSuccess} onError={handleGoogleError} />

                <div className="flex items-center gap-3 my-6 max-w-lg">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400 font-medium">OR CONTINUE WITH EMAIL</span>
                    <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Global Signup Error */}

                {signupError && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600
                    text-sm px-4 py-3 rounded-xl mb-5 max-w-lg">
                        <FaTimesCircle className="flex-shrink-0" />
                        {signupError}
                    </div>
                )}

                {/* Form */}
                
                <form onSubmit={handleSubmit} className="space-y-5 max-w-lg" >
                        
                        {/* Full Name */}

                        <InputField
                        label="Full Name"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="John Doe"
                        icon={<FaUser />}
                        error={errors.fullName} 
                        />

                        {/* Email */}

                        <InputField 
                        label= "Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@gmail.com"
                        icon={<FaEnvelope />}
                        error={errors.email}
                        />

                        {/* Password */}

                        <div>
                            <InputField 
                            label="Password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={handleChange}
                            placeholder={"Create a strong password"}
                            icon={<FaLock/>}
                            error={errors.password}
                            rightElement={
                                <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                onFocus={() => setFocusPassword(true)}
                                onBlur={() => setFocusPassword(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors aria-label"
                                aria-label="Toggle password visibility"
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            }
                        />

                        {/* Password Strenght Bar */}

                        {formData.password && (
                            <div className="mt-2 space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                        <div className={`h-full rounded-full transition-all duration-500 ${strength.color} ${strength.width}`} />
                                    </div>
                                    <span className={`text-xs font-semibold ${strength.textColor}`}>
                                        {strength.label}
                                    </span>
                                </div>
                                
                                {/* Passowrd checklist*/}
                                <div className="grid grid-cols-2 gap-1">
                                    {passwordChecks.map((check) => {
                                        const passed = check.test(formData.password);
                                        return(
                                            <div key={check.key} className="flex items-center gap-1.5">
                                                {passed
                                                ? <FaCheckCircle className="text-green-500 text-xs flex-shrink-0" />
                                                :<FaTimesCircle className="text-gray-300 text-xs flex-shrink-0"/>
                                                }
                                                
                                                <span className={`text-xs ${passed ? "text-green-600 " : "text-gray-400"}`}>
                                                    {check.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            )}
                        </div> 

                        {/* Confirm Password */}

                        <InputField 
                        label="Confirm Password"
                        name="confirmPassword"
                        type={showConfrim ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm Password"
                        icon={<FaLock/>}
                        error={errors.confirmPassword}
                        rightElement={
                            <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfrim)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label="Toggle confirm passowrd visibility"
                            >
                        {showConfrim ? <FaEyeSlash/> : <FaEye />}
                            </button>
                        }
                     />

                     {/* Match Indicator */}

                     {formData.confirmPassword && formData.password && (
                        <div className="flex items-center gap-1.5">
                            {formData.password === formData.confirmPassword? (
                                <>
                                <FaCheckCircle className="text-green-500 text-xs"/>
                                <span className="text-green-600 text-xs font-medium">Password Match</span>
                                </>
                            ) : (
                            <>
                                <FaTimesCircle className="text-red-400 text-xs"/>
                                <span className="text-red-500 text-xs font-medium">Password does not match</span>
                            </>
                        )}
                        </div>
                     )}

                    {/* Terms */}
                    <p className="text-xs text-gray-400 leading-relaxed">
                        By creating an account you agree to our {" "}
                        <a href="#" className="text-primary-600 hover:underline font-medium">Terms of Service</a>
                        {" "}and{" "}
                        <a href="#" className="text-primary-600 hover:underline font-medium">Privacy Policy</a>
                    </p>

                    {/* Submit Button */}

                    <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-300
                        flex items-center justify-center gap-2 shadow-lg
                        ${isSubmitting
                            ? "bg-primary-400 cursor-not-allowed" 
                            : "bg-primary-600 hover:bg-primary-700 hover:shadow-primary-200 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 "
                        } text-white `}
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                    <path className="opacity-75 " fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                </svg>
                                Creating Account
                            </>
                        ): (
                            "Create Account"
                        )}
                    </button>
                </form>

                {/* Footer note */}

                <p className="text-xs text-gray-400 mt-8">
                    @ {new Date().getFullYear()} SmartAgri Platform
                </p>
            </div>
        </div>
           
        );
    };
         
    

export default SignUp;
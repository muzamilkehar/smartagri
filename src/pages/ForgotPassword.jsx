import { useState } from "react";
import { Link } from "react-router-dom";
import { GiPlantSeed } from "react-icons/gi";
import { FaEnvelope, FaTimesCircle, FaCheckCircle, FaArrowLeft } from "react-icons/fa";


const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const validate = () => {
        if(!email.trim())
            return "Email is required."

        if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            return  "Please enter a valid email."
        return "";
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationError = validate();
        if(validationError){
            setError(validationError);
            return;
        }
        
        setIsSubmitting(true);
        setTimeout(() =>{
            setIsSubmitting(false);
            setIsSuccess(true);
        }, 1500);
    };


    return (
        <div className="min-h-screen flex">

            {/* Left Panel */}
            <div className="hidden lg:flex lg:w-5/12 min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600 
            relative overflow-hidden flex-col items-center justify-center  p-12">

            {/* Background Circles */}

            <div className="absolute -top-24 left-24 w-72 h-72 bg-primary-500 rounded-full opacity-20" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-primary-400 rounded-full opacity-20  "/>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-700 rounded-full opacity-10"/>

            {/* Content */}

            <div className="relative z-10 text-center">

                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-10">
                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                    <GiPlantSeed className="text-white text-3xl"/>
                    </div>

                    <div className="text-left">
                        <p className="text-white font-bold text-xl leading-none">SmartAgri</p>
                        <p className="text-primary-200 text-sm">AI Platform</p>
                    </div>
                </div>

                {/* Icon */}
                <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full flex items-center 
                justify-center mx-auto mb-6 border border-white/20">
                    <FaEnvelope className="text-white text-4xl" />
                </div>

                <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
                    Forgot Your <br />
                    <span className="text-green-300">Password?</span>
                </h2>

                <p className="text-primary-200 text-sm leading-relaxed max-w-xs mx-auto">
                    No worries! Enter your registered email address and we'll send you link
                    to reset your password instantly.
                </p>

                {/* Steps */}

                <div className="mt-10 space-y-3 text-left">
                    {[
                        {step: "01", label: "Enter your email address"},
                        {step: "02", label: "Check your inbox for the link"},
                        {step: "03", label: "Reset and sign in again"}
                    ].map((item) =>(
                        <div
                        key={item.step}
                        className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl 
                        px-4 py-3 "
                        >
                            <span className="text-green-300 font-bold text-sm">{item.step}</span>
                            <span className="text-white text-sm">{item.label}</span>
                            </div>
                    ))}
                </div>
            </div>
            </div>

            {/* Right Panel */}

            <div className="flex-1 flex flex-col  justify-center px-6 py-12 sm:px-10 lg:px-16 bg-white">

                {/* Mobile Logo */}

                <div className="flex items-center gap-2 mb-8 lg:hidden">
                    <div className="bg-primary-600 p-2 rounded-xl">
                        <GiPlantSeed className="text-white text-xl " />
                    </div>

                    <div>
                        <p className="text-primary-700 font-bold text-base leading-none">SmartAgri</p>
                        <p className="text-gray-400 text-xs">AI Platform</p>
                    </div>
                </div>

                {isSuccess ? (
                    <div className="max-w-md w-full">
                        <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mb-6">
                            <FaCheckCircle className="text-primary-600 text-3xl"/>
                        </div> 

                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                            Check your inbox!
                        </h1>

                        <p className="text-gray-500 text-sm mb-2">
                            We sent a password reset link to:
                        </p>

                        <p className="text-primary-600 font-semibold text-sm mb-6">
                            {email}
                        </p>
                        <div className="bg-primary-50 border border-primary-200 rounded-xl px-4 py-3 mb-8">
                            <p className="text-primary-700 text-xs leading-relaxed">
                                Didn't receive an email? Check your spam folder or {""}
                                <button 
                                onClick={() => setIsSuccess(false)}
                                className="font-semibold underline hover:text-primary-800 transition-colors"
                                >
                                    Resend 
                                </button>
                                .
                            </p>
                        </div>
                        <Link
                        to="/signin"
                        className="flex items-center gap-2 text-sm text-primary-600 font-semibold hover:text-primary-700
                        transition-colors"
                        >
                            <FaArrowLeft className="text-xs"/>
                            Back to Sign In
                        </Link>
                    </div>

                ): (

                    /* Form State */
                    <div className="max-w-md w-full ">

                        {/* Back Link */}

                        <Link
                        to="/signin"
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors mb-8"
                        >
                            <FaArrowLeft className="text-xs" />
                            Back to Sign In
                        </Link>

                        {/* Heading */}
                        <div className="mb-8">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                                Reset your password
                            </h1>
                            <p className="text-gray-800 text-sm">
                                Enter the email address linked to your account and we'll send you
                                a reset link.
                            </p>
                        </div>

                        {/* Form */}

                        <form onSubmit={handleSubmit} className="space-y-5">

                            {/* Email Field */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-700">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base">
                                    <FaEnvelope />
                                    </div>

                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => {
                                                setEmail(e.target.value);
                                                if(error) setError("");
                                        }}
                                        placeholder="Enter your registered email"
                                        className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm text-gray-800
                                            outline-none transition-all duration-200 bg-gray-50
                                            ${error ?
                                                "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                               :"border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:bg-white"
                                            }`}
                                    />
                                </div>
                                {error && (
                                    <p className="text-red-500 text-xs flex items-center gap-1">
                                        <FaTimesCircle className="flex-shrink-0 "/>
                                        {error}
                                    </p>
                                 )}
                                </div>

                                 {/* Submit Button */}

                                 <button
                                 type="submit"
                                 disabled={isSubmitting}
                                 className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-300
                                    flex items-center justify-center gap-2 shadow-lg text-white
                                    ${isSubmitting 
                                        ?   "bg-primary-400 cursor-not-allowed"
                                        :   "bg-primary-600 hover:bg-primary-700 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                                    }`}
                                 >

                                    {isSubmitting ? (
                                        <>
                                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" >
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                        Sending Reset Link...
                                        </>
                                    ): (
                                        "Send Reset Link"
                                    )}

                                 </button>
                        </form>
                        {/* Footer */}
                        <p className="text-xs text-gray-400 mt-8">
                            @ {new Date().getFullYear()} SmartAgri Platform.
                        </p>
                    </div>
                )}
            </div>
            
        </div>
    );
};

export default ForgotPassword;
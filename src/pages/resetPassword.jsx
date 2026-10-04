import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { GiPlantSeed } from "react-icons/gi";
import { FaLock, FaEye, FaEyeSlash, FaTimesCircle, FaCheckCircle, FaArrowLeft } from "react-icons/fa";
import { resetPassword } from "../services/authAPI";

const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") || "";

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const validate = () => {
        const e = {};
        if (!password) e.password = "Password is required.";
        else if (password.length < 8) e.password = "Password must be at least 8 characters.";

        if (!confirmPassword) e.confirmPassword = "Please confirm your password.";
        else if (password !== confirmPassword) e.confirmPassword = "Passwords do not match.";

        return e;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            setFormError("This reset link is missing its token. Request a new one.");
            return;
        }

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);
        setFormError("");

        const result = await resetPassword(token, password);

        setIsSubmitting(false);

        if (result.success) {
            setIsSuccess(true);
            setTimeout(() => navigate("/signin", { replace: true }), 2000);
        } else {
            setFormError(result.error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600 px-4">
            <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-2xl">

                <div className="flex items-center gap-2 mb-8">
                    <div className="bg-primary-600 p-2 rounded-xl">
                        <GiPlantSeed className="text-white text-xl" />
                    </div>
                    <div>
                        <p className="text-primary-700 font-bold text-base leading-none">SmartAgri</p>
                        <p className="text-gray-400 text-xs">AI Platform</p>
                    </div>
                </div>

                {isSuccess ? (
                    <div className="text-center py-6">
                        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-5">
                            <FaCheckCircle className="text-primary-600 text-3xl" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Password reset!</h1>
                        <p className="text-gray-500 text-sm">Redirecting you to sign in...</p>
                    </div>
                ) : (
                    <>
                        <h1 className="text-2xl font-bold text-gray-800 mb-1">Set a new password</h1>
                        <p className="text-gray-500 text-sm mb-6">Choose a new password for your account.</p>

                        {!token && (
                            <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs px-4 py-3 rounded-xl mb-5">
                                This link is missing its reset token.{" "}
                                <Link to="/forgot-password" className="underline font-semibold">Request a new one</Link>.
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-700">New Password</label>
                                <div className="relative">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"><FaLock /></div>
                                    <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((p) => ({ ...p, password: "" })); }}
                                    placeholder="Create a new password"
                                    className={`w-full pl-10 pr-10 py-3 rounded-xl border text-sm text-gray-800 outline-none
                                        transition-all duration-200 bg-gray-50 ${errors.password
                                            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                            : "border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:bg-white"}`}
                                    />
                                    <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    aria-label="Toggle password visibility"
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-red-500 text-xs flex items-center gap-1"><FaTimesCircle className="flex-shrink-0" />{errors.password}</p>
                                )}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                                <div className="relative">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"><FaLock /></div>
                                    <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => { setConfirmPassword(e.target.value); if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: "" })); }}
                                    placeholder="Confirm new password"
                                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm text-gray-800 outline-none
                                        transition-all duration-200 bg-gray-50 ${errors.confirmPassword
                                            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                            : "border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:bg-white"}`}
                                    />
                                </div>
                                {errors.confirmPassword && (
                                    <p className="text-red-500 text-xs flex items-center gap-1"><FaTimesCircle className="flex-shrink-0" />{errors.confirmPassword}</p>
                                )}
                            </div>

                            {formError && <p className="text-red-500 text-xs">{formError}</p>}

                            <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 text-white
                                ${isSubmitting ? "bg-primary-400 cursor-not-allowed" : "bg-primary-600 hover:bg-primary-700 hover:shadow-xl"}`}
                            >
                                {isSubmitting ? "Resetting..." : "Reset Password"}
                            </button>
                        </form>

                        <Link
                        to="/signin"
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors mt-6"
                        >
                            <FaArrowLeft className="text-xs" /> Back to Sign In
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
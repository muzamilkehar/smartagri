import { useState } from "react";
import { FaLock, FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";
import { changePassword } from "../services/authAPI";
import { toastSuccess, toastError } from "../utils/toast";

const ChangePasswordModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const validate = () => {
        const e = {};
        if (!formData.currentPassword) e.currentPassword = "Current password is required.";
        if (!formData.newPassword) e.newPassword = "New password is required.";
        else if (formData.newPassword.length < 8) e.newPassword = "Password must be at least 8 characters.";
        if (formData.newPassword === formData.currentPassword) e.newPassword = "New password must be different.";
        if (!formData.confirmPassword) e.confirmPassword = "Please confirm your password.";
        else if (formData.newPassword !== formData.confirmPassword) e.confirmPassword = "Passwords do not match.";
        return e;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);
        const result = await changePassword(formData.currentPassword, formData.newPassword);
        setIsSubmitting(false);

        if (result.success) {
            toastSuccess("Password updated successfully.");
            setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            onClose();
        } else {
            toastError(result.error);
        }
    };

    const inputClass = (field) => `
        w-full pl-10 pr-10 py-3 rounded-xl border text-sm text-gray-800 outline-none
        transition-all duration-200 bg-gray-50
        ${errors[field] 
            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100" 
            : "border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:bg-white"
        }
    `;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-800">Change Password</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close">
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Current Password */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1.5">Current Password</label>
                        <div className="relative">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                                <FaLock />
                            </div>
                            <input
                                type={showCurrent ? "text" : "password"}
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                placeholder="Enter current password"
                                className={inputClass("currentPassword")}
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrent(!showCurrent)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showCurrent ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        {errors.currentPassword && <p className="text-red-500 text-xs mt-1">{errors.currentPassword}</p>}
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1.5">New Password</label>
                        <div className="relative">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                                <FaLock />
                            </div>
                            <input
                                type={showNew ? "text" : "password"}
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                placeholder="At least 8 characters"
                                className={inputClass("newPassword")}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNew(!showNew)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showNew ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1.5">Confirm New Password</label>
                        <div className="relative">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                                <FaLock />
                            </div>
                            <input
                                type={showNew ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm new password"
                                className={inputClass("confirmPassword")}
                            />
                        </div>
                        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-3 rounded-xl text-sm font-semibold text-white transition-colors mt-2
                            ${isSubmitting ? "bg-primary-400 cursor-not-allowed" : "bg-primary-600 hover:bg-primary-700"}`}
                    >
                        {isSubmitting ? "Updating..." : "Update Password"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordModal;
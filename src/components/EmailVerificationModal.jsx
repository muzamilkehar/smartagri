import { useState, useEffect, useRef } from "react";
import { FaEnvelope, FaTimes, FaCheckCircle, FaShieldAlt } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { sendVerificationEmail, verifyEmailOtp } from "../services/emailAPI";
import { toastSuccess, toastError } from "../utils/toast";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

const EmailVerificationModal = ({ isOpen, onClose, onVerified }) => {
    const { currentUser, refreshUser } = useAuth();

    const [step, setStep] = useState("send"); // "send" | "verify" | "success"
    const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
    const [sending, setSending] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [resendCountdown, setResendCountdown] = useState(0);
    const [error, setError] = useState("");

    const inputsRef = useRef([]);

    /* Reset state whenever the modal opens */
    useEffect(() => {
        if (isOpen) {
            setStep("send");
            setOtp(Array(OTP_LENGTH).fill(""));
            setError("");
        }
    }, [isOpen]);

    /* Resend cooldown timer */
    useEffect(() => {
        if (resendCountdown <= 0) return;
        const t = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [resendCountdown]);

    /* Focus the first OTP input when we switch to verify step */
    useEffect(() => {
        if (step === "verify") {
            setTimeout(() => inputsRef.current[0]?.focus(), 50);
        }
    }, [step]);

    if (!isOpen) return null;

    /* ---------- Send OTP ---------- */
    const handleSend = async () => {
        setSending(true);
        setError("");
        const result = await sendVerificationEmail(currentUser?.email);
        setSending(false);

        if (result.success) {
            toastSuccess("Verification code sent. Check your email.");
            setStep("verify");
            setResendCountdown(RESEND_COOLDOWN);
        } else {
            setError(result.error);
            toastError(result.error);
        }
    };

    /* ---------- Resend ---------- */
    const handleResend = async () => {
        if (resendCountdown > 0) return;
        setSending(true);
        setError("");
        const result = await sendVerificationEmail(currentUser?.email);
        setSending(false);

        if (result.success) {
            toastSuccess("New code sent.");
            setResendCountdown(RESEND_COOLDOWN);
            setOtp(Array(OTP_LENGTH).fill(""));
            inputsRef.current[0]?.focus();
        } else {
            setError(result.error);
            toastError(result.error);
        }
    };

    /* ---------- OTP input handling ---------- */
    const handleOtpChange = (index, value) => {
        const digit = value.replace(/\D/g, "").slice(-1);
        const next = [...otp];
        next[index] = digit;
        setOtp(next);
        if (error) setError("");
        if (digit && index < OTP_LENGTH - 1) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === "Backspace") {
            if (otp[index]) {
                const next = [...otp];
                next[index] = "";
                setOtp(next);
            } else if (index > 0) {
                inputsRef.current[index - 1]?.focus();
                const next = [...otp];
                next[index - 1] = "";
                setOtp(next);
            }
        } else if (e.key === "ArrowLeft" && index > 0) {
            inputsRef.current[index - 1]?.focus();
        } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
        if (!pasted) return;
        const next = Array(OTP_LENGTH).fill("");
        for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
        setOtp(next);
        inputsRef.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
    };

    /* ---------- Verify ---------- */
    const handleVerify = async () => {
        const code = otp.join("");
        if (code.length !== OTP_LENGTH) {
            setError("Please enter all 6 digits.");
            return;
        }

        setVerifying(true);
        setError("");
        const result = await verifyEmailOtp(currentUser?.email, code);
        setVerifying(false);

        if (result.success) {
            setStep("success");
            toastSuccess("Email verified successfully!");

            // Sync user state so isEmailVerified becomes true everywhere
            const refreshed = await refreshUser();
            if (refreshed.success && onVerified) onVerified(refreshed.user);
        } else {
            setError(result.error);
            toastError(result.error);
        }
    };

    const handleClose = () => {
        if (verifying || sending) return;
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">

                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${step === "success" ? "bg-green-100" : "bg-primary-100"}`}>
                            {step === "success"
                                ? <FaCheckCircle className="text-green-600 text-xl" />
                                : <FaShieldAlt className="text-primary-600 text-xl" />}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">
                                {step === "success" ? "Email Verified!" : "Verify Your Email"}
                            </h3>
                            <p className="text-xs text-gray-400">
                                {step === "success"
                                    ? "Your account is now fully activated."
                                    : "We'll send a 6-digit code to your inbox."}
                            </p>
                        </div>
                    </div>
                    {step !== "success" && (
                        <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Close"
                        >
                            <FaTimes />
                        </button>
                    )}
                </div>

                {/* Email chip */}
                {step !== "success" && (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
                        <FaEnvelope className="text-gray-400 text-sm flex-shrink-0" />
                        <span className="text-sm text-gray-700 truncate">{currentUser?.email}</span>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2.5 rounded-xl mb-4">
                        {error}
                    </div>
                )}

                {/* ---------- Step: send ---------- */}
                {step === "send" && (
                    <>
                        <p className="text-sm text-gray-500 leading-relaxed mb-6">
                            Click the button below and we'll email you a 6-digit verification code.
                            The code expires in <span className="font-semibold text-gray-700">5 minutes</span>.
                        </p>
                        <div className="flex gap-3">
                            <button
                            onClick={handleClose}
                            className="flex-1 py-3 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                            onClick={handleSend}
                            disabled={sending}
                            className={`flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2
                                ${sending ? "bg-primary-400 cursor-not-allowed" : "bg-primary-600 hover:bg-primary-700"}`}
                            >
                                {sending ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        </svg>
                                        Sending...
                                    </>
                                ) : (
                                    "Send Code"
                                )}
                            </button>
                        </div>
                    </>
                )}

                {/* ---------- Step: verify ---------- */}
                {step === "verify" && (
                    <>
                        <p className="text-sm text-gray-500 leading-relaxed mb-4 text-center">
                            Enter the 6-digit code sent to your email.
                        </p>

                        <div
                        className="flex items-center justify-center gap-2 mb-5"
                        onPaste={handleOtpPaste}
                        >
                            {otp.map((digit, i) => (
                                <input
                                key={i}
                                ref={(el) => { inputsRef.current[i] = el; }}
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(i, e.target.value)}
                                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                className="w-11 h-13 sm:w-12 sm:h-14 text-center text-lg font-bold
                                rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-800
                                outline-none transition-all duration-200
                                focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100"
                                />
                            ))}
                        </div>

                        <button
                        onClick={handleVerify}
                        disabled={verifying || otp.some((d) => !d)}
                        className={`w-full py-3 rounded-xl text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2
                            ${verifying || otp.some((d) => !d)
                                ? "bg-gray-300 cursor-not-allowed"
                                : "bg-primary-600 hover:bg-primary-700"}`}
                        >
                            {verifying ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    </svg>
                                    Verifying...
                                </>
                            ) : (
                                "Verify Code"
                            )}
                        </button>

                        <div className="text-center mt-4 text-xs text-gray-400">
                            Didn't receive it?{" "}
                            {resendCountdown > 0 ? (
                                <span className="text-gray-500">Resend in {resendCountdown}s</span>
                            ) : (
                                <button
                                onClick={handleResend}
                                disabled={sending}
                                className="text-primary-600 font-semibold hover:text-primary-700 transition-colors"
                                >
                                    {sending ? "Sending..." : "Resend code"}
                                </button>
                            )}
                        </div>
                    </>
                )}

                {/* ---------- Step: success ---------- */}
                {step === "success" && (
                    <button
                    onClick={handleClose}
                    className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                    >
                        Continue
                    </button>
                )}
            </div>
        </div>
    );
};

export default EmailVerificationModal;
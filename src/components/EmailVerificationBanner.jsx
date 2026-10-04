import { useState } from "react";
import { FaEnvelope, FaCheckCircle, FaTimes } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import EmailVerificationModal from "./EmailVerificationModal";

const EmailVerificationBanner = () => {
    const { currentUser } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    // Hide for: not logged in, already verified, or user dismissed this session
    if (!currentUser || currentUser.isEmailVerified || dismissed) return null;

    return (
        <>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start sm:items-center gap-3">
                <div className="bg-amber-100 p-2.5 rounded-xl flex-shrink-0">
                    <FaEnvelope className="text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-amber-800 font-semibold text-sm">Verify your email</p>
                    <p className="text-amber-700 text-xs mt-0.5">
                        We sent a code to <span className="font-medium">{currentUser.email}</span>. Verify now to unlock all features.
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                    onClick={() => setShowModal(true)}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap"
                    >
                        Verify
                    </button>
                    <button
                    onClick={() => setDismissed(true)}
                    className="text-amber-600 hover:text-amber-800 transition-colors p-1"
                    aria-label="Dismiss"
                    >
                        <FaTimes className="text-sm" />
                    </button>
                </div>
            </div>

            <EmailVerificationModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
            />
        </>
    );
};

export default EmailVerificationBanner;
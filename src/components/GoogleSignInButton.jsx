import { useEffect, useRef } from "react";

// Decodes a JWT's payload WITHOUT verifying its signature.
// Fine for reading name/email/picture to show in the UI right away —
// but a real backend must still verify the token's signature with
// Google's servers before trusting it for anything security-sensitive.
const decodeJwt = (token) => {
    try {
        const payload = token.split(".")[1];
        const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
        return JSON.parse(decodeURIComponent(escape(json)));
    } catch {
        return null;
    }
};

const GoogleSignInButton = ({ onSuccess, onError }) => {
    const buttonRef = useRef(null);

    useEffect(() => {
        let attempts = 0;

        const tryInit = () => {
            // The GIS script loads async, so it may not be ready the
            // instant this component mounts — retry briefly if needed.
            if (!window.google?.accounts?.id || !buttonRef.current) {
                if (attempts++ < 20) setTimeout(tryInit, 150);
                return;
            }

            window.google.accounts.id.initialize({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                callback: (response) => {
                    const payload = decodeJwt(response.credential);
                    if (!payload) {
                        onError?.("Could not read your Google account. Please try again.");
                        return;
                    }
                    onSuccess({
                        credential: response.credential, // raw ID token — send this to a real backend
                        fullName: payload.name,
                        email: payload.email,
                        photoURL: payload.picture
                    });
                }
            });

            window.google.accounts.id.renderButton(buttonRef.current, {
                theme: "outline",
                size: "large",
                shape: "pill",
                width: 360
            });
        };

        tryInit();
    }, [onSuccess, onError]);

    return <div ref={buttonRef} className="flex justify-center" />;
};

export default GoogleSignInButton;
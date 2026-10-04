import { useEffect, useRef } from "react";

const decodeJwt = (token) => {
    try {
        const payload = token.split(".")[1];
        const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
        return JSON.parse(decodeURIComponent(escape(json)));
    } catch {
        return null;
    }
};

// Module-level guard so only the FIRST mounted instance ever calls
// google.accounts.id.initialize() — subsequent mounts just render.
let gsiInitialized = false;

const GoogleSignInButton = ({ onSuccess, onError }) => {
    const buttonRef = useRef(null);
    const onSuccessRef = useRef(onSuccess);
    const onErrorRef = useRef(onError);

    useEffect(() => { onSuccessRef.current = onSuccess; }, [onSuccess]);
    useEffect(() => { onErrorRef.current = onError; }, [onError]);

    useEffect(() => {
        let attempts = 0;
        let cancelled = false;

        const tryInit = () => {
            if (cancelled) return;
            if (!window.google?.accounts?.id || !buttonRef.current) {
                if (attempts++ < 20) setTimeout(tryInit, 150);
                return;
            }

            if (!gsiInitialized) {
                window.google.accounts.id.initialize({
                    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                    callback: (response) => {
                        const payload = decodeJwt(response.credential);
                        if (!payload) {
                            onErrorRef.current?.("Could not read your Google account. Please try again.");
                            return;
                        }
                        onSuccessRef.current?.({
                            credential: response.credential,
                            fullName: payload.name,
                            email: payload.email,
                            photoURL: payload.picture
                        });
                    }
                });
                gsiInitialized = true;
            }

            window.google.accounts.id.renderButton(buttonRef.current, {
                theme: "outline",
                size: "large",
                shape: "pill",
                width: 360
            });
        };

        tryInit();

        return () => { cancelled = true; };
    }, []);

    return <div ref={buttonRef} className="flex justify-center" />;
};

export default GoogleSignInButton;
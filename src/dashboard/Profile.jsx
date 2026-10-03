    import { useState, useRef, useEffect, useCallback } from "react";
    import {
        FaUser, FaEnvelope, FaUserShield,
        FaCamera, FaTrash, FaTimes, FaCheck, FaUndo, FaLock
    } from "react-icons/fa";
    import { MdLocationOn } from "react-icons/md";
    import { GiPlantSeed } from "react-icons/gi";
    import { useAuth } from "../context/AuthContext";

    // Size (px) of the final, saved avatar image
    const OUTPUT_SIZE = 320;
    // Size (px) of the circular crop viewport shown in the "Adjust Photo" modal
    const CROP_SIZE = 260;

    const Profile = () => {
        const { currentUser, isAdmin, updateProfile } = useAuth();

        const [profile] = useState({
            fullName: currentUser?.fullName
                || `${currentUser?.firstName || ""} ${currentUser?.lastName || ""}`.trim()
                || "",
            email: currentUser?.email || "",
            role: currentUser?.role || "User"
        });

        // ---- City — the one field a farmer can actually edit ----
        const [city, setCity] = useState(currentUser?.city || "");
        const [savingCity, setSavingCity] = useState(false);
        const [cityStatus, setCityStatus] = useState(""); // "saved" | "error" | ""

        const handleCitySave = async () => {
            setSavingCity(true);
            setCityStatus("");
            const result = await updateProfile(city.trim());
            setSavingCity(false);
            setCityStatus(result.success ? "saved" : "error");
            setTimeout(() => setCityStatus(""), 2500);
        };

        // The applied profile picture — what actually renders on the avatar
        const [photoPreview, setPhotoPreview] = useState(currentUser?.photoURL || null);

        // ---------- "Adjust before apply" crop state ----------
        const [rawImage, setRawImage] = useState(null); // { src, width, height } of the freshly picked file
        const [showAdjustModal, setShowAdjustModal] = useState(false);
        const [zoom, setZoom] = useState(1);
        const [position, setPosition] = useState({ x: 0, y: 0 });

        const fileInputRef = useRef(null);
        const dragState = useRef(null); // { startX, startY, originX, originY }

        const initials = profile.fullName
            ? profile.fullName.trim().split(/\s+/).map((n) => n[0]).slice(0, 2).join("").toUpperCase()
            : "U";

        // Clean up object URLs so we don't leak memory
        useEffect(() => {
            return () => {
                if (photoPreview?.startsWith("blob:")) URL.revokeObjectURL(photoPreview);
            };
        }, [photoPreview]);

        /* ---------- Step 1: pick a file ---------- */
        const handlePhotoClick = () => {
            fileInputRef.current?.click();
        };

        const handlePhotoChange = (e) => {
            const file = e.target.files?.[0];
            if (!file || !file.type.startsWith("image/")) return;

            const url = URL.createObjectURL(file);
            const img = new Image();
            img.onload = () => {
                setRawImage({ src: url, width: img.naturalWidth, height: img.naturalHeight });
                setZoom(1);
                setPosition({ x: 0, y: 0 });
                setShowAdjustModal(true);
            };
            img.src = url;
        };

        /* ---------- Step 2: drag / zoom inside the crop circle ---------- */
        const clampPosition = useCallback((pos, currentZoom) => {
            if (!rawImage) return pos;
            const baseScale = Math.max(CROP_SIZE / rawImage.width, CROP_SIZE / rawImage.height);
            const scale = baseScale * currentZoom;
            const displayW = rawImage.width * scale;
            const displayH = rawImage.height * scale;
            const extraX = Math.max(0, (displayW - CROP_SIZE) / 2);
            const extraY = Math.max(0, (displayH - CROP_SIZE) / 2);
            return {
                x: Math.min(extraX, Math.max(-extraX, pos.x)),
                y: Math.min(extraY, Math.max(-extraY, pos.y))
            };
        }, [rawImage]);

        const handlePointerDown = (e) => {
            dragState.current = {
                startX: e.clientX,
                startY: e.clientY,
                originX: position.x,
                originY: position.y
            };
            e.currentTarget.setPointerCapture(e.pointerId);
        };

        const handlePointerMove = (e) => {
            if (!dragState.current) return;
            const dx = e.clientX - dragState.current.startX;
            const dy = e.clientY - dragState.current.startY;
            setPosition(
                clampPosition(
                    { x: dragState.current.originX + dx, y: dragState.current.originY + dy },
                    zoom
                )
            );
        };

        const handlePointerUp = () => {
            dragState.current = null;
        };

        const handleZoomChange = (e) => {
            const nextZoom = Number(e.target.value);
            setZoom(nextZoom);
            setPosition((prev) => clampPosition(prev, nextZoom));
        };

        const handleResetAdjust = () => {
            setZoom(1);
            setPosition({ x: 0, y: 0 });
        };

        /* ---------- Step 3: Apply -> bake the crop into a canvas ---------- */
        const handleApplyAdjust = () => {
            if (!rawImage) return;

            const baseScale = Math.max(CROP_SIZE / rawImage.width, CROP_SIZE / rawImage.height);
            const scale = baseScale * zoom;
            const displayW = rawImage.width * scale;
            const displayH = rawImage.height * scale;

            const imgLeft = CROP_SIZE / 2 - displayW / 2 + position.x;
            const imgTop = CROP_SIZE / 2 - displayH / 2 + position.y;

            const sourceLeft = -imgLeft / scale;
            const sourceTop = -imgTop / scale;
            const sourceSize = CROP_SIZE / scale;

            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = OUTPUT_SIZE;
                canvas.height = OUTPUT_SIZE;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(
                    img,
                    sourceLeft, sourceTop, sourceSize, sourceSize,
                    0, 0, OUTPUT_SIZE, OUTPUT_SIZE
                );

                if (photoPreview?.startsWith("blob:")) URL.revokeObjectURL(photoPreview);
                setPhotoPreview(canvas.toDataURL("image/jpeg", 0.92));
                // Photo upload isn't wired to the backend yet — still local-only, same as before

                URL.revokeObjectURL(rawImage.src);
                setRawImage(null);
                setShowAdjustModal(false);
                if (fileInputRef.current) fileInputRef.current.value = "";
            };
            img.src = rawImage.src;
        };

        const handleCancelAdjust = () => {
            if (rawImage) URL.revokeObjectURL(rawImage.src);
            setRawImage(null);
            setShowAdjustModal(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        };

        const handlePhotoRemove = (e) => {
            e.stopPropagation();
            if (photoPreview?.startsWith("blob:")) URL.revokeObjectURL(photoPreview);
            setPhotoPreview(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        };

        // Live transform for the image inside the crop modal
        const cropImageStyle = rawImage ? (() => {
            const baseScale = Math.max(CROP_SIZE / rawImage.width, CROP_SIZE / rawImage.height);
            const scale = baseScale * zoom;
            return {
                width: rawImage.width * scale,
                height: rawImage.height * scale,
                transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px)`
            };
        })() : {};

        return (
            <div className="space-y-6 w-full">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        View your account details, set your farm's city, and update your profile picture.
                    </p>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md
                transition-shadow duration-300 overflow-hidden">

                    {/* Banner */}
                    <div className={`h-32 relative ${isAdmin
                    ? "bg-gradient-to-br from-purple-800 to-purple-600"
                    : "bg-gradient-to-br from-primary-800 to-primary-600"}`}>

                        {/* Avatar + photo edit controls */}
                        <div className="absolute -bottom-16 left-6 group">
                            <div className={`w-32 h-32 rounded-full border-4 border-white shadow-lg
                                overflow-hidden relative ${isAdmin
                                    ? "bg-gradient-to-br from-purple-400 to-purple-600" : "bg-gradient-to-br from-primary-400 to-primary-600"
                                }`}>

                                {photoPreview ? (
                                    <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-4xl">
                                        {initials}
                                    </div>
                                )}

                                <button
                                type="button"
                                onClick={handlePhotoClick}
                                className="absolute inset-0 flex items-center justify-center
                                bg-black/0 group-hover:bg-black/40 opacity-0 group-hover:opacity-100
                                transition-all duration-200 cursor-pointer"
                                aria-label="Change profile picture"
                                >
                                    <FaCamera className="text-white text-xl"/>
                                </button>
                            </div>

                            {/* Always-visible camera badge */}
                            <button
                            type="button"
                            onClick={handlePhotoClick}
                            className={`absolute -bottom-1 -right-1 w-9 h-9 rounded-full border-2 border-white
                                flex items-center justify-center shadow-md transition-colors
                                ${isAdmin ? "bg-purple-600 hover:bg-purple-700" : "bg-primary-600 hover:bg-primary-700"}`}
                            aria-label="Change profile picture"
                            >
                                <FaCamera className="text-white text-sm"/>
                            </button>

                            {/* Remove-photo badge, only shown once a photo is applied */}
                            {photoPreview && (
                                <button
                                type="button"
                                onClick={handlePhotoRemove}
                                className="absolute -bottom-1 right-11 w-9 h-9 rounded-full border-2 border-white
                                bg-gray-500 hover:bg-red-500 flex items-center justify-center shadow-md
                                transition-colors"
                                aria-label="Remove profile picture"
                                >
                                    <FaTrash className="text-white text-sm"/>
                                </button>
                            )}

                            <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handlePhotoChange}
                            className="hidden"
                            />
                        </div>

                        {/* Role badge */}
                        <div className="absolute top-3 right-4">
                            <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold
                                ${isAdmin ? "bg-purple-500/40 text-white" : "bg-primary-500/40 text-white"}`}>
                                {isAdmin ? <><FaUserShield />Admin</> : <><FaUser />User</>}
                            </span>
                        </div>
                    </div>

                    <div className="pt-20 px-6 pb-6">

                        {/* Name (no Edit button anymore) */}
                        <div className="mb-6">
                            <h2 className="text-gray-800 font-bold text-xl">
                                {profile.fullName || "Unnamed User"}
                            </h2>
                            <p className={`text-sm capitalize font-medium
                                ${isAdmin ? "text-purple-600" : "text-primary-600"}`}>
                                {isAdmin ? "Administrator" : "Standard User"}
                            </p>
                        </div>

                        {/* Fields — permanently read-only */}
                        <div className="space-y-4">
                            {[
                                { label: "Full Name", name: "fullName", icon: <FaUser />, type: "text" },
                                { label: "Email", name: "email", icon: <FaEnvelope />, type: "email" }
                            ].map((field) => (
                                <div key={field.name}>
                                    <label className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">
                                        {field.label}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                                            {field.icon}
                                        </div>
                                        <input
                                        type={field.type}
                                        name={field.name}
                                        value={profile[field.name]}
                                        disabled
                                        readOnly
                                        className="w-full pl-10 pr-10 py-3 rounded-xl border border-transparent
                                        bg-gray-50 text-sm text-gray-600 outline-none cursor-default"
                                        />
                                        <FaLock className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 text-xs"/>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <p className="text-xs text-gray-400 mt-3">
                            Contact an admin to update your name or email address.
                        </p>

                        {/* City — editable, used for your farm's weather */}
                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">
                                City
                            </label>
                            <p className="text-xs text-gray-400 mb-2">
                                Used to show weather for your farm's location.
                            </p>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                                        <MdLocationOn />
                                    </div>
                                    <input
                                    type="text"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    placeholder="e.g. Shikarpur"
                                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm text-gray-800 outline-none
                                        transition-all duration-200 bg-gray-50
                                        ${isAdmin
                                            ? "border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:bg-white"
                                            : "border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:bg-white"
                                        }`}
                                    />
                                </div>
                                <button
                                type="button"
                                onClick={handleCitySave}
                                disabled={savingCity || !city.trim() || city.trim() === (currentUser?.city || "")}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap
                                    ${savingCity || !city.trim() || city.trim() === (currentUser?.city || "")
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : isAdmin ? "bg-purple-600 text-white hover:bg-purple-700" : "bg-primary-600 text-white hover:bg-primary-700"
                                    }`}
                                >
                                    {savingCity ? "Saving..." : "Save"}
                                </button>
                            </div>
                            {cityStatus === "saved" && (
                                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                                    <FaCheck className="text-[10px]" /> City updated.
                                </p>
                            )}
                            {cityStatus === "error" && (
                                <p className="text-xs text-red-500 mt-2">Could not save. Please try again.</p>
                            )}
                        </div>

                        {/* Extra info */}
                        <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
                            <div className={`rounded-xl p-4 transition-colors ${isAdmin ? "bg-purple-50" : "bg-primary-50"}`}>
                                <div className="flex items-center gap-2 mb-1">
                                    <GiPlantSeed className={isAdmin ? "text-purple-600 text-sm" : "text-primary-600 text-sm"}/>
                                    <p className={`text-xs font-semibold ${isAdmin ? "text-purple-600" : "text-primary-600"}`}>
                                        Account Role
                                    </p>
                                </div>
                                <p className="text-gray-800 font-semibold text-sm capitalize">
                                    {isAdmin ? "Administrator" : "Standard User"}
                                </p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <p className="text-gray-500 text-xs font-semibold mb-1">Email Address</p>
                                <p className="text-gray-800 font-semibold text-sm truncate">{profile.email}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ---------- Adjust Photo Modal ---------- */}
                {showAdjustModal && rawImage && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                        <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">

                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-800">Adjust Photo</h3>
                                <button
                                onClick={handleCancelAdjust}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                aria-label="Close"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            {/* Crop viewport */}
                            <div
                            className="relative mx-auto rounded-full overflow-hidden border-2 border-dashed border-gray-200
                            bg-gray-100 cursor-grab active:cursor-grabbing touch-none select-none"
                            style={{ width: CROP_SIZE, height: CROP_SIZE }}
                            onPointerDown={handlePointerDown}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            onPointerLeave={handlePointerUp}
                            >
                                <img
                                src={rawImage.src}
                                alt="Adjust preview"
                                draggable={false}
                                className="absolute top-1/2 left-1/2 max-w-none pointer-events-none"
                                style={cropImageStyle}
                                />
                            </div>

                            {/* Zoom control */}
                            <div className="mt-5 flex items-center gap-3">
                                <span className="text-xs text-gray-400 font-medium">Zoom</span>
                                <input
                                type="range"
                                min="1"
                                max="3"
                                step="0.05"
                                value={zoom}
                                onChange={handleZoomChange}
                                style={{ accentColor: isAdmin ? "#9333ea" : "#16a34a" }}
                                className="flex-1"
                                />
                                <button
                                type="button"
                                onClick={handleResetAdjust}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                aria-label="Reset"
                                >
                                    <FaUndo className="text-xs"/>
                                </button>
                            </div>

                            <p className="text-xs text-gray-400 text-center mt-2">
                                Drag the photo to reposition it, use the slider to zoom.
                            </p>

                            {/* Actions */}
                            <div className="flex gap-3 mt-6">
                                <button
                                type="button"
                                onClick={handleCancelAdjust}
                                className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-gray-200
                                text-gray-600 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                type="button"
                                onClick={handleApplyAdjust}
                                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center
                                justify-center gap-2 transition-colors
                                ${isAdmin ? "bg-purple-600 hover:bg-purple-700" : "bg-primary-600 hover:bg-primary-700"}`}
                                >
                                    <FaCheck className="text-xs"/> Apply
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    export default Profile;
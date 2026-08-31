import { useState } from "react";
import { MdOutlineImageSearch, MdOutlineSearch, MdUpload } from "react-icons/md";
import { FaLeaf, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { identifyDisease } from "../services/diseaseAPI";


const dummyResult = {
    plant: "Tomato",
    status: "Diseased",
    disease: "Early Blight",
    confidence: "94.3%",
    severity: "High",
    recommendation: "Apply recommended fungicide (Mancozeb or Chlorothalonil). Remove and destroy infected leaves immediately."
};


const Disease = () => {

    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState(null);


    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if(!file) return;
        setImage(file);
        setPreview(URL.createObjectURL(file));
        setResult(null);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if(!file) return;
        setImage(file);
        setPreview(URL.createObjectURL(file));
        setResult(null);
    };

   const handleAnalyze = async () => {
    if(!image) return;
    setIsAnalyzing(true);
    setResult(null);

    try {
        const data = await identifyDisease(image);

        if(data && data.suggestions && data.suggestions.length > 0) {
            const topResult = data.suggestions[0];
            const disease = data.health_assesment?.disease || [];
            const topDisease = disease[0];

            setResult ({
                plant:          topResult.plant_name || "Unknown Plant",
                status:         diseases.length > 0 && topDisease?.probability > 0.3
                                ? "Diseased" : "Healthy",
                disease:        topDisease?.name || "No disease detected",
                confidence:     `${((topResult.probability || 0) * 100).toFixed(1)}%`,
                severity:       topDisease?.probability > 0.7 ? "High"
                                : topDisease?.probability > 0.4 ? "Medium"
                                : topDisease?.probability > 0.2 ? "Low" : "None",
                recommendation: topDisease?.disease_details?.treatment?.biological?.[0]
                                || topDisease?.disease_details?.description
                                || "Plant appears healthy. Continue regular care and monitoring.",
                description:    topResult.plant_details?.wiki_description?.value?.slice(0, 200) || ""
            });
        }
        else {
            // Fallback if API returns no result
            setResult({
                plant:          "Unknown",
                status:         "Unknown",
                disease:        "Could not identify",
                confidence:     "N/A",
                severity:       "None",
                recommendation: "Please upload a clearer image of the plant leaf.",
                description:    ""
            });
        }
    }
    catch(error) {
        console.error("Disease API error:", error);
        // Fallback to dummy result if API fails
        setResult({
            plant:          "Tomato",
            status:         "Diseased",
            disease:        "Early Blight",
            confidence:     "94.3%",
            severity:       "High",
            recommendation: "Apply recommended fungicide. Remove infected leaves immediately.",
            description:    "API connection failed — showing demo result."
        });
    }
    setIsAnalyzing(false);
};

    const handleReset = () => {
        setImage(null);
        setPreview(null);
        setResult(null);
    };

    return (
        <div className="space-y-6">

            {/* Header */}

            <div>
                <h1 className="text-2xl font-bold text-gray-800">Plant Disease Detection</h1>
                <p className="text-gray-500 text-sm mt-1">
                    Upload a Plant image to detect disease.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Upload Card */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="text-gray-800 font-semibold text-base mb-4 flex items-center gap-2">
                        <MdUpload className="text-primary-600 text-xl" />
                        Upload Plant Image
                    </h2>

                    {/* Drop Zone */}

                    <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center
                    hover:border-primary-400 transition-colors cursor-pointer mb-4"
                    onClick={() => document.getElementById("imageInput").click()}
                    >
                        {preview ? (
                            <img 
                            src={preview}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-xl"
                            />
                        ): (
                            <div className="py-8">
                                <MdOutlineSearch className="text-5xl text-gray-300 mx-auto mb-3"/>
                                <p className="text-gray-500 text-sm font-medium">
                                    Drop your image here or click to browse
                                </p>
                                <p className="text-gray-400 text-xs mt-1">
                                    Supports JPG, PNG, WEBP
                                </p>
                            </div>
                        )}
                    </div>

                    <input 
                    id="imageInput"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    />
                     {/* Buttons */}
                     <div className="flex gap-3">
                        <button
                        onClick={handleAnalyze}
                        disabled={!image || isAnalyzing}
                        className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex
                            items-center justify-center gap-2 text-white
                            ${!image || isAnalyzing ? "bg-gray-300 cursor-not-allowed" : "bg-primary-600 hover:bg-primary-700 hover:shadow-lg"}`}
                        >
                            {isAnalyzing ? (
                                <>
                                 <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                 </svg>
                                 Analyzing...
                                </>
                            ):(
                                <>
                                    <MdOutlineImageSearch className="text-lg" />
                                    Analyze Image
                                </>
                            )}
                            </button>
                            {image && (
                                <button
                                onClick={handleReset}
                                className="px-4 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium
                                hover:bg-gray-50 transition-colors"
                                > 
                                Reset
                                </button>
                            )}
                     </div>
                </div>

                {/* Result Card */}

                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="text-gray-800 font-semibold text-base mb-4 flex items-center gap-2">
                        <FaLeaf className="text-primary-600"/>
                        Detection Result
                    </h2>

                    {result ? (
                        <div className="space-y-4">

                            {/* Status Badge */}
                            <div className={`flex items-center gap-2 p-3 rounded-xl 
                                ${result.status === "Healthy" 
                                    ? "bg-green-50 border border-green-200"
                                    : "bg-red-50 border border-red-200"
                                }`}>
                                    {result.status === "Healthy"
                                    ? <FaCheckCircle className="text-green-600 text-lg" />
                                    : <FaExclamationTriangle className="text-red-600 text-lg" /> 
                                }    
                                <div>
                                <p className="font-bold text-sm text-gray-800">{result.status}</p>   
                                <p className="text-xs text-gray-500">Confidence: {result.confidence}</p> 
                                </div>                              
                            </div>
                            {/* Details */}
                            {[
                                {label: "Plant", value:   result.plant},
                                {label: "Disease", value: result.disease},
                                {label: "Severity", value: result.severity}
                            ].map((item) =>(
                                <div key={item.label} className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-gray-500 text-sm">{item.label}</span>
                                    <span className="text-gray-800 font-semibold text-sm">{item.value}</span>  
                                </div>
                            ))}

                            {/* Recommendations */}
                            <div className="bg-primary-50 border border-primary-100 rounded-xl p-4">
                                <p className="text-primary-700 font-semibold  text-xs mb-1">
                                    Recommendation
                                </p>
                                <p className="text-primary-600 text-xs leading-relaxed">
                                    {result.recommendation}
                                </p>
                            </div>
                        </div>
                    ): (
                        <div className="flex flex-col items-center justify-center h-48 text-center">
                            <MdOutlineImageSearch className="text-5xl text-gray-200 mb-3"/>
                            <p className="text-gray-400 text-sm">
                                Upload an image and click Analyze to see results.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


export default Disease;
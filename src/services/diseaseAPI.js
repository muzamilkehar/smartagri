const API_KEY = import.meta.env.VITE_DISEASE_API_KEY;
const BASE_URL = "https://api.plant.id/v2";

// Convert image file to base64

const toBase64 = (file) => 
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
     });


     // identify plant disease from image

     export const identifyDisease = async(imageFile) => {
        try {
            const base64Image = await toBase64(imageFile);

            const response = await fetch(`${BASE_URL}/identify`,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Api_key": API_KEY,
                },
                body: JSON.stringify({
                    images: [base64Image],
                    modifiers: ["crops_fast", "similar_images"],
                    plant_language: "en",
                    plant_id: "suggest",
                    plant_details: [
                        "common_names",
                        "url",
                        "description",
                        "taxonomy",
                        "wiki_description"
                    ],

                    disease_details: [
                    "description",
                    "treatment",
                    "classification",
                    "common_names",
                    ],

                }),
            });

            if(!response.ok) 
                throw new Error("Plant API Failed");
        }

        catch (error) {
            console.error("Disease API Failed: ", error);
            return null;
        }
     };
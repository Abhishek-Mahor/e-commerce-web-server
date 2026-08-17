const Product = require("../models/product.model");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require('axios');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);






async function suggestOutfit(req, res) {
  try {
    const { occasion, weather } = req.body;

    if (!occasion || !weather) {
      return res.status(400).json({ 
        success: false, 
        message: "Occasion and weather are required." 
      });
    }

    // Get products from database
    const products = await Product.find({});
    
    // Prepare a clean list of products for Gemini to analyze
    const productCatalog = products.map(p => ({
      id: p._id.toString(),
      name: p.name,
      color: p.color,
      description: p.description,
      price: p.price,
      size: p.size
    }));

    const promptgemini = `You are a professional fashion stylist and coordinator. 
Give fashion outfit suggestions for:
Occasion: ${occasion}
Weather: ${weather}

Here is the catalog of available products in our store:
${JSON.stringify(productCatalog, null, 2)}

Instructions:
1. Provide a detailed, cohesive style/outfit recommendation based on the occasion and weather.
2. Select the specific products from the available catalog list that match or complement this look.
3. Recommend only products that exist in the provided catalog list.

Return your response STRICTLY in the following JSON format:
{
  "clothsuggestion": "Detailed styling advice and outfit description. Use standard markdown for list items and headers if needed.",
  "recommendedProductIds": ["list of product IDs that you selected from the catalog that match this look"]
}

Ensure the output is valid, parsable JSON and nothing else.`;
     
    // Call Gemini API requesting JSON response
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });
    
    const result = await model.generateContent(promptgemini);
    const responseText = result.response.text();
    
    let clothsuggestion = "";
    let recommendedProducts = [];

    try {
      const parsedData = JSON.parse(responseText);
      clothsuggestion = parsedData.clothsuggestion || "";
      const recommendedIds = parsedData.recommendedProductIds || [];
      
      // Filter database products that match the recommended IDs
      recommendedProducts = products.filter(p => recommendedIds.includes(p._id.toString()));
    } catch (parseError) {
      console.error("JSON parsing error from Gemini response:", parseError);
      clothsuggestion = responseText; // fallback to raw response if JSON parsing fails
    }

    console.log("Outfit suggestions and product matches generated successfully");

    // Return response
    return res.json({ 
      clothsuggestion,
      recommendedProducts,
      success: true 
    });
  } catch (error) {
    console.error("Error in suggestOutfit:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to generate outfit suggestion.",
      error: error.message 
    });
  }
}

    

   

   






module.exports = { suggestOutfit };

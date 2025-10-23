const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = 3000;

const GEMINI_API_KEY = "AIzaSyCubGmnX_kJ-yBOSF_Z1MW0H0YBKZ5m7gU";

const apiCache = new Map();

app.use(express.json());
app.use(cors());
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

app.post('/analyze', async (req, res) => {
  const { productName } = req.body;
  if (!productName) return res.status(400).json({ error: 'Product name is required.' });

  if (apiCache.has(productName)) {
    console.log(`[Cache Hit] Serving from cache: ${productName}`);
    return res.json(apiCache.get(productName));
  }
  
  console.log(`[API Call] Analyzing new product: ${productName}`);

  const prompt = `
    You are Verdify, a sustainability research assistant. Analyze the product "${productName}".

    Perform these steps:
    1. Research the product's full lifecycle (materials, manufacturing, use, disposal).
    2. Identify 3 to 5 total, concise, one-liner key points (pros and cons).
    3. Determine its primary positive impact category from this list: "Reduced Plastic Waste", "Lower Energy Use", "E-Waste Prevention", "Sustainable Materials". If none strongly apply, use "General Eco-Choice".
    4. Suggest one highly-rated sustainable alternative and create its Amazon.com search URL.
    5. Provide a sustainability score (0-100) and a confidence score (0-100).

    Return your response strictly in the following JSON format:
    {
      "sustainabilityScore": <integer>,
      "confidenceScore": <integer>,
      "keyPoints": [
        {"type": "positive", "text": "<A concise positive one-liner.>"},
        {"type": "negative", "text": "<A concise negative one-liner.>"}
      ],
      "impactCategory": "<The determined impact category from the list>",
      "smarterSwap": {
        "name": "<Name of the alternative product>",
        "searchLink": "<A valid, full Amazon.com search URL for the alternative>"
      }
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const jsonResponse = JSON.parse(responseText.replace(/```json|```/g, '').trim());
    
    apiCache.set(productName, jsonResponse);
    res.json(jsonResponse);

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ error: 'Failed to analyze the product.' });
  }
});

app.listen(PORT, () => {
  console.log(`Verdify server is running on http://localhost:${PORT}`);
});
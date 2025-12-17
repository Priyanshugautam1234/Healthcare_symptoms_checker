require('dotenv').config();
const { analyzeSymptoms } = require('./services/llmService');

async function testGemini() {
    console.log("Testing Gemini API...");
    console.log("Key present:", !!process.env.LLM_API_KEY);
    console.log("Provider:", process.env.LLM_PROVIDER);

    const symptoms = "I have a sharp pain in my lower right abdomen and feeling nauseous";
    try {
        const result = await analyzeSymptoms(symptoms);
        console.log("Result:", JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("Test Failed:", error);
    }
}

testGemini();

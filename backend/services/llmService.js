
const axios = require('axios');

async function analyzeSymptoms(symptoms) {
    const apiKey = process.env.LLM_API_KEY;
    const provider = process.env.LLM_PROVIDER || 'mock'; // 'openai', 'gemini', 'mock'

    // Real Gemini API Implementation
    if (provider === 'gemini' || (process.env.LLM_API_KEY && process.env.LLM_API_KEY.length > 10)) {
        if (!process.env.LLM_API_KEY) {
            return {
                conditions: [{ name: "Configuration Error", explanation: "Missing API Key." }],
                recommendations: [{ action: "Update .env", reason: "Please set LLM_API_KEY in your backend/.env file." }],
                disclaimer: "System Information",
                emergency_alert: false
            };
        }

        try {
            const prompt = `
            You are a helpful medical assistant AI.
            User symptoms: "${symptoms}"

            Analyze these symptoms and identify possible conditions.
            Also provide specific, actionable recommendations.
            Determine if this is a medical emergency.
            
            Strictly output VALID JSON in the following format (no markdown code blocks):
            {
                "conditions": [
                    { "name": "Condition Name", "explanation": "Brief explanation of why this fits." }
                ],
                "recommendations": [
                    { "action": "Action Title", "reason": "Why this action helps." }
                ],
                "disclaimer": "Standard medical disclaimer text.",
                "emergency_alert": boolean
            }
            `;

            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
                {
                    contents: [{ parts: [{ text: prompt }] }]
                },
                { headers: { 'Content-Type': 'application/json' } }
            );

            const textResponse = response.data.candidates[0].content.parts[0].text;

            // Clean markdown formatting if present (e.g. ```json ... ```)
            const jsonStr = textResponse.replace(/^```json\n|\n```$/g, '').trim();

            return JSON.parse(jsonStr);

        } catch (error) {
            console.error("Gemini API Error:", error.response ? error.response.data : error.message);
            return {
                conditions: [{ name: "API Error", explanation: "Failed to connect to AI service." }],
                recommendations: [{ action: "Check Configuration", reason: "Ensure your API Key is valid and you have internet access." }],
                disclaimer: "System Error",
                emergency_alert: false
            };
        }
    }

    // Default to Error if provider not handled
    return {
        conditions: [{ name: "Configuration Required", explanation: "Please set LLM_PROVIDER=gemini and provide an LLM_API_KEY in the backend .env file to use the AI." }],
        recommendations: [{ action: "Update Configuration", reason: "Real-time analysis requires a valid Google Gemini API Key." }],
        disclaimer: "System Information",
        emergency_alert: false
    };
}

module.exports = { analyzeSymptoms };

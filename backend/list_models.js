require('dotenv').config();
const axios = require('axios');

async function listModels() {
    const key = process.env.LLM_API_KEY;
    if (!key) {
        console.log("No API Key found");
        return;
    }

    try {
        const response = await axios.get(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
        );
        console.log("Available Models:");
        response.data.models.forEach(m => console.log(`- ${m.name} (${m.supportedGenerationMethods})`));
    } catch (error) {
        console.error("List Models Error:", error.response ? error.response.data : error.message);
    }
}

listModels();

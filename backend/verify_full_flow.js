const axios = require('axios');

async function verify() {
    console.log("Verifying Backend Status...");
    try {
        // 1. Check Health
        const health = await axios.get('http://localhost:5000/');
        console.log("✅ Server Health:", health.data);

        // 2. Test AI Analysis
        console.log("\nTesting AI Analysis (Gemini)...");
        const response = await axios.post('http://localhost:5000/api/analyze', {
            symptoms: "I have a throbbing headache and sensitivity to light"
        });

        if (response.data.conditions && response.data.conditions.length > 0) {
            console.log("✅ AI Response Received:");
            console.log(`   Condition: ${response.data.conditions[0].name}`);
            console.log(`   Explanation: ${response.data.conditions[0].explanation}`);
            console.log("   Emergency Alert:", response.data.emergency_alert);
        } else {
            console.error("❌ AI Response Invalid:", response.data);
        }

    } catch (error) {
        console.error("❌ Verification Failed:", error.message);
        if (error.response) console.error("   Server Response:", error.response.data);
    }
}

verify();

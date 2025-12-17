const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { analyzeSymptoms } = require('./services/llmService');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Basic health check
app.get('/', (req, res) => {
    res.send('Healthcare Symptom Checker API is running.');
});

// Symptom Analysis Endpoint
app.post('/api/analyze', async (req, res) => {
    try {
        const { symptoms } = req.body;
        if (!symptoms) {
            return res.status(400).json({ error: 'Symptoms are required.' });
        }

        const result = await analyzeSymptoms(symptoms);
        res.json(result);
    } catch (error) {
        console.error('Error analyzing symptoms:', error);
        res.status(500).json({ error: 'Failed to analyze symptoms.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

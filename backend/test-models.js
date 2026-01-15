require('dotenv').config();
const axios = require('axios');

const API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
    try {
        console.log('Testing API key:', API_KEY.substring(0, 10) + '...');
        console.log('\nFetching available models...');
        
        // Try using the REST API directly
        const response = await axios.get(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
        );
        
        console.log('\nAvailable models:');
        response.data.models.forEach(model => {
            console.log(`- ${model.name}`);
            console.log(`  Display Name: ${model.displayName}`);
            console.log(`  Supported methods: ${model.supportedGenerationMethods.join(', ')}`);
            console.log('');
        });
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

listModels();

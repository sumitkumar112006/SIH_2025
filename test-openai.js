// OpenAI Connection Test Script
// Run this with: node test-openai.js

const axios = require('axios');

class OpenAITester {
    constructor() {
        this.apiKey = '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';
        this.baseUrl = 'https://openrouter.ai/api/v1';
        this.openAIModels = [
            'openai/gpt-4o-mini',
            'openai/gpt-4o',
            'openai/gpt-3.5-turbo'
        ];
    }

    async testModel(model) {
        try {
            console.log(`🧪 Testing ${model}...`);
            
            const response = await axios.post(
                `${this.baseUrl}/chat/completions`,
                {
                    model: model,
                    messages: [
                        { role: 'user', content: 'Hello! Please respond with "WORKING" if you can process this message.' }
                    ],
                    temperature: 0.1,
                    max_tokens: 50
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': 'https://kmrl-document-system.com',
                        'X-Title': 'KMRL Document Management System'
                    },
                    timeout: 10000
                }
            );

            const result = response.data.choices[0].message.content;
            console.log(`✅ ${model}: ${result}`);
            return { success: true, model, response: result };
            
        } catch (error) {
            const errorMsg = error.response?.data?.error?.message || error.message;
            console.log(`❌ ${model}: ${errorMsg}`);
            return { success: false, model, error: errorMsg };
        }
    }

    async testAllOpenAIModels() {
        console.log('🚀 Starting OpenAI Model Test via OpenRouter...\n');
        
        const results = [];
        
        for (const model of this.openAIModels) {
            const result = await this.testModel(model);
            results.push(result);
            
            // Add delay between requests
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        console.log('\n📊 Test Summary:');
        console.log('================');
        
        const working = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);
        
        console.log(`✅ Working models: ${working.length}/${results.length}`);
        working.forEach(r => console.log(`   - ${r.model}`));
        
        if (failed.length > 0) {
            console.log(`❌ Failed models: ${failed.length}/${results.length}`);
            failed.forEach(r => console.log(`   - ${r.model}: ${r.error}`));
        }
        
        if (working.length > 0) {
            console.log(`\n🎉 Recommended model: ${working[0].model}`);
            console.log('OpenAI integration is working properly! 🚀');
        } else {
            console.log('\n⚠️ All OpenAI models failed. Check your API key and OpenRouter status.');
        }
        
        return results;
    }

    async testAPIKey() {
        try {
            console.log('🔑 Testing API key validity...');
            
            const response = await axios.get(`${this.baseUrl}/models`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                },
                timeout: 10000
            });
            
            const openAIModels = response.data.data.filter(model => 
                model.id.startsWith('openai/')
            );
            
            console.log(`✅ API key valid! Found ${openAIModels.length} OpenAI models available.`);
            return true;
            
        } catch (error) {
            console.log(`❌ API key test failed: ${error.response?.data?.error?.message || error.message}`);
            return false;
        }
    }
}

// Run the test
async function runTest() {
    const tester = new OpenAITester();
    
    // Test API key first
    const keyValid = await tester.testAPIKey();
    
    if (keyValid) {
        console.log('\n');
        await tester.testAllOpenAIModels();
    } else {
        console.log('\n❌ Cannot proceed with model tests - API key is invalid.');
        console.log('Please check your OpenRouter API key.');
    }
}

// Export for use in other modules
module.exports = OpenAITester;

// Run test if this file is executed directly
if (require.main === module) {
    runTest().catch(console.error);
}
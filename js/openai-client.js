// OpenAI API Client - Handles all AI API communication
class OpenAIClient {
    constructor(config = {}) {
        this.apiKey = config.apiKey || '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';
        this.apiUrl = config.apiUrl || 'https://openrouter.ai/api/v1/chat/completions';
        this.model = config.model || 'microsoft/wizardlm-2-8x22b';
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'HTTP-Referer': 'https://kmrl-docs.local',
            'X-Title': 'KMRL Document Management System'
        };
        this.defaultParams = {
            max_tokens: 500,
            temperature: 0.7
        };
    }

    // Main method to get AI response
    async getChatCompletion(messages, options = {}) {
        try {
            const requestBody = {
                model: options.model || this.model,
                messages: messages,
                max_tokens: options.max_tokens || this.defaultParams.max_tokens,
                temperature: options.temperature || this.defaultParams.temperature,
                ...options.additionalParams
            };

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: { ...this.defaultHeaders, ...options.headers },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('Invalid response format from API');
            }

            return {
                success: true,
                content: data.choices[0].message.content,
                usage: data.usage,
                model: data.model,
                fullResponse: data
            };

        } catch (error) {
            console.error('OpenAI API Error:', error);
            return {
                success: false,
                error: error.message,
                type: this.getErrorType(error)
            };
        }
    }

    // Helper method to create system prompt
    createSystemPrompt(context) {
        return `You are KMRL AI Assistant, an intelligent helper for the KMRL Document Management System.

Project Context: ${context.purpose || 'KMRL Document Management System'}

Key Features: ${context.features ? context.features.join(', ') : 'Document management, tender tracking, analytics'}

User Role: ${context.userRole || 'user'}

You should help users with:
1. Document upload and management procedures
2. System navigation and feature explanations
3. Tender tracking and notification setup
4. Analytics and reporting guidance
5. General system usage questions

Provide helpful, concise, and actionable responses. Always be friendly and professional.`;
    }

    // Method for single message completion
    async getSingleResponse(userMessage, systemPrompt = null, options = {}) {
        const messages = [];
        
        if (systemPrompt) {
            messages.push({ role: 'system', content: systemPrompt });
        }
        
        messages.push({ role: 'user', content: userMessage });

        return await this.getChatCompletion(messages, options);
    }

    // Method for conversation with history
    async getContinuationResponse(userMessage, chatHistory = [], systemPrompt = null, options = {}) {
        const messages = [];
        
        if (systemPrompt) {
            messages.push({ role: 'system', content: systemPrompt });
        }

        // Add recent chat history (limit to last 10 messages to manage token usage)
        const recentHistory = chatHistory.slice(-10);
        messages.push(...recentHistory);
        
        messages.push({ role: 'user', content: userMessage });

        return await this.getChatCompletion(messages, options);
    }

    // Specialized method for document analysis
    async analyzeDocument(documentContent, analysisType = 'summary', options = {}) {
        const prompts = {
            summary: `Please provide a concise summary of the following document:

${documentContent}

Summary:`,
            keywords: `Extract the most important keywords from the following document (return as comma-separated list):

${documentContent}

Keywords:`,
            category: `Categorize the following document into one of these categories: Infrastructure, Electrical, Mechanical, Civil, Technology, Maintenance, Safety, Finance, HR, Other

Document:
${documentContent}

Category:`,
            priority: `Assess the priority level of this document as: urgent, high, medium, or low

Document:
${documentContent}

Priority:`
        };

        const prompt = prompts[analysisType] || prompts.summary;
        
        const analysisOptions = {
            max_tokens: options.max_tokens || 200,
            temperature: options.temperature || 0.3,
            ...options
        };

        return await this.getSingleResponse(prompt, null, analysisOptions);
    }

    // Specialized method for tender analysis
    async analyzeTender(tenderData, analysisType = 'summary', options = {}) {
        const tenderInfo = `
Title: ${tenderData.title || 'N/A'}
Organization: ${tenderData.organization || 'N/A'}
Description: ${tenderData.description || 'N/A'}
Value: ${tenderData.value || 'N/A'}
Location: ${tenderData.location || 'N/A'}
Category: ${tenderData.category || 'N/A'}
Deadline: ${tenderData.deadline || 'N/A'}
`;

        const prompts = {
            summary: `Provide a concise summary of this tender:\n${tenderInfo}\nSummary:`,
            keywords: `Extract important keywords from this tender (comma-separated):\n${tenderInfo}\nKeywords:`,
            department: `Categorize this tender by department: Infrastructure, Electrical, Mechanical, Civil, Technology, Maintenance, Safety, Other\n${tenderInfo}\nDepartment:`,
            priority: `Assess tender priority as: urgent, high, medium, low\n${tenderInfo}\nPriority:`
        };

        const prompt = prompts[analysisType] || prompts.summary;
        
        const analysisOptions = {
            max_tokens: options.max_tokens || 150,
            temperature: options.temperature || 0.3,
            ...options
        };

        return await this.getSingleResponse(prompt, null, analysisOptions);
    }

    // Method to test API connection
    async testConnection() {
        try {
            const result = await this.getSingleResponse('Hello, please respond with "Connection successful"', null, {
                max_tokens: 50,
                temperature: 0
            });
            
            return {
                success: result.success,
                message: result.success ? 'API connection successful' : `Connection failed: ${result.error}`,
                details: result
            };
        } catch (error) {
            return {
                success: false,
                message: `Connection test failed: ${error.message}`,
                error: error
            };
        }
    }

    // Helper method to determine error type
    getErrorType(error) {
        if (error.message.includes('401')) return 'authentication';
        if (error.message.includes('403')) return 'permission';
        if (error.message.includes('429')) return 'rate_limit';
        if (error.message.includes('500')) return 'server_error';
        if (error.message.includes('network') || error.message.includes('fetch')) return 'network';
        return 'unknown';
    }

    // Method to update API key
    updateApiKey(newApiKey) {
        this.apiKey = newApiKey;
        this.defaultHeaders['Authorization'] = `Bearer ${newApiKey}`;
    }

    // Method to update model
    updateModel(newModel) {
        this.model = newModel;
    }

    // Method to get current configuration
    getConfig() {
        return {
            model: this.model,
            apiUrl: this.apiUrl,
            hasApiKey: !!this.apiKey,
            defaultParams: this.defaultParams
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OpenAIClient;
}

// Make available globally for browser use
if (typeof window !== 'undefined') {
    window.OpenAIClient = OpenAIClient;
}
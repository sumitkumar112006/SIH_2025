const axios = require('axios');

class OpenRouterAIService {
    constructor() {
        // Your OpenRouter API key
        this.apiKey = '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';
        this.baseUrl = 'https://openrouter.ai/api/v1';
        this.siteUrl = 'https://kmrl-document-system.com'; // Replace with your actual site URL
        this.siteTitle = 'KMRL Document Management System';
        
        // PRIORITY: OpenAI models first - high reliability and performance
        this.defaultModel = 'openai/gpt-4o-mini'; // Best balance of speed/cost/quality
        
        // OpenAI Model Priority List (in order of preference)
        this.openAIModels = [
            'openai/gpt-4o-mini',     // Primary: Fast, reliable, cost-effective
            'openai/gpt-4o',          // Secondary: Most powerful for complex tasks
            'openai/gpt-3.5-turbo',   // Fallback: Reliable and fast
            'openai/o1-preview',      // Advanced reasoning when needed
            'openai/o1-mini'          // Lightweight reasoning model
        ];
        
        // Fallback models (if OpenAI unavailable)
        this.fallbackModels = [
            'anthropic/claude-3-5-sonnet',
            'anthropic/claude-3-haiku',
            'meta-llama/llama-3.1-8b-instruct:free'
        ];
        
        this.currentModelIndex = 0; // Start with first OpenAI model
    }

    /**
     * Make a request to OpenRouter API with OpenAI priority and fallback
     */
    async makeRequest(messages, model = null, temperature = 0.7, maxTokens = 1000) {
        const modelToTry = model || this.getNextOpenAIModel();
        
        try {
            console.log(`🤖 Trying OpenAI model: ${modelToTry}`);
            
            const response = await axios.post(
                `${this.baseUrl}/chat/completions`,
                {
                    model: modelToTry,
                    messages: messages,
                    temperature: temperature,
                    max_tokens: maxTokens,
                    // OpenAI-specific optimizations
                    top_p: 1,
                    frequency_penalty: 0,
                    presence_penalty: 0
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': this.siteUrl,
                        'X-Title': this.siteTitle
                    },
                    timeout: 30000 // 30 second timeout
                }
            );

            // Reset model index on success (OpenAI is working)
            this.currentModelIndex = 0;
            console.log(`✅ OpenAI request successful with model: ${modelToTry}`);
            
            return response.data.choices[0].message.content;
            
        } catch (error) {
            console.error(`❌ OpenAI model ${modelToTry} failed:`, error.response?.data || error.message);
            
            // Try next OpenAI model if current one fails
            if (!model && this.currentModelIndex < this.openAIModels.length - 1) {
                console.log(`🔄 Trying next OpenAI model...`);
                this.currentModelIndex++;
                return this.makeRequest(messages, null, temperature, maxTokens);
            }
            
            // If all OpenAI models fail, try fallback models
            if (!model && this.currentModelIndex >= this.openAIModels.length - 1) {
                console.log(`🚨 All OpenAI models failed, trying fallback models...`);
                return this.makeRequestWithFallback(messages, temperature, maxTokens);
            }
            
            throw new Error(`OpenAI Service Error: ${error.response?.data?.error?.message || error.message}`);
        }
    }
    
    /**
     * Get the next OpenAI model to try
     */
    getNextOpenAIModel() {
        return this.openAIModels[this.currentModelIndex] || this.openAIModels[0];
    }
    
    /**
     * Fallback request with non-OpenAI models
     */
    async makeRequestWithFallback(messages, temperature = 0.7, maxTokens = 1000) {
        for (const fallbackModel of this.fallbackModels) {
            try {
                console.log(`🔄 Trying fallback model: ${fallbackModel}`);
                
                const response = await axios.post(
                    `${this.baseUrl}/chat/completions`,
                    {
                        model: fallbackModel,
                        messages: messages,
                        temperature: temperature,
                        max_tokens: maxTokens
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${this.apiKey}`,
                            'Content-Type': 'application/json',
                            'HTTP-Referer': this.siteUrl,
                            'X-Title': this.siteTitle
                        },
                        timeout: 30000
                    }
                );
                
                console.log(`✅ Fallback model ${fallbackModel} successful`);
                return response.data.choices[0].message.content;
                
            } catch (error) {
                console.error(`❌ Fallback model ${fallbackModel} failed:`, error.response?.data || error.message);
                continue; // Try next fallback model
            }
        }
        
        throw new Error('All AI models (OpenAI and fallbacks) are currently unavailable. Please try again later.');
    }

    /**
     * Enhanced Document Summarization using OpenAI (Priority) via OpenRouter
     */
    async summarizeDocument(text, summaryType = 'standard') {
        const systemPrompt = `You are an expert document analyst for KMRL (Kochi Metro Rail Limited). 
        Your task is to provide comprehensive document summaries that help government officials and project managers quickly understand key information.
        
        Focus on:
        - Key decisions and action items
        - Important dates and deadlines
        - Financial implications
        - Regulatory/compliance requirements
        - Risk factors
        - Stakeholder information`;

        let userPrompt;
        switch (summaryType) {
            case 'executive':
                userPrompt = `Provide an executive summary of this document in 2-3 paragraphs, focusing on strategic decisions, financial impact, and key outcomes:\n\n${text}`;
                break;
            case 'technical':
                userPrompt = `Provide a technical summary focusing on specifications, requirements, procedures, and implementation details:\n\n${text}`;
                break;
            case 'bullet':
                userPrompt = `Summarize this document as clear bullet points covering the most important information:\n\n${text}`;
                break;
            default:
                userPrompt = `Summarize this document comprehensively, highlighting key points, decisions, dates, and action items:\n\n${text}`;
        }

        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ];

        // Use OpenAI for high-quality summarization
        const summary = await this.makeRequest(messages, this.getNextOpenAIModel(), 0.3, 800);
        
        return {
            summary: summary,
            summaryType: summaryType,
            wordCount: text.split(/\s+/).length,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Advanced Document Classification using OpenAI (Priority)
     */
    async classifyDocument(text) {
        const systemPrompt = `You are a document classification expert for KMRL's document management system.
        
        Classify documents into these categories:
        - TENDER: Tender notices, RFPs, bid documents
        - CONTRACT: Agreements, MOUs, service contracts
        - TECHNICAL: Engineering specs, blueprints, technical reports
        - FINANCIAL: Budgets, invoices, payment records, audits
        - REGULATORY: Compliance docs, safety reports, regulatory filings
        - HR: Personnel policies, recruitment, training materials
        - OPERATIONS: Operational procedures, maintenance guides
        - SAFETY: Safety protocols, incident reports, risk assessments
        - LEGAL: Legal opinions, court documents, regulatory notices
        - PROJECT: Project plans, status reports, milestone documents
        
        Also provide:
        - Confidence score (0-1)
        - 3-5 relevant tags
        - Urgency level (LOW/MEDIUM/HIGH/CRITICAL)
        - Suggested actions
        
        Format as JSON.`;

        const userPrompt = `Classify this document:\n\n${text}`;

        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ];

        try {
            // Use OpenAI for accurate classification
            const response = await this.makeRequest(messages, this.getNextOpenAIModel(), 0.2, 500);
            return JSON.parse(response);
        } catch (error) {
            // Fallback if JSON parsing fails
            return {
                category: 'GENERAL',
                confidence: 0.5,
                tags: ['document', 'kmrl'],
                urgency: 'MEDIUM',
                actions: ['Review and categorize manually']
            };
        }
    }

    /**
     * Enhanced Language Detection and Translation using OpenAI (Priority)
     */
    async translateText(text, targetLanguage = null) {
        // Detect if text contains Malayalam characters
        const containsMalayalam = /[\u0D00-\u0D7F]/.test(text);
        const isEnglish = /^[A-Za-z0-9\s.,!?;:'"()-]+$/.test(text.trim());
        
        let detectedLanguage = 'Unknown';
        if (containsMalayalam) {
            detectedLanguage = 'Malayalam';
        } else if (isEnglish) {
            detectedLanguage = 'English';
        }

        // Determine target language
        if (!targetLanguage) {
            targetLanguage = detectedLanguage === 'Malayalam' ? 'English' : 'Malayalam';
        }

        const systemPrompt = `You are a professional translator specializing in English-Malayalam translation for government and technical documents.
        
        Provide accurate translations that:
        - Maintain technical terminology appropriately
        - Preserve the formal tone suitable for government documents
        - Keep proper nouns and technical terms where appropriate
        - Ensure cultural context is maintained`;

        const userPrompt = `Translate this ${detectedLanguage} text to ${targetLanguage}. If technical terms don't have direct translations, keep them in English with Malayalam explanation in parentheses:

${text}`;

        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ];

        // Use OpenAI for high-quality translation
        const translation = await this.makeRequest(messages, this.getNextOpenAIModel(), 0.3, 1000);

        return {
            originalText: text,
            translatedText: translation,
            sourceLanguage: detectedLanguage,
            targetLanguage: targetLanguage,
            confidence: 0.95,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Advanced Entity Extraction
     */
    async extractEntities(text) {
        const systemPrompt = `You are an expert at extracting structured information from KMRL documents.
        
        Extract and categorize the following entities:
        - PERSONS: Names of individuals, officials, contractors
        - ORGANIZATIONS: Company names, government bodies, departments
        - DATES: All dates mentioned (format as YYYY-MM-DD where possible)
        - AMOUNTS: Financial amounts with currency
        - LOCATIONS: Places, addresses, project sites
        - PROJECTS: Project names, codes, identifiers
        - REGULATIONS: Acts, rules, standards, compliance requirements
        - DEADLINES: Specific deadlines and timeframes
        - CONTRACTS: Contract numbers, agreement references
        - TECHNICAL_SPECS: Technical specifications, standards, measurements
        
        Format as JSON with arrays for each category.`;

        const userPrompt = `Extract all relevant entities from this document:\n\n${text}`;

        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ];

        try {
            const response = await this.makeRequest(messages, null, 0.2, 800);
            return JSON.parse(response);
        } catch (error) {
            // Fallback extraction
            return {
                PERSONS: [],
                ORGANIZATIONS: [],
                DATES: [],
                AMOUNTS: [],
                LOCATIONS: [],
                PROJECTS: [],
                REGULATIONS: [],
                DEADLINES: [],
                CONTRACTS: [],
                TECHNICAL_SPECS: []
            };
        }
    }

    /**
     * Intelligent Q&A about documents
     */
    async answerQuestion(question, documentText, context = '') {
        const systemPrompt = `You are an AI assistant specialized in KMRL's document management system.
        You help users understand and extract information from government and technical documents.
        
        Provide accurate, helpful answers based on the document content.
        If information is not available in the document, clearly state that.
        Focus on being precise and actionable.`;

        const userPrompt = `Document Context: ${context}
        
Document Content:
${documentText}

Question: ${question}

Please answer based on the document content above.`;

        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ];

        const answer = await this.makeRequest(messages, null, 0.4, 600);

        return {
            question: question,
            answer: answer,
            hasAnswer: !answer.toLowerCase().includes('not mentioned') && !answer.toLowerCase().includes('not found'),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Generate action items and tasks from documents
     */
    async extractActionItems(text) {
        const systemPrompt = `You are a project management expert helping KMRL officials identify actionable tasks from documents.
        
        Extract action items that include:
        - Clear task description
        - Responsible party (if mentioned)
        - Deadline (if mentioned)
        - Priority level (HIGH/MEDIUM/LOW)
        - Dependencies (if any)
        - Resources required (if mentioned)
        
        Format as JSON array of action items.`;

        const userPrompt = `Extract all action items, tasks, and deliverables from this document:\n\n${text}`;

        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ];

        try {
            const response = await this.makeRequest(messages, null, 0.3, 800);
            return JSON.parse(response);
        } catch (error) {
            return [];
        }
    }

    /**
     * Compliance and Risk Analysis
     */
    async analyzeCompliance(text) {
        const systemPrompt = `You are a compliance expert familiar with Indian government regulations, railway standards, and metro rail requirements.
        
        Analyze the document for:
        - Regulatory compliance requirements
        - Safety standards mentioned
        - Environmental clearances
        - Financial compliance
        - Risk factors
        - Missing compliance elements
        
        Provide specific, actionable compliance insights.`;

        const userPrompt = `Analyze this document for compliance requirements and risks:\n\n${text}`;

        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ];

        const analysis = await this.makeRequest(messages, null, 0.3, 800);

        return {
            complianceAnalysis: analysis,
            riskLevel: this.assessRiskLevel(analysis),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Smart Document Search
     */
    async generateSearchQuery(naturalLanguageQuery) {
        const systemPrompt = `Convert natural language questions into optimized search queries for KMRL's document database.
        
        Generate multiple search variations that would help find relevant documents.
        Consider synonyms, technical terms, and related concepts.`;

        const userPrompt = `Convert this question into effective search queries: "${naturalLanguageQuery}"`;

        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ];

        const searchQueries = await this.makeRequest(messages, null, 0.5, 300);

        return {
            originalQuery: naturalLanguageQuery,
            optimizedQueries: searchQueries.split('\n').filter(q => q.trim()),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Document Quality Assessment
     */
    async assessDocumentQuality(text) {
        const systemPrompt = `You are a document quality expert for government systems.
        
        Assess document quality based on:
        - Completeness of information
        - Clarity and readability
        - Structure and organization
        - Missing critical elements
        - Consistency
        - Professional formatting
        
        Provide a quality score (0-100) and specific improvement suggestions.`;

        const userPrompt = `Assess the quality of this document:\n\n${text}`;

        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ];

        const assessment = await this.makeRequest(messages, null, 0.3, 600);

        return {
            qualityAssessment: assessment,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Helper method to assess risk level
     */
    assessRiskLevel(analysisText) {
        const riskKeywords = {
            HIGH: ['critical', 'urgent', 'violation', 'non-compliance', 'penalty', 'legal action'],
            MEDIUM: ['concern', 'attention', 'review required', 'potential issue'],
            LOW: ['minor', 'recommendation', 'suggestion', 'best practice']
        };

        const textLower = analysisText.toLowerCase();
        
        for (const [level, keywords] of Object.entries(riskKeywords)) {
            if (keywords.some(keyword => textLower.includes(keyword))) {
                return level;
            }
        }
        
        return 'MEDIUM';
    }

    /**
     * Batch processing for multiple documents
     */
    async processDocumentBatch(documents, operations = ['summarize', 'classify', 'extract_entities']) {
        const results = [];
        
        for (const doc of documents) {
            const result = { documentId: doc.id, title: doc.title };
            
            try {
                if (operations.includes('summarize')) {
                    result.summary = await this.summarizeDocument(doc.content || doc.description);
                }
                
                if (operations.includes('classify')) {
                    result.classification = await this.classifyDocument(doc.content || doc.description);
                }
                
                if (operations.includes('extract_entities')) {
                    result.entities = await this.extractEntities(doc.content || doc.description);
                }
                
                if (operations.includes('action_items')) {
                    result.actionItems = await this.extractActionItems(doc.content || doc.description);
                }
                
                result.success = true;
            } catch (error) {
                result.error = error.message;
                result.success = false;
            }
            
            results.push(result);
            
            // Add small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        return results;
    }

    /**
     * Get available models from OpenRouter (OpenAI prioritized)
     */
    async getAvailableModels() {
        try {
            const response = await axios.get(`${this.baseUrl}/models`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });
            
            const allModels = response.data.data.map(model => ({
                id: model.id,
                name: model.name,
                description: model.description,
                pricing: model.pricing,
                provider: model.id.split('/')[0]
            }));
            
            // Sort models: OpenAI first, then others
            const sortedModels = allModels.sort((a, b) => {
                if (a.provider === 'openai' && b.provider !== 'openai') return -1;
                if (a.provider !== 'openai' && b.provider === 'openai') return 1;
                if (a.provider === 'openai' && b.provider === 'openai') {
                    // Sort OpenAI models by our priority list
                    const aIndex = this.openAIModels.indexOf(a.id);
                    const bIndex = this.openAIModels.indexOf(b.id);
                    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
                    if (aIndex !== -1) return -1;
                    if (bIndex !== -1) return 1;
                }
                return a.name.localeCompare(b.name);
            });
            
            console.log(`📋 Available models fetched. OpenAI models: ${sortedModels.filter(m => m.provider === 'openai').length}`);
            return sortedModels;
            
        } catch (error) {
            console.error('Error fetching models:', error);
            // Return our known OpenAI models as fallback
            return this.openAIModels.map(modelId => ({
                id: modelId,
                name: modelId.split('/')[1],
                description: 'OpenAI Model',
                pricing: { prompt: '0.0015', completion: '0.002' },
                provider: 'openai'
            }));
        }
    }

    /**
     * Set the model to use for requests (prioritize OpenAI)
     */
    setModel(modelId) {
        // If it's an OpenAI model, update the current index
        const openAIIndex = this.openAIModels.indexOf(modelId);
        if (openAIIndex !== -1) {
            this.currentModelIndex = openAIIndex;
            this.defaultModel = modelId;
            console.log(`🤖 Switched to OpenAI model: ${modelId} (priority index: ${openAIIndex})`);
        } else {
            // Non-OpenAI model
            this.defaultModel = modelId;
            console.log(`🔄 Switched to non-OpenAI model: ${modelId}`);
        }
    }
    
    /**
     * Reset to primary OpenAI model
     */
    resetToPrimaryOpenAI() {
        this.currentModelIndex = 0;
        this.defaultModel = this.openAIModels[0];
        console.log(`🔄 Reset to primary OpenAI model: ${this.defaultModel}`);
    }
    
    /**
     * Check OpenAI model availability
     */
    async testOpenAIAvailability() {
        for (let i = 0; i < this.openAIModels.length; i++) {
            try {
                const testModel = this.openAIModels[i];
                console.log(`🧪 Testing OpenAI model: ${testModel}`);
                
                await this.makeRequest([
                    { role: 'user', content: 'Hello, are you working?' }
                ], testModel, 0.1, 10);
                
                console.log(`✅ OpenAI model ${testModel} is available`);
                this.currentModelIndex = i;
                this.defaultModel = testModel;
                return { available: true, model: testModel, index: i };
                
            } catch (error) {
                console.error(`❌ OpenAI model ${this.openAIModels[i]} failed test:`, error.message);
                continue;
            }
        }
        
        console.error(`🚨 All OpenAI models are currently unavailable`);
        return { available: false, model: null, index: -1 };
    }
}

module.exports = OpenRouterAIService;
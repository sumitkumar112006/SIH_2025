const OpenRouterAIService = require('./OpenRouterAIService');
const DocumentAIService = require('./DocumentAIService');
const Tender = require('../../models/Tender');
const fs = require('fs').promises;
const path = require('path');

class EnhancedAIController {
    constructor() {
        this.openRouterService = new OpenRouterAIService();
        this.documentService = new DocumentAIService(); // Fallback service
        this.useOpenRouter = true; // Always try OpenRouter first
        this.openAIHealthy = true; // Track OpenAI status
        
        console.log('🤖 Enhanced AI Controller initialized with OpenAI priority');
        
        // Test OpenAI availability on startup
        this.checkOpenAIHealth();
    }
    
    /**
     * Check OpenAI availability and switch models if needed
     */
    async checkOpenAIHealth() {
        try {
            const healthCheck = await this.openRouterService.testOpenAIAvailability();
            this.openAIHealthy = healthCheck.available;
            
            if (healthCheck.available) {
                console.log(`✅ OpenAI is healthy - using model: ${healthCheck.model}`);
            } else {
                console.log(`🚨 OpenAI models unavailable - will use fallback`);
            }
            
            return healthCheck;
        } catch (error) {
            console.error('❌ OpenAI health check failed:', error);
            this.openAIHealthy = false;
            return { available: false, error: error.message };
        }
    }

    /**
     * Enhanced Document Understanding & Processing Endpoints
     */

    // Enhanced OCR + AI Analysis
    async extractAndAnalyzeDocument(req, res) {
        try {
            const { filePath } = req.body;

            if (!filePath) {
                return res.status(400).json({ error: 'File path is required' });
            }

            // Check if file exists
            try {
                await fs.access(filePath);
            } catch (error) {
                return res.status(404).json({ error: 'File not found' });
            }

            // Extract text using existing OCR service
            const extractedText = await this.documentService.extractTextFromDocument(filePath);

            // Enhance with OpenRouter AI analysis
            const [summary, classification, entities, actionItems] = await Promise.all([
                this.openRouterService.summarizeDocument(extractedText),
                this.openRouterService.classifyDocument(extractedText),
                this.openRouterService.extractEntities(extractedText),
                this.openRouterService.extractActionItems(extractedText)
            ]);

            res.json({
                success: true,
                extractedText,
                wordCount: extractedText.split(/\s+/).length,
                characterCount: extractedText.length,
                aiAnalysis: {
                    summary,
                    classification,
                    entities,
                    actionItems
                }
            });
        } catch (error) {
            console.error('Error in extractAndAnalyzeDocument:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Enhanced Language Detection & Translation using OpenRouter
    async detectAndTranslate(req, res) {
        try {
            const { text, targetLanguage } = req.body;

            if (!text) {
                return res.status(400).json({ error: 'Text is required' });
            }

            let result;
            if (this.useOpenRouter) {
                result = await this.openRouterService.translateText(text, targetLanguage);
            } else {
                result = await this.documentService.detectAndTranslateLanguage(text);
            }

            res.json({
                success: true,
                ...result
            });
        } catch (error) {
            console.error('Error in detectAndTranslate:', error);
            // Fallback to document service
            try {
                const fallbackResult = await this.documentService.detectAndTranslateLanguage(text);
                res.json({
                    success: true,
                    ...fallbackResult,
                    note: 'Used fallback translation service'
                });
            } catch (fallbackError) {
                res.status(500).json({ error: error.message });
            }
        }
    }

    // Enhanced Document Classification using OpenAI Priority
    async classifyDocument(req, res) {
        try {
            const { text } = req.body;

            if (!text) {
                return res.status(400).json({ error: 'Text is required' });
            }

            let classification;
            if (this.useOpenRouter && this.openAIHealthy) {
                try {
                    console.log('🤖 Using OpenAI for document classification');
                    classification = await this.openRouterService.classifyDocument(text);
                } catch (error) {
                    console.error('❌ OpenAI classification failed, trying fallback:', error.message);
                    this.openAIHealthy = false;
                    classification = await this.documentService.classifyDocument(text);
                }
            } else {
                classification = await this.documentService.classifyDocument(text);
            }

            res.json({
                success: true,
                ...classification,
                aiService: this.openAIHealthy && this.useOpenRouter ? 'OpenAI' : 'Fallback'
            });
        } catch (error) {
            console.error('Error in classifyDocument:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Enhanced Entity Recognition using OpenRouter
    async extractEntities(req, res) {
        try {
            const { text } = req.body;

            if (!text) {
                return res.status(400).json({ error: 'Text is required' });
            }

            let entities;
            if (this.useOpenRouter) {
                entities = await this.openRouterService.extractEntities(text);
            } else {
                entities = await this.documentService.extractEntities(text);
            }

            res.json({
                success: true,
                entities
            });
        } catch (error) {
            console.error('Error in extractEntities:', error);
            // Fallback to document service
            try {
                const fallbackResult = await this.documentService.extractEntities(text);
                res.json({
                    success: true,
                    entities: fallbackResult,
                    note: 'Used fallback entity extraction service'
                });
            } catch (fallbackError) {
                res.status(500).json({ error: error.message });
            }
        }
    }

    /**
     * Enhanced Summarization & Knowledge Extraction using OpenRouter
     */

    // Smart Summarization with OpenAI priority
    async summarizeDocument(req, res) {
        try {
            const { text, summaryType = 'standard' } = req.body;

            if (!text) {
                return res.status(400).json({ error: 'Text is required' });
            }

            let summary;
            if (this.useOpenRouter && this.openAIHealthy) {
                try {
                    console.log('🤖 Using OpenAI for document summarization');
                    summary = await this.openRouterService.summarizeDocument(text, summaryType);
                } catch (error) {
                    console.error('❌ OpenAI summarization failed, trying fallback:', error.message);
                    this.openAIHealthy = false;
                    summary = await this.documentService.summarizeDocument(text);
                }
            } else {
                summary = await this.documentService.summarizeDocument(text);
            }

            res.json({
                success: true,
                ...summary,
                aiService: this.openAIHealthy && this.useOpenRouter ? 'OpenAI' : 'Fallback'
            });
        } catch (error) {
            console.error('Error in summarizeDocument:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Enhanced Action Point Extraction using OpenRouter
    async extractActionPoints(req, res) {
        try {
            const { text } = req.body;

            if (!text) {
                return res.status(400).json({ error: 'Text is required' });
            }

            let actionPoints;
            if (this.useOpenRouter) {
                actionPoints = await this.openRouterService.extractActionItems(text);
            } else {
                actionPoints = await this.documentService.extractActionPoints(text);
            }

            res.json({
                success: true,
                actionPoints
            });
        } catch (error) {
            console.error('Error in extractActionPoints:', error);
            // Fallback to document service
            try {
                const fallbackResult = await this.documentService.extractActionPoints(text);
                res.json({
                    success: true,
                    actionPoints: fallbackResult,
                    note: 'Used fallback action point extraction service'
                });
            } catch (fallbackError) {
                res.status(500).json({ error: error.message });
            }
        }
    }

    // New: Compliance Analysis using OpenRouter
    async analyzeCompliance(req, res) {
        try {
            const { text } = req.body;

            if (!text) {
                return res.status(400).json({ error: 'Text is required' });
            }

            const complianceAnalysis = await this.openRouterService.analyzeCompliance(text);

            res.json({
                success: true,
                ...complianceAnalysis
            });
        } catch (error) {
            console.error('Error in analyzeCompliance:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Enhanced Document Q&A using OpenAI priority
    async answerDocumentQuestion(req, res) {
        try {
            const { question, documentText, documentId } = req.body;

            if (!question || !documentText) {
                return res.status(400).json({ error: 'Question and document text are required' });
            }

            let context = '';
            if (documentId) {
                // Get document context from database
                const document = await Tender.findById(documentId);
                if (document) {
                    context = `Document: ${document.title}, Category: ${document.category || 'Unknown'}`;
                }
            }

            let answer;
            if (this.useOpenRouter && this.openAIHealthy) {
                try {
                    console.log('🤖 Using OpenAI for document Q&A');
                    answer = await this.openRouterService.answerQuestion(question, documentText, context);
                } catch (error) {
                    console.error('❌ OpenAI Q&A failed:', error.message);
                    this.openAIHealthy = false;
                    // Simple fallback Q&A
                    answer = {
                        question: question,
                        answer: `Based on the document content, I can see information related to your question. However, the advanced AI service is currently unavailable. Please try again later for detailed analysis.`,
                        hasAnswer: false,
                        timestamp: new Date().toISOString()
                    };
                }
            } else {
                // Simple fallback Q&A
                answer = {
                    question: question,
                    answer: `I can see your question about "${question}". The document contains relevant information, but advanced AI analysis is currently unavailable. Please try again later.`,
                    hasAnswer: false,
                    timestamp: new Date().toISOString()
                };
            }

            res.json({
                success: true,
                ...answer,
                aiService: this.openAIHealthy && this.useOpenRouter ? 'OpenAI' : 'Fallback'
            });
        } catch (error) {
            console.error('Error in answerDocumentQuestion:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // New: Document Quality Assessment
    async assessDocumentQuality(req, res) {
        try {
            const { text } = req.body;

            if (!text) {
                return res.status(400).json({ error: 'Text is required' });
            }

            const qualityAssessment = await this.openRouterService.assessDocumentQuality(text);

            res.json({
                success: true,
                ...qualityAssessment
            });
        } catch (error) {
            console.error('Error in assessDocumentQuality:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // New: Smart Search Query Generation
    async generateSearchQuery(req, res) {
        try {
            const { naturalQuery } = req.body;

            if (!naturalQuery) {
                return res.status(400).json({ error: 'Natural language query is required' });
            }

            const searchQueries = await this.openRouterService.generateSearchQuery(naturalQuery);

            res.json({
                success: true,
                ...searchQueries
            });
        } catch (error) {
            console.error('Error in generateSearchQuery:', error);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Enhanced Batch Processing with OpenRouter
     */
    async processDocumentBatch(req, res) {
        try {
            const { documentIds, operations = ['summarize', 'classify', 'extract_entities'] } = req.body;

            if (!documentIds || !Array.isArray(documentIds)) {
                return res.status(400).json({ error: 'Document IDs array is required' });
            }

            // Get documents from database
            const documents = await Tender.find({ _id: { $in: documentIds } });

            let results;
            if (this.useOpenRouter) {
                results = await this.openRouterService.processDocumentBatch(documents, operations);
            } else {
                // Fallback to existing batch processing
                results = [];
                for (const doc of documents) {
                    try {
                        const text = doc.description || doc.title;
                        const classification = await this.documentService.classifyDocument(text);
                        const entities = await this.documentService.extractEntities(text);
                        const summary = await this.documentService.summarizeDocument(text);

                        results.push({
                            id: doc._id,
                            success: true,
                            classification,
                            entities,
                            summary
                        });
                    } catch (docError) {
                        results.push({ id: doc._id, error: docError.message });
                    }
                }
            }

            res.json({
                success: true,
                results,
                processedCount: results.filter(r => r.success).length,
                errorCount: results.filter(r => r.error).length,
                totalDocuments: documents.length
            });
        } catch (error) {
            console.error('Error in processDocumentBatch:', error);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * System Management Endpoints
     */

    // Get available AI models
    async getAvailableModels(req, res) {
        try {
            const models = await this.openRouterService.getAvailableModels();
            res.json({
                success: true,
                models,
                currentModel: this.openRouterService.defaultModel
            });
        } catch (error) {
            console.error('Error getting available models:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Switch AI model with OpenAI priority
    async switchModel(req, res) {
        try {
            const { modelId } = req.body;

            if (!modelId) {
                return res.status(400).json({ error: 'Model ID is required' });
            }

            // Check if it's an OpenAI model
            const isOpenAI = modelId.startsWith('openai/');
            
            if (isOpenAI) {
                console.log(`🤖 Switching to OpenAI model: ${modelId}`);
                this.openRouterService.setModel(modelId);
                
                // Test the new model
                try {
                    await this.openRouterService.makeRequest([
                        { role: 'user', content: 'Test message' }
                    ], modelId, 0.1, 10);
                    
                    this.openAIHealthy = true;
                    console.log(`✅ Successfully switched to OpenAI model: ${modelId}`);
                } catch (error) {
                    console.error(`❌ OpenAI model ${modelId} test failed:`, error.message);
                    this.openAIHealthy = false;
                }
            } else {
                console.log(`🔄 Switching to non-OpenAI model: ${modelId}`);
                this.openRouterService.setModel(modelId);
            }

            res.json({
                success: true,
                message: `Switched to model: ${modelId}`,
                currentModel: modelId,
                isOpenAI: isOpenAI,
                healthy: isOpenAI ? this.openAIHealthy : true
            });
        } catch (error) {
            console.error('Error switching model:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Toggle between OpenRouter and fallback service
    async toggleAIService(req, res) {
        try {
            const { useOpenRouter } = req.body;

            this.useOpenRouter = useOpenRouter !== undefined ? useOpenRouter : !this.useOpenRouter;

            res.json({
                success: true,
                message: `AI service switched to: ${this.useOpenRouter ? 'OpenRouter' : 'Fallback'}`,
                currentService: this.useOpenRouter ? 'OpenRouter' : 'Fallback'
            });
        } catch (error) {
            console.error('Error toggling AI service:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Health check for AI services with OpenAI priority
    async healthCheck(req, res) {
        try {
            const healthStatus = {
                openRouter: false,
                openAI: false,
                fallbackService: true,
                currentService: 'Unknown',
                timestamp: new Date().toISOString(),
                availableModels: []
            };

            // Test OpenAI availability first
            try {
                const openAIHealth = await this.checkOpenAIHealth();
                healthStatus.openAI = openAIHealth.available;
                healthStatus.openRouter = openAIHealth.available;
                
                if (openAIHealth.available) {
                    healthStatus.currentService = `OpenAI (${openAIHealth.model})`;
                    healthStatus.availableModels = this.openRouterService.openAIModels;
                } else {
                    healthStatus.currentService = 'Fallback Service';
                }
                
                this.openAIHealthy = openAIHealth.available;
                
            } catch (error) {
                console.error('OpenAI health check failed:', error.message);
                healthStatus.currentService = 'Fallback Service';
                this.openAIHealthy = false;
            }

            res.json({
                success: true,
                healthStatus
            });
        } catch (error) {
            console.error('Error in health check:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Inherit all methods from original AIController for backward compatibility
    
    // Add all existing methods from AIController
    async compareVersions(req, res) {
        try {
            const { document1, document2 } = req.body;
            if (!document1 || !document2) {
                return res.status(400).json({ error: 'Both documents are required' });
            }
            const comparison = await this.documentService.compareDocumentVersions(document1, document2);
            res.json({ success: true, ...comparison });
        } catch (error) {
            console.error('Error in compareVersions:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Reset to primary OpenAI model
    async resetToOpenAI(req, res) {
        try {
            console.log('🔄 Resetting to primary OpenAI model...');
            
            this.openRouterService.resetToPrimaryOpenAI();
            const healthCheck = await this.checkOpenAIHealth();
            
            res.json({
                success: true,
                message: 'Reset to primary OpenAI model',
                currentModel: this.openRouterService.defaultModel,
                openAIHealthy: healthCheck.available,
                modelUsed: healthCheck.model || 'fallback'
            });
        } catch (error) {
            console.error('Error resetting to OpenAI:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async highlightCompliance(req, res) {
        try {
            const { text } = req.body;
            if (!text) {
                return res.status(400).json({ error: 'Text is required' });
            }

            let complianceIssues;
            if (this.useOpenRouter) {
                const analysis = await this.openRouterService.analyzeCompliance(text);
                complianceIssues = analysis.complianceAnalysis;
            } else {
                complianceIssues = await this.documentService.highlightCompliance(text);
            }

            res.json({ success: true, complianceIssues });
        } catch (error) {
            console.error('Error in highlightCompliance:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async extractKeyValuePairs(req, res) {
        try {
            const { text } = req.body;
            if (!text) {
                return res.status(400).json({ error: 'Text is required' });
            }
            const keyValuePairs = await this.documentService.extractKeyValuePairs(text);
            res.json({ success: true, keyValuePairs });
        } catch (error) {
            console.error('Error in extractKeyValuePairs:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Add other methods as needed for complete compatibility...
}

module.exports = EnhancedAIController;
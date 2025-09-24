const DocumentAIService = require('./DocumentAIService');
const Tender = require('../../models/Tender');
const fs = require('fs').promises;
const path = require('path');

class AIController {
    constructor() {
        this.aiService = new DocumentAIService();
    }

    /**
     * 🔍 Document Understanding & Processing Endpoints
     */

    // OCR + Handwriting Recognition
    async extractText(req, res) {
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

            const extractedText = await this.aiService.extractTextFromDocument(filePath);

            res.json({
                success: true,
                extractedText,
                wordCount: extractedText.split(/\s+/).length,
                characterCount: extractedText.length
            });
        } catch (error) {
            console.error('Error in extractText:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Language Detection & Translation
    async detectAndTranslate(req, res) {
        try {
            const { text } = req.body;

            if (!text) {
                return res.status(400).json({ error: 'Text is required' });
            }

            const result = await this.aiService.detectAndTranslateLanguage(text);

            res.json({
                success: true,
                ...result
            });
        } catch (error) {
            console.error('Error in detectAndTranslate:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Document Classification
    async classifyDocument(req, res) {
        try {
            const { text } = req.body;

            if (!text) {
                return res.status(400).json({ error: 'Text is required' });
            }

            const classification = await this.aiService.classifyDocument(text);

            res.json({
                success: true,
                ...classification
            });
        } catch (error) {
            console.error('Error in classifyDocument:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Entity Recognition (NER)
    async extractEntities(req, res) {
        try {
            const { text } = req.body;

            if (!text) {
                return res.status(400).json({ error: 'Text is required' });
            }

            const entities = await this.aiService.extractEntities(text);

            res.json({
                success: true,
                entities
            });
        } catch (error) {
            console.error('Error in extractEntities:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Version Comparison
    async compareVersions(req, res) {
        try {
            const { document1, document2 } = req.body;

            if (!document1 || !document2) {
                return res.status(400).json({ error: 'Both documents are required' });
            }

            const comparison = await this.aiService.compareDocumentVersions(document1, document2);

            res.json({
                success: true,
                ...comparison
            });
        } catch (error) {
            console.error('Error in compareVersions:', error);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * 📑 Summarization & Knowledge Extraction Endpoints
     */

    // Smart Summarization
    async summarizeDocument(req, res) {
        try {
            const { text } = req.body;

            if (!text) {
                return res.status(400).json({ error: 'Text is required' });
            }

            const summary = await this.aiService.summarizeDocument(text);

            res.json({
                success: true,
                ...summary
            });
        } catch (error) {
            console.error('Error in summarizeDocument:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Action Point Extraction
    async extractActionPoints(req, res) {
        try {
            const { text } = req.body;

            if (!text) {
                return res.status(400).json({ error: 'Text is required' });
            }

            const actionPoints = await this.aiService.extractActionPoints(text);

            res.json({
                success: true,
                actionPoints
            });
        } catch (error) {
            console.error('Error in extractActionPoints:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Compliance Highlighting
    async highlightCompliance(req, res) {
        try {
            const { text } = req.body;

            if (!text) {
                return res.status(400).json({ error: 'Text is required' });
            }

            const complianceIssues = await this.aiService.highlightCompliance(text);

            res.json({
                success: true,
                complianceIssues
            });
        } catch (error) {
            console.error('Error in highlightCompliance:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Key-Value Extraction
    async extractKeyValuePairs(req, res) {
        try {
            const { text } = req.body;

            if (!text) {
                return res.status(400).json({ error: 'Text is required' });
            }

            const keyValuePairs = await this.aiService.extractKeyValuePairs(text);

            res.json({
                success: true,
                keyValuePairs
            });
        } catch (error) {
            console.error('Error in extractKeyValuePairs:', error);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * 🔎 Search & Retrieval Endpoints
     */

    // Semantic Search
    async semanticSearch(req, res) {
        try {
            const { query } = req.body;

            if (!query) {
                return res.status(400).json({ error: 'Query is required' });
            }

            // Get all tenders as sample documents
            const documents = await Tender.find();

            const results = await this.aiService.semanticSearch(query, documents);

            res.json({
                success: true,
                results,
                resultCount: results.length
            });
        } catch (error) {
            console.error('Error in semanticSearch:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Multilingual Search
    async multilingualSearch(req, res) {
        try {
            const { query } = req.body;

            if (!query) {
                return res.status(400).json({ error: 'Query is required' });
            }

            // Get all tenders as sample documents
            const documents = await Tender.find();

            const results = await this.aiService.multilingualSearch(query, documents);

            res.json({
                success: true,
                results,
                resultCount: results.length
            });
        } catch (error) {
            console.error('Error in multilingualSearch:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Cross-Document Linking
    async findRelatedDocuments(req, res) {
        try {
            const { documentId } = req.body;

            if (!documentId) {
                return res.status(400).json({ error: 'Document ID is required' });
            }

            // Get the target document
            const document = await Tender.findById(documentId);
            if (!document) {
                return res.status(404).json({ error: 'Document not found' });
            }

            // Get all other documents
            const allDocuments = await Tender.find({ _id: { $ne: documentId } });

            const relatedDocs = await this.aiService.findRelatedDocuments(document, allDocuments);

            res.json({
                success: true,
                relatedDocuments: relatedDocs
            });
        } catch (error) {
            console.error('Error in findRelatedDocuments:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Visual Search
    async visualSearch(req, res) {
        try {
            const { queryImage } = req.body;

            if (!queryImage) {
                return res.status(400).json({ error: 'Query image is required' });
            }

            // Get all tenders as sample documents
            const documents = await Tender.find();

            const results = await this.aiService.visualSearch(queryImage, documents);

            res.json({
                success: true,
                results,
                resultCount: results.length
            });
        } catch (error) {
            console.error('Error in visualSearch:', error);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * ⚡ Personalization & Notifications Endpoints
     */

    // Role-Based Recommendations
    async getRecommendations(req, res) {
        try {
            const { user } = req.body;

            if (!user) {
                return res.status(400).json({ error: 'User information is required' });
            }

            // Get all tenders as sample documents
            const documents = await Tender.find();

            const recommendations = await this.aiService.getRoleBasedRecommendations(user, documents);

            res.json({
                success: true,
                recommendations,
                recommendationCount: recommendations.length
            });
        } catch (error) {
            console.error('Error in getRecommendations:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Priority Alerts
    async getPriorityAlerts(req, res) {
        try {
            // Get all tenders as sample documents
            const documents = await Tender.find();

            const alerts = await this.aiService.generatePriorityAlerts(documents);

            res.json({
                success: true,
                alerts,
                alertCount: alerts.length
            });
        } catch (error) {
            console.error('Error in getPriorityAlerts:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Daily/Weekly Digest
    async getDigest(req, res) {
        try {
            const { user, period } = req.body;

            if (!user) {
                return res.status(400).json({ error: 'User information is required' });
            }

            // Get all tenders as sample documents
            const documents = await Tender.find();

            const digest = await this.aiService.generateDigest(user, documents, period);

            res.json({
                success: true,
                digest
            });
        } catch (error) {
            console.error('Error in getDigest:', error);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * 🛡️ Trust, Security & Compliance Endpoints
     */

    // Traceability
    async getTraceabilityInfo(req, res) {
        try {
            const { documentId } = req.body;

            if (!documentId) {
                return res.status(400).json({ error: 'Document ID is required' });
            }

            // Get the document
            const document = await Tender.findById(documentId);
            if (!document) {
                return res.status(404).json({ error: 'Document not found' });
            }

            const traceabilityInfo = await this.aiService.generateTraceabilityInfo(document);

            res.json({
                success: true,
                traceabilityInfo
            });
        } catch (error) {
            console.error('Error in getTraceabilityInfo:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Access Control
    async checkAccessControl(req, res) {
        try {
            const { user, documentId } = req.body;

            if (!user || !documentId) {
                return res.status(400).json({ error: 'User and document ID are required' });
            }

            // Get the document
            const document = await Tender.findById(documentId);
            if (!document) {
                return res.status(404).json({ error: 'Document not found' });
            }

            const accessResult = await this.aiService.checkAccessControl(user, document);

            res.json({
                success: true,
                ...accessResult
            });
        } catch (error) {
            console.error('Error in checkAccessControl:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Anomaly Detection
    async detectAnomalies(req, res) {
        try {
            // Get all tenders as sample documents
            const documents = await Tender.find();

            const anomalies = await this.aiService.detectAnomalies(documents);

            res.json({
                success: true,
                anomalies,
                anomalyCount: anomalies.length
            });
        } catch (error) {
            console.error('Error in detectAnomalies:', error);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * 📊 Analytics & Insights Endpoints
     */

    // Trend Analysis
    async analyzeTrends(req, res) {
        try {
            // Get all tenders as sample documents
            const documents = await Tender.find();

            const trends = await this.aiService.analyzeTrends(documents);

            res.json({
                success: true,
                trends
            });
        } catch (error) {
            console.error('Error in analyzeTrends:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Knowledge Retention
    async buildKnowledgeBase(req, res) {
        try {
            // Get all tenders as sample documents
            const documents = await Tender.find();

            const knowledgeBase = await this.aiService.buildKnowledgeBase(documents);

            res.json({
                success: true,
                knowledgeBase
            });
        } catch (error) {
            console.error('Error in buildKnowledgeBase:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Usage Insights
    async getUsageInsights(req, res) {
        try {
            // Get all tenders as sample documents
            const documents = await Tender.find();

            // Simulate user interactions
            const userInteractions = [
                { type: 'view', documentId: documents[0]?._id, userId: 'user1', timestamp: new Date() },
                { type: 'download', documentId: documents[1]?._id, userId: 'user2', timestamp: new Date() },
                { type: 'view', documentId: documents[0]?._id, userId: 'user3', timestamp: new Date() },
                { type: 'view', documentId: documents[2]?._id, userId: 'user1', timestamp: new Date() },
                { type: 'download', documentId: documents[0]?._id, userId: 'user2', timestamp: new Date() }
            ];

            const insights = await this.aiService.generateUsageInsights(documents, userInteractions);

            res.json({
                success: true,
                insights
            });
        } catch (error) {
            console.error('Error in getUsageInsights:', error);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Batch Processing Endpoint
     */
    async processDocumentBatch(req, res) {
        try {
            const { documentIds } = req.body;

            if (!documentIds || !Array.isArray(documentIds)) {
                return res.status(400).json({ error: 'Document IDs array is required' });
            }

            const results = [];

            for (const docId of documentIds) {
                try {
                    // Get document
                    const document = await Tender.findById(docId);
                    if (!document) {
                        results.push({ id: docId, error: 'Document not found' });
                        continue;
                    }

                    // Process document with all AI features
                    const text = document.description || document.title;
                    if (!text) {
                        results.push({ id: docId, error: 'No text content available' });
                        continue;
                    }

                    // Run all AI processing steps
                    const classification = await this.aiService.classifyDocument(text);
                    const entities = await this.aiService.extractEntities(text);
                    const summary = await this.aiService.summarizeDocument(text);
                    const actionPoints = await this.aiService.extractActionPoints(text);

                    results.push({
                        id: docId,
                        success: true,
                        classification,
                        entities,
                        summary,
                        actionPoints: actionPoints.length
                    });
                } catch (docError) {
                    results.push({ id: docId, error: docError.message });
                }
            }

            res.json({
                success: true,
                results,
                processedCount: results.filter(r => r.success).length,
                errorCount: results.filter(r => r.error).length
            });
        } catch (error) {
            console.error('Error in processDocumentBatch:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = AIController;
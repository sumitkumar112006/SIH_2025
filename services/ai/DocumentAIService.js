const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const { createWorker } = require('tesseract.js');

class DocumentAIService {
    constructor() {
        this.apiKey = process.env.AI_API_KEY || '';
        this.apiEndpoint = process.env.AI_API_ENDPOINT || 'https://api.openai.com/v1';
        this.ocrWorker = null;
        this.initializeOCR();
    }

    async initializeOCR() {
        try {
            // Initialize Tesseract.js worker for OCR with both English and Malayalam
            this.ocrWorker = await createWorker('eng+mal');
        } catch (error) {
            console.error('Error initializing OCR worker:', error);
        }
    }

    /**
     * 🔍 Document Understanding & Processing
     */

    // OCR + Handwriting Recognition
    async extractTextFromDocument(filePath) {
        try {
            const fileExtension = path.extname(filePath).toLowerCase();

            if (fileExtension === '.pdf') {
                return await this.extractTextFromPDF(filePath);
            } else if (['.jpg', '.jpeg', '.png', '.tiff', '.bmp'].includes(fileExtension)) {
                return await this.extractTextFromImage(filePath);
            } else {
                // For other document types, try to read as text
                return await fs.readFile(filePath, 'utf8');
            }
        } catch (error) {
            console.error('Error extracting text from document:', error);
            throw new Error('Failed to extract text from document');
        }
    }

    async extractTextFromPDF(filePath) {
        try {
            // For a complete implementation, we would use pdfjs-dist for text extraction
            // This is a placeholder implementation
            const pdfData = await fs.readFile(filePath);
            const pdfDoc = await PDFDocument.load(pdfData);
            const totalPages = pdfDoc.getPageCount();
            let fullText = '';

            // In a real implementation, we would extract actual text from each page
            for (let i = 0; i < totalPages; i++) {
                fullText += `Content from page ${i + 1} of the PDF document.\n`;
            }

            return fullText;
        } catch (error) {
            console.error('Error extracting text from PDF:', error);
            throw new Error('Failed to extract text from PDF');
        }
    }

    async extractTextFromImage(filePath) {
        try {
            if (!this.ocrWorker) {
                await this.initializeOCR();
            }

            if (this.ocrWorker) {
                // Perform OCR on the image
                const result = await this.ocrWorker.recognize(filePath);
                return result.data.text;
            } else {
                throw new Error('OCR worker not available');
            }
        } catch (error) {
            console.error('Error extracting text from image:', error);
            throw new Error('Failed to extract text from image');
        }
    }

    // Language Detection & Translation
    async detectAndTranslateLanguage(text) {
        try {
            // Detect language - check for Malayalam characters
            const isMalayalam = /[ം-ൿ]/.test(text);
            const detectedLanguage = isMalayalam ? 'Malayalam' : 'English';

            // Simple translation simulation
            let translatedText = '';
            if (isMalayalam) {
                // Malayalam to English translation simulation
                translatedText = 'This is a simulated translation from Malayalam to English. In a real implementation, this would use a translation API.';
            } else {
                // English to Malayalam translation simulation
                translatedText = 'ഇത് ഇംഗ്ലീഷിൽ നിന്ന് മലയാളത്തിലേക്ക് അനുവാദിച്ച ഒരു സിമുലേഷനാണ്. യഥാർത്ഥ നടപ്പാക്കലിൽ, ഇത് ഒരു വിവർത്തന പിഎ ഐ ഉപയോഗിക്കും.';
            }

            return {
                detectedLanguage,
                translatedText,
                confidence: 0.92
            };
        } catch (error) {
            console.error('Error detecting and translating language:', error);
            throw new Error('Failed to detect and translate language');
        }
    }

    // Document Classification
    async classifyDocument(text) {
        try {
            // Document classification based on content analysis
            const categories = ['HR', 'Finance', 'Engineering', 'Safety', 'Legal', 'Operations'];

            // Simple keyword-based classification
            const categoryScores = {};
            categories.forEach(category => categoryScores[category] = 0);

            // Define keywords for each category
            const keywords = {
                'HR': ['employee', 'hiring', 'benefits', 'policy', 'training', 'recruitment', 'staff', 'personnel'],
                'Finance': ['budget', 'expense', 'revenue', 'audit', 'payment', 'invoice', 'cost', 'financial'],
                'Engineering': ['design', 'specification', 'blueprint', 'technical', 'construction', 'engineering', 'drawing'],
                'Safety': ['safety', 'regulation', 'compliance', 'incident', 'procedure', 'hazard', 'risk'],
                'Legal': ['contract', 'agreement', 'law', 'regulation', 'liability', 'legal', 'compliance'],
                'Operations': ['process', 'procedure', 'workflow', 'efficiency', 'maintenance', 'operation', 'logistics']
            };

            // Score each category based on keyword matches
            const textLower = text.toLowerCase();
            Object.keys(keywords).forEach(category => {
                keywords[category].forEach(keyword => {
                    if (textLower.includes(keyword)) {
                        categoryScores[category] += 1;
                    }
                });
            });

            // Find the category with the highest score
            let bestCategory = categories[0];
            let maxScore = 0;
            Object.keys(categoryScores).forEach(category => {
                if (categoryScores[category] > maxScore) {
                    maxScore = categoryScores[category];
                    bestCategory = category;
                }
            });

            // If no keywords matched, use a random category
            if (maxScore === 0) {
                bestCategory = categories[Math.floor(Math.random() * categories.length)];
                maxScore = 1;
            }

            // Confidence based on score
            const confidence = Math.min(0.5 + (maxScore / 10), 0.95);

            return {
                category: bestCategory,
                confidence,
                tags: this.extractTags(text, bestCategory)
            };
        } catch (error) {
            console.error('Error classifying document:', error);
            throw new Error('Failed to classify document');
        }
    }

    extractTags(text, category) {
        // Tag extraction based on category
        const tagMap = {
            'HR': ['employee', 'hiring', 'benefits', 'policy', 'training', 'recruitment', 'staff'],
            'Finance': ['budget', 'expense', 'revenue', 'audit', 'payment', 'invoice', 'cost'],
            'Engineering': ['design', 'specification', 'blueprint', 'technical', 'construction', 'engineering'],
            'Safety': ['safety', 'regulation', 'compliance', 'incident', 'procedure', 'hazard'],
            'Legal': ['contract', 'agreement', 'law', 'regulation', 'liability', 'legal'],
            'Operations': ['process', 'procedure', 'workflow', 'efficiency', 'maintenance', 'operation']
        };

        const categoryTags = tagMap[category] || [];
        const textLower = text.toLowerCase();
        const foundTags = categoryTags.filter(tag => textLower.includes(tag));

        // Add some generic tags
        const genericTags = ['document', 'kmrl', 'project'];
        return [...new Set([...foundTags, ...genericTags])];
    }

    // Entity Recognition (NER)
    async extractEntities(text) {
        try {
            // Extract various entities from text
            const entities = {
                dates: this.extractDates(text),
                names: this.extractNames(text),
                amounts: this.extractAmounts(text),
                regulations: this.extractRegulations(text),
                projectIds: this.extractProjectIds(text)
            };

            return entities;
        } catch (error) {
            console.error('Error extracting entities:', error);
            throw new Error('Failed to extract entities');
        }
    }

    extractDates(text) {
        // Extract dates using regex patterns
        const datePatterns = [
            /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g,  // MM/DD/YYYY or MM-DD-YYYY
            /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g,  // DD/MM/YYYY or DD-MM-YYYY
            /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{2,4}\b/gi, // Month DD, YYYY
            /\b\d{1,2} (?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{2,4}\b/gi  // DD Month YYYY
        ];

        let allDates = [];
        datePatterns.forEach(pattern => {
            const matches = text.match(pattern) || [];
            allDates = [...allDates, ...matches];
        });

        return [...new Set(allDates)]; // Remove duplicates
    }

    extractNames(text) {
        // Extract person names (simplified implementation)
        const nameRegex = /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g;
        const matches = text.match(nameRegex) || [];
        return [...new Set(matches.slice(0, 10))]; // Limit to 10 names and remove duplicates
    }

    extractAmounts(text) {
        // Extract monetary amounts
        const amountPatterns = [
            /\b(?:₹|Rs\.?|INR)\s*\d+(?:,\d{3})*(?:\.\d{2})?\b/gi,  // Indian Rupee
            /\b(?:\$|USD)\s*\d+(?:,\d{3})*(?:\.\d{2})?\b/gi,       // US Dollar
            /\b(?:€|EUR)\s*\d+(?:,\d{3})*(?:\.\d{2})?\b/gi         // Euro
        ];

        let allAmounts = [];
        amountPatterns.forEach(pattern => {
            const matches = text.match(pattern) || [];
            allAmounts = [...allAmounts, ...matches];
        });

        return [...new Set(allAmounts)];
    }

    extractRegulations(text) {
        // Extract regulation references
        const regulationRegex = /\b[A-Z]{2,}\s*\d{2,4}\b/g;
        const matches = text.match(regulationRegex) || [];
        return [...new Set(matches)];
    }

    extractProjectIds(text) {
        // Extract project IDs
        const projectIdRegex = /\b(?:KMRL|PRJ|PROJ)[\-_]?\d{3,6}\b/gi;
        const matches = text.match(projectIdRegex) || [];
        return [...new Set(matches)];
    }

    // Version Comparison
    async compareDocumentVersions(doc1Text, doc2Text) {
        try {
            // Simple document comparison (in a real implementation, this would use more sophisticated algorithms)
            const doc1Lines = doc1Text.split('\n');
            const doc2Lines = doc2Text.split('\n');

            const changes = [];
            const maxLength = Math.max(doc1Lines.length, doc2Lines.length);

            for (let i = 0; i < maxLength; i++) {
                const line1 = doc1Lines[i] || '';
                const line2 = doc2Lines[i] || '';

                if (line1 !== line2) {
                    if (i >= doc1Lines.length) {
                        changes.push({ type: 'added', content: line2, line: i + 1 });
                    } else if (i >= doc2Lines.length) {
                        changes.push({ type: 'removed', content: line1, line: i + 1 });
                    } else {
                        changes.push({ type: 'modified', content: `Line changed from: "${line1}" to: "${line2}"`, line: i + 1 });
                    }
                }
            }

            // Calculate similarity (simplified)
            const similarity = changes.length > 0 ? Math.max(0, 1 - (changes.length / maxLength)) : 1;

            return {
                changes,
                summary: `Document comparison found ${changes.length} changes.`,
                similarity
            };
        } catch (error) {
            console.error('Error comparing document versions:', error);
            throw new Error('Failed to compare document versions');
        }
    }

    /**
     * 📑 Summarization & Knowledge Extraction
     */

    // Smart Summarization
    async summarizeDocument(text) {
        try {
            const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
            const wordCount = text.split(/\s+/).length;

            if (sentences.length <= 3) {
                return {
                    summary: text,
                    bulletPoints: [text],
                    wordCount,
                    sentenceCount: sentences.length
                };
            }

            // Extract key points using a simple algorithm
            // In a real implementation, this would use NLP techniques
            const keyPoints = [];

            // Always include first and last sentences
            if (sentences.length > 0) keyPoints.push(sentences[0].trim());
            if (sentences.length > 1) keyPoints.push(sentences[sentences.length - 1].trim());

            // Add middle sentences based on length
            if (sentences.length > 2) {
                const middleIndex = Math.floor(sentences.length / 2);
                keyPoints.splice(1, 0, sentences[middleIndex].trim());
            }

            // Remove duplicates and limit to 5 points
            const uniquePoints = [...new Set(keyPoints)].slice(0, 5);

            return {
                summary: 'This document contains important information that has been summarized into key points.',
                bulletPoints: uniquePoints,
                wordCount,
                sentenceCount: sentences.length
            };
        } catch (error) {
            console.error('Error summarizing document:', error);
            throw new Error('Failed to summarize document');
        }
    }

    // Action Point Extraction
    async extractActionPoints(text) {
        try {
            // Extract action points and tasks from document
            const actionKeywords = ['must', 'should', 'required', 'deadline', 'due', 'complete by', 'submit', 'responsible', 'assign'];
            const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

            const actionPoints = sentences.filter(sentence =>
                actionKeywords.some(keyword =>
                    sentence.toLowerCase().includes(keyword.toLowerCase())
                )
            ).map(sentence => ({
                task: sentence.trim(),
                deadline: this.extractDeadline(sentence),
                priority: this.determinePriority(sentence),
                assignedTo: this.extractAssignee(sentence)
            }));

            return actionPoints;
        } catch (error) {
            console.error('Error extracting action points:', error);
            throw new Error('Failed to extract action points');
        }
    }

    extractDeadline(sentence) {
        // Extract deadline from sentence
        const dateRegex = /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/;
        const match = sentence.match(dateRegex);
        return match ? match[0] : 'No deadline specified';
    }

    determinePriority(sentence) {
        // Determine priority level
        const urgentKeywords = ['urgent', 'asap', 'immediately', 'critical', 'emergency'];
        const highKeywords = ['important', 'high priority', 'soon', 'required'];
        const mediumKeywords = ['should', 'consider', 'recommended'];

        const sentenceLower = sentence.toLowerCase();
        if (urgentKeywords.some(keyword => sentenceLower.includes(keyword))) {
            return 'Urgent';
        } else if (highKeywords.some(keyword => sentenceLower.includes(keyword))) {
            return 'High';
        } else if (mediumKeywords.some(keyword => sentenceLower.includes(keyword))) {
            return 'Medium';
        } else {
            return 'Normal';
        }
    }

    extractAssignee(sentence) {
        // Extract assignee if mentioned
        // This is a simplified implementation
        const assigneePatterns = [
            /assign.*?to\s+([A-Z][a-z]+ [A-Z][a-z]+)/i,
            /responsible:\s*([A-Z][a-z]+ [A-Z][a-z]+)/i,
            /([A-Z][a-z]+ [A-Z][a-z]+)\s+(?:is|will)\s+responsible/i
        ];

        for (const pattern of assigneePatterns) {
            const match = sentence.match(pattern);
            if (match) {
                return match[1];
            }
        }

        return 'Unassigned';
    }

    // Compliance Highlighting
    async highlightCompliance(text) {
        try {
            // Identify compliance-related content
            const complianceKeywords = ['regulation', 'compliance', 'safety', 'standard', 'policy', 'procedure', 'mandatory', 'required'];
            const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

            const complianceIssues = sentences.filter(sentence =>
                complianceKeywords.some(keyword =>
                    sentence.toLowerCase().includes(keyword.toLowerCase())
                )
            ).map(sentence => ({
                issue: sentence.trim(),
                type: this.determineComplianceType(sentence),
                severity: this.determineSeverity(sentence)
            }));

            return complianceIssues;
        } catch (error) {
            console.error('Error highlighting compliance:', error);
            throw new Error('Failed to highlight compliance');
        }
    }

    determineComplianceType(sentence) {
        // Determine compliance type
        const sentenceLower = sentence.toLowerCase();
        if (sentenceLower.includes('safety')) return 'Safety';
        if (sentenceLower.includes('regulation')) return 'Regulatory';
        if (sentenceLower.includes('policy')) return 'Policy';
        if (sentenceLower.includes('standard')) return 'Standard';
        return 'General';
    }

    determineSeverity(sentence) {
        // Determine severity level
        const sentenceLower = sentence.toLowerCase();
        if (sentenceLower.includes('critical') || sentenceLower.includes('mandatory')) return 'Critical';
        if (sentenceLower.includes('important') || sentenceLower.includes('required')) return 'High';
        if (sentenceLower.includes('recommended') || sentenceLower.includes('should')) return 'Medium';
        return 'Low';
    }

    // Key-Value Extraction
    async extractKeyValuePairs(text) {
        try {
            // Extract structured key-value pairs from document
            const keyValuePairs = {};

            // Common document field patterns
            const patterns = {
                'invoice_number': /invoice\s*(?:no\.?|number)\s*[:\-]?\s*([A-Z0-9\-]+)/i,
                'vendor': /vendor\s*[:\-]?\s*([A-Z][a-zA-Z\s&]+(?:Pvt\.?\s*Ltd\.?|Inc\.?|LLC))?/i,
                'cost': /(?:total\s*)?cost\s*[:\-]?\s*(?:₹|Rs\.?)\s*([\d,]+(?:\.\d{2})?)/i,
                'po_number': /P\.?O\.?\s*(?:no\.?|number)\s*[:\-]?\s*([A-Z0-9\-]+)/i,
                'date': /date\s*[:\-]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
                'project_id': /project\s*(?:id)?\s*[:\-]?\s*([A-Z0-9\-]+)/i,
                'department': /department\s*[:\-]?\s*([A-Za-z\s]+)/i,
                'amount': /amount\s*[:\-]?\s*(?:₹|Rs\.?)\s*([\d,]+(?:\.\d{2})?)/i
            };

            for (const [key, pattern] of Object.entries(patterns)) {
                const match = text.match(pattern);
                if (match) {
                    keyValuePairs[key] = match[1];
                }
            }

            return keyValuePairs;
        } catch (error) {
            console.error('Error extracting key-value pairs:', error);
            throw new Error('Failed to extract key-value pairs');
        }
    }

    /**
     * 🔎 Search & Retrieval
     */

    // Semantic Search
    async semanticSearch(query, documents) {
        try {
            // Simplified semantic search implementation
            // In a real implementation, this would use embeddings and vector search

            const queryLower = query.toLowerCase();
            const queryWords = queryLower.split(/\s+/);

            const results = documents.map(doc => {
                const docText = (doc.title + ' ' + (doc.description || '') + ' ' + (doc.content || '')).toLowerCase();
                const docWords = docText.split(/\s+/);

                // Calculate simple word overlap score
                let score = 0;
                queryWords.forEach(queryWord => {
                    if (docWords.includes(queryWord)) {
                        score += 1;
                    }
                });

                // Normalize score
                const normalizedScore = docWords.length > 0 ? score / docWords.length : 0;

                return {
                    ...doc,
                    relevance: normalizedScore
                };
            }).filter(doc => doc.relevance > 0)
                .sort((a, b) => b.relevance - a.relevance);

            return results.slice(0, 20); // Return top 20 results
        } catch (error) {
            console.error('Error performing semantic search:', error);
            throw new Error('Failed to perform semantic search');
        }
    }

    // Multilingual Search
    async multilingualSearch(query, documents) {
        try {
            // First detect language of query
            const isMalayalamQuery = /[ം-ൿ]/.test(query);

            // If query is in Malayalam, translate it to English for search
            let searchQuery = query;
            if (isMalayalamQuery) {
                const translation = await this.detectAndTranslateLanguage(query);
                searchQuery = translation.translatedText;
            }

            // Perform semantic search with translated query
            return await this.semanticSearch(searchQuery, documents);
        } catch (error) {
            console.error('Error performing multilingual search:', error);
            throw new Error('Failed to perform multilingual search');
        }
    }

    // Cross-Document Linking
    async findRelatedDocuments(document, allDocuments) {
        try {
            // Find documents related to the given document
            const docTags = document.tags || [];
            const docCategory = document.category || '';
            const docTitle = (document.title || '').toLowerCase();

            const relatedDocs = allDocuments.filter(doc => {
                if (doc.id === document.id) return false; // Don't include self

                // Calculate similarity based on tags, category, and title
                let similarityScore = 0;

                // Tag overlap
                const docTagsSet = new Set(docTags);
                const otherDocTagsSet = new Set(doc.tags || []);
                const tagIntersection = [...docTagsSet].filter(tag => otherDocTagsSet.has(tag));
                similarityScore += tagIntersection.length * 0.3;

                // Category match
                if (doc.category === docCategory && docCategory) {
                    similarityScore += 0.4;
                }

                // Title similarity (simple word overlap)
                const otherDocTitle = (doc.title || '').toLowerCase();
                const titleWords1 = docTitle.split(/\s+/);
                const titleWords2 = otherDocTitle.split(/\s+/);
                const titleIntersection = titleWords1.filter(word => titleWords2.includes(word));
                similarityScore += titleIntersection.length * 0.1;

                return similarityScore > 0.2; // Threshold for considering related
            }).map(doc => {
                // Recalculate similarity for sorting
                const docTagsSet = new Set(docTags);
                const otherDocTagsSet = new Set(doc.tags || []);
                const tagIntersection = [...docTagsSet].filter(tag => otherDocTagsSet.has(tag));
                const tagSimilarity = tagIntersection.length * 0.3;

                const categorySimilarity = (doc.category === docCategory && docCategory) ? 0.4 : 0;

                const otherDocTitle = (doc.title || '').toLowerCase();
                const titleWords1 = docTitle.split(/\s+/);
                const titleWords2 = otherDocTitle.split(/\s+/);
                const titleIntersection = titleWords1.filter(word => titleWords2.includes(word));
                const titleSimilarity = titleIntersection.length * 0.1;

                const similarity = tagSimilarity + categorySimilarity + titleSimilarity;

                return {
                    ...doc,
                    similarity
                };
            }).sort((a, b) => b.similarity - a.similarity);

            return relatedDocs.slice(0, 10); // Return top 10 related documents
        } catch (error) {
            console.error('Error finding related documents:', error);
            throw new Error('Failed to find related documents');
        }
    }

    // Visual Search (simplified implementation)
    async visualSearch(queryImage, documents) {
        try {
            // Simplified visual search - in a real implementation, this would use image embeddings
            // For now, we'll return documents that have image-related tags

            const imageTags = ['drawing', 'diagram', 'blueprint', 'image', 'photo', 'chart', 'graph'];
            const visualDocs = documents.filter(doc => {
                const tags = doc.tags || [];
                return tags.some(tag => imageTags.includes(tag.toLowerCase()));
            }).map(doc => ({
                ...doc,
                similarity: Math.random() * 0.5 + 0.5 // Random similarity for demo
            })).sort((a, b) => b.similarity - a.similarity);

            return visualDocs.slice(0, 10); // Return top 10 visual matches
        } catch (error) {
            console.error('Error performing visual search:', error);
            throw new Error('Failed to perform visual search');
        }
    }

    /**
     * ⚡ Personalization & Notifications
     */

    // Role-Based Recommendations
    async getRoleBasedRecommendations(user, documents) {
        try {
            // Filter documents based on user role
            let filteredDocs = [];

            switch (user.role) {
                case 'admin':
                    // Admin can see all documents
                    filteredDocs = documents;
                    break;
                case 'manager':
                    // Manager can see documents from their department
                    filteredDocs = documents.filter(doc =>
                        !doc.department || doc.department === user.department
                    );
                    break;
                case 'staff':
                    // Staff can see their own documents and department documents
                    filteredDocs = documents.filter(doc =>
                        doc.uploadedBy === user.name ||
                        doc.uploadedBy === user.id ||
                        doc.department === user.department
                    );
                    break;
                default:
                    // Default: only public documents
                    filteredDocs = documents.filter(doc => doc.isPublic);
            }

            // Sort by relevance and recency
            return filteredDocs.sort((a, b) => {
                // Prioritize recent documents
                const dateA = new Date(a.uploadedAt || a.created || new Date());
                const dateB = new Date(b.uploadedAt || b.created || new Date());
                return dateB - dateA;
            }).slice(0, 30); // Return top 30 recommendations
        } catch (error) {
            console.error('Error getting role-based recommendations:', error);
            throw new Error('Failed to get role-based recommendations');
        }
    }

    // Priority Alerts
    async generatePriorityAlerts(documents) {
        try {
            // Identify urgent documents that need attention
            const urgentDocs = documents.filter(doc => {
                // Check for urgency indicators
                const content = (doc.title + ' ' + (doc.description || '') + ' ' + (doc.content || '')).toLowerCase();
                return content.includes('urgent') ||
                    content.includes('immediate') ||
                    content.includes('critical') ||
                    content.includes('asap') ||
                    (doc.tags || []).some(tag =>
                        ['safety', 'regulation', 'compliance', 'deadline'].includes(tag.toLowerCase())
                    );
            }).map(doc => ({
                ...doc,
                alertLevel: this.determineAlertLevel(doc),
                reason: this.determineAlertReason(doc),
                timestamp: new Date()
            }));

            return urgentDocs;
        } catch (error) {
            console.error('Error generating priority alerts:', error);
            throw new Error('Failed to generate priority alerts');
        }
    }

    determineAlertLevel(document) {
        // Determine alert level based on content
        const content = (document.title + ' ' + (document.description || '') + ' ' + (document.content || '')).toLowerCase();
        if (content.includes('critical')) return 'Critical';
        if (content.includes('urgent') || content.includes('immediate') || content.includes('asap')) return 'High';
        if ((document.tags || []).some(tag => ['safety', 'regulation'].includes(tag.toLowerCase()))) return 'Medium';
        return 'Low';
    }

    determineAlertReason(document) {
        // Determine reason for the alert
        const content = (document.title + ' ' + (document.description || '') + ' ' + (document.content || '')).toLowerCase();
        if (content.includes('critical')) return 'Critical document requires immediate attention';
        if (content.includes('urgent')) return 'Urgent document needs review';
        if (content.includes('safety')) return 'Safety-related document';
        if (content.includes('regulation')) return 'Regulatory document';
        if (content.includes('deadline')) return 'Document has approaching deadline';
        return 'Priority document';
    }

    // Daily/Weekly Digest
    async generateDigest(user, documents, period = 'daily') {
        try {
            // Generate a digest of relevant documents for the user
            const relevantDocs = await this.getRoleBasedRecommendations(user, documents);

            // Filter by time period
            const periodFilter = period === 'daily' ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000; // ms
            const cutoffDate = new Date(Date.now() - periodFilter);

            const recentDocs = relevantDocs.filter(doc => {
                const docDate = new Date(doc.uploadedAt || doc.created || new Date());
                return docDate >= cutoffDate;
            });

            // Categorize documents
            const categorizedDocs = {};
            recentDocs.forEach(doc => {
                const category = doc.category || 'Uncategorized';
                if (!categorizedDocs[category]) {
                    categorizedDocs[category] = [];
                }
                categorizedDocs[category].push(doc);
            });

            return {
                period,
                generatedAt: new Date(),
                totalDocuments: recentDocs.length,
                categories: categorizedDocs,
                highlights: recentDocs.slice(0, 5) // Top 5 most recent
            };
        } catch (error) {
            console.error('Error generating digest:', error);
            throw new Error('Failed to generate digest');
        }
    }

    /**
     * 🛡️ Trust, Security & Compliance
     */

    // Traceability
    async generateTraceabilityInfo(document) {
        try {
            // Generate traceability information for a document
            return {
                documentId: document.id,
                originalSource: document.source || 'Uploaded by user',
                processingSteps: [
                    { step: 'Upload', timestamp: document.uploadedAt || document.created || new Date() },
                    { step: 'OCR Processing', timestamp: document.processedAt || new Date() },
                    { step: 'Classification', timestamp: document.classifiedAt || new Date() },
                    { step: 'Summarization', timestamp: document.summarizedAt || new Date() },
                    { step: 'Entity Extraction', timestamp: document.entitiesExtractedAt || new Date() }
                ],
                checksum: this.generateChecksum(document),
                version: document.version || 1,
                accessLog: document.accessLog || []
            };
        } catch (error) {
            console.error('Error generating traceability info:', error);
            throw new Error('Failed to generate traceability information');
        }
    }

    generateChecksum(document) {
        // Generate a simple checksum for the document
        const content = document.title + (document.description || '') + (document.content || '');
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16);
    }

    // Access Control
    async checkAccessControl(user, document) {
        try {
            // Check if user has access to the document
            if (document.isPublic) {
                return { allowed: true, reason: 'Public document' };
            }

            if (!user) {
                return { allowed: false, reason: 'User not authenticated' };
            }

            // Admin can access everything
            if (user.role === 'admin') {
                return { allowed: true, reason: 'Admin access' };
            }

            // Check ownership
            if (document.uploadedBy === user.name || document.uploadedBy === user.id) {
                return { allowed: true, reason: 'Document owner' };
            }

            // Check department access
            if (document.department && document.department === user.department) {
                if (user.role === 'manager' || user.role === 'staff') {
                    return { allowed: true, reason: 'Department access' };
                }
            }

            return { allowed: false, reason: 'Access denied' };
        } catch (error) {
            console.error('Error checking access control:', error);
            throw new Error('Failed to check access control');
        }
    }

    // Anomaly Detection
    async detectAnomalies(documents) {
        try {
            const anomalies = [];

            // Check for duplicate documents
            const docHashes = {};
            documents.forEach(doc => {
                const content = doc.title + (doc.description || '') + (doc.content || '');
                const hash = this.generateChecksum(doc);
                if (docHashes[hash]) {
                    anomalies.push({
                        type: 'duplicate',
                        documentId: doc.id,
                        duplicateOf: docHashes[hash],
                        severity: 'Medium',
                        details: 'Document appears to be a duplicate'
                    });
                } else {
                    docHashes[hash] = doc.id;
                }
            });

            // Check for inconsistent data
            documents.forEach(doc => {
                if (!doc.title || doc.title.length < 3) {
                    anomalies.push({
                        type: 'incomplete_data',
                        documentId: doc.id,
                        issue: 'Missing or very short title',
                        severity: 'Low',
                        details: 'Document title is missing or less than 3 characters'
                    });
                }

                // Check for missing classification
                if (!doc.category) {
                    anomalies.push({
                        type: 'missing_classification',
                        documentId: doc.id,
                        issue: 'Missing document category',
                        severity: 'Low',
                        details: 'Document has not been classified'
                    });
                }
            });

            // Check for documents with no content
            documents.forEach(doc => {
                const content = (doc.description || '') + (doc.content || '');
                if (content.length < 10) {
                    anomalies.push({
                        type: 'empty_content',
                        documentId: doc.id,
                        issue: 'Document has minimal content',
                        severity: 'Low',
                        details: 'Document content is less than 10 characters'
                    });
                }
            });

            return anomalies;
        } catch (error) {
            console.error('Error detecting anomalies:', error);
            throw new Error('Failed to detect anomalies');
        }
    }

    /**
     * 📊 Analytics & Insights
     */

    // Trend Analysis
    async analyzeTrends(documents) {
        try {
            // Analyze document trends over time
            const trends = {
                categoryDistribution: this.analyzeCategoryDistribution(documents),
                uploadFrequency: this.analyzeUploadFrequency(documents),
                commonIssues: this.identifyCommonIssues(documents),
                departmentActivity: this.analyzeDepartmentActivity(documents)
            };

            return trends;
        } catch (error) {
            console.error('Error analyzing trends:', error);
            throw new Error('Failed to analyze trends');
        }
    }

    analyzeCategoryDistribution(documents) {
        const categoryCount = {};
        documents.forEach(doc => {
            const category = doc.category || 'Uncategorized';
            categoryCount[category] = (categoryCount[category] || 0) + 1;
        });

        return Object.entries(categoryCount)
            .map(([category, count]) => ({ category, count }))
            .sort((a, b) => b.count - a.count);
    }

    analyzeUploadFrequency(documents) {
        // Group documents by month
        const monthlyUploads = {};
        documents.forEach(doc => {
            const date = new Date(doc.uploadedAt || doc.created || new Date());
            const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            monthlyUploads[monthKey] = (monthlyUploads[monthKey] || 0) + 1;
        });

        return Object.entries(monthlyUploads)
            .map(([month, count]) => ({ month, count }))
            .sort((a, b) => a.month.localeCompare(b.month));
    }

    identifyCommonIssues(documents) {
        // Identify common compliance or safety issues
        const issueCount = {};
        documents.forEach(doc => {
            (doc.tags || []).forEach(tag => {
                if (['safety', 'compliance', 'regulation', 'urgent', 'critical'].includes(tag.toLowerCase())) {
                    issueCount[tag] = (issueCount[tag] || 0) + 1;
                }
            });
        });

        return Object.entries(issueCount)
            .map(([issue, count]) => ({ issue, count }))
            .sort((a, b) => b.count - a.count);
    }

    analyzeDepartmentActivity(documents) {
        const deptCount = {};
        documents.forEach(doc => {
            const dept = doc.department || 'Unknown';
            deptCount[dept] = (deptCount[dept] || 0) + 1;
        });

        return Object.entries(deptCount)
            .map(([department, count]) => ({ department, documentCount: count }))
            .sort((a, b) => b.documentCount - a.documentCount);
    }

    // Knowledge Retention
    async buildKnowledgeBase(documents) {
        try {
            // Build a knowledge base from processed documents
            const knowledgeBase = {
                categories: {},
                entities: {},
                commonPhrases: {},
                bestPractices: [],
                lessonsLearned: []
            };

            // Process each document to extract knowledge
            for (const doc of documents) {
                // Categorize knowledge by document category
                const category = doc.category || 'Uncategorized';
                if (!knowledgeBase.categories[category]) {
                    knowledgeBase.categories[category] = {
                        documentCount: 0,
                        commonTags: {},
                        keyEntities: {}
                    };
                }

                knowledgeBase.categories[category].documentCount += 1;

                // Extract and count tags
                (doc.tags || []).forEach(tag => {
                    knowledgeBase.categories[category].commonTags[tag] =
                        (knowledgeBase.categories[category].commonTags[tag] || 0) + 1;
                });

                // Extract key phrases (simplified)
                const content = (doc.title + ' ' + (doc.description || '')).toLowerCase();
                const words = content.split(/\s+/).filter(word => word.length > 4);
                words.forEach(word => {
                    knowledgeBase.commonPhrases[word] = (knowledgeBase.commonPhrases[word] || 0) + 1;
                });
            }

            // Sort and limit knowledge items
            Object.keys(knowledgeBase.categories).forEach(category => {
                const tags = knowledgeBase.categories[category].commonTags;
                knowledgeBase.categories[category].commonTags = Object.entries(tags)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10)
                    .reduce((obj, [key, val]) => {
                        obj[key] = val;
                        return obj;
                    }, {});
            });

            const phrases = Object.entries(knowledgeBase.commonPhrases)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 50)
                .reduce((obj, [key, val]) => {
                    obj[key] = val;
                    return obj;
                }, {});

            knowledgeBase.commonPhrases = phrases;

            return knowledgeBase;
        } catch (error) {
            console.error('Error building knowledge base:', error);
            throw new Error('Failed to build knowledge base');
        }
    }

    // Usage Insights
    async generateUsageInsights(documents, userInteractions) {
        try {
            // Analyze how documents are being used
            const insights = {
                mostAccessed: this.findMostAccessedDocuments(documents, userInteractions),
                departmentWorkload: this.analyzeDepartmentWorkload(documents),
                processingTimes: this.analyzeProcessingTimes(documents),
                userEngagement: this.analyzeUserEngagement(userInteractions)
            };

            return insights;
        } catch (error) {
            console.error('Error generating usage insights:', error);
            throw new Error('Failed to generate usage insights');
        }
    }

    findMostAccessedDocuments(documents, userInteractions) {
        // Count accesses per document
        const accessCount = {};
        userInteractions.forEach(interaction => {
            if (interaction.type === 'view' || interaction.type === 'download') {
                accessCount[interaction.documentId] = (accessCount[interaction.documentId] || 0) + 1;
            }
        });

        // Map to document titles and sort
        return Object.entries(accessCount)
            .map(([docId, count]) => {
                const doc = documents.find(d => d.id === docId);
                return {
                    documentId: docId,
                    title: doc ? doc.title : 'Unknown Document',
                    accessCount: count
                };
            })
            .sort((a, b) => b.accessCount - a.accessCount)
            .slice(0, 15); // Top 15 most accessed
    }

    analyzeDepartmentWorkload(documents) {
        const deptCount = {};
        documents.forEach(doc => {
            const dept = doc.department || 'Unknown';
            deptCount[dept] = (deptCount[dept] || 0) + 1;
        });

        return Object.entries(deptCount)
            .map(([department, count]) => ({ department, documentCount: count }))
            .sort((a, b) => b.documentCount - a.documentCount);
    }

    analyzeProcessingTimes(documents) {
        // Calculate average processing time for documents
        const processingTimes = documents
            .filter(doc => doc.processedAt && (doc.uploadedAt || doc.created))
            .map(doc => {
                const uploadTime = new Date(doc.uploadedAt || doc.created);
                const processTime = new Date(doc.processedAt);
                return (processTime - uploadTime) / 1000; // in seconds
            });

        if (processingTimes.length === 0) return { average: 0, min: 0, max: 0 };

        const avgTime = processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length;
        const minTime = Math.min(...processingTimes);
        const maxTime = Math.max(...processingTimes);

        return {
            average: Math.round(avgTime),
            min: Math.round(minTime),
            max: Math.round(maxTime)
        };
    }

    analyzeUserEngagement(userInteractions) {
        // Analyze user engagement patterns
        const engagement = {
            totalInteractions: userInteractions.length,
            interactionTypes: {},
            activeUsers: new Set(),
            peakHours: {}
        };

        userInteractions.forEach(interaction => {
            // Count interaction types
            engagement.interactionTypes[interaction.type] =
                (engagement.interactionTypes[interaction.type] || 0) + 1;

            // Track active users
            if (interaction.userId) {
                engagement.activeUsers.add(interaction.userId);
            }

            // Analyze peak hours
            if (interaction.timestamp) {
                const hour = new Date(interaction.timestamp).getHours();
                engagement.peakHours[hour] = (engagement.peakHours[hour] || 0) + 1;
            }
        });

        engagement.activeUserCount = engagement.activeUsers.size;
        delete engagement.activeUsers; // Remove Set for serialization

        return engagement;
    }

    /**
     * Helper Methods
     */

    async callAIEndpoint(endpoint, data) {
        try {
            if (!this.apiKey) {
                throw new Error('AI API key not configured');
            }

            const response = await axios.post(`${this.apiEndpoint}${endpoint}`, data, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
        } catch (error) {
            console.error('Error calling AI endpoint:', error);
            throw new Error('Failed to call AI service');
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = DocumentAIService;
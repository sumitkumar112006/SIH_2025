// Enhanced AI Assistant with OpenRouter Integration
class EnhancedAIAssistant {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.apiBaseUrl = '/api/ai/enhanced';
        this.conversationHistory = [];
        this.currentDocument = null;
        this.isProcessing = false;
        this.currentModel = 'openai/gpt-3.5-turbo';
        this.usingEnhancedService = true;
        
        // Mark this as the advanced assistant
        window.advancedAIAssistant = this;
        
        this.init();
    }

    init() {
        console.log('Enhanced AI Assistant: Initializing with OpenRouter...');
        this.setupEventListeners();
        this.loadConversationHistory();
        this.checkServiceHealth();
        console.log('Enhanced AI Assistant: Initialized successfully');
    }

    getCurrentUser() {
        try {
            const userData = localStorage.getItem('kmrl_user');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error getting user data:', error);
            return null;
        }
    }

    async checkServiceHealth() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/health`);
            const data = await response.json();
            
            if (data.success) {
                this.usingEnhancedService = data.healthStatus.openRouter;
                console.log('Enhanced AI Service Health:', data.healthStatus);
                this.updateServiceStatus(data.healthStatus);
            }
        } catch (error) {
            console.error('Health check failed:', error);
            this.usingEnhancedService = false;
        }
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('#enhancedAIToggle')) {
                this.toggleAssistant();
            }
            if (e.target.closest('#enhancedAIClose')) {
                this.closeAssistant();
            }
            if (e.target.closest('#enhancedAISend')) {
                this.handleUserMessage();
            }
            if (e.target.closest('#enhancedAIClear')) {
                this.clearConversationHistory();
            }
            if (e.target.closest('.enhanced-ai-feature-btn')) {
                const feature = e.target.closest('.enhanced-ai-feature-btn').dataset.feature;
                this.activateFeature(feature);
            }
            if (e.target.closest('#fixOpenAI')) {
                this.fixOpenAI();
            }
            if (e.target.closest('#testOpenAI')) {
                this.testOpenAI();
            }
        });

        document.addEventListener('keypress', (e) => {
            if (e.target.id === 'enhancedAIInput' && e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleUserMessage();
            }
        });
    }

    toggleAssistant() {
        const panel = document.getElementById('enhancedAIPanel');
        if (panel) {
            panel.classList.toggle('show');
            if (panel.classList.contains('show')) {
                this.initializeUI();
            }
        }
    }

    closeAssistant() {
        const panel = document.getElementById('enhancedAIPanel');
        if (panel) {
            panel.classList.remove('show');
        }
    }

    initializeUI() {
        this.renderConversation();
        this.renderDocumentSelector();
        this.renderFeatureButtons();
        this.updateServiceStatus();
        this.focusInput();
    }

    renderConversation() {
        const container = document.getElementById('enhancedAIChat');
        if (!container) return;

        if (this.conversationHistory.length === 0) {
            container.innerHTML = `
                <div class="enhanced-ai-welcome">
                    <div class="enhanced-ai-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <h3>🚀 Enhanced KMRL AI Assistant</h3>
                    <p><strong>Powered by OpenRouter & Advanced Language Models</strong></p>
                    <div class="enhanced-ai-capabilities">
                        <h4>🔥 New Capabilities:</h4>
                        <div class="capabilities-grid">
                            <div class="capability-item">
                                <i class="fas fa-brain"></i>
                                <span>Advanced Document Analysis</span>
                            </div>
                            <div class="capability-item">
                                <i class="fas fa-language"></i>
                                <span>Professional Translation</span>
                            </div>
                            <div class="capability-item">
                                <i class="fas fa-question-circle"></i>
                                <span>Intelligent Q&A</span>
                            </div>
                            <div class="capability-item">
                                <i class="fas fa-shield-check"></i>
                                <span>Compliance Analysis</span>
                            </div>
                        </div>
                    </div>
                    <p>Choose a feature below or ask me anything about your documents!</p>
                </div>
            `;
        } else {
            container.innerHTML = this.conversationHistory.map(msg => `
                <div class="enhanced-ai-message ${msg.sender}">
                    <div class="enhanced-ai-message-content">
                        ${msg.content}
                        <div class="enhanced-ai-message-time">${this.formatTime(msg.timestamp)}</div>
                    </div>
                </div>
            `).join('');
            container.scrollTop = container.scrollHeight;
        }
    }

    renderFeatureButtons() {
        const container = document.getElementById('enhancedAIFeatures');
        if (!container) return;

        const features = [
            { id: 'summarize', icon: 'fas fa-compress-alt', label: 'Smart Summary' },
            { id: 'translate', icon: 'fas fa-language', label: 'Translate' },
            { id: 'qa', icon: 'fas fa-question-circle', label: 'Ask Questions' },
            { id: 'classify', icon: 'fas fa-tags', label: 'Classify' },
            { id: 'entities', icon: 'fas fa-search', label: 'Extract Data' },
            { id: 'compliance', icon: 'fas fa-shield-check', label: 'Compliance' },
            { id: 'quality', icon: 'fas fa-star', label: 'Quality Check' },
            { id: 'actions', icon: 'fas fa-tasks', label: 'Action Items' }
        ];

        container.innerHTML = features.map(feature => `
            <button class="enhanced-ai-feature-btn" data-feature="${feature.id}">
                <i class="${feature.icon}"></i>
                <span>${feature.label}</span>
            </button>
        `).join('');
    }

    renderDocumentSelector() {
        const selector = document.getElementById('enhancedDocSelect');
        if (!selector) return;

        try {
            const documents = JSON.parse(localStorage.getItem('kmrl_documents') || '[]');
            
            selector.innerHTML = `
                <option value="">Select a document to analyze</option>
                ${documents.map(doc => `
                    <option value="${doc.id}" ${this.currentDocument?.id === doc.id ? 'selected' : ''}>
                        ${doc.title} (${doc.category || 'Uncategorized'})
                    </option>
                `).join('')}
            `;
        } catch (error) {
            console.error('Error loading documents:', error);
        }
    }

    updateServiceStatus(healthStatus = null) {
        const statusElement = document.getElementById('enhancedAIStatus');
        if (!statusElement) return;

        const status = healthStatus || { openRouter: this.usingEnhancedService, openAI: false };
        
        let statusColor, statusText, statusIcon, actionButton = '';
        
        if (status.openAI) {
            statusColor = '#10b981';
            statusText = '🤖 OpenAI Active & Healthy';
            statusIcon = 'fas fa-check-circle';
        } else if (status.openRouter) {
            statusColor = '#f59e0b';
            statusText = '⚠️ OpenAI Issues - Using Fallback';
            statusIcon = 'fas fa-exclamation-triangle';
            actionButton = `<button id="fixOpenAI" class="fix-openai-btn" title="Attempt to fix OpenAI connection">
                <i class="fas fa-wrench"></i> Fix OpenAI
            </button>`;
        } else {
            statusColor = '#ef4444';
            statusText = '❌ AI Services Offline';
            statusIcon = 'fas fa-times-circle';
            actionButton = `<button id="testOpenAI" class="fix-openai-btn" title="Test OpenAI connection">
                <i class="fas fa-sync"></i> Test OpenAI
            </button>`;
        }

        statusElement.innerHTML = `
            <div class="service-status" style="color: ${statusColor}">
                <div class="status-main">
                    <i class="${statusIcon}"></i>
                    <span>${statusText}</span>
                </div>
                ${actionButton}
            </div>
        `;
    }

    async handleUserMessage() {
        const input = document.getElementById('enhancedAIInput');
        const message = input.value.trim();

        if (!message || this.isProcessing) return;

        this.addMessageToHistory('user', message);
        input.value = '';
        this.renderConversation();
        this.showThinking();
        this.isProcessing = true;

        try {
            const response = await this.processMessage(message);
            this.addMessageToHistory('ai', response);
        } catch (error) {
            console.error('AI Processing Error:', error);
            this.addMessageToHistory('ai', '❌ Sorry, I encountered an error processing your request. Please try again.');
        } finally {
            this.hideThinking();
            this.isProcessing = false;
            this.renderConversation();
        }
    }

    async processMessage(message) {
        // Check if this is a document-specific question
        if (this.currentDocument) {
            return await this.answerDocumentQuestion(message);
        }

        // General chat response
        return await this.generateChatResponse(message);
    }

    async answerDocumentQuestion(question) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/question-answer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: question,
                    documentText: this.currentDocument.content || this.currentDocument.description,
                    documentId: this.currentDocument.id
                })
            });

            const data = await response.json();
            if (data.success) {
                return `**📋 Document Q&A**

**Question:** ${question}

**Answer:** ${data.answer}`;
            }
        } catch (error) {
            console.error('Document Q&A error:', error);
        }

        return "I'm sorry, I couldn't process your question about the document. Please try rephrasing.";
    }

    async generateChatResponse(message) {
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            return `🚀 Hello! I'm your Enhanced AI Assistant powered by OpenAI through OpenRouter. 

🤖 **Current Status**: Using ${this.usingEnhancedService ? 'OpenAI models' : 'fallback service'}

I can help with document analysis, translation, compliance checking, and more. What would you like to work on?`;
        }

        if (lowerMessage.includes('help') || lowerMessage.includes('openai') || lowerMessage.includes('fix')) {
            return `🔥 **Enhanced AI Capabilities (OpenAI Priority):**

• **🤖 OpenAI Models**: GPT-4o-mini, GPT-4o, GPT-3.5-turbo
• **📊 Smart Document Analysis** - Executive & technical summaries
• **🌐 Professional Translation** - English ↔ Malayalam
• **❓ Intelligent Q&A** - Ask questions about documents
• **🛡️ Compliance Checking** - Regulatory analysis
• **⭐ Quality Assessment** - Document improvement suggestions
• **🔍 Entity Extraction** - Dates, amounts, names
• **📋 Action Items** - Task and deadline identification

**🔧 Troubleshooting**: If you see "Fix OpenAI" button, click it to restore OpenAI functionality.

Select a document and choose a feature, or ask me anything!`;
        }
        
        if (lowerMessage.includes('status') || lowerMessage.includes('health')) {
            return `🔍 **System Status Check**

🤖 **OpenAI Status**: ${this.usingEnhancedService ? 'Active' : 'Issues detected'}
⚡ **Service Mode**: ${this.usingEnhancedService ? 'Enhanced (OpenAI)' : 'Fallback'}

If you're experiencing issues, try:
1. Click the "Fix OpenAI" button if available
2. Refresh the page
3. Check your internet connection

I'm here to help regardless of the service mode!`;
        }

        return `I understand you're asking about "${message}". 

🤖 **Quick Tips:**
• Select a document above to analyze it with OpenAI
• Click feature buttons for specific AI tasks
• Ask about "help" to see all capabilities
• Use "Fix OpenAI" if you see connection issues

What specific task would you like help with?`;
    }

    async activateFeature(feature) {
        if (!this.currentDocument) {
            this.addMessageToHistory('system', '⚠️ Please select a document first.');
            this.renderConversation();
            return;
        }

        this.showThinking();
        this.isProcessing = true;

        try {
            let response;
            switch (feature) {
                case 'summarize':
                    response = await this.performSummarization();
                    break;
                case 'translate':
                    response = await this.performTranslation();
                    break;
                case 'classify':
                    response = await this.performClassification();
                    break;
                case 'entities':
                    response = await this.performEntityExtraction();
                    break;
                case 'compliance':
                    response = await this.performComplianceAnalysis();
                    break;
                case 'quality':
                    response = await this.performQualityAssessment();
                    break;
                case 'actions':
                    response = await this.performActionExtraction();
                    break;
                default:
                    response = 'Feature not implemented yet.';
            }

            this.addMessageToHistory('ai', response);
        } catch (error) {
            console.error('Feature error:', error);
            this.addMessageToHistory('ai', `❌ Error with ${feature} feature. Please try again.`);
        } finally {
            this.hideThinking();
            this.isProcessing = false;
            this.renderConversation();
        }
    }

    async performSummarization() {
        const response = await fetch(`${this.apiBaseUrl}/summarize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: this.currentDocument.content || this.currentDocument.description,
                summaryType: 'standard'
            })
        });

        const data = await response.json();
        if (data.success) {
            return `**📄 Document Summary**

${data.summary}

**📊 Word Count:** ${data.wordCount}`;
        }
        throw new Error('Summarization failed');
    }

    async performTranslation() {
        const response = await fetch(`${this.apiBaseUrl}/detect-translate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: this.currentDocument.content || this.currentDocument.description })
        });

        const data = await response.json();
        if (data.success) {
            return `**🌐 Translation**

**Source (${data.sourceLanguage}):**
${data.originalText.substring(0, 200)}...

**Translation (${data.targetLanguage}):**
${data.translatedText}`;
        }
        throw new Error('Translation failed');
    }

    async performClassification() {
        const response = await fetch(`${this.apiBaseUrl}/classify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: this.currentDocument.content || this.currentDocument.description })
        });

        const data = await response.json();
        if (data.success) {
            return `**🏷️ Classification**

**Category:** ${data.category}
**Confidence:** ${(data.confidence * 100).toFixed(1)}%
**Urgency:** ${data.urgency}`;
        }
        throw new Error('Classification failed');
    }

    async performEntityExtraction() {
        const response = await fetch(`${this.apiBaseUrl}/extract-entities`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: this.currentDocument.content || this.currentDocument.description })
        });

        const data = await response.json();
        if (data.success) {
            let result = '**🔍 Extracted Entities**\n\n';
            Object.entries(data.entities).forEach(([type, items]) => {
                if (Array.isArray(items) && items.length > 0) {
                    result += `**${type.replace(/_/g, ' ').toUpperCase()}:**\n`;
                    items.slice(0, 3).forEach(item => result += `• ${item}\n`);
                    result += '\n';
                }
            });
            return result || 'No significant entities found.';
        }
        throw new Error('Entity extraction failed');
    }

    async performComplianceAnalysis() {
        const response = await fetch(`${this.apiBaseUrl}/compliance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: this.currentDocument.content || this.currentDocument.description })
        });

        const data = await response.json();
        if (data.success) {
            const riskIcon = { HIGH: '🔴', MEDIUM: '🟡', LOW: '🟢' }[data.riskLevel] || '🟡';
            return `**🛡️ Compliance Analysis**

**Risk Level:** ${riskIcon} ${data.riskLevel}

${data.complianceAnalysis}`;
        }
        throw new Error('Compliance analysis failed');
    }

    async performQualityAssessment() {
        const response = await fetch(`${this.apiBaseUrl}/quality-assessment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: this.currentDocument.content || this.currentDocument.description })
        });

        const data = await response.json();
        if (data.success) {
            return `**⭐ Quality Assessment**\n\n${data.qualityAssessment}`;
        }
        throw new Error('Quality assessment failed');
    }

    async performActionExtraction() {
        const response = await fetch(`${this.apiBaseUrl}/action-points`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: this.currentDocument.content || this.currentDocument.description })
        });

        const data = await response.json();
        if (data.success && Array.isArray(data.actionPoints)) {
            if (data.actionPoints.length === 0) {
                return '**📋 Action Items**\n\nNo specific action items found.';
            }

            let result = '**📋 Action Items**\n\n';
            data.actionPoints.slice(0, 5).forEach((action, index) => {
                result += `**${index + 1}.** ${action.task || action.description}\n`;
                if (action.priority) result += `Priority: ${action.priority}\n`;
                if (action.deadline) result += `Deadline: ${action.deadline}\n`;
                result += '\n';
            });
            return result;
        }
        throw new Error('Action extraction failed');
    }

    showThinking() {
        const container = document.getElementById('enhancedAIChat');
        if (container) {
            const thinking = document.createElement('div');
            thinking.id = 'enhancedAIThinking';
            thinking.className = 'enhanced-ai-message ai thinking';
            thinking.innerHTML = `
                <div class="enhanced-ai-message-content">
                    <div class="thinking-dots">
                        <span></span><span></span><span></span>
                    </div>
                    <span>Processing with AI...</span>
                </div>
            `;
            container.appendChild(thinking);
            container.scrollTop = container.scrollHeight;
        }
    }

    hideThinking() {
        const thinking = document.getElementById('enhancedAIThinking');
        if (thinking) thinking.remove();
    }

    addMessageToHistory(sender, content) {
        this.conversationHistory.push({
            sender,
            content: content.replace(/\n/g, '<br>'),
            timestamp: new Date()
        });
        this.saveConversationHistory();
    }

    loadConversationHistory() {
        try {
            const saved = localStorage.getItem('kmrl_enhanced_ai_conversation');
            if (saved) {
                this.conversationHistory = JSON.parse(saved).map(msg => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp)
                }));
            }
        } catch (error) {
            this.conversationHistory = [];
        }
    }

    saveConversationHistory() {
        try {
            localStorage.setItem('kmrl_enhanced_ai_conversation', JSON.stringify(this.conversationHistory));
        } catch (error) {
            console.error('Error saving conversation history:', error);
        }
    }

    clearConversationHistory() {
        if (confirm('Clear conversation history?')) {
            this.conversationHistory = [];
            this.saveConversationHistory();
            this.renderConversation();
        }
    }

    focusInput() {
        const input = document.getElementById('enhancedAIInput');
        if (input) setTimeout(() => input.focus(), 100);
    }

    formatTime(date) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // OpenAI-specific methods
    async fixOpenAI() {
        this.addMessageToHistory('system', '🔧 Attempting to fix OpenAI connection...');
        this.renderConversation();
        this.showThinking();
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/reset-openai`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.usingEnhancedService = data.openAIHealthy;
                this.addMessageToHistory('ai', `✅ **OpenAI Fix Attempt Complete**

🤖 **Status**: ${data.openAIHealthy ? 'OpenAI is now working!' : 'Still having issues, using fallback'}
📱 **Model**: ${data.currentModel}
🔄 **Service**: ${data.modelUsed}

You can now try using the AI features again.`);
                this.checkServiceHealth();
            } else {
                this.addMessageToHistory('ai', '❌ **OpenAI Fix Failed**\n\nStill experiencing issues. Using fallback service for now. Please try again later.');
            }
        } catch (error) {
            this.addMessageToHistory('ai', '❌ **Fix Attempt Failed**\n\nCould not connect to fix OpenAI. Please check your internet connection and try again.');
        } finally {
            this.hideThinking();
            this.renderConversation();
        }
    }
    
    async testOpenAI() {
        this.addMessageToHistory('system', '🧪 Testing OpenAI connection...');
        this.renderConversation();
        this.showThinking();
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/health`);
            const data = await response.json();
            
            if (data.success) {
                const status = data.healthStatus;
                this.usingEnhancedService = status.openAI;
                
                let statusMessage = `🔍 **OpenAI Test Results**\n\n`;
                statusMessage += `🤖 **OpenAI Status**: ${status.openAI ? '✅ Working' : '❌ Not responding'}\n`;
                statusMessage += `⚡ **Current Service**: ${status.currentService}\n`;
                statusMessage += `📊 **Available Models**: ${status.availableModels?.length || 0}\n`;
                statusMessage += `⏰ **Test Time**: ${new Date(status.timestamp).toLocaleTimeString()}`;
                
                if (status.openAI) {
                    statusMessage += `\n\n🎉 **Great news!** OpenAI is working. You can now use all advanced features.`;
                } else {
                    statusMessage += `\n\n⚠️ **Notice**: OpenAI is currently unavailable. Using fallback service for basic functionality.`;
                }
                
                this.addMessageToHistory('ai', statusMessage);
                this.updateServiceStatus(status);
            }
        } catch (error) {
            this.addMessageToHistory('ai', '❌ **Connection Test Failed**\n\nCould not test OpenAI connection. Please check your internet and try again.');
        } finally {
            this.hideThinking();
            this.renderConversation();
        }
    }
}

// Initialize Enhanced AI Assistant when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new EnhancedAIAssistant();
    });
} else {
    new EnhancedAIAssistant();
}
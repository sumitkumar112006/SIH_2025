// KMRL Document Management System - Advanced AI Assistant JavaScript

class AdvancedAIAssistant {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.assistantMode = 'chat'; // chat, summarizer, translator, search, etc.
        this.currentDocument = null;
        this.conversationHistory = [];
        this.apiBaseUrl = '/api/ai';
        this.init();
    }

    init() {
        console.log('Advanced AI Assistant: Initializing...');
        this.setupEventListeners();
        this.loadConversationHistory();
        this.setupRoleBasedKnowledge();
        console.log('Advanced AI Assistant: Initialized with user:', this.currentUser);
    }

    getCurrentUser() {
        try {
            const userData = localStorage.getItem('kmrl_user');
            console.log('Advanced AI Assistant: Found user data in localStorage:', userData);
            const parsedUser = userData ? JSON.parse(userData) : null;
            console.log('Advanced AI Assistant: Parsed user data:', parsedUser);
            return parsedUser;
        } catch (error) {
            console.error('Error getting user data:', error);
            return null;
        }
    }

    setupRoleBasedKnowledge() {
        console.log('Advanced AI Assistant: Setting up role-based knowledge for user:', this.currentUser);
        // Configure AI assistant knowledge based on user role
        if (this.currentUser) {
            console.log('Advanced AI Assistant: User role is:', this.currentUser.role);
            switch (this.currentUser.role) {
                case 'admin':
                    this.roleKnowledge = this.getAdminKnowledge();
                    console.log('Advanced AI Assistant: Set up admin knowledge');
                    break;
                case 'manager':
                    this.roleKnowledge = this.getManagerKnowledge();
                    console.log('Advanced AI Assistant: Set up manager knowledge');
                    break;
                case 'staff':
                    this.roleKnowledge = this.getStaffKnowledge();
                    console.log('Advanced AI Assistant: Set up staff knowledge');
                    break;
                default:
                    this.roleKnowledge = this.getDefaultKnowledge();
                    console.log('Advanced AI Assistant: Set up default knowledge');
            }
        } else {
            this.roleKnowledge = this.getDefaultKnowledge();
            console.log('Advanced AI Assistant: No user found, set up default knowledge');
        }
        console.log('Advanced AI Assistant: Role knowledge configured:', this.roleKnowledge);
    }

    getAdminKnowledge() {
        return {
            role: 'System Administrator',
            accessLevel: 'Full System Access',
            capabilities: [
                'User Management',
                'System Configuration',
                'Document Oversight',
                'Workflow Management',
                'Security Monitoring',
                'System Analytics',
                'Backup and Restore',
                'All Department Access',
                'AI Model Management',
                'System-wide Document Processing'
            ],
            permissions: [
                'Create/Edit/Delete Users',
                'Modify System Settings',
                'Approve/Reject Any Document',
                'View All System Logs',
                'Configure Workflows',
                'Perform System Backups',
                'Access All AI Features',
                'Manage AI Service Configuration'
            ]
        };
    }

    getManagerKnowledge() {
        return {
            role: 'Department Manager',
            accessLevel: 'Department Level Access',
            department: this.currentUser?.department || 'Operations',
            capabilities: [
                'Department Document Management',
                'Staff Performance Monitoring',
                'Department Analytics',
                'Document Approval (Department Only)',
                'Task Assignment',
                'Department Reporting',
                'Department AI Insights',
                'Team Document Processing'
            ],
            permissions: [
                'Approve/Reject Department Documents',
                'View Department Analytics',
                'Manage Department Staff Tasks',
                'Generate Department Reports',
                'Access Department AI Features',
                'View Team Processing Results'
            ]
        };
    }

    getStaffKnowledge() {
        return {
            role: 'Staff Member',
            accessLevel: 'Personal Document Access',
            department: this.currentUser?.department || 'General',
            capabilities: [
                'Document Upload',
                'Personal Document Management',
                'Task Completion',
                'Department Communication',
                'Personal Document Processing',
                'Document Summarization',
                'Document Translation'
            ],
            permissions: [
                'Upload Documents',
                'Edit Own Pending Documents',
                'View Assigned Tasks',
                'Access Department Documents',
                'Use Basic AI Features',
                'Process Personal Documents'
            ]
        };
    }

    getDefaultKnowledge() {
        return {
            role: 'Guest User',
            accessLevel: 'Limited Access',
            capabilities: [
                'Basic System Information',
                'Public Document Access',
                'Basic Search'
            ],
            permissions: [
                'View Public Information Only',
                'Basic Search Only'
            ]
        };
    }

    setupEventListeners() {
        console.log('Advanced AI Assistant: Setting up event listeners');
        // AI Assistant toggle
        const clickHandler = (e) => {
            console.log('Advanced AI Assistant: Document click event triggered');
            if (e.target.closest('#aiAssistantToggle')) {
                console.log('Advanced AI Assistant: Toggle button clicked');
                this.toggleAssistant();
            }
            if (e.target.closest('#aiAssistantClose')) {
                console.log('Advanced AI Assistant: Close button clicked');
                this.closeAssistant();
            }
            if (e.target.closest('#aiSendMessage')) {
                console.log('Advanced AI Assistant: Send message button clicked');
                this.handleUserMessage();
            }
            if (e.target.closest('#aiClearHistory')) {
                console.log('Advanced AI Assistant: Clear history button clicked');
                this.clearConversationHistory();
            }
            if (e.target.closest('.ai-mode-btn')) {
                const modeBtn = e.target.closest('.ai-mode-btn');
                const mode = modeBtn.dataset.mode;
                console.log('Advanced AI Assistant: Mode button clicked:', mode);
                this.switchMode(mode);
            }
            if (e.target.closest('#aiDocumentSelect')) {
                const docSelect = e.target.closest('#aiDocumentSelect');
                const docId = docSelect.value;
                console.log('Advanced AI Assistant: Document selected:', docId);
                this.selectDocument(docId);
            }
            if (e.target.closest('.ai-feature-btn')) {
                const featureBtn = e.target.closest('.ai-feature-btn');
                const feature = featureBtn.dataset.feature;
                console.log('Advanced AI Assistant: Feature button clicked:', feature);
                this.executeFeature(feature);
            }
        };

        document.addEventListener('click', clickHandler);
        console.log('Advanced AI Assistant: Click event listener attached');

        // Handle Enter key in message input
        const keypressHandler = (e) => {
            if (e.target.id === 'aiUserMessage' && e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                console.log('Advanced AI Assistant: Enter key pressed in message input');
                this.handleUserMessage();
            }
        };

        document.addEventListener('keypress', keypressHandler);
        console.log('Advanced AI Assistant: Keypress event listener attached');
        console.log('Advanced AI Assistant: Event listeners set up');
    }

    toggleAssistant() {
        console.log('Advanced AI Assistant: Toggling assistant');
        const assistantPanel = document.getElementById('aiAssistantPanel');
        console.log('Advanced AI Assistant: Found panel:', assistantPanel);
        if (assistantPanel) {
            assistantPanel.classList.toggle('show');
            console.log('Advanced AI Assistant: Panel visibility:', assistantPanel.classList.contains('show'));
            if (assistantPanel.classList.contains('show')) {
                this.initializeAssistant();
            }
        } else {
            console.log('Advanced AI Assistant: Panel not found');
        }
    }

    closeAssistant() {
        console.log('Advanced AI Assistant: Closing assistant');
        const assistantPanel = document.getElementById('aiAssistantPanel');
        console.log('Advanced AI Assistant: Found panel:', assistantPanel);
        if (assistantPanel) {
            assistantPanel.classList.remove('show');
            console.log('Advanced AI Assistant: Panel closed');
        } else {
            console.log('Advanced AI Assistant: Panel not found');
        }
    }

    initializeAssistant() {
        console.log('Advanced AI Assistant: Initializing assistant UI');
        // Ensure user data is current
        this.currentUser = this.getCurrentUser();
        this.setupRoleBasedKnowledge();

        this.renderRoleInfo();
        this.renderConversation();
        this.renderDocumentSelector();
        this.renderFeatures();
        this.focusMessageInput();
        console.log('Advanced AI Assistant: Assistant UI initialized');
    }

    renderRoleInfo() {
        const roleInfo = document.getElementById('aiRoleInfo');
        if (roleInfo && this.roleKnowledge) {
            roleInfo.innerHTML = `
                <div class="ai-role-header">
                    <h4>${this.roleKnowledge.role}</h4>
                    <span class="ai-access-level">${this.roleKnowledge.accessLevel}</span>
                </div>
                <div class="ai-role-details">
                    ${this.roleKnowledge.department ? `<p><strong>Department:</strong> ${this.roleKnowledge.department}</p>` : ''}
                    <div class="ai-capabilities">
                        <h5>Capabilities:</h5>
                        <ul>
                            ${this.roleKnowledge.capabilities.map(cap => `<li>${cap}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="ai-permissions">
                        <h5>Permissions:</h5>
                        <ul>
                            ${this.roleKnowledge.permissions.map(perm => `<li>${perm}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
            console.log('Advanced AI Assistant: Role info rendered');
        } else {
            console.log('Advanced AI Assistant: Could not render role info - missing element or knowledge');
        }
    }

    renderConversation() {
        const chatContainer = document.getElementById('aiChatContainer');
        if (chatContainer) {
            if (this.conversationHistory.length === 0) {
                chatContainer.innerHTML = `
                    <div class="ai-welcome">
                        <div class="ai-avatar">
                            <i class="fas fa-robot"></i>
                        </div>
                        <h3>Welcome to KMRL Advanced AI Assistant</h3>
                        <p>I'm here to help you with document management tasks. You can ask me to:</p>
                        <ul>
                            <li>Summarize documents</li>
                            <li>Translate content between English and Malayalam</li>
                            <li>Search documents semantically</li>
                            <li>Extract key information</li>
                            <li>Classify documents</li>
                            <li>Find related documents</li>
                        </ul>
                        <p>How can I assist you today?</p>
                    </div>
                `;
            } else {
                chatContainer.innerHTML = this.conversationHistory.map(msg => `
                    <div class="ai-message ${msg.sender}">
                        <div class="ai-message-content">
                            ${msg.content}
                            <div class="ai-message-time">${this.formatTime(msg.timestamp)}</div>
                        </div>
                    </div>
                `).join('');

                // Scroll to bottom
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }
        }
    }

    renderDocumentSelector() {
        const selector = document.getElementById('aiDocumentSelect');
        if (selector) {
            // Get documents based on user role
            let documents = [];
            try {
                documents = JSON.parse(localStorage.getItem('kmrl_documents') || '[]');

                // Filter based on user role
                if (this.currentUser) {
                    switch (this.currentUser.role) {
                        case 'admin':
                            // Admin can see all documents
                            break;
                        case 'manager':
                            // Manager can see documents from their department
                            documents = documents.filter(doc => {
                                // For simplicity, we'll assume documents have a department field
                                // In a real implementation, you'd check the uploader's department
                                return !doc.department || doc.department === this.currentUser.department;
                            });
                            break;
                        case 'staff':
                            // Staff can see their own documents
                            documents = documents.filter(doc =>
                                doc.uploadedBy === this.currentUser.name ||
                                doc.uploadedBy === this.currentUser.id
                            );
                            break;
                        default:
                            documents = [];
                    }
                }
            } catch (error) {
                console.error('Error loading documents:', error);
                documents = [];
            }

            selector.innerHTML = `
                <option value="">Select a document</option>
                ${documents.map(doc => `
                    <option value="${doc.id}" ${this.currentDocument?.id === doc.id ? 'selected' : ''}>
                        ${doc.title} (${doc.category})
                    </option>
                `).join('')}
            `;
        }
    }

    renderFeatures() {
        const featuresContainer = document.getElementById('aiFeaturesContainer');
        if (featuresContainer) {
            featuresContainer.innerHTML = `
                <div class="ai-features-grid">
                    <button class="ai-feature-btn" data-feature="summarize">
                        <i class="fas fa-file-alt"></i>
                        <span>Summarize</span>
                    </button>
                    <button class="ai-feature-btn" data-feature="translate">
                        <i class="fas fa-language"></i>
                        <span>Translate</span>
                    </button>
                    <button class="ai-feature-btn" data-feature="classify">
                        <i class="fas fa-tags"></i>
                        <span>Classify</span>
                    </button>
                    <button class="ai-feature-btn" data-feature="extract">
                        <i class="fas fa-key"></i>
                        <span>Extract</span>
                    </button>
                    <button class="ai-feature-btn" data-feature="search">
                        <i class="fas fa-search"></i>
                        <span>Search</span>
                    </button>
                    <button class="ai-feature-btn" data-feature="related">
                        <i class="fas fa-link"></i>
                        <span>Related</span>
                    </button>
                </div>
            `;
        }
    }

    focusMessageInput() {
        const input = document.getElementById('aiUserMessage');
        if (input) {
            setTimeout(() => {
                input.focus();
            }, 100);
        }
    }

    async handleUserMessage() {
        console.log('Advanced AI Assistant: Handling user message');
        const input = document.getElementById('aiUserMessage');
        console.log('Advanced AI Assistant: Found input element:', input);
        const message = input.value.trim();
        console.log('Advanced AI Assistant: Message content:', message);

        if (!message) {
            console.log('Advanced AI Assistant: No message to send');
            return;
        }

        // Add user message to conversation
        this.addMessageToHistory('user', message);
        input.value = '';

        // Show thinking indicator
        this.showThinkingIndicator();

        try {
            // Process the message based on current mode
            let response;
            console.log('Advanced AI Assistant: Current mode:', this.assistantMode);
            switch (this.assistantMode) {
                case 'summarizer':
                    console.log('Advanced AI Assistant: Processing as summarizer');
                    response = await this.summarizeContent(message);
                    break;
                case 'translator':
                    console.log('Advanced AI Assistant: Processing as translator');
                    response = await this.translateContent(message);
                    break;
                case 'search':
                    console.log('Advanced AI Assistant: Processing as search');
                    response = await this.searchContent(message);
                    break;
                case 'chat':
                default:
                    console.log('Advanced AI Assistant: Processing as chat');
                    response = await this.chatResponse(message);
                    break;
            }
            console.log('Advanced AI Assistant: Response generated:', response);

            // Add AI response to conversation
            this.addMessageToHistory('ai', response);
        } catch (error) {
            console.error('Advanced AI Assistant error:', error);
            this.addMessageToHistory('ai', 'Sorry, I encountered an error processing your request. Please try again.');
        } finally {
            this.hideThinkingIndicator();
            this.renderConversation();
        }
    }

    async chatResponse(message) {
        // Simulate AI processing delay
        await this.delay(1000 + Math.random() * 1000);

        // Simple rule-based responses for demo
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            return `Hello! I'm the KMRL Advanced AI Assistant. I can help you with document management tasks. How can I assist you today?`;
        }

        if (lowerMessage.includes('help')) {
            return `I can help you with several advanced tasks:

1. **Document Summarization** - Get concise summaries of documents
2. **Translation** - Translate between English and Malayalam
3. **Semantic Search** - Find documents by meaning, not just keywords
4. **Document Classification** - Auto-tag documents by category
5. **Entity Extraction** - Pull out key information like dates, names, amounts
6. **Related Document Finding** - Discover connected documents
7. **Compliance Checking** - Identify regulatory requirements
8. **Action Point Extraction** - Find tasks and deadlines

What would you like to do?`;
        }

        if (lowerMessage.includes('role') || lowerMessage.includes('permission')) {
            const capabilitiesList = this.roleKnowledge.capabilities.map(cap => `- ${cap}`).join('\n');
            const permissionsList = this.roleKnowledge.permissions.map(perm => `- ${perm}`).join('\n');
            return `Based on your role as ${this.roleKnowledge.role}, you have the following capabilities:

**Capabilities:**
${capabilitiesList}

**Permissions:**
${permissionsList}

If you need help with any specific capability, just let me know!`;
        }

        if (lowerMessage.includes('document') && lowerMessage.includes('count')) {
            try {
                const documents = JSON.parse(localStorage.getItem('kmrl_documents') || '[]');
                let count = documents.length;

                // Filter based on user role
                if (this.currentUser) {
                    switch (this.currentUser.role) {
                        case 'manager':
                            count = documents.filter(doc =>
                                !doc.department || doc.department === this.currentUser.department
                            ).length;
                            break;
                        case 'staff':
                            count = documents.filter(doc =>
                                doc.uploadedBy === this.currentUser.name ||
                                doc.uploadedBy === this.currentUser.id
                            ).length;
                            break;
                    }
                }

                return `There are currently ${count} documents in the system that you have access to.`;
            } catch (error) {
                return "I'm having trouble accessing the document count right now. Please try again later.";
            }
        }

        if (lowerMessage.includes('summar') || lowerMessage.includes('summary')) {
            return "To get a document summary, please switch to Summarizer mode using the mode buttons above, then select a document or paste the content you'd like summarized.";
        }

        if (lowerMessage.includes('translat')) {
            return "To translate content, please switch to Translator mode using the mode buttons above. I can translate between English and Malayalam.";
        }

        if (lowerMessage.includes('search')) {
            return "To perform a semantic search, please switch to Search mode using the mode buttons above, then enter your query.";
        }

        if (lowerMessage.includes('classif')) {
            return "I can help classify documents into categories like HR, Finance, Engineering, Safety, etc. Please provide the document content you'd like classified.";
        }

        if (lowerMessage.includes('extract')) {
            return "I can extract key information from documents including dates, names, amounts, and more. Please provide the document content you'd like processed.";
        }

        // Default response
        return `I understand you're asking about "${message}". As an Advanced AI assistant, I can help with:

• Document summarization and key point extraction
• English-Malayalam translation
• Semantic document search
• Document classification and tagging
• Entity extraction (dates, names, amounts)
• Related document discovery
• Compliance checking
• Action point identification

Could you please be more specific about what you need help with?`;
    }

    async summarizeContent(content) {
        // Simulate AI processing delay
        await this.delay(1500 + Math.random() * 1000);

        try {
            // Call the AI service endpoint
            const response = await fetch(`${this.apiBaseUrl}/summarize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: content })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    const bulletPoints = data.summary.bulletPoints.map((point, i) => `${i + 1}. ${point}`).join('\n');
                    return `**Document Summary**

${data.summary.summary}

**Key Points:**
${bulletPoints}

**Statistics:**
- Word Count: ${data.summary.wordCount}
- Sentence Count: ${data.summary.sentenceCount}`;
                }
            }
        } catch (error) {
            console.error('Error calling summarize API:', error);
        }

        // Fallback to simple summarization
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const wordCount = content.split(/\s+/).length;

        if (sentences.length <= 3) {
            return `This content is already quite brief:\n\n${content}`;
        }

        // Extract key points (first, middle, last sentences)
        const keyPoints = [
            sentences[0],
            sentences[Math.floor(sentences.length / 2)],
            sentences[sentences.length - 1]
        ];

        const keyPointsList = keyPoints.map((point, i) => `${i + 1}. ${point.trim()}`).join('\n');
        return `**Summary**

**Key Points:**
${keyPointsList}

**Word Count:** ${wordCount} words
**Sentence Count:** ${sentences.length} sentences`;
    }

    async translateContent(content) {
        // Simulate AI processing delay
        await this.delay(1200 + Math.random() * 800);

        try {
            // Call the AI service endpoint
            const response = await fetch(`${this.apiBaseUrl}/detect-translate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: content })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    const isEnglish = data.detectedLanguage === 'English';
                    return `**${data.detectedLanguage} to ${isEnglish ? 'Malayalam' : 'English'} Translation**

**Original (${data.detectedLanguage}):**
${content}

**Translated (${isEnglish ? 'Malayalam' : 'English'}):**
${data.translatedText}

**Confidence:** ${(data.confidence * 100).toFixed(1)}%`;
                }
            }
        } catch (error) {
            console.error('Error calling translate API:', error);
        }

        // Fallback to simple translation simulation
        const isEnglish = /[a-zA-Z]/.test(content);
        const wordCount = content.split(/\s+/).length;

        if (isEnglish) {
            // English to Malayalam simulation
            return `**English to Malayalam Translation**

**Original (English):**
${content}

**Translated (Malayalam):**
[Simulated Malayalam translation would appear here]

**Word Count:** ${wordCount} words`;
        } else {
            // Malayalam to English simulation
            return `**Malayalam to English Translation**

**Original (Malayalam):**
${content}

**Translated (English):**
[Simulated English translation would appear here]

**Word Count:** ${wordCount} words`;
        }
    }

    async searchContent(query) {
        // Simulate AI processing delay
        await this.delay(1300 + Math.random() * 700);

        try {
            // Call the AI service endpoint
            const response = await fetch(`${this.apiBaseUrl}/semantic-search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: query })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.results.length > 0) {
                    const resultsList = data.results.slice(0, 5).map(result =>
                        `- ${result.title} (${result.category || 'Uncategorized'})`
                    ).join('\n');

                    return `**Search Results for "${query}"**

Found ${data.resultCount} documents. Here are the top 5 matches:

${resultsList}

Would you like me to provide more details about any of these documents?`;
                } else {
                    return `I couldn't find any documents matching "${query}". Try using different keywords or a more general search term.`;
                }
            }
        } catch (error) {
            console.error('Error calling search API:', error);
        }

        // Fallback response
        return `I searched for "${query}" but couldn't connect to the advanced search service. In a real implementation, this would perform semantic search across all documents in the system.`;
    }

    switchMode(mode) {
        this.assistantMode = mode;

        // Update UI to reflect mode change
        const modeButtons = document.querySelectorAll('.ai-mode-btn');
        modeButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mode === mode) {
                btn.classList.add('active');
            }
        });

        // Update mode description
        const modeDesc = document.getElementById('aiModeDescription');
        if (modeDesc) {
            const descriptions = {
                chat: 'Chat Mode: Ask questions about the system or document management',
                summarizer: 'Summarizer Mode: Get concise summaries of documents or text',
                translator: 'Translator Mode: Translate between English and Malayalam',
                search: 'Search Mode: Find documents by meaning, not just keywords'
            };
            modeDesc.textContent = descriptions[mode] || descriptions.chat;
        }

        // Show/hide document selector based on mode
        const docSelectorContainer = document.getElementById('aiDocumentSelectorContainer');
        if (docSelectorContainer) {
            docSelectorContainer.style.display = (mode === 'summarizer') ? 'block' : 'none';
        }

        // Add mode change message to conversation
        this.addMessageToHistory('system', `Switched to ${mode.charAt(0).toUpperCase() + mode.slice(1)} Mode`);
        this.renderConversation();
    }

    async executeFeature(feature) {
        console.log('Advanced AI Assistant: Executing feature:', feature);

        // Show thinking indicator
        this.showThinkingIndicator();

        try {
            let response = '';

            switch (feature) {
                case 'summarize':
                    if (this.currentDocument) {
                        const docContent = this.getDocumentContentForProcessing(this.currentDocument);
                        response = await this.summarizeContent(docContent);
                    } else {
                        response = 'Please select a document first to summarize.';
                    }
                    break;

                case 'translate':
                    response = 'Switched to Translator mode. Please enter text to translate.';
                    this.switchMode('translator');
                    break;

                case 'classify':
                    if (this.currentDocument) {
                        const docContent = this.currentDocument.description || this.currentDocument.title;
                        if (docContent) {
                            try {
                                const responseApi = await fetch(`${this.apiBaseUrl}/classify-document`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({ text: docContent })
                                });

                                if (responseApi.ok) {
                                    const data = await responseApi.json();
                                    if (data.success) {
                                        response = `**Document Classification**

Category: ${data.category}
Confidence: ${(data.confidence * 100).toFixed(1)}%
Tags: ${data.tags.join(', ')}`;
                                    } else {
                                        response = 'Unable to classify the document at this time.';
                                    }
                                }
                            } catch (error) {
                                console.error('Error calling classify API:', error);
                                response = 'Unable to classify the document at this time.';
                            }
                        } else {
                            response = 'No content available to classify.';
                        }
                    } else {
                        response = 'Please select a document first to classify.';
                    }
                    break;

                case 'extract':
                    if (this.currentDocument) {
                        const docContent = this.currentDocument.description || this.currentDocument.title;
                        if (docContent) {
                            try {
                                const responseApi = await fetch(`${this.apiBaseUrl}/extract-entities`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({ text: docContent })
                                });

                                if (responseApi.ok) {
                                    const data = await responseApi.json();
                                    if (data.success) {
                                        response = `**Extracted Entities**

Dates: ${data.entities.dates.join(', ') || 'None found'}
Names: ${data.entities.names.join(', ') || 'None found'}
Amounts: ${data.entities.amounts.join(', ') || 'None found'}
Regulations: ${data.entities.regulations.join(', ') || 'None found'}
Project IDs: ${data.entities.projectIds.join(', ') || 'None found'}`;
                                    } else {
                                        response = 'Unable to extract entities from the document at this time.';
                                    }
                                }
                            } catch (error) {
                                console.error('Error calling extract API:', error);
                                response = 'Unable to extract entities from the document at this time.';
                            }
                        } else {
                            response = 'No content available to extract entities from.';
                        }
                    } else {
                        response = 'Please select a document first to extract entities.';
                    }
                    break;

                case 'search':
                    response = 'Switched to Search mode. Please enter your search query.';
                    this.switchMode('search');
                    break;

                case 'related':
                    if (this.currentDocument) {
                        try {
                            const responseApi = await fetch(`${this.apiBaseUrl}/find-related`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ documentId: this.currentDocument.id })
                            });

                            if (responseApi.ok) {
                                const data = await responseApi.json();
                                if (data.success && data.relatedDocuments.length > 0) {
                                    const relatedList = data.relatedDocuments.slice(0, 3).map(doc =>
                                        `- ${doc.title} (${(doc.similarity * 100).toFixed(1)}% similar)`
                                    ).join('\n');

                                    response = `**Related Documents**

Found ${data.relatedDocuments.length} related documents:

${relatedList}`;
                                } else {
                                    response = 'No related documents found for this document.';
                                }
                            }
                        } catch (error) {
                            console.error('Error calling related documents API:', error);
                            response = 'Unable to find related documents at this time.';
                        }
                    } else {
                        response = 'Please select a document first to find related documents.';
                    }
                    break;

                default:
                    response = `Feature "${feature}" is not yet implemented.`;
            }

            // Add AI response to conversation
            this.addMessageToHistory('ai', response);
        } catch (error) {
            console.error('Advanced AI Assistant feature error:', error);
            this.addMessageToHistory('ai', 'Sorry, I encountered an error executing that feature. Please try again.');
        } finally {
            this.hideThinkingIndicator();
            this.renderConversation();
        }
    }

    selectDocument(docId) {
        if (!docId) {
            this.currentDocument = null;
            return;
        }

        try {
            const documents = JSON.parse(localStorage.getItem('kmrl_documents') || '[]');
            this.currentDocument = documents.find(doc => doc.id === docId) || null;

            if (this.currentDocument) {
                // Add system message about document selection
                this.addMessageToHistory('system', `Selected document: ${this.currentDocument.title}`);
            }
        } catch (error) {
            console.error('Error selecting document:', error);
            this.addMessageToHistory('system', 'Error selecting document');
        }
    }

    getDocumentContentForProcessing(document) {
        // Extract content from document for processing
        let content = `Title: ${document.title}\n`;
        if (document.description) {
            content += `Description: ${document.description}\n`;
        }
        if (document.category) {
            content += `Category: ${document.category}\n`;
        }
        if (document.tags && document.tags.length > 0) {
            content += `Tags: ${document.tags.join(', ')}\n`;
        }

        return content;
    }

    addMessageToHistory(sender, content) {
        const message = {
            sender: sender,
            content: content.replace(/\n/g, '<br>'),
            timestamp: new Date()
        };

        this.conversationHistory.push(message);
        this.saveConversationHistory();
    }

    showThinkingIndicator() {
        const chatContainer = document.getElementById('aiChatContainer');
        if (chatContainer) {
            const thinkingIndicator = document.createElement('div');
            thinkingIndicator.className = 'ai-message ai-thinking';
            thinkingIndicator.id = 'aiThinkingIndicator';
            thinkingIndicator.innerHTML = `
                <div class="ai-message-content">
                    <div class="ai-thinking-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            `;
            chatContainer.appendChild(thinkingIndicator);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }

    hideThinkingIndicator() {
        const indicator = document.getElementById('aiThinkingIndicator');
        if (indicator) {
            indicator.remove();
        }
    }

    loadConversationHistory() {
        try {
            const saved = localStorage.getItem('kmrl_ai_conversation');
            if (saved) {
                this.conversationHistory = JSON.parse(saved).map(msg => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp)
                }));
            }
        } catch (error) {
            console.error('Error loading conversation history:', error);
            this.conversationHistory = [];
        }
    }

    saveConversationHistory() {
        try {
            localStorage.setItem('kmrl_ai_conversation', JSON.stringify(this.conversationHistory));
        } catch (error) {
            console.error('Error saving conversation history:', error);
        }
    }

    clearConversationHistory() {
        if (confirm('Are you sure you want to clear the conversation history?')) {
            this.conversationHistory = [];
            this.saveConversationHistory();
            this.renderConversation();
        }
    }

    formatTime(date) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Add custom CSS for Advanced AI Assistant
    addCustomStyles() {
        // Check if styles are already added
        if (document.getElementById('advanced-ai-assistant-styles')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'advanced-ai-assistant-styles';
        style.textContent = `
        /* Advanced AI Assistant Panel Styles */
        .ai-assistant-panel {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 450px;
            height: 700px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            display: flex;
            flex-direction: column;
            z-index: 10000;
            transform: translateY(20px);
            opacity: 0;
            transition: all 0.3s ease;
            border: 1px solid #e5e7eb;
        }

        .ai-assistant-panel.show {
            transform: translateY(0);
            opacity: 1;
        }

        .ai-header {
            padding: 1rem;
            background: linear-gradient(135deg, #2563eb, #3b82f6);
            color: white;
            border-radius: 12px 12px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .ai-header h3 {
            margin: 0;
            font-size: 1.1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .ai-header-buttons {
            display: flex;
            gap: 0.5rem;
        }

        .ai-header-btn {
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s;
        }

        .ai-header-btn:hover {
            background: rgba(255,255,255,0.3);
        }

        .ai-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        .ai-role-info {
            padding: 1rem;
            background: #f8fafc;
            border-bottom: 1px solid #e5e7eb;
            font-size: 0.85rem;
            max-height: 150px;
            overflow-y: auto;
        }

        .ai-role-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
        }

        .ai-role-header h4 {
            margin: 0;
            font-size: 1rem;
        }

        .ai-access-level {
            background: #dbeafe;
            color: #2563eb;
            padding: 0.25rem 0.5rem;
            border-radius: 1rem;
            font-size: 0.7rem;
            font-weight: 500;
        }

        .ai-role-details h5 {
            margin: 0.75rem 0 0.25rem 0;
            font-size: 0.85rem;
        }

        .ai-role-details ul {
            margin: 0.25rem 0 0.5rem 1rem;
            padding: 0;
            font-size: 0.8rem;
        }

        .ai-role-details li {
            margin-bottom: 0.25rem;
        }

        .ai-mode-selector {
            padding: 0.75rem 1rem;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            gap: 0.5rem;
            background: #f1f5f9;
        }

        .ai-mode-btn {
            flex: 1;
            padding: 0.5rem;
            border: 1px solid #d1d5db;
            background: white;
            border-radius: 0.5rem;
            cursor: pointer;
            font-size: 0.8rem;
            transition: all 0.2s;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.25rem;
        }

        .ai-mode-btn:hover {
            background: #f8fafc;
        }

        .ai-mode-btn.active {
            background: #2563eb;
            color: white;
            border-color: #2563eb;
        }

        .ai-mode-btn i {
            font-size: 1rem;
        }

        .ai-mode-description {
            padding: 0.5rem 1rem;
            font-size: 0.8rem;
            color: #64748b;
            background: #f8fafc;
            border-bottom: 1px solid #e5e7eb;
        }

        .ai-features-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.5rem;
            padding: 0.75rem 1rem;
            border-bottom: 1px solid #e5e7eb;
            background: #f8fafc;
        }

        .ai-feature-btn {
            padding: 0.75rem 0.5rem;
            border: 1px solid #d1d5db;
            background: white;
            border-radius: 0.5rem;
            cursor: pointer;
            font-size: 0.75rem;
            transition: all 0.2s;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.25rem;
        }

        .ai-feature-btn:hover {
            background: #f8fafc;
            transform: translateY(-2px);
        }

        .ai-feature-btn i {
            font-size: 1rem;
            color: #2563eb;
        }

        .ai-document-selector {
            padding: 0.75rem 1rem;
            border-bottom: 1px solid #e5e7eb;
            background: #f8fafc;
        }

        .ai-document-selector select {
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #d1d5db;
            border-radius: 0.5rem;
            background: white;
        }

        .ai-chat-container {
            flex: 1;
            padding: 1rem;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .ai-message {
            max-width: 85%;
            padding: 0.75rem;
            border-radius: 1rem;
            position: relative;
        }

        .ai-message.user {
            align-self: flex-end;
            background: #2563eb;
            color: white;
            border-bottom-right-radius: 0;
        }

        .ai-message.ai {
            align-self: flex-start;
            background: #f1f5f9;
            border-bottom-left-radius: 0;
        }

        .ai-message.system {
            align-self: center;
            background: #dbeafe;
            color: #2563eb;
            font-size: 0.8rem;
            padding: 0.5rem 1rem;
            border-radius: 1rem;
        }

        .ai-message-content {
            line-height: 1.4;
        }

        .ai-message-content ul {
            margin: 0.5rem 0;
            padding-left: 1.25rem;
        }

        .ai-message-content li {
            margin-bottom: 0.25rem;
        }

        .ai-message-time {
            font-size: 0.7rem;
            opacity: 0.7;
            margin-top: 0.25rem;
            text-align: right;
        }

        .ai-thinking {
            align-self: flex-start;
        }

        .ai-thinking-dots {
            display: flex;
            gap: 0.25rem;
        }

        .ai-thinking-dots span {
            width: 8px;
            height: 8px;
            background: #94a3b8;
            border-radius: 50%;
            animation: ai-bounce 1.5s infinite;
        }

        .ai-thinking-dots span:nth-child(2) {
            animation-delay: 0.2s;
        }

        .ai-thinking-dots span:nth-child(3) {
            animation-delay: 0.4s;
        }

        @keyframes ai-bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
        }

        .ai-welcome {
            text-align: center;
            padding: 1rem;
        }

        .ai-avatar {
            width: 60px;
            height: 60px;
            background: #2563eb;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1rem;
            color: white;
            font-size: 1.5rem;
        }

        .ai-welcome h3 {
            margin: 0 0 0.5rem 0;
            color: #1e293b;
        }

        .ai-welcome p {
            margin: 0 0 1rem 0;
            color: #64748b;
            font-size: 0.9rem;
        }

        .ai-welcome ul {
            text-align: left;
            margin: 1rem 0;
            padding-left: 1.25rem;
        }

        .ai-input-area {
            padding: 1rem;
            border-top: 1px solid #e5e7eb;
            background: white;
        }

        .ai-input-container {
            display: flex;
            gap: 0.5rem;
        }

        .ai-message-input {
            flex: 1;
            padding: 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 0.5rem;
            resize: none;
            font-family: inherit;
            height: 60px;
        }

        .ai-message-input:focus {
            outline: none;
            border-color: #2563eb;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .ai-send-btn {
            padding: 0 1rem;
            background: #2563eb;
            color: white;
            border: none;
            border-radius: 0.5rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .ai-send-btn:hover {
            background: #1d4ed8;
        }

        .ai-footer {
            padding: 0.5rem 1rem;
            display: flex;
            justify-content: space-between;
            font-size: 0.75rem;
            color: #94a3b8;
            border-top: 1px solid #e5e7eb;
            background: #f8fafc;
        }

        .ai-clear-btn {
            background: none;
            border: none;
            color: #94a3b8;
            cursor: pointer;
            font-size: 0.75rem;
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
        }

        .ai-clear-btn:hover {
            background: #f1f5f9;
            color: #64748b;
        }

        /* Advanced AI Assistant Toggle Button */
        .ai-assistant-toggle {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            background: #2563eb;
            color: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            transition: all 0.2s;
        }

        .ai-assistant-toggle:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
        }

        /* Responsive styles */
        @media (max-width: 768px) {
            .ai-assistant-panel {
                width: calc(100% - 40px);
                height: calc(100% - 40px);
                bottom: 20px;
                right: 20px;
            }
            
            .ai-features-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }
        `;
        document.head.appendChild(style);
    }
}

// Initialize Advanced AI Assistant when DOM is loaded
function initializeAdvancedAIAssistant() {
    console.log('Advanced AI Assistant: Initializing UI elements');

    // Remove basic AI assistant elements if they exist
    const basicToggle = document.getElementById('aiAssistantToggle');
    const basicPanel = document.getElementById('aiAssistantPanel');

    if (basicToggle) {
        basicToggle.remove();
        console.log('Advanced AI Assistant: Removed basic AI assistant toggle');
    }

    if (basicPanel) {
        basicPanel.remove();
        console.log('Advanced AI Assistant: Removed basic AI assistant panel');
    }

    // Also remove any basic AI assistant styles
    const basicStyles = document.getElementById('ai-assistant-styles');
    if (basicStyles) {
        basicStyles.remove();
        console.log('Advanced AI Assistant: Removed basic AI assistant styles');
    }

    // Clear any existing AI assistant instances
    if (window.aiAssistant) {
        window.aiAssistant = null;
        console.log('Advanced AI Assistant: Cleared basic AI assistant instance');
    }

    // Add Advanced AI Assistant toggle button to all pages
    if (!document.getElementById('aiAssistantToggle')) {
        console.log('Advanced AI Assistant: Creating toggle button');
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'aiAssistantToggle';
        toggleBtn.className = 'ai-assistant-toggle';
        toggleBtn.innerHTML = '<i class="fas fa-robot"></i>';
        toggleBtn.title = 'Advanced AI Assistant';
        document.body.appendChild(toggleBtn);
        console.log('Advanced AI Assistant: Toggle button created');

        // Add click event to redirect to dedicated AI page
        toggleBtn.addEventListener('click', function () {
            window.location.href = 'ai-assistant.html';
        });
    } else {
        console.log('Advanced AI Assistant: Toggle button already exists');

        // Update click event to redirect to dedicated AI page
        const existingToggle = document.getElementById('aiAssistantToggle');
        if (existingToggle) {
            existingToggle.onclick = function () {
                window.location.href = 'ai-assistant.html';
            };
        }
    }

    // Note: We're not creating the panel anymore since we're redirecting to a dedicated page
    console.log('Advanced AI Assistant: Initialization complete (redirecting to dedicated page)');
}

// Try to initialize immediately, and also on DOMContentLoaded
try {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeAdvancedAIAssistant);
    } else {
        // DOM is already ready
        initializeAdvancedAIAssistant();
    }
} catch (error) {
    console.error('Error initializing Advanced AI Assistant:', error);
    // Fallback: try again after a short delay
    setTimeout(initializeAdvancedAIAssistant, 1000);
}
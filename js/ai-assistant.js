// KMRL Document Management System - AI Assistant JavaScript

class AIAssistant {
    constructor() {
        // Check if Advanced AI Assistant is already initialized
        if (window.advancedAIAssistant) {
            console.log('Advanced AI Assistant already initialized, skipping basic AI Assistant');
            return;
        }

        this.currentUser = this.getCurrentUser();
        this.assistantMode = 'chat'; // chat, summarizer, translator
        this.currentDocument = null;
        this.conversationHistory = [];
        this.apiBaseUrl = '/api/ai';
        this.init();
    }

    init() {
        console.log('AI Assistant: Initializing...');
        this.setupEventListeners();
        this.loadConversationHistory();
        this.setupRoleBasedKnowledge();
        console.log('AI Assistant: Initialized with user:', this.currentUser);
    }

    getCurrentUser() {
        try {
            const userData = localStorage.getItem('kmrl_user');
            console.log('AI Assistant: Found user data in localStorage:', userData);
            const parsedUser = userData ? JSON.parse(userData) : null;
            console.log('AI Assistant: Parsed user data:', parsedUser);
            return parsedUser;
        } catch (error) {
            console.error('Error getting user data:', error);
            return null;
        }
    }

    setupRoleBasedKnowledge() {
        console.log('AI Assistant: Setting up role-based knowledge for user:', this.currentUser);
        // Configure AI assistant knowledge based on user role
        if (this.currentUser) {
            console.log('AI Assistant: User role is:', this.currentUser.role);
            switch (this.currentUser.role) {
                case 'admin':
                    this.roleKnowledge = this.getAdminKnowledge();
                    console.log('AI Assistant: Set up admin knowledge');
                    break;
                case 'manager':
                    this.roleKnowledge = this.getManagerKnowledge();
                    console.log('AI Assistant: Set up manager knowledge');
                    break;
                case 'staff':
                    this.roleKnowledge = this.getStaffKnowledge();
                    console.log('AI Assistant: Set up staff knowledge');
                    break;
                default:
                    this.roleKnowledge = this.getDefaultKnowledge();
                    console.log('AI Assistant: Set up default knowledge');
            }
        } else {
            this.roleKnowledge = this.getDefaultKnowledge();
            console.log('AI Assistant: No user found, set up default knowledge');
        }
        console.log('AI Assistant: Role knowledge configured:', this.roleKnowledge);
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
                'Security Monitoring'
            ],
            permissions: [
                'Create/Edit/Delete Users',
                'Modify System Settings',
                'Approve/Reject Any Document',
                'View All System Logs',
                'Configure Workflows'
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
                'Task Assignment'
            ],
            permissions: [
                'Approve/Reject Department Documents',
                'View Department Analytics',
                'Manage Department Staff Tasks',
                'Generate Department Reports'
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
                'Department Communication'
            ],
            permissions: [
                'Upload Documents',
                'Edit Own Pending Documents',
                'View Assigned Tasks',
                'Access Department Documents'
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
        console.log('AI Assistant: Setting up event listeners');
        // AI Assistant toggle
        const clickHandler = (e) => {
            console.log('AI Assistant: Document click event triggered');
            // Check if Advanced AI Assistant is initialized
            if (window.advancedAIAssistant) {
                console.log('Advanced AI Assistant is active, skipping basic AI Assistant event handling');
                return;
            }

            if (e.target.closest('#aiAssistantToggle')) {
                console.log('AI Assistant: Toggle button clicked');
                this.toggleAssistant();
            }
            if (e.target.closest('#aiAssistantClose')) {
                console.log('AI Assistant: Close button clicked');
                this.closeAssistant();
            }
            if (e.target.closest('#aiSendMessage')) {
                console.log('AI Assistant: Send message button clicked');
                this.handleUserMessage();
            }
            if (e.target.closest('#aiClearHistory')) {
                console.log('AI Assistant: Clear history button clicked');
                this.clearConversationHistory();
            }
            if (e.target.closest('.basic-ai-mode-btn')) {
                const modeBtn = e.target.closest('.basic-ai-mode-btn');
                const mode = modeBtn.dataset.mode;
                console.log('AI Assistant: Mode button clicked:', mode);
                this.switchMode(mode);
            }
            if (e.target.closest('#aiDocumentSelect')) {
                const docSelect = e.target.closest('#aiDocumentSelect');
                const docId = docSelect.value;
                console.log('AI Assistant: Document selected:', docId);
                this.selectDocument(docId);
            }
        };

        document.addEventListener('click', clickHandler);
        console.log('AI Assistant: Click event listener attached');

        // Handle Enter key in message input
        const keypressHandler = (e) => {
            // Check if Advanced AI Assistant is initialized
            if (window.advancedAIAssistant) {
                console.log('Advanced AI Assistant is active, skipping basic AI Assistant keypress handling');
                return;
            }

            if (e.target.id === 'aiUserMessage' && e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                console.log('AI Assistant: Enter key pressed in message input');
                this.handleUserMessage();
            }
        };

        document.addEventListener('keypress', keypressHandler);
        console.log('AI Assistant: Keypress event listener attached');
        console.log('AI Assistant: Event listeners set up');
    }

    toggleAssistant() {
        console.log('AI Assistant: Toggling assistant');
        const assistantPanel = document.getElementById('aiAssistantPanel');
        console.log('AI Assistant: Found panel:', assistantPanel);
        if (assistantPanel) {
            assistantPanel.classList.toggle('show');
            console.log('AI Assistant: Panel visibility:', assistantPanel.classList.contains('show'));
            if (assistantPanel.classList.contains('show')) {
                this.initializeAssistant();
            }
        } else {
            console.log('AI Assistant: Panel not found');
        }
    }

    closeAssistant() {
        console.log('AI Assistant: Closing assistant');
        const assistantPanel = document.getElementById('aiAssistantPanel');
        console.log('AI Assistant: Found panel:', assistantPanel);
        if (assistantPanel) {
            assistantPanel.classList.remove('show');
            console.log('AI Assistant: Panel closed');
        } else {
            console.log('AI Assistant: Panel not found');
        }
    }

    initializeAssistant() {
        console.log('AI Assistant: Initializing assistant UI');
        // Ensure user data is current
        this.currentUser = this.getCurrentUser();
        this.setupRoleBasedKnowledge();

        this.renderRoleInfo();
        this.renderConversation();
        this.renderDocumentSelector();
        this.focusMessageInput();
        console.log('AI Assistant: Assistant UI initialized');
    }

    renderRoleInfo() {
        const roleInfo = document.getElementById('aiRoleInfo');
        if (roleInfo && this.roleKnowledge) {
            roleInfo.innerHTML = `
                <div class="basic-ai-role-header">
                    <h4>${this.roleKnowledge.role}</h4>
                    <span class="basic-ai-access-level">${this.roleKnowledge.accessLevel}</span>
                </div>
                <div class="basic-ai-role-details">
                    ${this.roleKnowledge.department ? `<p><strong>Department:</strong> ${this.roleKnowledge.department}</p>` : ''}
                    <div class="basic-ai-capabilities">
                        <h5>Capabilities:</h5>
                        <ul>
                            ${this.roleKnowledge.capabilities.map(cap => `<li>${cap}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="basic-ai-permissions">
                        <h5>Permissions:</h5>
                        <ul>
                            ${this.roleKnowledge.permissions.map(perm => `<li>${perm}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
            console.log('AI Assistant: Role info rendered');
        } else {
            console.log('AI Assistant: Could not render role info - missing element or knowledge');
        }
    }

    renderConversation() {
        const chatContainer = document.getElementById('aiChatContainer');
        if (chatContainer) {
            if (this.conversationHistory.length === 0) {
                chatContainer.innerHTML = `
                    <div class="basic-ai-welcome">
                        <div class="basic-ai-avatar">
                            <i class="fas fa-robot"></i>
                        </div>
                        <h3>Welcome to KMRL AI Assistant</h3>
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
                    <div class="basic-ai-message ${msg.sender}">
                        <div class="basic-ai-message-content">
                            ${msg.content}
                            <div class="basic-ai-message-time">${this.formatTime(msg.timestamp)}</div>
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

    focusMessageInput() {
        const input = document.getElementById('aiUserMessage');
        if (input) {
            setTimeout(() => {
                input.focus();
            }, 100);
        }
    }

    async handleUserMessage() {
        console.log('AI Assistant: Handling user message');
        const input = document.getElementById('aiUserMessage');
        console.log('AI Assistant: Found input element:', input);
        const message = input.value.trim();
        console.log('AI Assistant: Message content:', message);

        if (!message) {
            console.log('AI Assistant: No message to send');
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
            console.log('AI Assistant: Current mode:', this.assistantMode);
            switch (this.assistantMode) {
                case 'summarizer':
                    console.log('AI Assistant: Processing as summarizer');
                    response = await this.summarizeContent(message);
                    break;
                case 'translator':
                    console.log('AI Assistant: Processing as translator');
                    response = await this.translateContent(message);
                    break;
                case 'chat':
                default:
                    console.log('AI Assistant: Processing as chat');
                    response = await this.chatResponse(message);
                    break;
            }
            console.log('AI Assistant: Response generated:', response);

            // Add AI response to conversation
            this.addMessageToHistory('ai', response);
        } catch (error) {
            console.error('AI Assistant error:', error);
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
            return `Hello! I'm the KMRL AI Assistant. I can help you with document management tasks. How can I assist you today?`;
        }

        if (lowerMessage.includes('help')) {
            return `I can help you with several tasks:

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
        return `I understand you're asking about "${message}". As an AI assistant, I can help with:

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

    switchMode(mode) {
        this.assistantMode = mode;

        // Update UI to reflect mode change
        const modeButtons = document.querySelectorAll('.basic-ai-mode-btn');
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
                translator: 'Translator Mode: Translate between English and Malayalam'
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
            thinkingIndicator.className = 'basic-ai-message basic-ai-thinking';
            thinkingIndicator.id = 'aiThinkingIndicator';
            thinkingIndicator.innerHTML = `
                <div class="basic-ai-message-content">
                    <div class="basic-ai-thinking-dots">
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

    // Add custom CSS for AI Assistant
    addCustomStyles() {
        // Check if styles are already added or if advanced assistant is active
        if (document.getElementById('ai-assistant-styles') || window.advancedAIAssistant) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'ai-assistant-styles';
        style.textContent = `
        /* AI Assistant Panel Styles */
        .basic-ai-assistant-panel {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 400px;
            height: 600px;
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

        .basic-ai-assistant-panel.show {
            transform: translateY(0);
            opacity: 1;
        }

        .basic-ai-header {
            padding: 1rem;
            background: linear-gradient(135deg, #2563eb, #3b82f6);
            color: white;
            border-radius: 12px 12px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .basic-ai-header h3 {
            margin: 0;
            font-size: 1.1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .basic-ai-header-buttons {
            display: flex;
            gap: 0.5rem;
        }

        .basic-ai-header-btn {
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

        .basic-ai-header-btn:hover {
            background: rgba(255,255,255,0.3);
        }

        .basic-ai-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        .basic-ai-role-info {
            padding: 1rem;
            background: #f8fafc;
            border-bottom: 1px solid #e5e7eb;
            font-size: 0.85rem;
            max-height: 150px;
            overflow-y: auto;
        }

        .basic-ai-role-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
        }

        .basic-ai-role-header h4 {
            margin: 0;
            font-size: 1rem;
        }

        .basic-ai-access-level {
            background: #dbeafe;
            color: #2563eb;
            padding: 0.25rem 0.5rem;
            border-radius: 1rem;
            font-size: 0.7rem;
            font-weight: 500;
        }

        .basic-ai-role-details h5 {
            margin: 0.75rem 0 0.25rem 0;
            font-size: 0.85rem;
        }

        .basic-ai-role-details ul {
            margin: 0.25rem 0 0.5rem 1rem;
            padding: 0;
            font-size: 0.8rem;
        }

        .basic-ai-role-details li {
            margin-bottom: 0.25rem;
        }

        .basic-ai-mode-selector {
            padding: 0.75rem 1rem;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            gap: 0.5rem;
            background: #f1f5f9;
        }

        .basic-ai-mode-btn {
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

        .basic-ai-mode-btn:hover {
            background: #f8fafc;
        }

        .basic-ai-mode-btn.active {
            background: #2563eb;
            color: white;
            border-color: #2563eb;
        }

        .basic-ai-mode-btn i {
            font-size: 1rem;
        }

        .basic-ai-mode-description {
            padding: 0.5rem 1rem;
            font-size: 0.8rem;
            color: #64748b;
            background: #f8fafc;
            border-bottom: 1px solid #e5e7eb;
        }

        .basic-ai-document-selector {
            padding: 0.75rem 1rem;
            border-bottom: 1px solid #e5e7eb;
            background: #f8fafc;
        }

        .basic-ai-document-selector select {
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #d1d5db;
            border-radius: 0.5rem;
            background: white;
        }

        .basic-ai-chat-container {
            flex: 1;
            padding: 1rem;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .basic-ai-message {
            max-width: 85%;
            padding: 0.75rem;
            border-radius: 1rem;
            position: relative;
        }

        .basic-ai-message.user {
            align-self: flex-end;
            background: #2563eb;
            color: white;
            border-bottom-right-radius: 0;
        }

        .basic-ai-message.ai {
            align-self: flex-start;
            background: #f1f5f9;
            border-bottom-left-radius: 0;
        }

        .basic-ai-message.system {
            align-self: center;
            background: #dbeafe;
            color: #2563eb;
            font-size: 0.8rem;
            padding: 0.5rem 1rem;
            border-radius: 1rem;
        }

        .basic-ai-message-content {
            line-height: 1.4;
        }

        .basic-ai-message-content ul {
            margin: 0.5rem 0;
            padding-left: 1.25rem;
        }

        .basic-ai-message-content li {
            margin-bottom: 0.25rem;
        }

        .basic-ai-message-time {
            font-size: 0.7rem;
            opacity: 0.7;
            margin-top: 0.25rem;
            text-align: right;
        }

        .basic-ai-thinking {
            align-self: flex-start;
        }

        .basic-ai-thinking-dots {
            display: flex;
            gap: 0.25rem;
        }

        .basic-ai-thinking-dots span {
            width: 8px;
            height: 8px;
            background: #94a3b8;
            border-radius: 50%;
            animation: basic-ai-bounce 1.5s infinite;
        }

        .basic-ai-thinking-dots span:nth-child(2) {
            animation-delay: 0.2s;
        }

        .basic-ai-thinking-dots span:nth-child(3) {
            animation-delay: 0.4s;
        }

        @keyframes basic-ai-bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
        }

        .basic-ai-welcome {
            text-align: center;
            padding: 1rem;
        }

        .basic-ai-avatar {
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

        .basic-ai-welcome h3 {
            margin: 0 0 0.5rem 0;
            color: #1e293b;
        }

        .basic-ai-welcome p {
            margin: 0 0 1rem 0;
            color: #64748b;
            font-size: 0.9rem;
        }

        .basic-ai-welcome ul {
            text-align: left;
            margin: 1rem 0;
            padding-left: 1.25rem;
        }

        .basic-ai-input-area {
            padding: 1rem;
            border-top: 1px solid #e5e7eb;
            background: white;
        }

        .basic-ai-input-container {
            display: flex;
            gap: 0.5rem;
        }

        .basic-ai-message-input {
            flex: 1;
            padding: 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 0.5rem;
            resize: none;
            font-family: inherit;
            height: 60px;
        }

        .basic-ai-message-input:focus {
            outline: none;
            border-color: #2563eb;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .basic-ai-send-btn {
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

        .basic-ai-send-btn:hover {
            background: #1d4ed8;
        }

        .basic-ai-footer {
            padding: 0.5rem 1rem;
            display: flex;
            justify-content: space-between;
            font-size: 0.75rem;
            color: #94a3b8;
            border-top: 1px solid #e5e7eb;
            background: #f8fafc;
        }

        .basic-ai-clear-btn {
            background: none;
            border: none;
            color: #94a3b8;
            cursor: pointer;
            font-size: 0.75rem;
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
        }

        .basic-ai-clear-btn:hover {
            background: #f1f5f9;
            color: #64748b;
        }

        /* AI Assistant Toggle Button */
        .basic-ai-assistant-toggle {
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

        .basic-ai-assistant-toggle:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
        }

        /* Responsive styles */
        @media (max-width: 768px) {
            .basic-ai-assistant-panel {
                width: calc(100% - 40px);
                height: calc(100% - 40px);
                bottom: 20px;
                right: 20px;
            }
        }
        `;
        document.head.appendChild(style);
    }
}

// Initialize AI Assistant when DOM is loaded
function initializeAIAssistant() {
    console.log('AI Assistant: Initializing UI elements');

    // Check if Advanced AI Assistant is already initialized
    if (window.advancedAIAssistant) {
        console.log('Advanced AI Assistant already initialized, skipping basic AI Assistant initialization');
        return;
    }

    // Add AI Assistant toggle button to all pages
    if (!document.getElementById('aiAssistantToggle')) {
        console.log('AI Assistant: Creating toggle button');
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'aiAssistantToggle';
        toggleBtn.className = 'basic-ai-assistant-toggle';
        toggleBtn.innerHTML = '<i class="fas fa-robot"></i>';
        toggleBtn.title = 'AI Assistant';
        document.body.appendChild(toggleBtn);
        console.log('AI Assistant: Toggle button created');

        // Add click event to redirect to dedicated AI page
        toggleBtn.addEventListener('click', function () {
            window.location.href = 'ai-assistant.html';
        });
    } else {
        console.log('AI Assistant: Toggle button already exists');

        // Update click event to redirect to dedicated AI page
        const existingToggle = document.getElementById('aiAssistantToggle');
        if (existingToggle) {
            existingToggle.onclick = function () {
                window.location.href = 'ai-assistant.html';
            };
        }
    }

    // Note: We're not creating the panel anymore since we're redirecting to a dedicated page
    console.log('AI Assistant: Initialization complete (redirecting to dedicated page)');
}

// Try to initialize immediately, and also on DOMContentLoaded
try {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeAIAssistant);
    } else {
        // DOM is already ready
        // Check again if advanced assistant is initialized before initializing
        if (!window.advancedAIAssistant) {
            initializeAIAssistant();
        } else {
            console.log('Advanced AI Assistant already initialized, skipping basic AI Assistant initialization');
        }
    }
} catch (error) {
    console.error('Error initializing AI Assistant:', error);
    // Fallback: try again after a short delay
    setTimeout(() => {
        if (!window.advancedAIAssistant) {
            initializeAIAssistant();
        } else {
            console.log('Advanced AI Assistant already initialized, skipping basic AI Assistant initialization');
        }
    }, 1000);
}
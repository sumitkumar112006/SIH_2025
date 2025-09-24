// KMRL AI Assistant - Comprehensive User Support System

class KMRLAIAssistant {
    constructor() {
        this.apiKey = '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';
        this.apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
        this.isOpen = false;
        this.chatHistory = [];
        this.currentUser = this.getCurrentUser();
        this.projectContext = this.getProjectContext();
        this.init();
    }

    init() {
        this.createAIInterface();
        this.setupEventListeners();
        this.loadChatHistory();
        this.setupFloatingButton();
    }

    getCurrentUser() {
        try {
            const userData = localStorage.getItem('kmrl_user');
            return userData ? JSON.parse(userData) : { name: 'Guest', role: 'visitor' };
        } catch (error) {
            console.error('Error getting user data:', error);
            return { name: 'Guest', role: 'visitor' };
        }
    }

    getProjectContext() {
        return {
            name: "KMRL Document Management System",
            purpose: `The KMRL (Kochi Metro Rail Limited) Document Management System is a comprehensive web-based platform designed to streamline document workflows for modern transportation organizations. 

            Key Features:
            • Role-based authentication (Admin, Manager, Staff)
            • Document upload with drag-and-drop functionality
            • Advanced search and filtering capabilities
            • Real-time tender tracking and notifications
            • AI-powered document analysis and categorization
            • Analytics dashboard with visual insights
            • Mobile-responsive design for accessibility
            
            The system serves KMRL's operational needs by:
            1. Centralizing document management processes
            2. Automating tender discovery and notification
            3. Providing intelligent document categorization
            4. Enabling secure collaboration across teams
            5. Offering comprehensive analytics and reporting
            
            This platform helps KMRL efficiently manage contracts, tenders, compliance documents, and operational files while ensuring security and accessibility for all stakeholders.`,
            
            features: [
                "Document Upload & Management",
                "Tender Tracking System",
                "Real-time Notifications",
                "AI Document Analysis",
                "Role-based Access Control",
                "Analytics & Reporting",
                "Mobile Responsive Design",
                "Search & Filter Capabilities"
            ],
            
            userRoles: {
                admin: "Full system access, user management, system configuration",
                manager: "Document approval, team management, analytics access",
                staff: "Document upload/download, basic search functionality"
            },
            
            operations: {
                upload: "Navigate to 'Upload Documents' to add new files with metadata",
                search: "Use the search bar and filters in 'My Documents' section",
                approve: "Managers can approve/reject documents in the documents list",
                analytics: "View system insights and reports in the Analytics section",
                tenders: "Monitor and track tenders in the Tender Dashboard"
            }
        };
    }

    createAIInterface() {
        // Create AI chat container
        const aiContainer = document.createElement('div');
        aiContainer.id = 'aiAssistant';
        aiContainer.className = 'ai-assistant-container';
        aiContainer.innerHTML = `
            <div class="ai-header">
                <div class="ai-title">
                    <i class="fas fa-robot"></i>
                    <span>KMRL AI Assistant</span>
                </div>
                <div class="ai-controls">
                    <button class="ai-minimize" onclick="aiAssistant.minimize()" title="Minimize">
                        <i class="fas fa-minus"></i>
                    </button>
                    <button class="ai-close" onclick="aiAssistant.close()" title="Close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            
            <div class="ai-welcome" id="aiWelcome">
                <div class="welcome-content">
                    <i class="fas fa-robot ai-welcome-icon"></i>
                    <h3>Welcome to KMRL AI Assistant!</h3>
                    <p>I'm here to help you with:</p>
                    <ul>
                        <li><i class="fas fa-upload"></i> Document uploads and management</li>
                        <li><i class="fas fa-search"></i> Finding and organizing files</li>
                        <li><i class="fas fa-gavel"></i> Tender tracking and notifications</li>
                        <li><i class="fas fa-chart-bar"></i> Analytics and reporting</li>
                        <li><i class="fas fa-question-circle"></i> General system guidance</li>
                    </ul>
                    <div class="quick-actions">
                        <button class="quick-action-btn" onclick="aiAssistant.askQuestion('How do I upload documents?')">
                            <i class="fas fa-upload"></i> Upload Help
                        </button>
                        <button class="quick-action-btn" onclick="aiAssistant.askQuestion('What is this project about?')">
                            <i class="fas fa-info-circle"></i> Project Info
                        </button>
                        <button class="quick-action-btn" onclick="aiAssistant.askQuestion('How do I search documents?')">
                            <i class="fas fa-search"></i> Search Help
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="ai-chat" id="aiChat" style="display: none;">
                <div class="ai-messages" id="aiMessages"></div>
                <div class="ai-input-container">
                    <div class="ai-input-wrapper">
                        <input type="text" id="aiInput" placeholder="Ask me anything about the system..." maxlength="500">
                        <button id="aiSend" onclick="aiAssistant.sendMessage()">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                    <div class="ai-suggestions" id="aiSuggestions"></div>
                </div>
            </div>
            
            <div class="ai-status" id="aiStatus">
                <span class="status-text">AI Assistant Ready</span>
                <div class="status-indicator"></div>
            </div>
        `;

        document.body.appendChild(aiContainer);
        this.addAIStyles();
    }

    setupFloatingButton() {
        const floatingBtn = document.createElement('div');
        floatingBtn.id = 'aiFloatingButton';
        floatingBtn.className = 'ai-floating-button';
        floatingBtn.innerHTML = `
            <i class="fas fa-robot"></i>
            <div class="ai-pulse"></div>
        `;
        floatingBtn.onclick = () => this.toggle();
        
        document.body.appendChild(floatingBtn);
    }

    setupEventListeners() {
        // Enter key in input
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && document.activeElement.id === 'aiInput') {
                this.sendMessage();
            }
        });

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Click outside to close
        document.addEventListener('click', (e) => {
            const aiContainer = document.getElementById('aiAssistant');
            const floatingBtn = document.getElementById('aiFloatingButton');
            
            if (this.isOpen && aiContainer && !aiContainer.contains(e.target) && !floatingBtn.contains(e.target)) {
                this.close();
            }
        });
    }

    async sendMessage(message = null) {
        const input = document.getElementById('aiInput');
        const messagesContainer = document.getElementById('aiMessages');
        
        if (!input || !messagesContainer) return;

        const userMessage = message || input.value.trim();
        if (!userMessage) return;

        // Show chat interface if showing welcome
        this.showChatInterface();

        // Clear input
        input.value = '';

        // Add user message
        this.addMessage(userMessage, 'user');

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Get AI response
            const response = await this.getAIResponse(userMessage);
            this.hideTypingIndicator();
            this.addMessage(response, 'ai');
            
            // Update status
            this.updateStatus('Response received', 'success');
            
            // Save to history
            this.saveChatHistory();
            
        } catch (error) {
            console.error('Error getting AI response:', error);
            this.hideTypingIndicator();
            this.addMessage('I apologize, but I\'m having trouble connecting right now. Here\'s what I can help you with based on your question:', 'ai');
            
            // Provide fallback response
            const fallbackResponse = this.getFallbackResponse(userMessage);
            this.addMessage(fallbackResponse, 'ai');
            
            this.updateStatus('Offline mode', 'warning');
        }

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    async getAIResponse(userMessage) {
        const systemPrompt = `You are KMRL AI Assistant, an intelligent helper for the KMRL Document Management System. 

Project Context: ${this.projectContext.purpose}

Key Features: ${this.projectContext.features.join(', ')}

User Role: ${this.currentUser.role} (${this.currentUser.name})

You should help users with:
1. Document upload and management procedures
2. System navigation and feature explanations  
3. Tender tracking and notification setup
4. Analytics and reporting guidance
5. General system usage questions

Provide helpful, concise, and actionable responses. Always be friendly and professional. If asked about the project purpose, provide a comprehensive explanation of KMRL's document management system goals and benefits.`;

        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
                'HTTP-Referer': 'https://kmrl-docs.local',
                'X-Title': 'KMRL Document Management System'
            },
            body: JSON.stringify({
                model: 'microsoft/wizardlm-2-8x22b',
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...this.chatHistory.slice(-10), // Include recent context
                    { role: 'user', content: userMessage }
                ],
                max_tokens: 500,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;
        
        // Add to chat history
        this.chatHistory.push(
            { role: 'user', content: userMessage },
            { role: 'assistant', content: aiResponse }
        );

        return aiResponse;
    }

    getFallbackResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();

        // Project purpose responses
        if (lowerMessage.includes('purpose') || lowerMessage.includes('about') || lowerMessage.includes('project')) {
            return `${this.projectContext.purpose}

This system helps KMRL streamline operations by providing centralized document management, automated tender tracking, and intelligent analytics to support decision-making processes.`;
        }

        // Upload help
        if (lowerMessage.includes('upload') || lowerMessage.includes('add document')) {
            return `To upload documents:
1. Click on "Upload Documents" in the sidebar
2. Drag and drop your files or click "Browse Files"
3. Fill in the document metadata (title, category, description)
4. Click "Upload" to submit

Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, images, and more.`;
        }

        // Search help
        if (lowerMessage.includes('search') || lowerMessage.includes('find')) {
            return `To search documents:
1. Go to "My Documents" section
2. Use the search bar to find by title, category, or content
3. Apply filters for category, status, or date range
4. Click "Search" to see results

You can also use advanced search operators and keywords for better results.`;
        }

        // Tender tracking
        if (lowerMessage.includes('tender') || lowerMessage.includes('tracking')) {
            return `The Tender Tracking system automatically monitors government and private tender portals:

• Real-time notifications for new tenders
• AI-powered tender categorization
• Email alerts for relevant opportunities
• Dashboard with tender analytics
• Integration with multiple portal sources

Access the Tender Dashboard to view and manage tracked tenders.`;
        }

        // Analytics help
        if (lowerMessage.includes('analytics') || lowerMessage.includes('report')) {
            return `The Analytics section provides:
• Document usage statistics
• User activity reports
• System performance metrics
• Tender tracking analytics
• Visual charts and graphs
• Export capabilities for reports

Navigate to Analytics to view detailed insights about your system usage.`;
        }

        // Default response
        return `I'm here to help you with the KMRL Document Management System! I can assist with:

• Document upload and management
• System navigation and features
• Tender tracking and notifications
• Analytics and reporting
• General system guidance

Please ask me specific questions about any of these topics, and I'll provide detailed assistance.`;
    }

    addMessage(content, sender) {
        const messagesContainer = document.getElementById('aiMessages');
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ${sender}-message`;

        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (sender === 'user') {
            messageDiv.innerHTML = `
                <div class="message-content">
                    <div class="message-text">${this.formatMessage(content)}</div>
                    <div class="message-time">${timestamp}</div>
                </div>
                <div class="message-avatar">
                    <i class="fas fa-user"></i>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    <div class="message-text">${this.formatMessage(content)}</div>
                    <div class="message-time">${timestamp}</div>
                </div>
            `;
        }

        messagesContainer.appendChild(messageDiv);

        // Add animation
        setTimeout(() => messageDiv.classList.add('show'), 100);
    }

    formatMessage(content) {
        // Basic markdown-like formatting
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/• /g, '• '); // Keep bullet points
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('aiMessages');
        if (!messagesContainer) return;

        const typingDiv = document.createElement('div');
        typingDiv.className = 'ai-message ai-message typing-indicator';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="typing-dots">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>
        `;

        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    showChatInterface() {
        const welcome = document.getElementById('aiWelcome');
        const chat = document.getElementById('aiChat');
        
        if (welcome && chat) {
            welcome.style.display = 'none';
            chat.style.display = 'flex';
            
            // Focus on input
            const input = document.getElementById('aiInput');
            if (input) input.focus();
        }
    }

    askQuestion(question) {
        this.sendMessage(question);
    }

    open() {
        const container = document.getElementById('aiAssistant');
        const floatingBtn = document.getElementById('aiFloatingButton');
        
        if (container && floatingBtn) {
            container.classList.add('show');
            floatingBtn.style.display = 'none';
            this.isOpen = true;
            
            // Focus on input if chat is visible
            const input = document.getElementById('aiInput');
            if (input && document.getElementById('aiChat').style.display !== 'none') {
                setTimeout(() => input.focus(), 300);
            }
        }
    }

    close() {
        const container = document.getElementById('aiAssistant');
        const floatingBtn = document.getElementById('aiFloatingButton');
        
        if (container && floatingBtn) {
            container.classList.remove('show');
            floatingBtn.style.display = 'flex';
            this.isOpen = false;
        }
    }

    minimize() {
        this.close();
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    updateStatus(message, type = 'info') {
        const statusText = document.querySelector('.status-text');
        const statusIndicator = document.querySelector('.status-indicator');
        
        if (statusText && statusIndicator) {
            statusText.textContent = message;
            statusIndicator.className = `status-indicator ${type}`;
            
            // Reset after 3 seconds
            setTimeout(() => {
                statusText.textContent = 'AI Assistant Ready';
                statusIndicator.className = 'status-indicator';
            }, 3000);
        }
    }

    saveChatHistory() {
        try {
            localStorage.setItem('kmrl_ai_chat_history', JSON.stringify(this.chatHistory.slice(-50))); // Keep last 50 messages
        } catch (error) {
            console.error('Error saving chat history:', error);
        }
    }

    loadChatHistory() {
        try {
            const history = localStorage.getItem('kmrl_ai_chat_history');
            if (history) {
                this.chatHistory = JSON.parse(history);
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
            this.chatHistory = [];
        }
    }

    addAIStyles() {
        const styles = `
        .ai-floating-button {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #2563eb, #3b82f6);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(37, 99, 235, 0.3);
            transition: all 0.3s ease;
            z-index: 1000;
            color: white;
            font-size: 24px;
        }

        .ai-floating-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 25px rgba(37, 99, 235, 0.4);
        }

        .ai-pulse {
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: rgba(37, 99, 235, 0.3);
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(1.5); opacity: 0; }
        }

        .ai-assistant-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 400px;
            height: 600px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            z-index: 1001;
            display: flex;
            flex-direction: column;
            opacity: 0;
            transform: translateY(20px) scale(0.9);
            transition: all 0.3s ease;
            border: 1px solid #e5e7eb;
        }

        @media (min-width: 769px) and (max-width: 1024px) {
            .ai-assistant-container {
                width: 360px;
                height: 550px;
            }
        }

        .ai-assistant-container.show {
            opacity: 1;
            transform: translateY(0) scale(1);
        }

        .ai-header {
            background: linear-gradient(135deg, #2563eb, #3b82f6);
            color: white;
            padding: 1rem;
            border-radius: 16px 16px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .ai-title {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 600;
        }

        .ai-controls {
            display: flex;
            gap: 0.5rem;
        }

        .ai-minimize, .ai-close {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .ai-minimize:hover, .ai-close:hover {
            background: rgba(255, 255, 255, 0.3);
        }

        .ai-welcome {
            flex: 1;
            padding: 1.5rem;
            overflow-y: auto;
        }

        .welcome-content {
            text-align: center;
        }

        .ai-welcome-icon {
            font-size: 3rem;
            color: #2563eb;
            margin-bottom: 1rem;
        }

        .ai-welcome h3 {
            margin: 0 0 1rem 0;
            color: #1f2937;
        }

        .ai-welcome p {
            color: #6b7280;
            margin-bottom: 1rem;
        }

        .ai-welcome ul {
            text-align: left;
            color: #6b7280;
            margin-bottom: 2rem;
        }

        .ai-welcome li {
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .quick-actions {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .quick-action-btn {
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            padding: 0.75rem;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            text-align: left;
        }

        .quick-action-btn:hover {
            background: #e5e7eb;
            border-color: #2563eb;
        }

        .ai-chat {
            flex: 1;
            display: flex;
            flex-direction: column;
        }

        .ai-messages {
            flex: 1;
            padding: 1rem;
            overflow-y: auto;
            max-height: 400px;
        }

        .ai-message {
            display: flex;
            margin-bottom: 1rem;
            opacity: 0;
            transform: translateY(10px);
            transition: all 0.3s ease;
        }

        .ai-message.show {
            opacity: 1;
            transform: translateY(0);
        }

        .user-message {
            justify-content: flex-end;
        }

        .user-message .message-content {
            background: #2563eb;
            color: white;
            border-radius: 16px 16px 4px 16px;
        }

        .ai-message .message-content {
            background: #f3f4f6;
            color: #1f2937;
            border-radius: 16px 16px 16px 4px;
            max-width: 80%;
        }

        .message-content {
            padding: 0.75rem 1rem;
        }

        .message-text {
            margin-bottom: 0.25rem;
            line-height: 1.4;
        }

        .message-time {
            font-size: 0.7rem;
            opacity: 0.7;
        }

        .message-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 0.5rem;
            font-size: 0.9rem;
        }

        .user-message .message-avatar {
            background: #1f2937;
            color: white;
        }

        .ai-message .message-avatar {
            background: #2563eb;
            color: white;
        }

        .typing-indicator .message-content {
            padding: 1rem;
        }

        .typing-dots {
            display: flex;
            gap: 0.25rem;
        }

        .dot {
            width: 8px;
            height: 8px;
            background: #6b7280;
            border-radius: 50%;
            animation: typing 1.4s infinite ease-in-out;
        }

        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes typing {
            0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
            30% { transform: translateY(-10px); opacity: 1; }
        }

        .ai-input-container {
            padding: 1rem;
            border-top: 1px solid #e5e7eb;
        }

        .ai-input-wrapper {
            display: flex;
            gap: 0.5rem;
            align-items: center;
        }

        #aiInput {
            flex: 1;
            padding: 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            outline: none;
            font-size: 0.9rem;
        }

        #aiInput:focus {
            border-color: #2563eb;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        #aiSend {
            background: #2563eb;
            color: white;
            border: none;
            padding: 0.75rem;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        #aiSend:hover {
            background: #1d4ed8;
        }

        .ai-status {
            padding: 0.5rem 1rem;
            background: #f9fafb;
            border-radius: 0 0 16px 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid #e5e7eb;
        }

        .status-text {
            font-size: 0.8rem;
            color: #6b7280;
        }

        .status-indicator {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #10b981;
        }

        .status-indicator.warning {
            background: #f59e0b;
        }

        .status-indicator.error {
            background: #ef4444;
        }

        @media (max-width: 768px) {
            .ai-assistant-container {
                width: 95vw;
                height: 85vh;
                bottom: 2.5vw;
                right: 2.5vw;
                max-height: calc(100vh - 40px);
            }

            .ai-floating-button {
                bottom: 15px;
                right: 15px;
                width: 50px;
                height: 50px;
                font-size: 20px;
            }

            .ai-header {
                padding: 0.75rem;
            }

            .ai-title {
                font-size: 0.9rem;
            }

            .ai-welcome {
                padding: 1rem;
            }

            .ai-welcome h3 {
                font-size: 1.1rem;
            }

            .ai-welcome p {
                font-size: 0.9rem;
            }

            .ai-messages {
                padding: 0.75rem;
                max-height: 300px;
            }

            .message-content {
                padding: 0.5rem 0.75rem;
                font-size: 0.9rem;
            }

            .message-avatar {
                width: 28px;
                height: 28px;
                font-size: 0.8rem;
            }

            .ai-input-container {
                padding: 0.75rem;
            }

            #aiInput {
                font-size: 0.9rem;
                padding: 0.6rem;
            }

            #aiSend {
                padding: 0.6rem;
            }

            .quick-action-btn {
                padding: 0.6rem;
                font-size: 0.85rem;
            }

            .ai-status {
                padding: 0.4rem 0.75rem;
            }

            .status-text {
                font-size: 0.75rem;
            }
        }

        @media (max-width: 480px) {
            .ai-assistant-container {
                width: 98vw;
                height: 90vh;
                bottom: 1vw;
                right: 1vw;
            }

            .ai-floating-button {
                width: 45px;
                height: 45px;
                font-size: 18px;
                bottom: 12px;
                right: 12px;
            }

            .ai-messages {
                max-height: 250px;
            }

            .message-content {
                max-width: 90%;
            }
        }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
}

// Initialize AI Assistant when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.aiAssistant = new KMRLAIAssistant();
});

// Global functions for easy access
window.openAIAssistant = () => {
    if (window.aiAssistant) window.aiAssistant.open();
};

window.closeAIAssistant = () => {
    if (window.aiAssistant) window.aiAssistant.close();
};
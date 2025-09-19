// AI Chat Functionality for KMRL Document Management System

class ChatManager {
    constructor() {
        this.initializeChatUI();
        this.setupEventListeners();
    }

    initializeChatUI() {
        // Create chat button if it doesn't exist
        if (!document.getElementById('chatBtn')) {
            const chatBtn = document.createElement('button');
            chatBtn.id = 'chatBtn';
            chatBtn.innerHTML = '<i class="fas fa-comments"></i>';
            chatBtn.title = 'AI Assistant';
            document.body.appendChild(chatBtn);
        }

        // Create chat window if it doesn't exist
        if (!document.getElementById('chatWindow')) {
            const chatWindow = document.createElement('div');
            chatWindow.id = 'chatWindow';
            chatWindow.style.display = 'none';

            chatWindow.innerHTML = `
                <div class="chat-header">
                    <h4>AI Assistant</h4>
                    <button id="closeChat" title="Close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div id="chatMessages"></div>
                <div class="chat-input-container">
                    <input type="text" id="chatInput" placeholder="Ask about documents..." />
                    <button id="sendBtn">Send</button>
                </div>
            `;

            document.body.appendChild(chatWindow);
        }
    }

    setupEventListeners() {
        const chatBtn = document.getElementById('chatBtn');
        const chatWindow = document.getElementById('chatWindow');
        const closeChat = document.getElementById('closeChat');
        const sendBtn = document.getElementById('sendBtn');
        const chatInput = document.getElementById('chatInput');

        // Toggle chat window
        chatBtn?.addEventListener('click', () => {
            chatWindow.style.display =
                chatWindow.style.display === 'none' ? 'flex' : 'none';
            if (chatWindow.style.display === 'flex') {
                document.getElementById('chatInput')?.focus();
            }
        });

        // Close chat window
        closeChat?.addEventListener('click', () => {
            chatWindow.style.display = 'none';
        });

        // Send message on button click
        sendBtn?.addEventListener('click', async () => {
            await this.handleSendMessage();
        });

        // Send message on Enter key
        chatInput?.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') {
                await this.handleSendMessage();
            }
        });
    }

    async handleSendMessage() {
        const chatInput = document.getElementById('chatInput');
        const chatMessages = document.getElementById('chatMessages');

        const userMessage = chatInput?.value.trim();
        if (!userMessage) return;

        // Display user message
        chatMessages.innerHTML += `<div class="message user-message"><span>${userMessage}</span></div>`;
        chatInput.value = '';

        // Show typing indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'message bot-message typing-indicator';
        typingIndicator.innerHTML = `
            <span>
                <i class="fas fa-circle"></i>
                <i class="fas fa-circle"></i>
                <i class="fas fa-circle"></i>
            </span>
        `;
        chatMessages.appendChild(typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            // Call AI API
            const aiResponse = await this.getAIResponse(userMessage);

            // Remove typing indicator
            typingIndicator.remove();

            // Display AI response
            chatMessages.innerHTML += `<div class="message bot-message"><span>${aiResponse}</span></div>`;
            chatMessages.scrollTop = chatMessages.scrollHeight;
        } catch (error) {
            // Remove typing indicator
            typingIndicator.remove();

            // Display error message
            chatMessages.innerHTML += `<div class="message bot-message error"><span>Sorry, I encountered an error. Please try again.</span></div>`;
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    async getAIResponse(message) {
        try {
            // Using the standard Gemini API endpoint instead of OpenAI compatibility layer
            const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyA-J5og-BemOJDe6AlGTN0k3PYvMQJ7qOQ', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: message
                        }]
                    }]
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API error: ${response.status} - ${JSON.stringify(errorData)}`);
            }

            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('Gemini API Error:', error);
            throw new Error(`Failed to get AI response: ${error.message}`);
        }
    }
}

// Initialize chat manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chatManager = new ChatManager();
});
# AI Assistant Architecture Documentation

## Overview
The KMRL AI Assistant has been refactored into a modular architecture separating the OpenAI API client from the user interface components. This separation provides better maintainability, reusability, and testing capabilities.

## Architecture Components

### 1. OpenAI Client (`js/openai-client.js`)
**Purpose**: Handles all communication with the OpenAI API

**Key Features**:
- API key management
- Request/response handling
- Error handling and retry logic
- Specialized methods for different AI tasks
- Connection testing
- Configuration management

**Main Methods**:
- `getChatCompletion(messages, options)` - Core chat completion method
- `getSingleResponse(userMessage, systemPrompt, options)` - Single message completion
- `getContinuationResponse(userMessage, chatHistory, systemPrompt, options)` - Conversation with history
- `analyzeDocument(documentContent, analysisType, options)` - Document analysis
- `analyzeTender(tenderData, analysisType, options)` - Tender analysis
- `testConnection()` - API connection testing
- `updateApiKey(newApiKey)` - Update API key
- `createSystemPrompt(context)` - Generate system prompts

**Usage Example**:
```javascript
const client = new OpenAIClient();
const result = await client.getSingleResponse("Hello", null, { max_tokens: 50 });
if (result.success) {
    console.log(result.content);
} else {
    console.error(result.error);
}
```

### 2. AI Assistant Interface (`js/ai-assistant-interface.js`)
**Purpose**: Manages the user interface and user interactions

**Key Features**:
- Chat interface management
- User input handling
- Message display and formatting
- UI state management
- Local storage for chat history
- Floating button and window controls
- Responsive design

**Main Methods**:
- `sendMessage(message)` - Send user message and get AI response
- `addMessage(content, sender)` - Add message to chat interface
- `open()`, `close()`, `toggle()` - Window management
- `analyzeDocument(documentContent, analysisType)` - Document analysis wrapper
- `analyzeTender(tenderData, analysisType)` - Tender analysis wrapper
- `testApiConnection()` - Test API connection
- `updateApiKey(newApiKey)` - Update API key

### 3. Legacy AI Assistant (`js/ai-assistant.js`)
**Status**: Legacy file - can be removed after migration
**Note**: This file contains the original monolithic implementation

## File Dependencies

### HTML Files Updated:
- `ai-demo.html`
- `dashboard.html` 
- `documents.html`
- `upload.html`

### Script Loading Order:
```html
<script src="js/openai-client.js"></script>
<script src="js/ai-assistant-interface.js"></script>
```

## Benefits of Separation

### 1. **Modularity**
- OpenAI API logic separated from UI logic
- Each component has a single responsibility
- Easier to test and maintain

### 2. **Reusability**
- OpenAI client can be used in other parts of the application
- API client can be used for backend processing
- Interface can be modified without affecting API logic

### 3. **Configuration Management**
- Centralized API key management
- Easy to switch between different AI models
- Better error handling and debugging

### 4. **Testing**
- API client can be tested independently
- UI components can be tested with mock API responses
- Better separation of concerns

## API Key Management

### Current Implementation:
- API Key stored in `OpenAIClient` constructor
- Also available in `.env` file for backend services
- Can be updated using `updateApiKey()` method

### Security Considerations:
- Frontend API key is visible in client-side code
- Consider implementing backend proxy for production
- Implement rate limiting and usage monitoring

## Usage Examples

### Basic Chat:
```javascript
// Initialize (happens automatically on page load)
const assistant = new KMRLAIAssistant();

// Send a message programmatically
assistant.sendMessage("How do I upload documents?");
```

### Document Analysis:
```javascript
const documentContent = "Your document text here...";
const summary = await assistant.analyzeDocument(documentContent, 'summary');
const keywords = await assistant.analyzeDocument(documentContent, 'keywords');
```

### Tender Analysis:
```javascript
const tenderData = {
    title: "Metro Extension Project",
    organization: "KMRL",
    description: "Extension of metro line...",
    value: "Rs. 500 Crores"
};

const summary = await assistant.analyzeTender(tenderData, 'summary');
const priority = await assistant.analyzeTender(tenderData, 'priority');
```

### API Connection Testing:
```javascript
const isConnected = await assistant.testApiConnection();
console.log('API Status:', isConnected);
```

## Migration from Legacy

### Steps to Complete Migration:
1. ✅ Created separated components
2. ✅ Updated HTML files to use new components  
3. ✅ Verified functionality
4. 🔲 Remove legacy `ai-assistant.js` file (optional)
5. 🔲 Update any direct references to legacy methods

### Backward Compatibility:
- All existing functionality preserved
- Same API for user interactions
- Global functions still available (`openAIAssistant()`, `closeAIAssistant()`)

## Configuration Options

### OpenAI Client Configuration:
```javascript
const client = new OpenAIClient({
    apiKey: 'your-api-key',
    apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
    model: 'microsoft/wizardlm-2-8x22b'
});
```

### Default Parameters:
- `max_tokens`: 500
- `temperature`: 0.7
- `model`: microsoft/wizardlm-2-8x22b

## Error Handling

### API Errors:
- Network connectivity issues
- API key authentication errors
- Rate limiting
- Model availability

### Fallback Responses:
- Local fallback responses when API is unavailable
- Cached responses for common questions
- Offline mode with limited functionality

## Future Enhancements

### Planned Features:
1. **Backend Integration**:
   - Move API calls to backend for security
   - Implement usage tracking
   - Add rate limiting

2. **Enhanced Analysis**:
   - Batch document processing
   - Advanced tender categorization
   - Custom model fine-tuning

3. **Performance Optimization**:
   - Response caching
   - Streaming responses
   - Connection pooling

4. **Security Improvements**:
   - API key encryption
   - User authentication integration
   - Audit logging

## Troubleshooting

### Common Issues:
1. **API Key Not Working**: Verify the key is correct and has proper permissions
2. **Connection Timeout**: Check network connectivity and API endpoint
3. **UI Not Loading**: Ensure script files are loaded in correct order
4. **Chat History Lost**: Check localStorage permissions and browser settings

### Debug Mode:
Enable console logging to see detailed API communication:
```javascript
// Enable debug mode (add to console)
window.aiAssistant.openaiClient.debug = true;
```
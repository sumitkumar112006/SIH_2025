# 🚀 OpenRouter AI Integration for KMRL Document System

## Overview

This integration adds powerful AI capabilities to your KMRL Document Management System using OpenRouter's API, which provides access to multiple state-of-the-art language models including GPT-4, Claude, and other advanced models.

## 🔥 New Features

### Enhanced Document Analysis
- **Smart Summarization**: Executive, technical, and bullet-point summaries
- **Advanced Classification**: Intelligent document categorization with confidence scores
- **Entity Extraction**: Automatic identification of dates, amounts, names, locations, etc.
- **Quality Assessment**: Comprehensive document quality analysis with improvement suggestions

### Language Services
- **Professional Translation**: Context-aware English ↔ Malayalam translation
- **Language Detection**: Automatic source language identification
- **Technical Term Preservation**: Maintains accuracy for government and technical documents

### Intelligent Q&A
- **Document Questioning**: Ask specific questions about document content
- **Contextual Answers**: Get accurate responses based on document context
- **Multi-document Analysis**: Compare and analyze multiple documents

### Compliance & Risk Analysis
- **Regulatory Compliance**: Identify compliance requirements and gaps
- **Risk Assessment**: Automatic risk level evaluation
- **Safety Standards**: Check against Indian government and railway standards

### Task Management
- **Action Item Extraction**: Automatically identify tasks and deadlines
- **Priority Assessment**: Classify urgency levels
- **Assignment Tracking**: Extract responsibility assignments

## 🛠️ Setup Instructions

### 1. API Key Configuration

Your OpenRouter API key is already configured in the system:
```javascript
// Located in: services/ai/OpenRouterAIService.js
this.apiKey = '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';
```

### 2. Install Dependencies

The system uses the existing `axios` dependency for API calls. No additional packages needed.

### 3. Start the Server

```bash
# Navigate to your project directory
cd "c:\Users\saroj\OneDrive\Desktop\Sih project\SIH_2025"

# Install dependencies (if not already done)
npm install

# Start the server
npm start
```

### 4. Access the Enhanced AI Assistant

1. **Open the demo page**: `http://localhost:3000/enhanced-ai-demo.html`
2. **Click the robot icon** in the bottom-right corner
3. **Select a document** from the dropdown
4. **Choose a feature** or ask questions naturally

## 📚 API Endpoints

### Enhanced AI Routes (with OpenRouter)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ai/enhanced/summarize` | POST | Advanced document summarization |
| `/api/ai/enhanced/detect-translate` | POST | Professional translation |
| `/api/ai/enhanced/classify` | POST | Smart document classification |
| `/api/ai/enhanced/extract-entities` | POST | Advanced entity extraction |
| `/api/ai/enhanced/question-answer` | POST | Document Q&A |
| `/api/ai/enhanced/compliance` | POST | Compliance analysis |
| `/api/ai/enhanced/quality-assessment` | POST | Document quality check |
| `/api/ai/enhanced/action-points` | POST | Action item extraction |
| `/api/ai/enhanced/process-batch` | POST | Batch document processing |
| `/api/ai/enhanced/health` | GET | Service health check |
| `/api/ai/enhanced/models` | GET | Available AI models |
| `/api/ai/enhanced/switch-model` | POST | Switch AI model |

### Example API Usage

#### Document Summarization
```javascript
const response = await fetch('/api/ai/enhanced/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        text: "Your document content here",
        summaryType: "executive" // or "technical", "bullet", "standard"
    })
});

const data = await response.json();
console.log(data.summary);
```

#### Document Q&A
```javascript
const response = await fetch('/api/ai/enhanced/question-answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        question: "What is the project deadline?",
        documentText: "Your document content here",
        documentId: "optional-doc-id"
    })
});

const data = await response.json();
console.log(data.answer);
```

#### Translation
```javascript
const response = await fetch('/api/ai/enhanced/detect-translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        text: "Text to translate",
        targetLanguage: "Malayalam" // optional
    })
});

const data = await response.json();
console.log(data.translatedText);
```

## 🎯 Available AI Models

The system supports multiple models through OpenRouter:

### Free Models
- `openai/gpt-oss-20b:free` - Free OpenAI-compatible model
- `meta-llama/llama-3.2-3b-instruct:free` - Free Llama model

### Premium Models
- `openai/gpt-3.5-turbo` - Fast and cost-effective (default)
- `openai/gpt-4o` - Most powerful OpenAI model
- `anthropic/claude-3-haiku` - Good balance of speed and capability
- `anthropic/claude-3-sonnet` - Advanced reasoning
- `anthropic/claude-3-opus` - Most capable Claude model

### Switch Models
```javascript
// Switch to a different model
const response = await fetch('/api/ai/enhanced/switch-model', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        modelId: 'openai/gpt-4o'
    })
});
```

## 🔧 Configuration Options

### OpenRouterAIService Configuration

Located in `services/ai/OpenRouterAIService.js`:

```javascript
constructor() {
    this.apiKey = 'your-api-key';
    this.baseUrl = 'https://openrouter.ai/api/v1';
    this.siteUrl = 'https://kmrl-document-system.com';
    this.siteTitle = 'KMRL Document Management System';
    this.defaultModel = 'openai/gpt-3.5-turbo';
}
```

### Fallback System

The system includes automatic fallback to the original AI service if OpenRouter is unavailable:

```javascript
// Toggle between services
const response = await fetch('/api/ai/enhanced/toggle-service', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        useOpenRouter: false // Switch to fallback
    })
});
```

## 🎨 Frontend Integration

### Enhanced AI Assistant

The new frontend component (`js/enhanced-ai-assistant.js`) provides:

- **Modern UI**: Beautiful, responsive interface
- **Feature Buttons**: Quick access to AI capabilities
- **Document Selection**: Easy document picker
- **Real-time Status**: Service health monitoring
- **Model Selection**: Switch between available models
- **Conversation History**: Persistent chat history

### Integration with Existing Pages

Add to any HTML page:

```html
<!-- Include the enhanced AI assistant -->
<script src="js/enhanced-ai-assistant.js"></script>

<!-- Add the toggle button -->
<button id="enhancedAIToggle" class="enhanced-ai-toggle">
    <i class="fas fa-robot"></i>
</button>

<!-- Add the AI panel (automatically created by script) -->
```

## 🚀 Usage Examples

### 1. Document Analysis Workflow

1. Upload a document to your system
2. Open the Enhanced AI Assistant
3. Select the document from the dropdown
4. Click "Smart Summary" for an executive summary
5. Click "Compliance" to check regulatory requirements
6. Ask specific questions like "What are the key deadlines?"

### 2. Translation Workflow

1. Select a document with English or Malayalam content
2. Click the "Translate" button
3. Get professional translation with context preservation
4. Technical terms are maintained appropriately

### 3. Batch Processing

```javascript
// Process multiple documents at once
const response = await fetch('/api/ai/enhanced/process-batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        documentIds: ['doc1', 'doc2', 'doc3'],
        operations: ['summarize', 'classify', 'extract_entities']
    })
});

const results = await response.json();
console.log(results.results);
```

## 🔍 Monitoring & Health Checks

### Health Check Endpoint

```javascript
const response = await fetch('/api/ai/enhanced/health');
const data = await response.json();
console.log(data.healthStatus);
```

### Service Status Indicators

The frontend shows real-time service status:
- 🟢 **OpenRouter Active**: Full AI capabilities available
- 🟡 **Fallback Mode**: Basic AI features using local service

## 💡 Best Practices

### 1. Model Selection
- Use `gpt-3.5-turbo` for most tasks (fast, cost-effective)
- Switch to `gpt-4o` for complex analysis or critical documents
- Use free models for testing and development

### 2. Document Processing
- Process documents in batches for efficiency
- Use appropriate summary types (executive for management, technical for implementation)
- Leverage Q&A for specific information extraction

### 3. Error Handling
- The system automatically falls back to the original AI service
- Monitor health status for service availability
- Implement retry logic for critical operations

## 🛡️ Security & Compliance

### Data Privacy
- All processing happens through secure HTTPS connections
- Your API key is stored securely on your server
- No document content is permanently stored by OpenRouter

### Government Compliance
- Translation maintains formal tone for official documents
- Compliance analysis follows Indian government standards
- Entity extraction recognizes Indian legal and regulatory formats

## 📈 Performance Optimization

### Rate Limiting
- Built-in delays between batch processing requests
- Configurable timeout settings
- Automatic retry with exponential backoff

### Caching
- Conversation history cached locally
- Document analysis results can be stored
- Model switching persisted in user preferences

## 🆘 Troubleshooting

### Common Issues

1. **"AI Service Error"**
   - Check your internet connection
   - Verify API key is valid
   - Check OpenRouter service status

2. **"Fallback Mode Active"**
   - OpenRouter service temporarily unavailable
   - System automatically using local AI service
   - Full functionality restored when service recovers

3. **Translation Not Working**
   - Ensure document contains sufficient text
   - Check language detection accuracy
   - Try with different document sections

### Debug Mode

Enable debug logging in browser console:
```javascript
localStorage.setItem('ai_debug', 'true');
```

## 🚀 Next Steps

1. **Test the Demo**: Visit `enhanced-ai-demo.html` to explore features
2. **Integrate with Your Pages**: Add the enhanced AI assistant to existing pages
3. **Configure Models**: Choose appropriate models for your use cases
4. **Monitor Usage**: Track API usage and costs through OpenRouter dashboard
5. **Customize Features**: Modify the AI prompts for your specific needs

## 📞 Support

For technical support or feature requests:
- Check the health endpoint for service status
- Review browser console for error messages
- Test with fallback mode if issues persist

---

**Enjoy the enhanced AI capabilities for your KMRL Document Management System!** 🎉
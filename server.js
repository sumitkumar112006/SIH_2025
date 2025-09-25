const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const Tender = require('./models/Tender');
const Notification = require('./models/Notification');
const Portal = require('./models/Portal');
const User = require('./models/User');
const PortalMonitor = require('./services/monitor');
const AIController = require('./services/ai/AIController');
const EnhancedAIController = require('./services/ai/EnhancedAIController');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Export io for use in other modules
module.exports.io = io;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kmrl_tender_tracker', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Email transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Initialize portal monitor
const portalMonitor = new PortalMonitor();

// Initialize AI controllers
const aiController = new AIController();
const enhancedAIController = new EnhancedAIController();

// API Routes
app.get('/api/tenders', async (req, res) => {
    try {
        const tenders = await Tender.find();
        res.json(tenders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/tenders', async (req, res) => {
    try {
        const tender = new Tender(req.body);
        await tender.save();

        // Emit real-time notification
        io.emit('new-tender', tender);

        // Send email notification if enabled
        if (req.body.notifyEmail) {
            await sendEmailNotification(tender);
        }

        res.status(201).json(tender);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/notifications', async (req, res) => {
    try {
        const notifications = await Notification.find().sort({ created: -1 }).limit(50);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/notifications', async (req, res) => {
    try {
        const notification = new Notification(req.body);
        await notification.save();

        // Emit real-time notification
        io.emit('new-notification', notification);

        res.status(201).json(notification);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/portals', async (req, res) => {
    try {
        const portals = await Portal.find();
        res.json(portals);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/portals/:id', async (req, res) => {
    try {
        const portal = await Portal.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(portal);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/monitoring/start', async (req, res) => {
    try {
        await portalMonitor.startMonitoring();
        res.json({ message: 'Monitoring started' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/monitoring/stop', async (req, res) => {
    try {
        portalMonitor.stopMonitoring();
        res.json({ message: 'Monitoring stopped' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// AI Service Routes
// 🔍 Document Understanding & Processing
app.post('/api/ai/extract-text', aiController.extractText.bind(aiController));
app.post('/api/ai/detect-translate', aiController.detectAndTranslate.bind(aiController));
app.post('/api/ai/classify-document', aiController.classifyDocument.bind(aiController));
app.post('/api/ai/extract-entities', aiController.extractEntities.bind(aiController));
app.post('/api/ai/compare-versions', aiController.compareVersions.bind(aiController));

// 📑 Summarization & Knowledge Extraction
app.post('/api/ai/summarize', aiController.summarizeDocument.bind(aiController));
app.post('/api/ai/extract-action-points', aiController.extractActionPoints.bind(aiController));
app.post('/api/ai/highlight-compliance', aiController.highlightCompliance.bind(aiController));
app.post('/api/ai/extract-key-value', aiController.extractKeyValuePairs.bind(aiController));

// 🔎 Search & Retrieval
app.post('/api/ai/semantic-search', aiController.semanticSearch.bind(aiController));
app.post('/api/ai/multilingual-search', aiController.multilingualSearch.bind(aiController));
app.post('/api/ai/find-related', aiController.findRelatedDocuments.bind(aiController));
app.post('/api/ai/visual-search', aiController.visualSearch.bind(aiController));

// ⚡ Personalization & Notifications
app.post('/api/ai/recommendations', aiController.getRecommendations.bind(aiController));
app.get('/api/ai/priority-alerts', aiController.getPriorityAlerts.bind(aiController));
app.post('/api/ai/digest', aiController.getDigest.bind(aiController));

// 🛡️ Trust, Security & Compliance
app.post('/api/ai/traceability', aiController.getTraceabilityInfo.bind(aiController));
app.post('/api/ai/access-control', aiController.checkAccessControl.bind(aiController));
app.get('/api/ai/anomalies', aiController.detectAnomalies.bind(aiController));

// 📊 Analytics & Insights
app.get('/api/ai/trends', aiController.analyzeTrends.bind(aiController));
app.get('/api/ai/knowledge-base', aiController.buildKnowledgeBase.bind(aiController));
app.get('/api/ai/usage-insights', aiController.getUsageInsights.bind(aiController));

// Batch Processing
app.post('/api/ai/process-batch', aiController.processDocumentBatch.bind(aiController));

// 🚀 Enhanced AI Routes with OpenRouter Integration
// Enhanced Document Understanding
app.post('/api/ai/enhanced/extract-analyze', enhancedAIController.extractAndAnalyzeDocument.bind(enhancedAIController));
app.post('/api/ai/enhanced/detect-translate', enhancedAIController.detectAndTranslate.bind(enhancedAIController));
app.post('/api/ai/enhanced/classify', enhancedAIController.classifyDocument.bind(enhancedAIController));
app.post('/api/ai/enhanced/extract-entities', enhancedAIController.extractEntities.bind(enhancedAIController));

// Enhanced Summarization & Analysis
app.post('/api/ai/enhanced/summarize', enhancedAIController.summarizeDocument.bind(enhancedAIController));
app.post('/api/ai/enhanced/action-points', enhancedAIController.extractActionPoints.bind(enhancedAIController));
app.post('/api/ai/enhanced/compliance', enhancedAIController.analyzeCompliance.bind(enhancedAIController));
app.post('/api/ai/enhanced/quality-assessment', enhancedAIController.assessDocumentQuality.bind(enhancedAIController));

// Enhanced Q&A and Search
app.post('/api/ai/enhanced/question-answer', enhancedAIController.answerDocumentQuestion.bind(enhancedAIController));
app.post('/api/ai/enhanced/search-query', enhancedAIController.generateSearchQuery.bind(enhancedAIController));

// Enhanced Batch Processing
app.post('/api/ai/enhanced/process-batch', enhancedAIController.processDocumentBatch.bind(enhancedAIController));

// System Management
app.get('/api/ai/enhanced/models', enhancedAIController.getAvailableModels.bind(enhancedAIController));
app.post('/api/ai/enhanced/switch-model', enhancedAIController.switchModel.bind(enhancedAIController));
app.post('/api/ai/enhanced/reset-openai', enhancedAIController.resetToOpenAI.bind(enhancedAIController));
app.post('/api/ai/enhanced/toggle-service', enhancedAIController.toggleAIService.bind(enhancedAIController));
app.get('/api/ai/enhanced/health', enhancedAIController.healthCheck.bind(enhancedAIController));

// Backward compatibility routes
app.post('/api/ai/enhanced/compare-versions', enhancedAIController.compareVersions.bind(enhancedAIController));
app.post('/api/ai/enhanced/highlight-compliance', enhancedAIController.highlightCompliance.bind(enhancedAIController));
app.post('/api/ai/enhanced/extract-key-value', enhancedAIController.extractKeyValuePairs.bind(enhancedAIController));

// WebSocket connection
io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Email notification function
async function sendEmailNotification(tender) {
    try {
        const users = await User.find({ 'preferences.emailNotifications': true });

        for (const user of users) {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: `New Tender: ${tender.title}`,
                text: `A new tender has been found: ${tender.title}

Organization: ${tender.organization}
Value: ${tender.value}
Deadline: ${tender.submissionDeadline}

View details: ${tender.sourceUrl}`
            });
        }
    } catch (error) {
        console.error('Error sending email notification:', error);
    }
}

// Initialize default portals
async function initializePortals() {
    const defaultPortals = [
        {
            id: 'etenders-gov',
            name: 'Government e-Tenders Portal',
            url: 'https://etenders.gov.in',
            type: 'government',
            active: true,
            searchEndpoint: '/api/search',
            lastScanned: null,
            totalTenders: 0,
            newTenders: 0
        },
        {
            id: 'gem-portal',
            name: 'Government e-Marketplace (GeM)',
            url: 'https://gem.gov.in',
            type: 'government',
            active: true,
            searchEndpoint: '/api/tenders',
            lastScanned: null,
            totalTenders: 0,
            newTenders: 0
        },
        {
            id: 'kerala-eproc',
            name: 'Kerala e-Procurement',
            url: 'https://eproc.kerala.gov.in',
            type: 'government',
            active: true,
            searchEndpoint: '/tender/search',
            lastScanned: null,
            totalTenders: 0,
            newTenders: 0
        },
        {
            id: 'tenderwizard',
            name: 'TenderWizard',
            url: 'https://tenderwizard.com',
            type: 'private',
            active: true,
            searchEndpoint: '/api/search-tenders',
            lastScanned: null,
            totalTenders: 0,
            newTenders: 0
        },
        {
            id: 'biddingowl',
            name: 'BiddingOwl',
            url: 'https://biddingowl.com',
            type: 'private',
            active: true,
            searchEndpoint: '/search',
            lastScanned: null,
            totalTenders: 0,
            newTenders: 0
        },
        {
            id: 'indian-railways',
            name: 'Indian Railways Tenders',
            url: 'https://indianrailways.gov.in',
            type: 'government',
            active: true,
            searchEndpoint: '/tender-search',
            lastScanned: null,
            totalTenders: 0,
            newTenders: 0
        }
    ];

    for (const portalData of defaultPortals) {
        const existingPortal = await Portal.findOne({ id: portalData.id });
        if (!existingPortal) {
            const portal = new Portal(portalData);
            await portal.save();
        }
    }
}

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await initializePortals();

    // Start monitoring automatically
    await portalMonitor.startMonitoring();
});
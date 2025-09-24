// KMRL Document Management System - Dashboard JavaScript

class DashboardManager {
    constructor() {
        this.init();
    }

    init() {
        // Initialize dynamic sample data
        this.initializeDynamicSampleData();
        this.loadDashboardData();
        this.setupEventListeners();
        this.startAutoRefresh();
    }

    initializeDynamicSampleData() {
        // Check if we need to generate new sample data (based on timestamp)
        const lastDataGen = localStorage.getItem('kmrl_last_data_gen');
        const now = new Date().getTime();
        const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

        // Generate new data if it's the first time or if an hour has passed
        if (!lastDataGen || (now - parseInt(lastDataGen)) > oneHour) {
            this.generateDynamicSampleData();
            localStorage.setItem('kmrl_last_data_gen', now.toString());
        }
    }

    generateDynamicSampleData() {
        // Generate realistic document data that changes over time
        const documentCount = Math.floor(Math.random() * 50) + 100; // Between 100-150 documents
        const sampleDocuments = [];

        // Document categories
        const categories = ['financial', 'hr', 'projects', 'it', 'marketing', 'legal', 'operations'];
        const statuses = ['approved', 'pending', 'rejected'];
        const users = ['Admin User', 'Manager User', 'Staff User', 'Director User', 'Supervisor User'];

        // Generate documents with realistic timestamps
        for (let i = 0; i < documentCount; i++) {
            // Random category
            const category = categories[Math.floor(Math.random() * categories.length)];

            // Random status with weighted probability (more approved, some pending, few rejected)
            let status;
            const statusRand = Math.random();
            if (statusRand < 0.7) status = 'approved';
            else if (statusRand < 0.9) status = 'pending';
            else status = 'rejected';

            // Random user
            const user = users[Math.floor(Math.random() * users.length)];

            // Random file size (100KB to 10MB)
            const fileSize = Math.floor(Math.random() * 10000000) + 100000;

            // Random date within the last 30 days
            const daysAgo = Math.floor(Math.random() * 30);
            const uploadDate = new Date();
            uploadDate.setDate(uploadDate.getDate() - daysAgo);
            uploadDate.setHours(Math.floor(Math.random() * 24));
            uploadDate.setMinutes(Math.floor(Math.random() * 60));

            // Random views and downloads
            const views = Math.floor(Math.random() * 100);
            const downloads = Math.floor(Math.random() * views * 0.7); // Downloads should be less than views

            sampleDocuments.push({
                id: `doc_${i + 1}`,
                title: this.generateDocumentTitle(category),
                category: category,
                files: [{
                    name: `document_${i + 1}.${this.getFileExtension(category)}`,
                    size: fileSize,
                    type: this.getFileType(category)
                }],
                uploadedAt: uploadDate.toISOString(),
                uploadedBy: user,
                status: status,
                downloads: downloads,
                views: views
            });
        }

        localStorage.setItem('kmrl_documents', JSON.stringify(sampleDocuments));

        // Generate sample users
        const sampleUsers = [
            {
                id: 'user_1',
                name: 'Admin User',
                email: 'admin@kmrl.com',
                role: 'admin',
                department: 'Administration'
            },
            {
                id: 'user_2',
                name: 'Manager User',
                email: 'manager@kmrl.com',
                role: 'manager',
                department: 'Operations'
            },
            {
                id: 'user_3',
                name: 'Staff User',
                email: 'staff@kmrl.com',
                role: 'staff',
                department: 'Operations'
            },
            {
                id: 'user_4',
                name: 'Director User',
                email: 'director@kmrl.com',
                role: 'manager',
                department: 'Finance'
            },
            {
                id: 'user_5',
                name: 'Supervisor User',
                email: 'supervisor@kmrl.com',
                role: 'staff',
                department: 'HR'
            }
        ];

        localStorage.setItem('kmrl_users', JSON.stringify(sampleUsers));

        // Set a default user for testing
        const defaultUser = sampleUsers[2]; // Staff User
        localStorage.setItem('kmrl_user', JSON.stringify(defaultUser));
    }

    generateDocumentTitle(category) {
        const titles = {
            'financial': ['Q1 Financial Report', 'Budget Analysis', 'Expense Report', 'Revenue Forecast', 'Investment Summary'],
            'hr': ['Employee Handbook', 'Policy Update', 'Training Manual', 'Performance Review', 'Recruitment Plan'],
            'projects': ['Project Status Update', 'Milestone Report', 'Risk Assessment', 'Timeline Adjustment', 'Resource Allocation'],
            'it': ['Security Policy', 'System Upgrade Plan', 'Network Diagram', 'Backup Procedure', 'Access Control'],
            'marketing': ['Campaign Strategy', 'Market Analysis', 'Customer Survey', 'Brand Guidelines', 'Promotion Plan'],
            'legal': ['Contract Review', 'Compliance Report', 'Legal Opinion', 'Regulatory Update', 'Case Summary'],
            'operations': ['Process Manual', 'SOP Update', 'Quality Check', 'Maintenance Schedule', 'Inventory Report']
        };

        const categoryTitles = titles[category] || ['General Document'];
        return categoryTitles[Math.floor(Math.random() * categoryTitles.length)] + ' ' + new Date().getFullYear();
    }

    getFileExtension(category) {
        const extensions = {
            'financial': 'xlsx',
            'hr': 'docx',
            'projects': 'pptx',
            'it': 'pdf',
            'marketing': 'pptx',
            'legal': 'pdf',
            'operations': 'docx'
        };
        return extensions[category] || 'pdf';
    }

    getFileType(category) {
        const types = {
            'financial': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'hr': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'projects': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'it': 'application/pdf',
            'marketing': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'legal': 'application/pdf',
            'operations': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        };
        return types[category] || 'application/pdf';
    }

    async loadDashboardData() {
        this.showLoadingState();

        try {
            // Simulate API call delay
            await this.delay(800 + Math.random() * 400); // Random delay between 800-1200ms

            // Get data from localStorage
            const documents = JSON.parse(localStorage.getItem('kmrl_documents') || '[]');
            const users = JSON.parse(localStorage.getItem('kmrl_users') || '[]');

            // Calculate statistics with some randomness to make values change
            const stats = {
                totalDocuments: documents.length,
                recentUploads: this.getRecentUploads(documents),
                pendingApprovals: documents.filter(doc => doc.status === 'pending').length,
                storageUsed: this.calculateStorageUsed(documents)
            };

            // Add slight variations to make the numbers look more dynamic
            stats.totalDocuments = Math.max(0, stats.totalDocuments + Math.floor(Math.random() * 10) - 5);
            stats.recentUploads = Math.max(0, stats.recentUploads + Math.floor(Math.random() * 5) - 2);
            stats.pendingApprovals = Math.max(0, stats.pendingApprovals + Math.floor(Math.random() * 3) - 1);

            // Update UI
            this.updateStats(stats);
            this.updateRecentActivity(documents);
            this.hideLoadingState();

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showError('Failed to load dashboard data');
            this.hideLoadingState();
        }
    }

    getRecentUploads(documents) {
        // Get documents uploaded in the last 7 days
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        return documents.filter(doc => {
            const uploadDate = new Date(doc.uploadedAt || doc.createdAt || new Date());
            return uploadDate >= oneWeekAgo;
        }).length;
    }

    calculateStorageUsed(documents) {
        // Calculate total storage used in GB with some variation
        let totalSize = 0;
        documents.forEach(doc => {
            // Handle different possible file size properties
            const fileSize = doc.fileSize || (doc.files && doc.files[0] && doc.files[0].size) || 0;
            totalSize += fileSize;
        });

        // Convert bytes to GB and add some random variation to make it look dynamic
        const baseGB = totalSize / (1024 * 1024 * 1024);
        const variation = (Math.random() * 0.5) - 0.25; // -0.25 to +0.25 variation
        const gbUsed = Math.max(0, baseGB + variation);

        return gbUsed.toFixed(1);
    }

    updateStats(stats) {
        // Update total documents
        const totalDocsElement = document.getElementById('totalDocs');
        if (totalDocsElement) {
            this.animateNumber(totalDocsElement, stats.totalDocuments);
        }

        // Update recent uploads
        const recentUploadsElement = document.getElementById('recentUploads');
        if (recentUploadsElement) {
            this.animateNumber(recentUploadsElement, stats.recentUploads);
        }

        // Update pending approvals
        const pendingApprovalsElement = document.getElementById('pendingApprovals');
        if (pendingApprovalsElement) {
            this.animateNumber(pendingApprovalsElement, stats.pendingApprovals);
        }

        // Update storage used
        const storageUsedElement = document.getElementById('storageUsed');
        if (storageUsedElement) {
            storageUsedElement.textContent = `${stats.storageUsed} GB`;
        }
    }

    updateRecentActivity(documents) {
        const recentActivityContainer = document.getElementById('recentActivity');
        if (!recentActivityContainer) return;

        // Sort by upload date (newest first) and get top 5
        const recentDocs = [...documents]
            .sort((a, b) => new Date(b.uploadedAt || b.createdAt || new Date()) - new Date(a.uploadedAt || a.createdAt || new Date()))
            .slice(0, 5);

        if (recentDocs.length === 0) {
            recentActivityContainer.innerHTML = `
                <div class="no-activity">
                    <i class="fas fa-history"></i>
                    <p>No recent activity</p>
                </div>
            `;
            return;
        }

        const activityHTML = recentDocs.map(doc => `
            <div class="activity-item">
                <div class="activity-icon" style="background-color: #2563eb;">
                    <i class="fas fa-file-upload"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${doc.title || doc.name || 'Untitled Document'} uploaded</div>
                    <div class="activity-time">${new Date(doc.uploadedAt || doc.createdAt || new Date()).toLocaleString()}</div>
                </div>
            </div>
        `).join('');

        recentActivityContainer.innerHTML = activityHTML;
    }

    animateNumber(element, targetValue) {
        const startValue = 0;
        const duration = 1500 + Math.random() * 500; // Random duration between 1500-2000ms
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function for smooth animation
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOut);

            element.textContent = currentValue;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    showLoadingState() {
        // Add loading animation to widgets
        document.querySelectorAll('.widget-value').forEach(el => {
            el.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        });
    }

    hideLoadingState() {
        // Remove loading state - values will be updated by animation
    }

    showError(message) {
        if (window.showNotification) {
            window.showNotification(message, 'error');
        } else {
            // Fallback for when notification system isn't available
            alert(message);
        }
    }

    handleWidgetClick(widgetType) {
        // Handle widget clicks for navigation
        const navigation = {
            'documents': 'documents.html',
            'uploads': 'upload.html',
            'approvals': 'documents.html?filter=pending',
            'storage': 'analytics.html'
        };

        if (navigation[widgetType]) {
            window.location.href = navigation[widgetType];
        }
    }

    startAutoRefresh() {
        // Auto-refresh dashboard data every 5 minutes (300,000 ms)
        setInterval(() => {
            this.loadDashboardData();
        }, 300000);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    updateDocumentCount() {
        try {
            const documents = JSON.parse(localStorage.getItem('kmrl_documents') || '[]');
            const totalDocsElement = document.getElementById('totalDocs');

            if (totalDocsElement) {
                // Add a small random variation to make it look more dynamic
                const baseCount = documents.length;
                const variation = Math.floor(Math.random() * 5) - 2; // -2 to +2 variation
                const displayCount = Math.max(0, baseCount + variation);

                this.animateNumber(totalDocsElement, displayCount);
            }
        } catch (error) {
            console.error('Error updating document count:', error);
        }
    }
}

// Refresh dashboard function
function refreshDashboard() {
    if (window.dashboardManager) {
        // Show loading state
        window.dashboardManager.showLoadingState();

        // Regenerate sample data for more dynamic changes
        window.dashboardManager.generateDynamicSampleData();

        // Reload dashboard data
        window.dashboardManager.loadDashboardData();

        // Show refresh notification
        if (window.showNotification) {
            window.showNotification('Dashboard refreshed with new data!', 'success');
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardManager = new DashboardManager();
});
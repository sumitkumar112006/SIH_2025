// KMRL Document Management System - Dashboard JavaScript

class DashboardManager {
    constructor() {
        this.currentUser = window.KMRL.getCurrentUser();
        this.widgets = [];
        this.chartInstances = {};
        this.init();
    }

    async init() {
        if (!this.currentUser) {
            window.KMRL.redirectToLogin();
            return;
        }

        this.updateWelcomeMessage();
        await this.loadDashboardData();
        this.renderWidgets();
        this.setupEventListeners();
        this.initializeChatbot();
        this.startAutoRefresh();
    }

    updateWelcomeMessage() {
        const welcomeMessage = document.getElementById('welcomeMessage');
        const welcomeSubtext = document.getElementById('welcomeSubtext');

        if (welcomeMessage) {
            const hour = new Date().getHours();
            let greeting = 'Good evening';
            if (hour < 12) greeting = 'Good morning';
            else if (hour < 18) greeting = 'Good afternoon';

            welcomeMessage.textContent = `${greeting}, ${this.currentUser.name || this.currentUser.email}!`;
        }

        if (welcomeSubtext) {
            const messages = {
                admin: "Monitor system operations and manage all platform activities.",
                manager: "Review team performance and approve pending documents.",
                staff: "Track your documents and stay updated on approvals."
            };
            welcomeSubtext.textContent = messages[this.currentUser.role] || "Here's what's happening with your documents today.";
        }
    }

    async loadDashboardData() {
        try {
            // Load data based on user role
            this.dashboardData = await window.KMRL.apiCall('analytics');
            this.documents = await window.KMRL.apiCall('documents');
            this.activities = await window.KMRL.apiCall('activities');

            // Role-specific data loading
            if (this.currentUser.role === 'admin') {
                await this.loadAdminData();
            } else if (this.currentUser.role === 'manager') {
                await this.loadManagerData();
            } else if (this.currentUser.role === 'staff') {
                await this.loadStaffData();
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            window.KMRL.showToast('Failed to load dashboard data', 'error');
        }
    }

    async loadAdminData() {
        this.systemActivities = this.activities.slice(0, 5);
        this.workflowStatus = {
            pending: this.dashboardData.pendingApprovals,
            approved: this.dashboardData.approvedDocuments,
            rejected: this.dashboardData.rejectedDocuments,
            total: this.dashboardData.documentsUploaded
        };
    }

    async loadManagerData() {
        this.pendingApprovals = this.documents.filter(doc =>
            doc.status === 'pending' || doc.status === 'under_review'
        ).slice(0, 5);

        this.teamPerformance = {
            thisWeek: Math.floor(Math.random() * 20) + 10,
            lastWeek: Math.floor(Math.random() * 20) + 8,
            approved: this.dashboardData.approvedDocuments,
            pending: this.dashboardData.pendingApprovals
        };
    }

    async loadStaffData() {
        this.myDocuments = this.documents.filter(doc =>
            doc.uploadedBy === this.currentUser.email
        ).slice(0, 5);

        this.documentStatus = {
            pending: this.myDocuments.filter(doc => doc.status === 'pending').length,
            approved: this.myDocuments.filter(doc => doc.status === 'approved').length,
            rejected: this.myDocuments.filter(doc => doc.status === 'rejected').length,
            under_review: this.myDocuments.filter(doc => doc.status === 'under_review').length
        };
    }

    renderWidgets() {
        const widgetGrid = document.getElementById('widgetGrid');
        if (!widgetGrid) return;

        let widgets = [];

        if (this.currentUser.role === 'admin') {
            widgets = [
                {
                    title: 'Total Documents',
                    value: this.dashboardData.documentsUploaded,
                    icon: 'fa-file-alt',
                    color: 'blue',
                    trend: '+12%'
                },
                {
                    title: 'Pending Approvals',
                    value: this.dashboardData.pendingApprovals,
                    icon: 'fa-clock',
                    color: 'orange',
                    trend: '+3'
                },
                {
                    title: 'Approved Today',
                    value: Math.floor(Math.random() * 15) + 5,
                    icon: 'fa-check-circle',
                    color: 'green',
                    trend: '+8%'
                },
                {
                    title: 'Active Users',
                    value: Math.floor(Math.random() * 50) + 25,
                    icon: 'fa-users',
                    color: 'blue',
                    trend: '+2'
                }
            ];
        } else if (this.currentUser.role === 'manager') {
            widgets = [
                {
                    title: 'Pending Approvals',
                    value: this.dashboardData.pendingApprovals,
                    icon: 'fa-clipboard-check',
                    color: 'orange',
                    trend: 'High Priority'
                },
                {
                    title: 'Team Documents',
                    value: Math.floor(Math.random() * 40) + 20,
                    icon: 'fa-folder',
                    color: 'blue',
                    trend: '+15%'
                },
                {
                    title: 'Approved This Week',
                    value: Math.floor(Math.random() * 25) + 10,
                    icon: 'fa-thumbs-up',
                    color: 'green',
                    trend: '+22%'
                },
                {
                    title: 'Team Members',
                    value: Math.floor(Math.random() * 10) + 5,
                    icon: 'fa-user-friends',
                    color: 'blue',
                    trend: 'Active'
                }
            ];
        } else if (this.currentUser.role === 'staff') {
            widgets = [
                {
                    title: 'My Documents',
                    value: this.myDocuments.length,
                    icon: 'fa-file-upload',
                    color: 'blue',
                    trend: `${this.myDocuments.length} total`
                },
                {
                    title: 'Pending Approval',
                    value: this.documentStatus.pending,
                    icon: 'fa-hourglass-half',
                    color: 'orange',
                    trend: 'Awaiting review'
                },
                {
                    title: 'Approved',
                    value: this.documentStatus.approved,
                    icon: 'fa-check-circle',
                    color: 'green',
                    trend: 'Completed'
                },
                {
                    title: 'Under Review',
                    value: this.documentStatus.under_review,
                    icon: 'fa-search',
                    color: 'blue',
                    trend: 'In progress'
                }
            ];
        }

        widgetGrid.innerHTML = widgets.map(widget => `
            <div class="widget-card">
                <div class="widget-icon ${widget.color}">
                    <i class="fas ${widget.icon}"></i>
                </div>
                <div class="widget-value">${widget.value}</div>
                <div class="widget-label">${widget.title}</div>
                <div class="widget-trend">${widget.trend}</div>
            </div>
        `).join('');

        // Add click handlers for widgets
        widgetGrid.querySelectorAll('.widget-card').forEach((card, index) => {
            card.addEventListener('click', () => this.handleWidgetClick(widgets[index]));
        });
    }

    handleWidgetClick(widget) {
        // Navigate to relevant page based on widget type
        const navigationMap = {
            'Total Documents': 'documents.html',
            'Pending Approvals': 'documents.html?filter=pending',
            'My Documents': 'documents.html?filter=my',
            'Team Documents': 'documents.html?filter=team'
        };

        const targetPage = navigationMap[widget.title];
        if (targetPage) {
            window.location.href = targetPage;
        }
    }

    setupEventListeners() {
        // Quick action buttons
        const quickActionBtn = document.getElementById('quickActionBtn');
        if (quickActionBtn) {
            quickActionBtn.addEventListener('click', () => this.showQuickSearch());
        }

        // Refresh buttons
        const refreshWorkflow = document.getElementById('refreshWorkflow');
        if (refreshWorkflow) {
            refreshWorkflow.addEventListener('click', () => this.refreshWorkflowData());
        }

        const refreshStatus = document.getElementById('refreshStatus');
        if (refreshStatus) {
            refreshStatus.addEventListener('click', () => this.refreshDocumentStatus());
        }

        // Performance period selector
        const performancePeriod = document.getElementById('performancePeriod');
        if (performancePeriod) {
            performancePeriod.addEventListener('change', () => this.updatePerformanceChart());
        }

        // Render role-specific content
        this.renderRoleSpecificContent();
        this.renderQuickActions();
    }

    renderRoleSpecificContent() {
        if (this.currentUser.role === 'admin') {
            this.renderSystemActivities();
            this.renderWorkflowStatus();
        } else if (this.currentUser.role === 'manager') {
            this.renderPendingApprovals();
            this.renderPerformanceChart();
        } else if (this.currentUser.role === 'staff') {
            this.renderRecentUploads();
            this.renderDocumentStatusBreakdown();
        }
    }

    renderSystemActivities() {
        const container = document.getElementById('systemActivities');
        if (!container || !this.systemActivities) return;

        container.innerHTML = this.systemActivities.map(activity => `
            <div class="activity-item">
                <div class="item-info">
                    <div class="item-title">${activity.action}</div>
                    <div class="item-meta">
                        ${activity.user} • ${window.KMRL.formatRelativeTime(activity.timestamp)}
                    </div>
                </div>
                <div class="item-actions">
                    <button class="btn btn-sm btn-secondary">View</button>
                </div>
            </div>
        `).join('');
    }

    renderWorkflowStatus() {
        const container = document.getElementById('workflowStatus');
        if (!container || !this.workflowStatus) return;

        const percentage = (this.workflowStatus.approved / this.workflowStatus.total * 100).toFixed(1);

        container.innerHTML = `
            <div class="workflow-summary">
                <div class="workflow-stat">
                    <span class="stat-label">Approval Rate</span>
                    <span class="stat-value">${percentage}%</span>
                </div>
                <div class="workflow-stat">
                    <span class="stat-label">Pending</span>
                    <span class="stat-value">${this.workflowStatus.pending}</span>
                </div>
                <div class="workflow-stat">
                    <span class="stat-label">Rejected</span>
                    <span class="stat-value">${this.workflowStatus.rejected}</span>
                </div>
            </div>
            <div class="workflow-progress">
                <div class="progress">
                    <div class="progress-bar" style="width: ${percentage}%"></div>
                </div>
                <small class="text-muted">Overall completion rate</small>
            </div>
        `;
    }

    renderPendingApprovals() {
        const container = document.getElementById('pendingApprovals');
        const countBadge = document.getElementById('pendingCount');

        if (countBadge) {
            countBadge.textContent = this.pendingApprovals.length;
        }

        if (!container || !this.pendingApprovals) return;

        if (this.pendingApprovals.length === 0) {
            container.innerHTML = '<div class="empty-state">No pending approvals</div>';
            return;
        }

        container.innerHTML = this.pendingApprovals.map(doc => `
            <div class="approval-item">
                <div class="item-info">
                    <div class="item-title">${doc.title}</div>
                    <div class="item-meta">
                        ${doc.department} • Uploaded by ${doc.uploadedBy} • 
                        ${window.KMRL.formatRelativeTime(doc.uploadDate)}
                    </div>
                </div>
                <div class="item-actions">
                    <button class="btn btn-sm btn-success" onclick="handleApproval('${doc.id}', 'approve')">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="handleApproval('${doc.id}', 'reject')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderPerformanceChart() {
        const container = document.getElementById('performanceChart');
        if (!container) return;

        // Simple text-based chart for demo
        container.innerHTML = `
            <div class="performance-summary">
                <div class="perf-metric">
                    <span class="metric-label">Documents Processed</span>
                    <span class="metric-value">${this.teamPerformance.thisWeek}</span>
                    <span class="metric-change">+${this.teamPerformance.thisWeek - this.teamPerformance.lastWeek}</span>
                </div>
                <div class="perf-metric">
                    <span class="metric-label">Approval Rate</span>
                    <span class="metric-value">85%</span>
                    <span class="metric-change">+5%</span>
                </div>
                <div class="perf-metric">
                    <span class="metric-label">Avg. Review Time</span>
                    <span class="metric-value">2.3 days</span>
                    <span class="metric-change">-0.5</span>
                </div>
            </div>
        `;
    }

    renderRecentUploads() {
        const container = document.getElementById('recentUploads');
        if (!container || !this.myDocuments) return;

        if (this.myDocuments.length === 0) {
            container.innerHTML = '<div class="empty-state">No documents uploaded yet</div>';
            return;
        }

        container.innerHTML = this.myDocuments.map(doc => `
            <div class="document-item">
                <div class="item-info">
                    <div class="item-title">${doc.title}</div>
                    <div class="item-meta">
                        ${doc.department} • ${window.KMRL.formatRelativeTime(doc.uploadDate)}
                    </div>
                </div>
                <div class="item-status">
                    <span class="badge badge-${this.getStatusClass(doc.status)}">${doc.status}</span>
                </div>
            </div>
        `).join('');
    }

    renderDocumentStatusBreakdown() {
        const container = document.getElementById('documentStatus');
        if (!container || !this.documentStatus) return;

        const total = Object.values(this.documentStatus).reduce((sum, count) => sum + count, 0);

        container.innerHTML = `
            <div class="status-grid">
                ${Object.entries(this.documentStatus).map(([status, count]) => {
            const percentage = total > 0 ? (count / total * 100).toFixed(1) : 0;
            return `
                        <div class="status-item">
                            <div class="status-label">${status.replace('_', ' ')}</div>
                            <div class="status-count">${count}</div>
                            <div class="status-bar">
                                <div class="progress">
                                    <div class="progress-bar bg-${this.getStatusClass(status)}" 
                                         style="width: ${percentage}%"></div>
                                </div>
                            </div>
                        </div>
                    `;
        }).join('')}
            </div>
        `;
    }

    renderQuickActions() {
        const container = document.getElementById('quickActionsGrid');
        if (!container) return;

        let actions = [];

        if (this.currentUser.role === 'admin') {
            actions = [
                { title: 'User Management', desc: 'Manage system users', icon: 'fa-users-cog', href: 'admin.html' },
                { title: 'System Reports', desc: 'View detailed reports', icon: 'fa-chart-bar', href: 'analytics.html' },
                { title: 'Backup Data', desc: 'Create system backup', icon: 'fa-download', href: '#', action: 'backup' },
                { title: 'System Settings', desc: 'Configure system', icon: 'fa-cog', href: 'settings.html' }
            ];
        } else if (this.currentUser.role === 'manager') {
            actions = [
                { title: 'Review Documents', desc: 'Approve pending docs', icon: 'fa-clipboard-check', href: 'documents.html?filter=pending' },
                { title: 'Team Reports', desc: 'View team performance', icon: 'fa-users', href: 'analytics.html' },
                { title: 'Bulk Actions', desc: 'Process multiple docs', icon: 'fa-tasks', href: '#', action: 'bulk' },
                { title: 'Export Data', desc: 'Download reports', icon: 'fa-file-export', href: '#', action: 'export' }
            ];
        } else {
            actions = [
                { title: 'Upload Document', desc: 'Add new document', icon: 'fa-cloud-upload-alt', href: 'upload.html' },
                { title: 'My Documents', desc: 'View your uploads', icon: 'fa-folder-open', href: 'documents.html?filter=my' },
                { title: 'Track Status', desc: 'Check approval status', icon: 'fa-search', href: 'documents.html' },
                { title: 'Get Help', desc: 'Contact support', icon: 'fa-question-circle', href: '#', action: 'help' }
            ];
        }

        container.innerHTML = actions.map(action => `
            <a href="${action.href}" class="quick-action" ${action.action ? `data-action="${action.action}"` : ''}>
                <i class="fas ${action.icon}"></i>
                <div class="quick-action-title">${action.title}</div>
                <div class="quick-action-desc">${action.desc}</div>
            </a>
        `).join('');

        // Add event listeners for custom actions
        container.querySelectorAll('.quick-action[data-action]').forEach(action => {
            action.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleQuickAction(action.dataset.action);
            });
        });
    }

    handleQuickAction(action) {
        switch (action) {
            case 'backup':
                this.initiateBackup();
                break;
            case 'bulk':
                this.showBulkActions();
                break;
            case 'export':
                this.exportData();
                break;
            case 'help':
                this.showChatbot();
                break;
        }
    }

    getStatusClass(status) {
        const statusClasses = {
            'pending': 'warning',
            'approved': 'success',
            'rejected': 'danger',
            'under_review': 'info'
        };
        return statusClasses[status] || 'secondary';
    }

    // Chatbot functionality
    initializeChatbot() {
        const chatbotToggle = document.getElementById('chatbotToggle');
        const chatbotContainer = document.getElementById('chatbotContainer');
        const chatbotClose = document.getElementById('chatbotClose');
        const chatbotSend = document.getElementById('chatbotSend');
        const chatbotInput = document.getElementById('chatbotInput');

        if (chatbotToggle) {
            chatbotToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.showChatbot();
            });
        }

        if (chatbotClose) {
            chatbotClose.addEventListener('click', () => {
                chatbotContainer.classList.remove('show');
            });
        }

        if (chatbotSend) {
            chatbotSend.addEventListener('click', () => this.sendChatMessage());
        }

        if (chatbotInput) {
            chatbotInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendChatMessage();
                }
            });
        }
    }

    showChatbot() {
        const chatbotContainer = document.getElementById('chatbotContainer');
        if (chatbotContainer) {
            chatbotContainer.classList.add('show');
            document.getElementById('chatbotInput').focus();
        }
    }

    async sendChatMessage() {
        const input = document.getElementById('chatbotInput');
        const messagesContainer = document.getElementById('chatbotMessages');

        if (!input.value.trim()) return;

        const userMessage = input.value.trim();
        input.value = '';

        // Add user message
        this.addChatMessage(userMessage, 'user');

        // Simulate AI response
        setTimeout(() => {
            const response = this.generateChatResponse(userMessage);
            this.addChatMessage(response, 'bot');
        }, 1000);
    }

    addChatMessage(message, type) {
        const messagesContainer = document.getElementById('chatbotMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        messageDiv.innerHTML = `
            <div class="message-content">${message}</div>
            <div class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        `;

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    generateChatResponse(userMessage) {
        const responses = {
            'upload': 'To upload a document, click on "Upload Document" in the navigation menu or use the quick action button on your dashboard.',
            'status': 'You can check document status by going to "Documents" section and filtering by your uploads.',
            'approval': 'Document approval process typically takes 2-3 business days. You\'ll receive notifications when status changes.',
            'help': 'I can help you with document uploads, status checks, navigation, and general KMRL DMS questions. What do you need help with?',
            'default': 'I\'m here to help! You can ask me about document uploads, approval status, system navigation, or any other KMRL DMS features.'
        };

        const lowerMessage = userMessage.toLowerCase();

        for (const [key, response] of Object.entries(responses)) {
            if (lowerMessage.includes(key)) {
                return response;
            }
        }

        return responses.default;
    }

    // Utility methods
    async refreshWorkflowData() {
        const btn = document.getElementById('refreshWorkflow');
        if (btn) {
            btn.innerHTML = '<i class="fas fa-sync fa-spin"></i>';
            btn.disabled = true;
        }

        try {
            await this.loadAdminData();
            this.renderWorkflowStatus();
            window.KMRL.showToast('Workflow data refreshed', 'success');
        } catch (error) {
            window.KMRL.showToast('Failed to refresh data', 'error');
        } finally {
            if (btn) {
                btn.innerHTML = '<i class="fas fa-sync"></i>';
                btn.disabled = false;
            }
        }
    }

    async refreshDocumentStatus() {
        const btn = document.getElementById('refreshStatus');
        if (btn) {
            btn.innerHTML = '<i class="fas fa-sync fa-spin"></i>';
            btn.disabled = true;
        }

        try {
            await this.loadStaffData();
            this.renderDocumentStatusBreakdown();
            window.KMRL.showToast('Document status refreshed', 'success');
        } catch (error) {
            window.KMRL.showToast('Failed to refresh status', 'error');
        } finally {
            if (btn) {
                btn.innerHTML = '<i class="fas fa-sync"></i>';
                btn.disabled = false;
            }
        }
    }

    showQuickSearch() {
        // Redirect to documents page with search focus
        window.location.href = 'documents.html?focus=search';
    }

    updatePerformanceChart() {
        // Update chart based on selected period
        this.renderPerformanceChart();
    }

    initiateBackup() {
        window.KMRL.showToast('System backup initiated', 'info');
        // Simulate backup process
        setTimeout(() => {
            window.KMRL.showToast('System backup completed successfully', 'success');
        }, 3000);
    }

    showBulkActions() {
        window.location.href = 'documents.html?mode=bulk';
    }

    exportData() {
        window.KMRL.showToast('Preparing export... Download will start shortly', 'info');
        // Simulate export
        setTimeout(() => {
            window.KMRL.showToast('Export completed successfully', 'success');
        }, 2000);
    }

    startAutoRefresh() {
        // Refresh dashboard data every 5 minutes
        setInterval(() => {
            this.loadDashboardData().then(() => {
                this.renderWidgets();
                console.log('Dashboard data auto-refreshed');
            }).catch(error => {
                console.error('Auto-refresh failed:', error);
            });
        }, 5 * 60 * 1000);
    }
}

// Global handler for approval actions
window.handleApproval = async function (docId, action) {
    try {
        const actionText = action === 'approve' ? 'approved' : 'rejected';
        window.KMRL.showToast(`Document ${actionText} successfully`, 'success');

        // Refresh pending approvals
        const dashboard = window.dashboardManager;
        if (dashboard) {
            await dashboard.loadManagerData();
            dashboard.renderPendingApprovals();
        }
    } catch (error) {
        window.KMRL.showToast('Failed to process approval', 'error');
    }
};

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardManager = new DashboardManager();
});
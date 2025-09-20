// KMRL Document Management System - Staff Panel JavaScript

class StaffManager {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.addCustomStyles();
        this.init();
        this.setupStaffRestrictions();
        this.setupNotifications();
    }

    init() {
        // Verify staff access
        if (!this.currentUser || this.currentUser.role !== 'staff') {
            return;
        }

        this.setupStaffDashboard();
        this.setupEventListeners();
        this.loadStaffData();
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

    setupStaffRestrictions() {
        if (!this.currentUser || this.currentUser.role !== 'staff') {
            return;
        }

        // Hide admin and manager only elements
        this.hideRestrictedElements();

        // Restrict document actions
        this.restrictDocumentActions();

        // Customize navigation
        this.customizeStaffNavigation();
    }

    hideRestrictedElements() {
        // Hide admin-only elements
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(el => {
            el.style.display = 'none';
        });

        // Hide manager-only elements
        const managerElements = document.querySelectorAll('.manager-only');
        managerElements.forEach(el => {
            el.style.display = 'none';
        });

        // Hide bulk actions that staff shouldn't have
        const bulkActions = document.querySelectorAll('.bulk-actions');
        bulkActions.forEach(el => {
            const approveBtn = el.querySelector('#bulkApprove');
            if (approveBtn) approveBtn.style.display = 'none';
        });
    }

    restrictDocumentActions() {
        // Remove approve/reject buttons from document tables for staff users
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                const approveButtons = document.querySelectorAll('.action-approve');
                const rejectButtons = document.querySelectorAll('.action-reject');

                approveButtons.forEach(btn => btn.style.display = 'none');
                rejectButtons.forEach(btn => btn.style.display = 'none');
            }, 1000);
        });
    }

    customizeStaffNavigation() {
        // Add staff-specific navigation items
        const sidebar = document.querySelector('.sidebar-nav');
        if (sidebar) {
            // Create staff-specific quick actions
            const staffActionsHtml = `
                <div class="nav-section staff-only">
                    <div class="nav-section-title">Quick Actions</div>
                    <a href="#" class="nav-link" id="quickUploadLink">
                        <i class="fas fa-plus-circle"></i>
                        <span>Quick Upload</span>
                    </a>
                    <a href="#" class="nav-link" id="myTasksLink">
                        <i class="fas fa-tasks"></i>
                        <span>My Tasks</span>
                    </a>
                    <a href="#" class="nav-link" id="notificationsLink">
                        <i class="fas fa-bell"></i>
                        <span>Notifications</span>
                    </a>
                </div>
            `;

            // Insert before admin panel link
            const adminLink = sidebar.querySelector('a[href="admin.html"]');
            if (adminLink) {
                adminLink.insertAdjacentHTML('beforebegin', staffActionsHtml);
            }
        }
    }

    setupStaffDashboard() {
        // Customize dashboard for staff users
        this.setupStaffWidgets();
        this.setupStaffNotifications();
    }

    setupStaffWidgets() {
        // Create staff-specific widgets
        const widgetsContainer = document.querySelector('.widgets-grid');
        if (widgetsContainer) {
            this.addStaffSpecificWidgets(widgetsContainer);
        }
    }

    addStaffSpecificWidgets(container) {
        // My Documents Widget
        const myDocsWidget = this.createStaffWidget({
            id: 'myDocuments',
            title: 'My Documents',
            icon: 'fas fa-folder-open',
            iconColor: '#2563eb',
            content: `
                <div class="staff-widget-content">
                    <div class="stat-large" id="myDocCount">0</div>
                    <div class="stat-label">Total Documents</div>
                    <div class="widget-actions">
                        <button class="btn btn-sm btn-primary" onclick="window.location.href='documents.html'">
                            View All
                        </button>
                    </div>
                </div>
            `
        });

        // Upload Status Widget
        const uploadStatusWidget = this.createStaffWidget({
            id: 'uploadStatus',
            title: 'Upload Status',
            icon: 'fas fa-cloud-upload-alt',
            iconColor: '#059669',
            content: `
                <div class="staff-widget-content">
                    <div class="status-breakdown">
                        <div class="status-item">
                            <span class="status-count" id="pendingCount">0</span>
                            <span class="status-label">Pending</span>
                        </div>
                        <div class="status-item">
                            <span class="status-count" id="approvedCount">0</span>
                            <span class="status-label">Approved</span>
                        </div>
                        <div class="status-item">
                            <span class="status-count" id="rejectedCount">0</span>
                            <span class="status-label">Rejected</span>
                        </div>
                    </div>
                </div>
            `
        });

        // Tasks Widget
        const tasksWidget = this.createStaffWidget({
            id: 'myTasks',
            title: 'My Tasks',
            icon: 'fas fa-tasks',
            iconColor: '#d97706',
            content: `
                <div class="staff-widget-content">
                    <div class="task-list" id="taskList">
                        <div class="task-item">
                            <i class="fas fa-file-upload"></i>
                            <span>Upload monthly reports</span>
                            <span class="task-status pending">Pending</span>
                        </div>
                        <div class="task-item">
                            <i class="fas fa-edit"></i>
                            <span>Review Q4 documents</span>
                            <span class="task-status in-progress">In Progress</span>
                        </div>
                    </div>
                    <button class="btn btn-sm btn-outline" onclick="staffManager.showAllTasks()">
                        View All Tasks
                    </button>
                </div>
            `
        });

        // Insert widgets at the beginning of the grid
        container.insertBefore(myDocsWidget, container.firstChild);
        container.insertBefore(uploadStatusWidget, container.children[1]);
        container.insertBefore(tasksWidget, container.children[2]);
    }

    createStaffWidget(config) {
        const widget = document.createElement('div');
        widget.className = 'widget staff-widget';
        widget.innerHTML = `
            <div class="widget-header">
                <h3 class="widget-title">${config.title}</h3>
                <div class="widget-icon" style="background: ${config.iconColor}20; color: ${config.iconColor};">
                    <i class="${config.icon}"></i>
                </div>
            </div>
            ${config.content}
        `;
        return widget;
    }

    setupEventListeners() {
        // Quick upload functionality
        document.addEventListener('click', (e) => {
            if (e.target.closest('#quickUploadLink')) {
                e.preventDefault();
                this.showQuickUpload();
            }
            if (e.target.closest('#myTasksLink')) {
                e.preventDefault();
                this.showMyTasks();
            }
            if (e.target.closest('#notificationsLink')) {
                e.preventDefault();
                this.showNotifications();
            }
        });

        // Document upload events
        document.addEventListener('documentUploaded', (e) => {
            this.handleDocumentUpload(e.detail);
        });
    }

    async loadStaffData() {
        try {
            // Load staff-specific data
            const [myDocs, tasks, notifications] = await Promise.all([
                this.loadMyDocuments(),
                this.loadMyTasks(),
                this.loadMyNotifications()
            ]);

            this.updateStaffWidgets(myDocs, tasks, notifications);
        } catch (error) {
            console.error('Error loading staff data:', error);
        }
    }

    async loadMyDocuments() {
        // Load only documents uploaded by current user
        const allDocs = JSON.parse(localStorage.getItem('kmrl_documents') || '[]');
        return allDocs.filter(doc => doc.uploadedBy === this.currentUser.name);
    }

    async loadMyTasks() {
        // Load tasks assigned to current user
        const allTasks = JSON.parse(localStorage.getItem('kmrl_tasks') || '[]');
        return allTasks.filter(task => task.assignedTo === this.currentUser.email);
    }

    async loadMyNotifications() {
        // Load notifications for current user
        const allNotifications = JSON.parse(localStorage.getItem('kmrl_notifications') || '[]');
        return allNotifications.filter(notif =>
            notif.recipients === 'all' ||
            notif.recipients === 'staff' ||
            notif.targetUser === this.currentUser.email
        );
    }

    updateStaffWidgets(myDocs, tasks, notifications) {
        // Update My Documents count
        const myDocCount = document.getElementById('myDocCount');
        if (myDocCount) {
            myDocCount.textContent = myDocs.length;
        }

        // Update status breakdown
        const pendingCount = myDocs.filter(doc => doc.status === 'pending').length;
        const approvedCount = myDocs.filter(doc => doc.status === 'approved').length;
        const rejectedCount = myDocs.filter(doc => doc.status === 'rejected').length;

        document.getElementById('pendingCount')?.textContent = pendingCount;
        document.getElementById('approvedCount')?.textContent = approvedCount;
        document.getElementById('rejectedCount')?.textContent = rejectedCount;

        // Update notifications badge
        this.updateNotificationsBadge(notifications.length);
    }

    showQuickUpload() {
        // Create quick upload modal
        const modal = this.createQuickUploadModal();
        document.body.appendChild(modal);
        modal.classList.add('show');
    }

    createQuickUploadModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">
                            <i class="fas fa-cloud-upload-alt"></i> Quick Upload
                        </h3>
                        <button type="button" class="close" onclick="this.closest('.modal').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="quickUploadForm" enctype="multipart/form-data">
                            <div class="form-group">
                                <label class="form-label">Select Files</label>
                                <input type="file" class="form-control" id="quickUploadFiles" 
                                       multiple accept=".pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt" required>
                                <small class="form-text">Accepted formats: PDF, Word, Excel, PowerPoint</small>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Category</label>
                                <select class="form-control" id="quickUploadCategory" required>
                                    <option value="">Select category</option>
                                    <option value="financial">Financial</option>
                                    <option value="hr">Human Resources</option>
                                    <option value="technical">Technical</option>
                                    <option value="marketing">Marketing</option>
                                    <option value="operations">Operations</option>
                                    <option value="legal">Legal</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Description (Optional)</label>
                                <textarea class="form-control" id="quickUploadDescription" 
                                          rows="3" placeholder="Brief description of the documents..."></textarea>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Tags (Optional)</label>
                                <input type="text" class="form-control" id="quickUploadTags" 
                                       placeholder="Enter tags separated by commas">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                            Cancel
                        </button>
                        <button type="submit" form="quickUploadForm" class="btn btn-primary">
                            <i class="fas fa-upload"></i> Upload Documents
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Handle form submission
        modal.querySelector('#quickUploadForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleQuickUpload(e.target);
        });

        return modal;
    }

    async handleQuickUpload(form) {
        const formData = new FormData(form);
        const files = document.getElementById('quickUploadFiles').files;
        const category = document.getElementById('quickUploadCategory').value;
        const description = document.getElementById('quickUploadDescription').value;
        const tags = document.getElementById('quickUploadTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);

        try {
            // Process each file
            const uploadPromises = Array.from(files).map(file =>
                this.processFileUpload(file, category, description, tags)
            );

            await Promise.all(uploadPromises);

            // Close modal and show success
            form.closest('.modal').remove();
            this.showNotification('Documents uploaded successfully and submitted for approval!', 'success');

            // Refresh data
            this.loadStaffData();

        } catch (error) {
            console.error('Upload error:', error);
            this.showNotification('Failed to upload documents. Please try again.', 'error');
        }
    }

    async processFileUpload(file, category, description, tags) {
        // Simulate file processing and AI analysis
        await this.delay(1000);

        // Generate AI summary and key points (simulation)
        const { summary, keyPoints } = this.generateAIAnalysis(file.name, category);

        // Create document record
        const document = {
            id: 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
            category: category,
            description: description,
            tags: tags,
            files: [{
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified
            }],
            uploadedBy: this.currentUser.name,
            uploadedAt: new Date().toISOString(),
            status: 'pending',
            downloads: 0,
            views: 0,
            summary: summary,
            keyPoints: keyPoints,
            accessLevel: 'internal'
        };

        // Save to localStorage
        const documents = JSON.parse(localStorage.getItem('kmrl_documents') || '[]');
        documents.unshift(document);
        localStorage.setItem('kmrl_documents', JSON.stringify(documents));

        return document;
    }

    generateAIAnalysis(fileName, category) {
        // Simulate AI-generated content based on file name and category
        const summaries = {
            financial: `Financial document analysis: This ${fileName} contains key financial metrics and performance indicators. The document includes budget allocations, expense reports, and revenue projections.`,
            hr: `HR document analysis: This ${fileName} contains human resources information including policies, procedures, and employee-related documentation.`,
            technical: `Technical document analysis: This ${fileName} contains technical specifications, requirements, and implementation details for system processes.`,
            marketing: `Marketing document analysis: This ${fileName} contains marketing strategies, campaign data, and promotional materials for business growth.`,
            operations: `Operations document analysis: This ${fileName} contains operational procedures, workflow documentation, and process optimization guidelines.`,
            legal: `Legal document analysis: This ${fileName} contains legal requirements, compliance information, and regulatory documentation.`
        };

        const keyPointsMap = {
            financial: ['Budget allocation breakdown', 'Revenue projections', 'Cost analysis', 'Performance metrics'],
            hr: ['Policy updates', 'Employee procedures', 'Benefits information', 'Training requirements'],
            technical: ['System requirements', 'Implementation steps', 'Technical specifications', 'Quality standards'],
            marketing: ['Target audience analysis', 'Campaign strategies', 'Market research data', 'Performance metrics'],
            operations: ['Process workflows', 'Quality controls', 'Efficiency measures', 'Standard procedures'],
            legal: ['Compliance requirements', 'Legal obligations', 'Risk assessments', 'Regulatory guidelines']
        };

        return {
            summary: summaries[category] || `Document analysis: This ${fileName} contains important information for the ${category} department.`,
            keyPoints: keyPointsMap[category] || ['Key information identified', 'Important data points', 'Relevant content sections']
        };
    }

    showMyTasks() {
        // Create tasks modal
        const modal = this.createTasksModal();
        document.body.appendChild(modal);
        modal.classList.add('show');
    }

    createTasksModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">
                            <i class="fas fa-tasks"></i> My Tasks
                        </h3>
                        <button type="button" class="close" onclick="this.closest('.modal').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="tasks-container">
                            <div class="task-filters">
                                <div class="filter-tabs">
                                    <button class="filter-tab active" data-filter="all">All Tasks</button>
                                    <button class="filter-tab" data-filter="pending">Pending</button>
                                    <button class="filter-tab" data-filter="in-progress">In Progress</button>
                                    <button class="filter-tab" data-filter="completed">Completed</button>
                                </div>
                            </div>
                            <div class="tasks-list" id="staffTasksList">
                                <!-- Tasks will be loaded here -->
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Load tasks
        this.loadTasksInModal(modal);

        return modal;
    }

    async loadTasksInModal(modal) {
        const tasksList = modal.querySelector('#staffTasksList');
        const tasks = await this.loadMyTasks();

        if (tasks.length === 0) {
            tasksList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tasks"></i>
                    <h4>No tasks assigned</h4>
                    <p>You don't have any tasks assigned at the moment.</p>
                </div>
            `;
            return;
        }

        tasksList.innerHTML = tasks.map(task => `
            <div class="task-item-detailed">
                <div class="task-header">
                    <h5>${task.title}</h5>
                    <span class="task-status ${task.status}">${task.status}</span>
                </div>
                <div class="task-content">
                    <p>${task.description}</p>
                    <div class="task-meta">
                        <span><i class="fas fa-calendar"></i> Due: ${this.formatDate(task.dueDate)}</span>
                        <span><i class="fas fa-user"></i> Assigned by: ${task.assignedBy}</span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="btn btn-sm btn-primary" onclick="staffManager.updateTaskStatus('${task.id}', 'in-progress')">
                        Start Task
                    </button>
                    <button class="btn btn-sm btn-success" onclick="staffManager.updateTaskStatus('${task.id}', 'completed')">
                        Mark Complete
                    </button>
                </div>
            </div>
        `).join('');
    }

    setupNotifications() {
        // Setup notification system for staff
        this.notificationPolling = setInterval(() => {
            this.checkForNewNotifications();
        }, 30000); // Check every 30 seconds
    }

    async checkForNewNotifications() {
        const notifications = await this.loadMyNotifications();
        const unreadCount = notifications.filter(n => !n.read).length;

        this.updateNotificationsBadge(unreadCount);

        // Show new notifications
        const newNotifications = notifications.filter(n => !n.shown && !n.read);
        newNotifications.forEach(notification => {
            this.showNotificationPopup(notification);
            notification.shown = true;
        });

        if (newNotifications.length > 0) {
            localStorage.setItem('kmrl_notifications', JSON.stringify(notifications));
        }
    }

    updateNotificationsBadge(count) {
        const badge = document.querySelector('#notificationsLink .notification-badge');
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'inline-block' : 'none';
        } else if (count > 0) {
            // Create badge if it doesn't exist
            const notifLink = document.querySelector('#notificationsLink');
            if (notifLink) {
                const badgeEl = document.createElement('span');
                badgeEl.className = 'notification-badge';
                badgeEl.textContent = count;
                badgeEl.style.cssText = `
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    background: #dc2626;
                    color: white;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    font-size: 0.7rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                `;
                notifLink.style.position = 'relative';
                notifLink.appendChild(badgeEl);
            }
        }
    }

    showNotificationPopup(notification) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'notification-toast';
        toast.innerHTML = `
            <div class="toast-header">
                <i class="fas fa-bell"></i>
                <strong>New Notification</strong>
                <button class="toast-close" onclick="this.closest('.notification-toast').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="toast-body">
                <h6>${notification.subject}</h6>
                <p>${notification.message}</p>
                <small>${this.formatDate(notification.sentAt)}</small>
            </div>
        `;

        // Add styles
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border-radius: 0.5rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            border-left: 4px solid #2563eb;
            max-width: 400px;
            z-index: 1060;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(toast);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }

    // Utility functions
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    formatDate(dateStr) {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString();
    }

    showNotification(message, type = 'info') {
        if (window.showNotification) {
            window.showNotification(message, type);
        }
    }

    // Cleanup
    destroy() {
        if (this.notificationPolling) {
            clearInterval(this.notificationPolling);
        }
    }

    // Add custom CSS styles for staff interface
    addCustomStyles() {
        const style = document.createElement('style');
        style.textContent = `
        .staff-widget {
            border-left: 4px solid #2563eb;
        }

        .staff-widget-content {
            text-align: center;
        }

        .stat-large {
            font-size: 2.5rem;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 0.5rem;
        }

        .status-breakdown {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
            margin-bottom: 1rem;
        }

        .status-item {
            text-align: center;
            padding: 1rem;
            background: #f8fafc;
            border-radius: 0.5rem;
        }

        .status-count {
            display: block;
            font-size: 1.5rem;
            font-weight: 700;
            color: #1e293b;
        }

        .status-label {
            font-size: 0.8rem;
            color: #64748b;
            text-transform: uppercase;
        }

        .task-list {
            margin-bottom: 1rem;
        }

        .task-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem;
            background: #f8fafc;
            border-radius: 0.5rem;
            margin-bottom: 0.5rem;
        }

        .task-status {
            padding: 0.25rem 0.5rem;
            border-radius: 1rem;
            font-size: 0.7rem;
            font-weight: 500;
            margin-left: auto;
        }

        .task-status.pending {
            background: #fef3c7;
            color: #92400e;
        }

        .task-status.in-progress {
            background: #dbeafe;
            color: #1e40af;
        }

        .task-status.completed {
            background: #dcfce7;
            color: #166534;
        }

        .nav-section {
            margin: 1rem 0;
            padding: 0 1rem;
        }

        .nav-section-title {
            color: #94a3b8;
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
            margin-bottom: 0.5rem;
            letter-spacing: 0.05em;
        }

        .notification-badge {
            position: absolute;
            top: -5px;
            right: -5px;
            background: #dc2626;
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            font-size: 0.7rem;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .notification-toast {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border-radius: 0.5rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            border-left: 4px solid #2563eb;
            max-width: 400px;
            z-index: 1060;
            animation: slideIn 0.3s ease;
        }

        .toast-header {
            padding: 1rem 1rem 0.5rem 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 600;
            color: #374151;
        }

        .toast-close {
            margin-left: auto;
            background: none;
            border: none;
            color: #6b7280;
            cursor: pointer;
        }

        .toast-body {
            padding: 0.5rem 1rem 1rem 1rem;
        }

        .toast-body h6 {
            margin: 0 0 0.5rem 0;
            color: #1e293b;
        }

        .toast-body p {
            margin: 0 0 0.5rem 0;
            color: #4b5563;
            font-size: 0.9rem;
        }

        .toast-body small {
            color: #6b7280;
        }

        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        .task-item-detailed {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 10px;
            background: #f9fafb;
        }
        `;

        document.head.appendChild(style);
    }
}

// Initialize staff manager when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.getCurrentUser && window.getCurrentUser()?.role === 'staff') {
            window.staffManager = new StaffManager();
        }
    });
} else {
    if (window.getCurrentUser && window.getCurrentUser()?.role === 'staff') {
        window.staffManager = new StaffManager();
    }
}
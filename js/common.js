// KMRL Document Management System - Common Utilities

class KMRLApp {
    constructor() {
        this.currentUser = null;
        this.notifications = [];
        this.init();
    }

    init() {
        this.loadUserSession();
        this.setupGlobalEventListeners();
        this.initializeNavigation();
        this.checkAuthentication();
    }

    // Authentication Methods
    loadUserSession() {
        const userData = localStorage.getItem('kmrl_user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
        }
    }

    checkAuthentication() {
        if (!this.currentUser && !this.isPublicPage()) {
            this.redirectToLogin();
            return false;
        }
        return true;
    }

    isPublicPage() {
        const publicPages = ['login.html', 'index.html'];
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        return publicPages.includes(currentPage);
    }

    redirectToLogin() {
        window.location.href = 'login.html';
    }

    logout() {
        localStorage.removeItem('kmrl_user');
        localStorage.removeItem('kmrl_login_time');
        this.redirectToLogin();
    }

    // User Role Management
    hasRole(role) {
        return this.currentUser && this.currentUser.role === role;
    }

    hasAnyRole(roles) {
        return this.currentUser && roles.includes(this.currentUser.role);
    }

    getCurrentUser() {
        return this.currentUser;
    }

    // UI Role Management
    showRoleBasedContent() {
        if (!this.currentUser) return;

        const userRole = this.currentUser.role;

        // Hide all role-specific content
        document.querySelectorAll('.admin-only, .manager-only, .staff-only').forEach(el => {
            el.style.display = 'none';
        });

        // Show content for current role
        document.querySelectorAll(`.${userRole}-only`).forEach(el => {
            el.style.display = 'block';
        });

        // Show role sections that should be active
        document.querySelectorAll('.role-section').forEach(el => {
            el.classList.remove('active');
        });

        const activeSection = document.getElementById(`${userRole}Dashboard`);
        if (activeSection) {
            activeSection.classList.add('active');
        }
    }

    // Navigation Methods
    initializeNavigation() {
        // Mobile menu toggle
        const mobileToggle = document.getElementById('mobileToggle');
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('mainContent');

        if (mobileToggle && sidebar) {
            mobileToggle.addEventListener('click', () => {
                sidebar.classList.toggle('show');
                mainContent.classList.toggle('expanded');
            });
        }

        // Close sidebar on outside click (mobile)
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && sidebar && !sidebar.contains(e.target) && !mobileToggle.contains(e.target)) {
                sidebar.classList.remove('show');
                mainContent.classList.remove('expanded');
            }
        });

        // Set active navigation item
        this.setActiveNavItem();
    }

    setActiveNavItem() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navItems = document.querySelectorAll('.nav-item');

        navItems.forEach(item => {
            item.classList.remove('active');
            const href = item.getAttribute('href');
            if (href && href.includes(currentPage)) {
                item.classList.add('active');
            }
        });
    }

    // Notification System
    addNotification(title, message, type = 'info', persistent = false) {
        const notification = {
            id: Date.now().toString(),
            title,
            message,
            type,
            timestamp: new Date(),
            read: false,
            persistent
        };

        this.notifications.unshift(notification);
        this.updateNotificationBadge();
        this.renderNotifications();

        // Show toast for non-persistent notifications
        if (!persistent) {
            this.showToast(message, type);
        }

        return notification.id;
    }

    markNotificationAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            this.updateNotificationBadge();
            this.renderNotifications();
        }
    }

    markAllNotificationsAsRead() {
        this.notifications.forEach(n => n.read = true);
        this.updateNotificationBadge();
        this.renderNotifications();
    }

    updateNotificationBadge() {
        const badge = document.getElementById('notificationBadge');
        const unreadCount = this.notifications.filter(n => !n.read).length;

        if (badge) {
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'block' : 'none';
        }
    }

    renderNotifications() {
        const container = document.getElementById('notificationList');
        if (!container) return;

        if (this.notifications.length === 0) {
            container.innerHTML = '<div class="no-notifications">No notifications</div>';
            return;
        }

        container.innerHTML = this.notifications.map(notification => `
            <div class="notification-item ${notification.read ? '' : 'unread'}" 
                 data-id="${notification.id}">
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-time">${this.formatRelativeTime(notification.timestamp)}</div>
                </div>
                <div class="notification-actions">
                    ${!notification.read ? '<button class="mark-read-btn">Mark as read</button>' : ''}
                </div>
            </div>
        `).join('');

        // Add event listeners for mark as read buttons
        container.querySelectorAll('.mark-read-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const notificationId = btn.closest('.notification-item').dataset.id;
                this.markNotificationAsRead(notificationId);
            });
        });

        // Add click listeners to notification items
        container.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', () => {
                const notificationId = item.dataset.id;
                this.markNotificationAsRead(notificationId);
            });
        });
    }

    // Toast Notifications
    showToast(message, type = 'info', duration = 4000) {
        const toastContainer = document.getElementById('toastContainer') || this.createToastContainer();

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas ${this.getToastIcon(type)}"></i>
            </div>
            <div class="toast-message">${message}</div>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        toastContainer.appendChild(toast);

        // Show toast
        setTimeout(() => toast.classList.add('show'), 100);

        // Auto-hide toast
        const hideToast = () => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        };

        setTimeout(hideToast, duration);

        // Close button
        toast.querySelector('.toast-close').addEventListener('click', hideToast);

        return toast;
    }

    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
        return container;
    }

    getToastIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    // Utility Methods
    formatRelativeTime(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    formatDate(date, includeTime = false) {
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };

        if (includeTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }

        return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
    }

    // API Simulation Methods
    async apiCall(endpoint, options = {}) {
        // Simulate API delay
        await this.delay(Math.random() * 1000 + 500);

        // Simulate occasional failures
        if (Math.random() < 0.05) {
            throw new Error('Network error. Please try again.');
        }

        // Return mock data based on endpoint
        return this.getMockData(endpoint, options);
    }

    getMockData(endpoint, options = {}) {
        const mockData = {
            'documents': this.generateMockDocuments(),
            'notifications': this.generateMockNotifications(),
            'analytics': this.generateMockAnalytics(),
            'users': this.generateMockUsers(),
            'activities': this.generateMockActivities()
        };

        return mockData[endpoint] || { data: [], message: 'No data available' };
    }

    generateMockDocuments() {
        const documents = [];
        const titles = [
            'Project Proposal - Metro Extension Phase 2',
            'Safety Compliance Report Q3 2024',
            'Budget Analysis - Annual Review',
            'Staff Training Manual Update',
            'Maintenance Schedule - October',
            'Passenger Feedback Analysis',
            'Environmental Impact Assessment',
            'Technical Specifications - New Trains'
        ];

        const departments = ['Operations', 'Engineering', 'Finance', 'HR', 'Safety', 'Maintenance'];
        const statuses = ['pending', 'approved', 'rejected', 'under_review'];

        for (let i = 0; i < 20; i++) {
            documents.push({
                id: `doc_${i + 1}`,
                title: titles[Math.floor(Math.random() * titles.length)],
                department: departments[Math.floor(Math.random() * departments.length)],
                uploadedBy: `user${Math.floor(Math.random() * 10) + 1}@kmrl.com`,
                uploadDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
                status: statuses[Math.floor(Math.random() * statuses.length)],
                fileType: ['pdf', 'docx', 'xlsx'][Math.floor(Math.random() * 3)],
                fileSize: Math.floor(Math.random() * 10000000) + 100000
            });
        }

        return documents;
    }

    generateMockNotifications() {
        return [
            {
                id: 'notif_1',
                title: 'Document Approved',
                message: 'Your safety report has been approved by the manager.',
                type: 'success',
                timestamp: new Date(Date.now() - 30 * 60 * 1000),
                read: false
            },
            {
                id: 'notif_2',
                title: 'New Document Uploaded',
                message: 'A new training manual has been uploaded for review.',
                type: 'info',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                read: false
            },
            {
                id: 'notif_3',
                title: 'System Maintenance',
                message: 'Scheduled maintenance will occur this weekend.',
                type: 'warning',
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
                read: true
            }
        ];
    }

    generateMockAnalytics() {
        return {
            documentsUploaded: Math.floor(Math.random() * 100) + 50,
            pendingApprovals: Math.floor(Math.random() * 20) + 5,
            approvedDocuments: Math.floor(Math.random() * 80) + 40,
            rejectedDocuments: Math.floor(Math.random() * 10) + 2,
            monthlyUploads: Array.from({ length: 12 }, () => Math.floor(Math.random() * 50) + 10),
            departmentStats: {
                'Operations': Math.floor(Math.random() * 30) + 10,
                'Engineering': Math.floor(Math.random() * 25) + 8,
                'Finance': Math.floor(Math.random() * 20) + 5,
                'HR': Math.floor(Math.random() * 15) + 3,
                'Safety': Math.floor(Math.random() * 35) + 12,
                'Maintenance': Math.floor(Math.random() * 28) + 9
            }
        };
    }

    generateMockUsers() {
        return [
            { id: 1, name: 'Admin User', email: 'admin@kmrl.com', role: 'admin', status: 'active' },
            { id: 2, name: 'John Manager', email: 'manager@kmrl.com', role: 'manager', status: 'active' },
            { id: 3, name: 'Sarah Staff', email: 'staff@kmrl.com', role: 'staff', status: 'active' },
            { id: 4, name: 'Mike Engineer', email: 'mike@kmrl.com', role: 'staff', status: 'active' },
            { id: 5, name: 'Lisa Operations', email: 'lisa@kmrl.com', role: 'manager', status: 'active' }
        ];
    }

    generateMockActivities() {
        const activities = [
            'Document uploaded by user',
            'Document approved by manager',
            'New user registered',
            'System backup completed',
            'Workflow updated',
            'Report generated'
        ];

        return Array.from({ length: 10 }, (_, i) => ({
            id: `activity_${i + 1}`,
            action: activities[Math.floor(Math.random() * activities.length)],
            user: `user${Math.floor(Math.random() * 5) + 1}@kmrl.com`,
            timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
            details: 'Additional activity details here...'
        }));
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Global Event Listeners
    setupGlobalEventListeners() {
        // User dropdown
        const userBtn = document.getElementById('userBtn');
        const userMenu = document.getElementById('userMenu');

        if (userBtn && userMenu) {
            userBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                userMenu.classList.toggle('show');
            });
        }

        // Notification dropdown
        const notificationBtn = document.getElementById('notificationBtn');
        const notificationPanel = document.getElementById('notificationPanel');

        if (notificationBtn && notificationPanel) {
            notificationBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                notificationPanel.classList.toggle('show');
            });
        }

        // Close dropdowns on outside click
        document.addEventListener('click', () => {
            if (userMenu) userMenu.classList.remove('show');
            if (notificationPanel) notificationPanel.classList.remove('show');
        });

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        // Mark all notifications as read
        const markAllRead = document.getElementById('markAllRead');
        if (markAllRead) {
            markAllRead.addEventListener('click', () => {
                this.markAllNotificationsAsRead();
            });
        }

        // Update user info in header
        this.updateUserInfo();

        // Show role-based content
        this.showRoleBasedContent();

        // Load initial notifications
        this.loadInitialNotifications();
    }

    updateUserInfo() {
        const userNameEl = document.getElementById('userName');
        const userRoleEl = document.getElementById('userRole');

        if (this.currentUser) {
            if (userNameEl) userNameEl.textContent = this.currentUser.name || this.currentUser.email;
            if (userRoleEl) userRoleEl.textContent = this.currentUser.role;
        }
    }

    loadInitialNotifications() {
        // Load mock notifications
        const mockNotifications = this.generateMockNotifications();
        this.notifications = mockNotifications;
        this.updateNotificationBadge();
        this.renderNotifications();
    }
}

// Initialize global app instance
window.KMRL = new KMRLApp();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KMRLApp;
}
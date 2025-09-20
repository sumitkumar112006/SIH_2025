// KMRL Tender Notification System

class TenderNotificationSystem {
    constructor() {
        this.notifications = [];
        this.currentUser = this.getCurrentUser();
        this.init();
    }

    init() {
        this.loadStoredNotifications();
        this.setupNotificationCenter();
        this.startNotificationProcessor();
    }

    getCurrentUser() {
        try {
            const userData = localStorage.getItem('kmrl_user');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            return null;
        }
    }

    async loadStoredNotifications() {
        try {
            // Load notifications from API if available
            if (window.apiClient) {
                this.notifications = await window.apiClient.getNotifications();
            } else {
                // Fallback to localStorage
                this.notifications = JSON.parse(localStorage.getItem('kmrl_all_notifications') || '[]');
            }
        } catch (error) {
            this.notifications = [];
        }
    }

    async saveNotifications() {
        // Save to localStorage as fallback
        localStorage.setItem('kmrl_all_notifications', JSON.stringify(this.notifications));

        // Also save to API if available
        // In a real implementation, you would save individual notifications to the API
    }

    setupNotificationCenter() {
        const center = document.createElement('div');
        center.id = 'notificationCenter';
        center.className = 'notification-center';
        center.style.display = 'none';
        center.innerHTML = `
            <div class="notification-header">
                <h3><i class="fas fa-bell"></i> Notifications</h3>
                <button id="closeNotificationCenter" class="btn-icon">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="notification-list" id="notificationList"></div>
        `;
        document.body.appendChild(center);
        this.addNotificationBell();
        this.setupEvents();
    }

    addNotificationBell() {
        const header = document.querySelector('.header') || document.querySelector('.navbar');
        if (header) {
            const bell = document.createElement('div');
            bell.innerHTML = `
                <button id="notificationBellBtn" class="notification-bell-btn">
                    <i class="fas fa-bell"></i>
                    <span class="notification-count" id="notificationCount">0</span>
                </button>
            `;
            header.appendChild(bell);
        }
    }

    setupEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('#notificationBellBtn')) {
                this.toggleNotificationCenter();
            }
            if (e.target.id === 'closeNotificationCenter') {
                this.closeNotificationCenter();
            }
        });
    }

    async createNotification(options) {
        const notification = {
            id: 'notif_' + Date.now(),
            type: options.type || 'info',
            title: options.title,
            message: options.message,
            category: options.category || 'system',
            priority: options.priority || 'medium',
            data: options.data || {},
            channels: options.channels || ['dashboard'],
            created: new Date().toISOString(),
            read: false
        };

        this.notifications.unshift(notification);
        this.saveNotifications();
        this.processNotification(notification);

        // Save to API if available
        if (window.apiClient) {
            try {
                await window.apiClient.createNotification(notification);
            } catch (error) {
                console.error('Error saving notification to API:', error);
            }
        }

        return notification;
    }

    processNotification(notification) {
        if (notification.channels.includes('dashboard')) {
            this.showDashboardNotification(notification);
        }
        if (notification.channels.includes('email')) {
            this.sendEmailNotification(notification);
        }
        if (notification.channels.includes('push')) {
            this.sendPushNotification(notification);
        }
        this.updateNotificationCount();
    }

    showDashboardNotification(notification) {
        const notif = document.createElement('div');
        notif.className = `dashboard-notification ${notification.priority}-priority`;
        notif.innerHTML = `
            <div class="notification-content">
                <div class="notification-title">${notification.title}</div>
                <div class="notification-message">${notification.message}</div>
            </div>
            <button onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        const container = document.querySelector('.notification-container') ||
            document.querySelector('.tender-notification-container');
        if (container) {
            container.appendChild(notif);
            setTimeout(() => notif.remove(), 5000);
        }
    }

    async sendEmailNotification(notification) {
        // In a real implementation, this would be handled by the backend
        // For now, we'll just log it
        console.log('Email notification would be sent:', notification.title);
    }

    sendPushNotification(notification) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(notification.title, {
                body: notification.message,
                icon: '/favicon.ico'
            });
        }
    }

    startNotificationProcessor() {
        setInterval(() => {
            this.checkDeadlineReminders();
        }, 60000); // Check every minute
    }

    checkDeadlineReminders() {
        if (window.tenderTracker?.tenders) {
            const tenders = window.tenderTracker.tenders;
            const now = new Date();

            tenders.forEach(tender => {
                const deadline = new Date(tender.submissionDeadline);
                const daysUntilDeadline = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

                if ([7, 3, 1].includes(daysUntilDeadline)) {
                    const exists = this.notifications.find(n =>
                        n.data.tenderId === tender.id &&
                        n.type === 'deadline-reminder' &&
                        n.data.reminderType === `${daysUntilDeadline}-day`
                    );

                    if (!exists) {
                        this.createDeadlineReminder(tender, daysUntilDeadline);
                    }
                }
            });
        }
    }

    createDeadlineReminder(tender, days) {
        return this.createNotification({
            type: 'deadline-reminder',
            title: 'Tender Deadline Reminder',
            message: `${tender.title} deadline is in ${days} day(s)`,
            category: 'deadline',
            priority: days <= 1 ? 'urgent' : 'high',
            channels: days <= 1 ? ['dashboard', 'email', 'push'] : ['dashboard', 'email'],
            data: {
                tenderId: tender.id,
                reminderType: `${days}-day`,
                deadline: tender.submissionDeadline
            }
        });
    }

    createTenderNotification(tender, type = 'new-tender') {
        const titles = {
            'new-tender': 'New Tender Found',
            'tender-updated': 'Tender Updated'
        };

        return this.createNotification({
            type: type,
            title: titles[type],
            message: `${tender.title} from ${tender.organization}`,
            category: 'tender',
            priority: tender.priority || 'medium',
            channels: ['dashboard', 'email'],
            data: { tenderId: tender.id }
        });
    }

    toggleNotificationCenter() {
        const center = document.getElementById('notificationCenter');
        if (center) {
            const isVisible = center.style.display !== 'none';
            center.style.display = isVisible ? 'none' : 'block';
            if (!isVisible) this.updateNotificationCenter();
        }
    }

    closeNotificationCenter() {
        document.getElementById('notificationCenter').style.display = 'none';
    }

    updateNotificationCenter() {
        const list = document.getElementById('notificationList');
        if (!list) return;

        const sorted = this.notifications
            .sort((a, b) => new Date(b.created) - new Date(a.created))
            .slice(0, 20);

        list.innerHTML = sorted.length === 0 ?
            '<div class="no-notifications">No notifications</div>' :
            sorted.map(n => this.renderNotificationItem(n)).join('');
    }

    renderNotificationItem(notification) {
        return `
            <div class="notification-item ${notification.read ? 'read' : 'unread'}" 
                 onclick="notificationSystem.markAsRead('${notification.id}')">
                <div class="notification-item-content">
                    <div class="notification-item-title">${notification.title}</div>
                    <div class="notification-item-message">${notification.message}</div>
                    <div class="notification-item-time">${this.getTimeAgo(notification.created)}</div>
                </div>
            </div>
        `;
    }

    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            this.saveNotifications();
            this.updateNotificationCenter();
            this.updateNotificationCount();
        }
    }

    updateNotificationCount() {
        const count = this.notifications.filter(n => !n.read).length;
        const element = document.getElementById('notificationCount');
        if (element) {
            element.textContent = count;
            element.style.display = count > 0 ? 'inline' : 'none';
        }
    }

    getTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMins = Math.floor((now - date) / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        return `${Math.floor(diffMins / 1440)}d ago`;
    }
}

// Initialize notification system
document.addEventListener('DOMContentLoaded', () => {
    window.notificationSystem = new TenderNotificationSystem();
});

// Add basic styles
const style = document.createElement('style');
style.textContent = `
    .notification-bell-btn {
        background: none; border: none; color: #6b7280; font-size: 1.25rem; 
        cursor: pointer; padding: 0.5rem; position: relative;
    }
    .notification-count {
        position: absolute; top: -5px; right: -5px; background: #dc2626; 
        color: white; font-size: 0.75rem; padding: 2px 6px; border-radius: 10px;
    }
    .notification-center {
        position: fixed; top: 60px; right: 20px; width: 400px; max-height: 500px;
        background: white; border: 1px solid #e5e7eb; border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.15); z-index: 9999;
    }
    .notification-header {
        background: #f8fafc; padding: 1rem; border-bottom: 1px solid #e5e7eb;
        display: flex; justify-content: space-between; align-items: center;
    }
    .notification-list { max-height: 400px; overflow-y: auto; }
    .notification-item {
        padding: 1rem; border-bottom: 1px solid #f3f4f6; cursor: pointer;
    }
    .notification-item.unread { background: #eff6ff; }
    .dashboard-notification {
        background: white; border: 1px solid #e5e7eb; border-radius: 8px;
        margin: 1rem; padding: 1rem; display: flex; justify-content: space-between;
    }
    .dashboard-notification.urgent-priority { border-left: 4px solid #dc2626; }
`;
document.head.appendChild(style);
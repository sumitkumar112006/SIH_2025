// API Client for KMRL Tender Tracking System

class APIClient {
    constructor() {
        this.baseURL = 'http://localhost:3000/api';
        this.socket = io('http://localhost:3000');
        this.setupSocketListeners();
    }

    setupSocketListeners() {
        this.socket.on('new-tender', (tender) => {
            if (window.tenderTracker) {
                window.tenderTracker.tenders.push(tender);
                window.tenderTracker.updateWidgetStats();
                window.tenderTracker.renderTenderList();
            }

            if (window.notificationSystem) {
                window.notificationSystem.createNotification({
                    type: 'new-tender',
                    title: 'New Tender Found',
                    message: `${tender.title} from ${tender.organization}`,
                    category: 'tender',
                    priority: tender.priority || 'medium',
                    channels: ['dashboard', 'email'],
                    data: { tenderId: tender.id }
                });
            }
        });

        this.socket.on('new-notification', (notification) => {
            if (window.notificationSystem) {
                // Add to notifications list
                window.notificationSystem.notifications.unshift(notification);
                window.notificationSystem.saveNotifications();
                window.notificationSystem.updateNotificationCount();

                // Show dashboard notification
                if (notification.channels.includes('dashboard')) {
                    window.notificationSystem.showDashboardNotification(notification);
                }
            }
        });
    }

    async getTenders() {
        try {
            const response = await fetch(`${this.baseURL}/tenders`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching tenders:', error);
            return [];
        }
    }

    async createTender(tender) {
        try {
            const response = await fetch(`${this.baseURL}/tenders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(tender),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating tender:', error);
            return null;
        }
    }

    async getNotifications() {
        try {
            const response = await fetch(`${this.baseURL}/notifications`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    }

    async createNotification(notification) {
        try {
            const response = await fetch(`${this.baseURL}/notifications`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(notification),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating notification:', error);
            return null;
        }
    }

    async getPortals() {
        try {
            const response = await fetch(`${this.baseURL}/portals`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching portals:', error);
            return [];
        }
    }

    async updatePortal(portalId, portalData) {
        try {
            const response = await fetch(`${this.baseURL}/portals/${portalId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(portalData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating portal:', error);
            return null;
        }
    }

    async startMonitoring() {
        try {
            const response = await fetch(`${this.baseURL}/monitoring/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error starting monitoring:', error);
            return null;
        }
    }

    async stopMonitoring() {
        try {
            const response = await fetch(`${this.baseURL}/monitoring/stop`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error stopping monitoring:', error);
            return null;
        }
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
}

// Initialize API client
document.addEventListener('DOMContentLoaded', () => {
    window.apiClient = new APIClient();
});
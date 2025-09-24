// KMRL Authorization & Role-Based Access Control System

class AuthorizationManager {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.permissions = this.initializePermissions();
        this.init();
    }

    init() {
        // For testing purposes, we'll allow the dashboard to load without authentication
        const currentPath = window.location.pathname;
        const isDashboard = currentPath.includes('dashboard.html');

        // Only redirect to login if not on dashboard or if we're in a production environment
        if (!this.currentUser && !isDashboard) {
            // Check if we're in a testing environment
            const isTesting = localStorage.getItem('kmrl_testing_mode') === 'true';

            if (!isTesting) {
                this.redirectToLogin();
                return;
            }
        }

        this.enforceUIRestrictions();
        this.setupAPIValidation();
        this.setupEventInterception();
        this.addCustomStyles();
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

    initializePermissions() {
        return {
            admin: {
                documents: ['view', 'create', 'edit', 'delete', 'approve', 'reject'],
                users: ['view', 'create', 'edit', 'delete', 'reset_password'],
                system: ['configure', 'backup', 'restore', 'logs'],
                workflows: ['view', 'create', 'edit', 'delete'],
                analytics: ['view_all_departments', 'export'],
                notifications: ['send_all', 'manage']
            },
            manager: {
                documents: ['view_department', 'approve', 'reject'],
                users: ['view_department'],
                system: [],
                workflows: ['view_department'],
                analytics: ['view_department'],
                notifications: ['send_department']
            },
            staff: {
                documents: ['view_own', 'create'],
                users: [],
                system: [],
                workflows: [],
                analytics: ['view_own'],
                notifications: ['receive']
            }
        };
    }

    // Check if user has specific permission
    hasPermission(category, action) {
        // For testing purposes, if no user is logged in, assume staff permissions
        const user = this.currentUser || { role: 'staff' };

        const userPermissions = this.permissions[user.role];
        if (!userPermissions || !userPermissions[category]) return false;

        return userPermissions[category].includes(action);
    }

    // Check if user can access specific document
    canAccessDocument(document) {
        // For testing purposes, if no user is logged in, assume staff permissions
        const user = this.currentUser || { role: 'staff' };

        const role = user.role;

        switch (role) {
            case 'admin':
                return true; // Admin can access all documents

            case 'manager':
                // Manager can access documents from their department
                if (document.department) {
                    return document.department === user.department;
                }
                // For documents without department, check uploader's department
                const uploader = this.getUserByName(document.uploadedBy);
                return uploader && uploader.department === user.department;

            case 'staff':
                // Staff can only access their own documents
                return document.uploadedBy === user.name ||
                    document.uploadedBy === user.id;

            default:
                return false;
        }
    }

    getUserByName(name) {
        try {
            const users = JSON.parse(localStorage.getItem('kmrl_users') || '[]');
            return users.find(user => user.name === name || user.id === name);
        } catch (error) {
            console.error('Error getting user:', error);
            return null;
        }
    }

    // Enforce UI restrictions based on role
    enforceUIRestrictions() {
        // For testing purposes, if no user is logged in, assume staff permissions
        const user = this.currentUser || { role: 'staff' };
        const role = user.role;

        this.hideUnauthorizedButtons(role);
        this.disableUnauthorizedActions(role);
        this.filterDocumentActions();
        this.setupMutationObserver();
    }

    hideUnauthorizedButtons(role) {
        // Hide admin-only elements
        if (role !== 'admin') {
            document.querySelectorAll('.admin-only, [data-auth="admin"]').forEach(el => {
                el.style.display = 'none';
                el.setAttribute('data-auth-hidden', 'true');
            });
        }

        // Hide manager-only elements
        if (!['admin', 'manager'].includes(role)) {
            document.querySelectorAll('.manager-only, [data-auth="manager"]').forEach(el => {
                el.style.display = 'none';
                el.setAttribute('data-auth-hidden', 'true');
            });
        }

        // Hide bulk actions for staff
        if (role === 'staff') {
            document.querySelectorAll('.bulk-actions').forEach(el => {
                el.style.display = 'none';
                el.setAttribute('data-auth-hidden', 'true');
            });
        }

        // Hide user management for non-admins
        if (role !== 'admin') {
            document.querySelectorAll('[data-action="user-management"]').forEach(el => {
                el.style.display = 'none';
                el.setAttribute('data-auth-hidden', 'true');
            });
        }
    }

    disableUnauthorizedActions(role) {
        // Disable delete buttons for staff and managers
        if (role !== 'admin') {
            document.querySelectorAll('.action-delete, [data-action="delete"]').forEach(btn => {
                btn.disabled = true;
                btn.classList.add('auth-disabled');
                btn.title = 'You do not have permission to delete documents';
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
            });
        }

        // Disable approve/reject buttons for staff
        if (role === 'staff') {
            document.querySelectorAll('.action-approve, .action-reject, [data-action="approve"], [data-action="reject"]').forEach(btn => {
                btn.disabled = true;
                btn.classList.add('auth-disabled');
                btn.title = 'You do not have permission to approve/reject documents';
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
            });
        }

        // Disable system settings for non-admins
        if (role !== 'admin') {
            document.querySelectorAll('[data-action="system-settings"]').forEach(btn => {
                btn.disabled = true;
                btn.classList.add('auth-disabled');
                btn.title = 'Administrator access required';
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
            });
        }
    }

    filterDocumentActions() {
        // This will be called when documents are loaded to filter actions per document
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => this.updateDocumentActions(), 100);
        });
    }

    updateDocumentActions() {
        document.querySelectorAll('[data-doc-id]').forEach(element => {
            const docId = element.getAttribute('data-doc-id');
            if (!docId) return;

            // For testing purposes, if no user is logged in, assume staff permissions
            const user = this.currentUser || { role: 'staff' };

            // Get document
            const documents = JSON.parse(localStorage.getItem('kmrl_documents') || '[]');
            const document = documents.find(doc => doc.id === docId);

            if (!document) return;

            // Check permissions
            const canApprove = user.role === 'admin' || (user.role === 'manager' && this.canAccessDocument(document));
            const canDelete = user.role === 'admin';
            const canEdit = user.role === 'admin' || (user.role === 'staff' && document.status === 'pending' &&
                (document.uploadedBy === user.name || document.uploadedBy === user.id));

            // Update UI based on permissions
            if (!canApprove) {
                element.querySelectorAll('.action-approve, .action-reject').forEach(btn => {
                    btn.disabled = true;
                    btn.style.opacity = '0.5';
                    btn.style.cursor = 'not-allowed';
                });
            }

            if (!canDelete) {
                element.querySelectorAll('.action-delete').forEach(btn => {
                    btn.disabled = true;
                    btn.style.opacity = '0.5';
                    btn.style.cursor = 'not-allowed';
                });
            }

            if (!canEdit) {
                element.querySelectorAll('.action-edit').forEach(btn => {
                    btn.disabled = true;
                    btn.style.opacity = '0.5';
                    btn.style.cursor = 'not-allowed';
                });
            }
        });
    }

    setupMutationObserver() {
        // Watch for dynamically added elements and apply authorization
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if this is a document row or action button
                        if (node.hasAttribute('data-doc-id') || node.querySelector('[data-doc-id]')) {
                            setTimeout(() => this.updateDocumentActions(), 100);
                        }
                    }
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    addCustomStyles() {
        // Add custom styles for authorization indicators
        if (!document.getElementById('auth-styles')) {
            const style = document.createElement('style');
            style.id = 'auth-styles';
            style.textContent = `
                .auth-disabled {
                    pointer-events: none !important;
                }
                [data-auth-hidden] {
                    display: none !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    redirectToLogin() {
        // Only redirect if we're not already on the login page
        if (!window.location.pathname.includes('login.html') &&
            !window.location.pathname.includes('index.html')) {
            window.location.href = 'login.html';
        }
    }

    // Export commonly used functions globally
    static hasPermission(category, action) {
        if (typeof window.authorizationManager !== 'undefined') {
            return window.authorizationManager.hasPermission(category, action);
        }
        // Default to true for testing
        return true;
    }

    static canAccessDocument(document) {
        if (typeof window.authorizationManager !== 'undefined') {
            return window.authorizationManager.canAccessDocument(document);
        }
        // Default to true for testing
        return true;
    }
}

// Initialize authorization manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authorizationManager = new AuthorizationManager();
});

// Export functions globally
window.hasPermission = (category, action) => {
    if (window.authorizationManager) {
        return window.authorizationManager.hasPermission(category, action);
    }
    // Default to true for testing
    return true;
};

window.canAccessDocument = (document) => {
    if (window.authorizationManager) {
        return window.authorizationManager.canAccessDocument(document);
    }
    // Default to true for testing
    return true;
};

// KMRL Authorization & Role-Based Access Control System

class AuthorizationManager {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.permissions = this.initializePermissions();
        this.init();
    }

    init() {
        if (!this.currentUser) {
            this.redirectToLogin();
            return;
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
        if (!this.currentUser) return false;

        const userPermissions = this.permissions[this.currentUser.role];
        if (!userPermissions || !userPermissions[category]) return false;

        return userPermissions[category].includes(action);
    }

    // Check if user can access specific document
    canAccessDocument(document) {
        if (!this.currentUser) return false;

        const role = this.currentUser.role;

        switch (role) {
            case 'admin':
                return true; // Admin can access all documents

            case 'manager':
                // Manager can access documents from their department
                if (document.department) {
                    return document.department === this.currentUser.department;
                }
                // For documents without department, check uploader's department
                const uploader = this.getUserByName(document.uploadedBy);
                return uploader && uploader.department === this.currentUser.department;

            case 'staff':
                // Staff can only access their own documents
                return document.uploadedBy === this.currentUser.name ||
                    document.uploadedBy === this.currentUser.id;

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
        this.hideUnauthorizedButtons();
        this.disableUnauthorizedActions();
        this.filterDocumentActions();
        this.setupMutationObserver();
    }

    hideUnauthorizedButtons() {
        const role = this.currentUser.role;

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

    disableUnauthorizedActions() {
        // Disable delete buttons for staff and managers
        if (this.currentUser.role !== 'admin') {
            document.querySelectorAll('.action-delete, [data-action="delete"]').forEach(btn => {
                btn.disabled = true;
                btn.classList.add('auth-disabled');
                btn.title = 'You do not have permission to delete documents';
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
            });
        }

        // Disable approve/reject buttons for staff
        if (this.currentUser.role === 'staff') {
            document.querySelectorAll('.action-approve, .action-reject, [data-action="approve"], [data-action="reject"]').forEach(btn => {
                btn.disabled = true;
                btn.classList.add('auth-disabled');
                btn.title = 'You do not have permission to approve/reject documents';
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
            });
        }

        // Disable system settings for non-admins
        if (this.currentUser.role !== 'admin') {
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

            const documents = JSON.parse(localStorage.getItem('kmrl_documents') || '[]');
            const document = documents.find(doc => doc.id === docId);

            if (!document) return;

            // Check if user can access this document
            if (!this.canAccessDocument(document)) {
                element.style.display = 'none';
                return;
            }

            // Filter action buttons within this document element
            const actionButtons = element.querySelectorAll('.action-btn, [data-action]');
            actionButtons.forEach(btn => {
                const action = btn.getAttribute('data-action') ||
                    btn.className.match(/action-(\w+)/)?.[1];

                if (!action) return;

                if (!this.canPerformDocumentAction(action, document)) {
                    btn.disabled = true;
                    btn.classList.add('auth-disabled');
                    btn.style.opacity = '0.5';
                    btn.style.cursor = 'not-allowed';
                    btn.title = 'You do not have permission for this action';
                }
            });
        });
    }

    canPerformDocumentAction(action, document) {
        const role = this.currentUser.role;

        switch (action) {
            case 'delete':
                return role === 'admin';

            case 'approve':
            case 'reject':
                return ['admin', 'manager'].includes(role) && this.canAccessDocument(document);

            case 'edit':
                return role === 'admin' ||
                    (role === 'staff' && document.uploadedBy === this.currentUser.name);

            case 'view':
            case 'download':
                return this.canAccessDocument(document);

            default:
                return false;
        }
    }

    // Setup mutation observer to catch dynamically added elements
    setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        this.processNewElement(node);
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    processNewElement(element) {
        // Apply restrictions to newly added elements
        if (element.classList?.contains('admin-only') && this.currentUser.role !== 'admin') {
            element.style.display = 'none';
        }

        if (element.classList?.contains('manager-only') &&
            !['admin', 'manager'].includes(this.currentUser.role)) {
            element.style.display = 'none';
        }

        // Process action buttons in the new element
        const actionButtons = element.querySelectorAll?.('.action-btn, [data-action]') || [];
        actionButtons.forEach(btn => {
            this.applyButtonRestrictions(btn);
        });
    }

    applyButtonRestrictions(button) {
        const action = button.getAttribute('data-action') ||
            button.className.match(/action-(\w+)/)?.[1];

        if (!action) return;

        // Apply role-based restrictions
        if (action === 'delete' && this.currentUser.role !== 'admin') {
            this.disableButton(button, 'Administrator access required');
        }

        if (['approve', 'reject'].includes(action) && this.currentUser.role === 'staff') {
            this.disableButton(button, 'You cannot approve/reject documents');
        }
    }

    disableButton(button, reason) {
        button.disabled = true;
        button.classList.add('auth-disabled');
        button.style.opacity = '0.5';
        button.style.cursor = 'not-allowed';
        button.title = reason;
    }

    // Setup API validation and interception
    setupAPIValidation() {
        this.interceptGlobalFunctions();
        this.setupFormValidation();
    }

    interceptGlobalFunctions() {
        // Intercept document actions
        this.wrapFunction('deleteDocument', this.validateDeleteDocument.bind(this));
        this.wrapFunction('approveDocument', this.validateApproveDocument.bind(this));
        this.wrapFunction('rejectDocument', this.validateRejectDocument.bind(this));

        // Intercept admin functions if they exist
        if (window.adminPanel) {
            this.wrapMethod(window.adminPanel, 'deleteUser', this.validateUserAction.bind(this));
            this.wrapMethod(window.adminPanel, 'addUser', this.validateUserAction.bind(this));
            this.wrapMethod(window.adminPanel, 'editUser', this.validateUserAction.bind(this));
        }
    }

    wrapFunction(functionName, validator) {
        const originalFunction = window[functionName];
        if (typeof originalFunction === 'function') {
            window[functionName] = (...args) => {
                if (validator(...args)) {
                    return originalFunction.apply(this, args);
                }
            };
        }
    }

    wrapMethod(object, methodName, validator) {
        const originalMethod = object[methodName];
        if (typeof originalMethod === 'function') {
            object[methodName] = (...args) => {
                if (validator(...args)) {
                    return originalMethod.apply(object, args);
                }
            };
        }
    }

    // Validation functions for different actions
    validateDeleteDocument(docId) {
        if (this.currentUser.role !== 'admin') {
            this.showUnauthorizedError('Only administrators can delete documents');
            return false;
        }
        return true;
    }

    validateApproveDocument(docId) {
        if (!['admin', 'manager'].includes(this.currentUser.role)) {
            this.showUnauthorizedError('You do not have permission to approve documents');
            return false;
        }

        // Additional check for managers - department access
        if (this.currentUser.role === 'manager') {
            const documents = JSON.parse(localStorage.getItem('kmrl_documents') || '[]');
            const document = documents.find(doc => doc.id === docId);

            if (document && !this.canAccessDocument(document)) {
                this.showUnauthorizedError('You can only approve documents from your department');
                return false;
            }
        }

        return true;
    }

    validateRejectDocument(docId) {
        return this.validateApproveDocument(docId); // Same rules as approve
    }

    validateUserAction() {
        if (this.currentUser.role !== 'admin') {
            this.showUnauthorizedError('Only administrators can manage users');
            return false;
        }
        return true;
    }

    setupFormValidation() {
        document.addEventListener('submit', (e) => {
            const form = e.target;

            // Validate user management forms
            if (form.id === 'addUserForm' || form.id === 'editUserForm') {
                if (!this.validateUserAction()) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
        });
    }

    // Setup event interception for unauthorized clicks
    setupEventInterception() {
        document.addEventListener('click', (e) => {
            const target = e.target.closest('button, a');
            if (!target) return;

            // Check if element is disabled by authorization
            if (target.classList.contains('auth-disabled')) {
                e.preventDefault();
                e.stopPropagation();
                this.showUnauthorizedError(target.title || 'You do not have permission for this action');
                return;
            }

            // Check specific actions
            const action = target.getAttribute('data-action');
            if (action && !this.validateAction(action, target)) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, true); // Use capture phase to intercept early
    }

    validateAction(action, element) {
        switch (action) {
            case 'delete':
                if (this.currentUser.role !== 'admin') {
                    this.showUnauthorizedError('Only administrators can delete items');
                    return false;
                }
                break;

            case 'user-management':
                if (this.currentUser.role !== 'admin') {
                    this.showUnauthorizedError('User management requires administrator privileges');
                    return false;
                }
                break;

            case 'system-settings':
                if (this.currentUser.role !== 'admin') {
                    this.showUnauthorizedError('System settings require administrator privileges');
                    return false;
                }
                break;
        }

        return true;
    }

    showUnauthorizedError(message) {
        if (window.showNotification) {
            window.showNotification(message, 'error');
        } else {
            alert('Access Denied: ' + message);
        }

        // Log unauthorized access attempt
        this.logUnauthorizedAccess(message);
    }

    logUnauthorizedAccess(action) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            user: this.currentUser.name,
            role: this.currentUser.role,
            action: action,
            ip: 'localhost', // In real app, get actual IP
            userAgent: navigator.userAgent
        };

        // Store in security log
        const securityLog = JSON.parse(localStorage.getItem('kmrl_security_log') || '[]');
        securityLog.push(logEntry);

        // Keep only last 1000 entries
        if (securityLog.length > 1000) {
            securityLog.splice(0, securityLog.length - 1000);
        }

        localStorage.setItem('kmrl_security_log', JSON.stringify(securityLog));

        console.warn('Unauthorized access attempt:', logEntry);
    }

    redirectToLogin() {
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
        }
    }

    addCustomStyles() {
        const style = document.createElement('style');
        style.textContent = `
        .auth-disabled {
            opacity: 0.5 !important;
            cursor: not-allowed !important;
            pointer-events: none !important;
        }

        .auth-hidden {
            display: none !important;
        }

        .unauthorized-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            font-size: 1.5rem;
        }

        .permission-indicator {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            margin-left: 4px;
        }

        .permission-granted {
            background: #059669;
        }

        .permission-denied {
            background: #dc2626;
        }
        `;

        document.head.appendChild(style);
    }

    // Public method to check permissions (for use by other modules)
    static hasPermission(category, action) {
        if (window.authManager) {
            return window.authManager.hasPermission(category, action);
        }
        return false;
    }

    // Public method to check document access
    static canAccessDocument(document) {
        if (window.authManager) {
            return window.authManager.canAccessDocument(document);
        }
        return false;
    }
}

// Initialize authorization manager
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthorizationManager();
});

// Export for module use
window.AuthorizationManager = AuthorizationManager;
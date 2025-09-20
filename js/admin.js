// KMRL Document Management System - Admin Panel JavaScript

class AdminManager {
    constructor() {
        this.init();
        this.loadAdminData();
        this.setupEventListeners();
        this.startSystemMonitoring();
    }

    init() {
        // Initialize admin panel
        this.currentUser = this.getCurrentUser();
        this.setupAdminAuthentication();
        this.initializeAdminUI();
        this.setupModals();
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

    setupAdminAuthentication() {
        // Verify admin access
        if (!this.currentUser || this.currentUser.role !== 'admin') {
            window.showNotification('Access denied. Admin privileges required.', 'error');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
            return;
        }
    }

    initializeAdminUI() {
        // Initialize all admin UI components
        this.initializeUserManagement();
        this.initializeSystemStatus();
        this.initializeDocumentOversight();
        this.initializeWorkflowManagement();
        this.initializeSystemSettings();
    }

    setupEventListeners() {
        // User Management Events
        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-user-btn')) {
                this.showAddUserModal();
            }
            if (e.target.closest('.edit-user-btn')) {
                const userId = e.target.closest('.edit-user-btn').dataset.userId;
                this.showEditUserModal(userId);
            }
            if (e.target.closest('.delete-user-btn')) {
                const userId = e.target.closest('.delete-user-btn').dataset.userId;
                this.deleteUser(userId);
            }
            if (e.target.closest('.reset-password-btn')) {
                const userId = e.target.closest('.reset-password-btn').dataset.userId;
                this.resetUserPassword(userId);
            }
        });

        // Document Oversight Events
        document.addEventListener('click', (e) => {
            if (e.target.closest('.approve-doc-btn')) {
                const docId = e.target.closest('.approve-doc-btn').dataset.docId;
                this.approveDocument(docId);
            }
            if (e.target.closest('.reject-doc-btn')) {
                const docId = e.target.closest('.reject-doc-btn').dataset.docId;
                this.rejectDocument(docId);
            }
            if (e.target.closest('.view-doc-history-btn')) {
                const docId = e.target.closest('.view-doc-history-btn').dataset.docId;
                this.showDocumentHistory(docId);
            }
        });

        // System Settings Events
        document.addEventListener('click', (e) => {
            if (e.target.closest('.system-settings-btn')) {
                this.showSystemSettings();
            }
            if (e.target.closest('.backup-btn')) {
                this.performBackup();
            }
            if (e.target.closest('.restore-btn')) {
                this.showRestoreModal();
            }
            if (e.target.closest('.send-notification-btn')) {
                this.showNotificationModal();
            }
        });

        // Form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'addUserForm') {
                e.preventDefault();
                this.handleAddUser(e.target);
            }
            if (e.target.id === 'editUserForm') {
                e.preventDefault();
                this.handleEditUser(e.target);
            }
            if (e.target.id === 'systemSettingsForm') {
                e.preventDefault();
                this.handleSystemSettings(e.target);
            }
            if (e.target.id === 'workflowForm') {
                e.preventDefault();
                this.handleWorkflowConfiguration(e.target);
            }
            if (e.target.id === 'notificationForm') {
                e.preventDefault();
                this.handleSendNotification(e.target);
            }
        });
    }

    async loadAdminData() {
        try {
            // Show loading state
            this.showLoadingState();

            // Load all admin data
            const [users, documents, systemStats, logs] = await Promise.all([
                this.loadUsers(),
                this.loadDocuments(),
                this.loadSystemStatistics(),
                this.loadSystemLogs()
            ]);

            // Update UI with loaded data
            this.updateUserTable(users);
            this.updateDocumentOversight(documents);
            this.updateSystemStatistics(systemStats);
            this.updateSystemLogs(logs);

            // Hide loading state
            this.hideLoadingState();

        } catch (error) {
            console.error('Error loading admin data:', error);
            this.showError('Failed to load admin data');
        }
    }

    // User Management Functions
    async loadUsers() {
        await this.delay(800);

        let users = JSON.parse(localStorage.getItem('kmrl_users') || '[]');

        if (users.length === 0) {
            users = this.generateSampleUsers();
            localStorage.setItem('kmrl_users', JSON.stringify(users));
        }

        return users;
    }

    generateSampleUsers() {
        return [
            {
                id: 'user_1',
                name: 'Admin User',
                email: 'admin@kmrl.com',
                role: 'admin',
                status: 'active',
                lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                createdAt: '2024-01-01T00:00:00Z',
                department: 'IT',
                permissions: ['all']
            },
            {
                id: 'user_2',
                name: 'Manager User',
                email: 'manager@kmrl.com',
                role: 'manager',
                status: 'active',
                lastLogin: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
                createdAt: '2024-01-02T00:00:00Z',
                department: 'Operations',
                permissions: ['read', 'write', 'approve']
            },
            {
                id: 'user_3',
                name: 'Staff User',
                email: 'staff@kmrl.com',
                role: 'staff',
                status: 'active',
                lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                createdAt: '2024-01-03T00:00:00Z',
                department: 'Finance',
                permissions: ['read', 'write']
            },
            {
                id: 'user_4',
                name: 'John Doe',
                email: 'john.doe@kmrl.com',
                role: 'staff',
                status: 'inactive',
                lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                createdAt: '2024-01-04T00:00:00Z',
                department: 'HR',
                permissions: ['read']
            }
        ];
    }

    updateUserTable(users) {
        const tbody = document.querySelector('.users-table tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="user-info">
                        <div class="user-avatar">${this.getInitials(user.name)}</div>
                        <div class="user-details">
                            <h4>${user.name}</h4>
                            <p>${user.email}</p>
                            <small class="text-muted">${user.department}</small>
                        </div>
                    </div>
                </td>
                <td><span class="role-badge role-${user.role}">${this.capitalizeFirst(user.role)}</span></td>
                <td><span class="status-badge status-${user.status}">${this.capitalizeFirst(user.status)}</span></td>
                <td>${this.formatRelativeTime(user.lastLogin)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit edit-user-btn" data-user-id="${user.id}" title="Edit User">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn warning reset-password-btn" data-user-id="${user.id}" title="Reset Password">
                            <i class="fas fa-key"></i>
                        </button>
                        ${user.role !== 'admin' ? `
                        <button class="action-btn delete delete-user-btn" data-user-id="${user.id}" title="Delete User">
                            <i class="fas fa-trash"></i>
                        </button>` : ''}
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    showAddUserModal() {
        const modal = this.createUserModal('add');
        document.body.appendChild(modal);
        modal.classList.add('show');
    }

    showEditUserModal(userId) {
        const users = JSON.parse(localStorage.getItem('kmrl_users') || '[]');
        const user = users.find(u => u.id === userId);
        if (!user) return;

        const modal = this.createUserModal('edit', user);
        document.body.appendChild(modal);
        modal.classList.add('show');
    }

    createUserModal(mode, user = null) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">${mode === 'add' ? 'Add New User' : 'Edit User'}</h3>
                        <button type="button" class="close" onclick="this.closest('.modal').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="${mode}UserForm">
                            ${user ? `<input type="hidden" name="userId" value="${user.id}">` : ''}
                            <div class="form-group">
                                <label class="form-label">Full Name</label>
                                <input type="text" class="form-control" name="name" value="${user?.name || ''}" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Email</label>
                                <input type="email" class="form-control" name="email" value="${user?.email || ''}" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Role</label>
                                <select class="form-control" name="role" required>
                                    <option value="staff" ${user?.role === 'staff' ? 'selected' : ''}>Staff</option>
                                    <option value="manager" ${user?.role === 'manager' ? 'selected' : ''}>Manager</option>
                                    <option value="admin" ${user?.role === 'admin' ? 'selected' : ''}>Admin</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Department</label>
                                <select class="form-control" name="department" required>
                                    <option value="IT" ${user?.department === 'IT' ? 'selected' : ''}>IT</option>
                                    <option value="Operations" ${user?.department === 'Operations' ? 'selected' : ''}>Operations</option>
                                    <option value="Finance" ${user?.department === 'Finance' ? 'selected' : ''}>Finance</option>
                                    <option value="HR" ${user?.department === 'HR' ? 'selected' : ''}>HR</option>
                                    <option value="Legal" ${user?.department === 'Legal' ? 'selected' : ''}>Legal</option>
                                    <option value="Marketing" ${user?.department === 'Marketing' ? 'selected' : ''}>Marketing</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Status</label>
                                <select class="form-control" name="status" required>
                                    <option value="active" ${user?.status === 'active' ? 'selected' : ''}>Active</option>
                                    <option value="inactive" ${user?.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                                </select>
                            </div>
                            ${mode === 'add' ? `
                            <div class="form-group">
                                <label class="form-label">Password</label>
                                <input type="password" class="form-control" name="password" required minlength="6">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Confirm Password</label>
                                <input type="password" class="form-control" name="confirmPassword" required minlength="6">
                            </div>` : ''}
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                        <button type="submit" form="${mode}UserForm" class="btn btn-primary">
                            ${mode === 'add' ? 'Add User' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        `;

        return modal;
    }

    // Utility Functions
    getInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    formatRelativeTime(date) {
        if (!date) return 'Never';
        const now = new Date();
        const then = new Date(date);
        const diff = now - then;

        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return 'Just now';
    }

    formatDateTime(date) {
        if (!date) return 'N/A';
        return new Date(date).toLocaleString();
    }

    formatFileSize(bytes) {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    showLoadingState() {
        // Show loading indicators
    }

    hideLoadingState() {
        // Hide loading indicators
    }

    showError(message) {
        if (window.showNotification) {
            window.showNotification(message, 'error');
        }
    }

    async handleAddUser(form) {
        const formData = new FormData(form);
        const userData = Object.fromEntries(formData);

        // Validate passwords match
        if (userData.password !== userData.confirmPassword) {
            window.showNotification('Passwords do not match', 'error');
            return;
        }

        try {
            // Create new user
            const newUser = {
                id: 'user_' + Date.now(),
                name: userData.name,
                email: userData.email,
                role: userData.role,
                department: userData.department,
                status: userData.status,
                createdAt: new Date().toISOString(),
                lastLogin: null,
                permissions: this.getDefaultPermissions(userData.role)
            };

            // Add to users list
            const users = JSON.parse(localStorage.getItem('kmrl_users') || '[]');
            users.push(newUser);
            localStorage.setItem('kmrl_users', JSON.stringify(users));

            // Update UI
            this.updateUserTable(users);
            form.closest('.modal').remove();

            window.showNotification('User added successfully', 'success');
            this.logActivity('User Management', `Added new user: ${newUser.name}`);

        } catch (error) {
            console.error('Error adding user:', error);
            window.showNotification('Failed to add user', 'error');
        }
    }

    async handleEditUser(form) {
        const formData = new FormData(form);
        const userData = Object.fromEntries(formData);

        try {
            // Update user
            const users = JSON.parse(localStorage.getItem('kmrl_users') || '[]');
            const userIndex = users.findIndex(u => u.id === userData.userId);

            if (userIndex !== -1) {
                users[userIndex] = {
                    ...users[userIndex],
                    name: userData.name,
                    email: userData.email,
                    role: userData.role,
                    department: userData.department,
                    status: userData.status,
                    permissions: this.getDefaultPermissions(userData.role)
                };

                localStorage.setItem('kmrl_users', JSON.stringify(users));
                this.updateUserTable(users);
                form.closest('.modal').remove();

                window.showNotification('User updated successfully', 'success');
                this.logActivity('User Management', `Updated user: ${users[userIndex].name}`);
            }

        } catch (error) {
            console.error('Error editing user:', error);
            window.showNotification('Failed to update user', 'error');
        }
    }

    async deleteUser(userId) {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        try {
            const users = JSON.parse(localStorage.getItem('kmrl_users') || '[]');
            const userIndex = users.findIndex(u => u.id === userId);

            if (userIndex !== -1) {
                const deletedUser = users[userIndex];
                users.splice(userIndex, 1);
                localStorage.setItem('kmrl_users', JSON.stringify(users));
                this.updateUserTable(users);

                window.showNotification('User deleted successfully', 'success');
                this.logActivity('User Management', `Deleted user: ${deletedUser.name}`);
            }

        } catch (error) {
            console.error('Error deleting user:', error);
            window.showNotification('Failed to delete user', 'error');
        }
    }

    async resetUserPassword(userId) {
        if (!confirm('Are you sure you want to reset this user\'s password?')) {
            return;
        }

        try {
            const users = JSON.parse(localStorage.getItem('kmrl_users') || '[]');
            const user = users.find(u => u.id === userId);

            if (user) {
                // Generate temporary password
                const tempPassword = this.generateTempPassword();

                // In a real system, you would hash the password and send it securely
                window.showNotification(`Password reset for ${user.name}. Temporary password: ${tempPassword}`, 'info', 10000);
                this.logActivity('User Management', `Reset password for user: ${user.name}`);
            }

        } catch (error) {
            console.error('Error resetting password:', error);
            window.showNotification('Failed to reset password', 'error');
        }
    }

    getDefaultPermissions(role) {
        const permissions = {
            admin: ['all'],
            manager: ['read', 'write', 'approve', 'delete'],
            staff: ['read', 'write']
        };
        return permissions[role] || ['read'];
    }

    generateTempPassword() {
        return Math.random().toString(36).slice(-8).toUpperCase();
    }

    // Document Management Functions
    async loadDocuments() {
        await this.delay(600);

        let documents = JSON.parse(localStorage.getItem('kmrl_documents') || '[]');

        if (documents.length === 0) {
            documents = this.generateSampleDocuments();
            localStorage.setItem('kmrl_documents', JSON.stringify(documents));
        }

        return documents;
    }

    generateSampleDocuments() {
        return [
            {
                id: 'doc_1',
                title: 'Financial Report Q4 2024',
                category: 'financial',
                files: [{ name: 'financial_report_q4.pdf', size: 2048000, type: 'application/pdf' }],
                uploadedAt: '2024-01-15T10:30:00Z',
                uploadedBy: 'Manager User',
                status: 'pending',
                downloads: 0,
                views: 5,
                keyPoints: ['Revenue increased by 15%', 'Expenses controlled within budget', 'Profit margin improved'],
                summary: 'Quarterly financial performance showing positive growth trends.'
            },
            {
                id: 'doc_2',
                title: 'Employee Handbook 2024',
                category: 'hr',
                files: [{ name: 'employee_handbook.docx', size: 1536000 }],
                uploadedAt: '2024-01-10T14:20:00Z',
                uploadedBy: 'HR Manager',
                status: 'approved',
                downloads: 25,
                views: 67,
                keyPoints: ['Updated policies', 'New benefit structure'],
                summary: 'Comprehensive guide for all employees.'
            }
        ];
    }

    updateDocumentOversight(documents) {
        const pendingDocs = documents.filter(doc => doc.status === 'pending');
        this.updatePendingDocuments(pendingDocs);
    }

    updatePendingDocuments(pendingDocs) {
        const container = document.getElementById('pendingDocuments');
        if (!container) return;

        container.innerHTML = '';

        if (pendingDocs.length === 0) {
            container.innerHTML = '<p class="text-muted">No pending documents</p>';
            return;
        }

        pendingDocs.forEach(doc => {
            const docElement = document.createElement('div');
            docElement.className = 'pending-doc-item';
            docElement.innerHTML = `
                <div class="doc-info">
                    <h6>${doc.title}</h6>
                    <p class="text-muted">Uploaded by ${doc.uploadedBy} • ${this.formatRelativeTime(doc.uploadedAt)}</p>
                    <small>${doc.summary || 'No summary available'}</small>
                </div>
                <div class="doc-actions">
                    <button class="btn btn-success btn-sm approve-doc-btn" data-doc-id="${doc.id}">
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button class="btn btn-danger btn-sm reject-doc-btn" data-doc-id="${doc.id}">
                        <i class="fas fa-times"></i> Reject
                    </button>
                    <button class="btn btn-secondary btn-sm view-doc-history-btn" data-doc-id="${doc.id}">
                        <i class="fas fa-history"></i> History
                    </button>
                </div>
            `;
            container.appendChild(docElement);
        });
    }

    async approveDocument(docId) {
        try {
            const documents = JSON.parse(localStorage.getItem('kmrl_documents') || '[]');
            const docIndex = documents.findIndex(doc => doc.id === docId);

            if (docIndex !== -1) {
                documents[docIndex].status = 'approved';
                documents[docIndex].approvedAt = new Date().toISOString();
                documents[docIndex].approvedBy = this.currentUser.name;

                localStorage.setItem('kmrl_documents', JSON.stringify(documents));
                this.updateDocumentOversight(documents);

                window.showNotification('Document approved successfully', 'success');
                this.logActivity('Document Management', `Approved document: ${documents[docIndex].title}`);
            }

        } catch (error) {
            console.error('Error approving document:', error);
            window.showNotification('Failed to approve document', 'error');
        }
    }

    async rejectDocument(docId) {
        const reason = prompt('Please provide a reason for rejection:');
        if (!reason) return;

        try {
            const documents = JSON.parse(localStorage.getItem('kmrl_documents') || '[]');
            const docIndex = documents.findIndex(doc => doc.id === docId);

            if (docIndex !== -1) {
                documents[docIndex].status = 'rejected';
                documents[docIndex].rejectedAt = new Date().toISOString();
                documents[docIndex].rejectedBy = this.currentUser.name;
                documents[docIndex].rejectionReason = reason;

                localStorage.setItem('kmrl_documents', JSON.stringify(documents));
                this.updateDocumentOversight(documents);

                window.showNotification('Document rejected', 'warning');
                this.logActivity('Document Management', `Rejected document: ${documents[docIndex].title}`);
            }

        } catch (error) {
            console.error('Error rejecting document:', error);
            window.showNotification('Failed to reject document', 'error');
        }
    }

    // System Management Functions
    async loadSystemStatistics() {
        await this.delay(500);

        return {
            totalUsers: Math.floor(Math.random() * 100) + 50,
            totalDocuments: Math.floor(Math.random() * 1000) + 500,
            storageUsed: Math.floor(Math.random() * 80) + 20,
            activeSessions: Math.floor(Math.random() * 50) + 10,
            systemUptime: 99.9,
            serverStatus: 'online',
            databaseStatus: 'connected',
            backupStatus: 'up-to-date'
        };
    }

    updateSystemStatistics(stats) {
        // Update stat cards
        const statElements = {
            'totalUsers': stats.totalUsers,
            'totalDocuments': stats.totalDocuments,
            'storageUsed': stats.storageUsed + '%',
            'activeSessions': stats.activeSessions
        };

        Object.entries(statElements).forEach(([statKey, value]) => {
            const element = document.querySelector(`[data-stat="${statKey}"]`);
            if (element) {
                this.animateCounter(element, value);
            }
        });
    }

    animateCounter(element, targetValue) {
        const startValue = 0;
        const duration = 2000;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(startValue + (parseInt(targetValue) - startValue) * easeOut);

            element.textContent = targetValue.toString().includes('%') ? currentValue + '%' : currentValue;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    async loadSystemLogs() {
        await this.delay(400);

        return [
            {
                type: 'info',
                message: 'User admin@kmrl.com logged in successfully',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
            },
            {
                type: 'info',
                message: 'Document Financial_Report_Q4.pdf uploaded by manager@kmrl.com',
                timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
            },
            {
                type: 'warning',
                message: 'Storage usage reached 75% capacity',
                timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
            },
            {
                type: 'info',
                message: 'Automatic backup completed successfully',
                timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
            },
            {
                type: 'error',
                message: 'Failed login attempt from IP 192.168.1.100',
                timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
            }
        ];
    }

    updateSystemLogs(logs) {
        const container = document.getElementById('systemLogs');
        if (!container) return;

        container.innerHTML = '';

        logs.forEach(log => {
            const logElement = document.createElement('div');
            logElement.className = 'log-item';
            logElement.innerHTML = `
                <div class="log-icon ${log.type}">
                    <i class="fas fa-${this.getLogIcon(log.type)}"></i>
                </div>
                <div class="log-content">
                    <p class="log-message">${log.message}</p>
                    <p class="log-time">${this.formatRelativeTime(log.timestamp)}</p>
                </div>
            `;
            container.appendChild(logElement);
        });
    }

    getLogIcon(type) {
        const icons = {
            info: 'info-circle',
            warning: 'exclamation-triangle',
            error: 'times-circle',
            success: 'check-circle'
        };
        return icons[type] || 'info-circle';
    }

    logActivity(category, message) {
        const logs = JSON.parse(localStorage.getItem('kmrl_activity_logs') || '[]');
        logs.unshift({
            type: 'info',
            category: category,
            message: message,
            timestamp: new Date().toISOString(),
            user: this.currentUser.name
        });

        // Keep only last 100 logs
        if (logs.length > 100) {
            logs.splice(100);
        }

        localStorage.setItem('kmrl_activity_logs', JSON.stringify(logs));
    }

    // Admin Action Functions
    showSystemSettings() {
        const modal = this.createSystemSettingsModal();
        document.body.appendChild(modal);
        modal.classList.add('show');
    }

    createSystemSettingsModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">System Settings</h3>
                        <button type="button" class="close" onclick="this.closest('.modal').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="systemSettingsForm">
                            <div class="form-group">
                                <label class="form-label">System Name</label>
                                <input type="text" class="form-control" name="systemName" value="KMRL Document Management" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Storage Limit (GB)</label>
                                <input type="number" class="form-control" name="storageLimit" value="100" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Session Timeout (minutes)</label>
                                <input type="number" class="form-control" name="sessionTimeout" value="60" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Auto-Backup Frequency</label>
                                <select class="form-control" name="backupFrequency" required>
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Email Notifications</label>
                                <select class="form-control" name="emailNotifications" required>
                                    <option value="enabled">Enabled</option>
                                    <option value="disabled">Disabled</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                        <button type="submit" form="systemSettingsForm" class="btn btn-primary">Save Settings</button>
                    </div>
                </div>
            </div>
        `;
        return modal;
    }

    async performBackup() {
        if (!confirm('Are you sure you want to perform a system backup? This may take a few minutes.')) {
            return;
        }

        try {
            window.showNotification('Starting system backup...', 'info');

            // Simulate backup process
            await this.delay(3000);

            // Create backup data
            const backupData = {
                users: JSON.parse(localStorage.getItem('kmrl_users') || '[]'),
                documents: JSON.parse(localStorage.getItem('kmrl_documents') || '[]'),
                logs: JSON.parse(localStorage.getItem('kmrl_activity_logs') || '[]'),
                timestamp: new Date().toISOString()
            };

            // In a real system, this would be sent to a backup server
            localStorage.setItem('kmrl_backup_' + Date.now(), JSON.stringify(backupData));

            window.showNotification('System backup completed successfully', 'success');
            this.logActivity('System Management', 'Performed system backup');

        } catch (error) {
            console.error('Backup error:', error);
            window.showNotification('Backup failed. Please try again.', 'error');
        }
    }

    showNotificationModal() {
        const modal = this.createNotificationModal();
        document.body.appendChild(modal);
        modal.classList.add('show');
    }

    createNotificationModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">Send System Notification</h3>
                        <button type="button" class="close" onclick="this.closest('.modal').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="notificationForm">
                            <div class="form-group">
                                <label class="form-label">Recipients</label>
                                <select class="form-control" name="recipients" required>
                                    <option value="all">All Users</option>
                                    <option value="admins">Admins Only</option>
                                    <option value="managers">Managers Only</option>
                                    <option value="staff">Staff Only</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Priority</label>
                                <select class="form-control" name="priority" required>
                                    <option value="low">Low</option>
                                    <option value="normal">Normal</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Subject</label>
                                <input type="text" class="form-control" name="subject" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Message</label>
                                <textarea class="form-control" name="message" rows="4" required></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                        <button type="submit" form="notificationForm" class="btn btn-primary">Send Notification</button>
                    </div>
                </div>
            </div>
        `;
        return modal;
    }

    async handleSendNotification(form) {
        const formData = new FormData(form);
        const notificationData = Object.fromEntries(formData);

        try {
            // Simulate sending notification
            await this.delay(1000);

            // Store notification for tracking
            const notifications = JSON.parse(localStorage.getItem('kmrl_notifications') || '[]');
            notifications.unshift({
                id: 'notif_' + Date.now(),
                ...notificationData,
                sentBy: this.currentUser.name,
                sentAt: new Date().toISOString(),
                status: 'sent'
            });
            localStorage.setItem('kmrl_notifications', JSON.stringify(notifications));

            form.closest('.modal').remove();
            window.showNotification('Notification sent successfully', 'success');
            this.logActivity('Communication', `Sent notification to ${notificationData.recipients}: ${notificationData.subject}`);

        } catch (error) {
            console.error('Error sending notification:', error);
            window.showNotification('Failed to send notification', 'error');
        }
    }

    startSystemMonitoring() {
        // Monitor system status every 30 seconds
        setInterval(() => {
            this.loadSystemStatistics().then(stats => {
                this.updateSystemStatistics(stats);
            });
        }, 30000);
    }

    // Initialize placeholder functions
    initializeUserManagement() {
        // User management initialization completed in loadAdminData
    }

    initializeSystemStatus() {
        // System status initialization completed in loadAdminData
    }

    initializeDocumentOversight() {
        // Document oversight initialization completed in loadAdminData
    }

    initializeWorkflowManagement() {
        // Workflow management initialization
        this.setupWorkflowHandlers();
    }

    initializeSystemSettings() {
        // System settings initialization
        this.loadSystemSettings();
    }

    setupModals() {
        // Modal setup completed
    }

    setupWorkflowHandlers() {
        // Setup workflow management handlers
    }

    loadSystemSettings() {
        // Load system settings from localStorage
        const settings = JSON.parse(localStorage.getItem('kmrl_system_settings') || '{}');
        this.systemSettings = {
            systemName: 'KMRL Document Management',
            storageLimit: 100,
            sessionTimeout: 60,
            backupFrequency: 'daily',
            emailNotifications: 'enabled',
            ...settings
        };
    }

    handleSystemSettings(form) {
        const formData = new FormData(form);
        const settings = Object.fromEntries(formData);

        // Save settings
        localStorage.setItem('kmrl_system_settings', JSON.stringify(settings));
        this.systemSettings = settings;

        form.closest('.modal').remove();
        window.showNotification('System settings updated successfully', 'success');
        this.logActivity('System Management', 'Updated system settings');
    }

    handleWorkflowConfiguration(form) {
        const formData = new FormData(form);
        const workflowData = Object.fromEntries(formData);

        // Save workflow configuration
        const workflows = JSON.parse(localStorage.getItem('kmrl_workflows') || '[]');
        workflows.push({
            id: 'workflow_' + Date.now(),
            ...workflowData,
            createdBy: this.currentUser.name,
            createdAt: new Date().toISOString()
        });
        localStorage.setItem('kmrl_workflows', JSON.stringify(workflows));

        form.closest('.modal').remove();
        window.showNotification('Workflow configured successfully', 'success');
        this.logActivity('Workflow Management', 'Configured new workflow');
    }

    showWorkflowConfiguration() {
        const modal = this.createWorkflowModal();
        document.body.appendChild(modal);
        modal.classList.add('show');
    }

    createWorkflowModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">Configure Workflow</h3>
                        <button type="button" class="close" onclick="this.closest('.modal').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="workflowForm">
                            <div class="form-group">
                                <label class="form-label">Workflow Name</label>
                                <input type="text" class="form-control" name="name" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Department</label>
                                <select class="form-control" name="department" required>
                                    <option value="all">All Departments</option>
                                    <option value="finance">Finance</option>
                                    <option value="hr">Human Resources</option>
                                    <option value="legal">Legal</option>
                                    <option value="operations">Operations</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Approval Steps</label>
                                <select class="form-control" name="approvalSteps" required>
                                    <option value="1">Single Approval</option>
                                    <option value="2">Two-Step Approval</option>
                                    <option value="3">Three-Step Approval</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Auto-Notification</label>
                                <select class="form-control" name="autoNotification" required>
                                    <option value="enabled">Enabled</option>
                                    <option value="disabled">Disabled</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                        <button type="submit" form="workflowForm" class="btn btn-primary">Save Workflow</button>
                    </div>
                </div>
            </div>
        `;
        return modal;
    }

    showAnalyticsDashboard() {
        // Redirect to analytics page with admin filters
        window.location.href = 'analytics.html?admin=true';
    }

    showDocumentHistory(docId) {
        const documents = JSON.parse(localStorage.getItem('kmrl_documents') || '[]');
        const doc = documents.find(d => d.id === docId);
        if (!doc) return;

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">Document History: ${doc.title}</h3>
                        <button type="button" class="close" onclick="this.closest('.modal').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="doc-history">
                            <div class="history-item">
                                <div class="history-icon"><i class="fas fa-upload"></i></div>
                                <div class="history-content">
                                    <strong>Document Uploaded</strong>
                                    <p>By ${doc.uploadedBy} on ${this.formatDateTime(doc.uploadedAt)}</p>
                                </div>
                            </div>
                            ${doc.approvedAt ? `
                            <div class="history-item">
                                <div class="history-icon"><i class="fas fa-check"></i></div>
                                <div class="history-content">
                                    <strong>Document Approved</strong>
                                    <p>By ${doc.approvedBy} on ${this.formatDateTime(doc.approvedAt)}</p>
                                </div>
                            </div>` : ''}
                            ${doc.rejectedAt ? `
                            <div class="history-item">
                                <div class="history-icon"><i class="fas fa-times"></i></div>
                                <div class="history-content">
                                    <strong>Document Rejected</strong>
                                    <p>By ${doc.rejectedBy} on ${this.formatDateTime(doc.rejectedAt)}</p>
                                    <p><em>Reason: ${doc.rejectionReason}</em></p>
                                </div>
                            </div>` : ''}
                        </div>
                        <div class="doc-stats">
                            <h5>Statistics</h5>
                            <div class="stats-row">
                                <span>Views: ${doc.views}</span>
                                <span>Downloads: ${doc.downloads}</span>
                                <span>File Size: ${this.formatFileSize(doc.files[0]?.size || 0)}</span>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.classList.add('show');
    }

    showRestoreModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">Restore System Backup</h3>
                        <button type="button" class="close" onclick="this.closest('.modal').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <p class="text-warning"><i class="fas fa-exclamation-triangle"></i> Warning: Restoring a backup will overwrite all current data.</p>
                        <div class="form-group">
                            <label class="form-label">Select Backup File</label>
                            <input type="file" class="form-control" accept=".json" id="backupFile">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                        <button type="button" class="btn btn-danger" onclick="adminManager.performRestore(); this.closest('.modal').remove();">Restore Backup</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.classList.add('show');
    }

    async performRestore() {
        const fileInput = document.getElementById('backupFile');
        if (!fileInput.files[0]) {
            window.showNotification('Please select a backup file', 'error');
            return;
        }

        try {
            const file = fileInput.files[0];
            const text = await file.text();
            const backupData = JSON.parse(text);

            // Restore data
            if (backupData.users) localStorage.setItem('kmrl_users', JSON.stringify(backupData.users));
            if (backupData.documents) localStorage.setItem('kmrl_documents', JSON.stringify(backupData.documents));
            if (backupData.logs) localStorage.setItem('kmrl_activity_logs', JSON.stringify(backupData.logs));

            window.showNotification('System restored successfully. Please refresh the page.', 'success');
            this.logActivity('System Management', 'Performed system restore');

            // Refresh the page after a short delay
            setTimeout(() => {
                window.location.reload();
            }, 2000);

        } catch (error) {
            console.error('Restore error:', error);
            window.showNotification('Failed to restore backup. Invalid file format.', 'error');
        }
    }
}

// Initialize admin manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.admin-container')) {
        window.adminManager = new AdminManager();
    }
});
// KMRL Document Management System - Manager Panel JavaScript

class ManagerPanel {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.addCustomStyles();
        this.init();
        this.setupManagerRestrictions();
        this.setupNotifications();
    }

    init() {
        // Verify manager access
        if (!this.currentUser || this.currentUser.role !== 'manager') {
            window.location.href = 'login.html';
            return;
        }

        this.setupManagerInterface();
        this.loadManagerData();
        this.setupEventListeners();
        this.updateUserInfo();
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

    setupManagerRestrictions() {
        if (!this.currentUser || this.currentUser.role !== 'manager') {
            return;
        }

        // Hide admin-only functions
        this.hideAdminOnlyElements();

        // Restrict to department documents only
        this.restrictToDepartment();

        // Setup manager-specific navigation
        this.customizeManagerNavigation();
    }

    hideAdminOnlyElements() {
        // Hide admin-only elements
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(el => {
            el.style.display = 'none';
        });

        // Hide user management features
        const userMgmtElements = document.querySelectorAll('.user-management');
        userMgmtElements.forEach(el => {
            el.style.display = 'none';
        });

        // Hide system-wide workflow configuration
        const workflowMgmtElements = document.querySelectorAll('.workflow-management');
        workflowMgmtElements.forEach(el => {
            el.style.display = 'none';
        });
    }

    restrictToDepartment() {
        // All document queries will be filtered by manager's department
        this.currentDepartment = this.currentUser.department || 'Operations';

        // Add department filter to all document-related operations
        this.departmentFilter = (doc) => {
            // Check if document belongs to manager's department
            return !doc.department || doc.department === this.currentDepartment;
        };
    }

    customizeManagerNavigation() {
        // Add manager-specific navigation items
        const sidebar = document.querySelector('.sidebar-nav');
        if (sidebar) {
            const managerActionsHtml = `
                <div class="nav-section manager-only">
                    <div class="nav-section-title">Manager Tools</div>
                    <a href="#" class="nav-link" id="pendingApprovalsLink">
                        <i class="fas fa-clock"></i>
                        <span>Pending Approvals</span>
                        <span class="notification-badge" id="approvalsBadge" style="display: none;">0</span>
                    </a>
                    <a href="#" class="nav-link" id="departmentAnalyticsLink">
                        <i class="fas fa-chart-line"></i>
                        <span>Department Analytics</span>
                    </a>
                    <a href="#" class="nav-link" id="staffPerformanceLink">
                        <i class="fas fa-users-cog"></i>
                        <span>Staff Performance</span>
                    </a>
                    <a href="#" class="nav-link" id="overdueTasksLink">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>Overdue Tasks</span>
                    </a>
                </div>
            `;

            // Insert before admin panel link
            const adminLink = sidebar.querySelector('a[href="admin.html"]');
            if (adminLink) {
                adminLink.insertAdjacentHTML('beforebegin', managerActionsHtml);
            }
        }
    }

    setupManagerInterface() {
        // Hide admin-only elements
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(el => el.style.display = 'none');

        // Setup sidebar toggle
        this.setupSidebarToggle();

        // Setup mobile menu
        this.setupMobileMenu();
    }

    setupSidebarToggle() {
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                document.querySelector('.sidebar').classList.toggle('collapsed');
            });
        }
    }

    setupMobileMenu() {
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', () => {
                document.querySelector('.sidebar').classList.toggle('show');
            });
        }
    }

    setupEventListeners() {
        // Logout functionality
        const logoutBtns = document.querySelectorAll('#logoutBtn');
        logoutBtns.forEach(btn => {
            btn.addEventListener('click', () => this.logout());
        });

        // Approval filter
        const approvalFilter = document.getElementById('approvalFilter');
        if (approvalFilter) {
            approvalFilter.addEventListener('change', () => this.filterApprovals());
        }
    }

    updateUserInfo() {
        const userNameElements = document.querySelectorAll('.user-name');
        userNameElements.forEach(el => {
            el.textContent = this.currentUser.name || 'Manager';
        });
    }

    async loadManagerData() {
        try {
            // Load all data in parallel
            const [pendingApprovals, departmentStats, staffPerformance] = await Promise.all([
                this.loadPendingApprovals(),
                this.loadDepartmentStats(),
                this.loadStaffPerformance()
            ]);

            this.updateManagerWidgets(pendingApprovals, departmentStats);
            this.displayPendingApprovals(pendingApprovals);
            this.displayStaffPerformance(staffPerformance);
        } catch (error) {
            console.error('Error loading manager data:', error);
            this.showError('Failed to load manager data');
        }
    }

    async loadPendingApprovals() {
        // Get all documents that are pending approval in manager's department
        const allDocuments = JSON.parse(localStorage.getItem('kmrl_documents') || '[]');
        const allUsers = JSON.parse(localStorage.getItem('kmrl_users') || '[]');

        // Filter for documents in manager's department that are pending
        return allDocuments.filter(doc => {
            if (doc.status !== 'pending') return false;

            // Find the user who uploaded the document
            const uploader = allUsers.find(user => user.name === doc.uploadedBy || user.id === doc.uploadedBy);

            // Check if uploader is in manager's department
            return uploader && uploader.department === this.currentDepartment;
        }).map(doc => {
            // Add additional metadata for approval process
            const daysSincePending = Math.floor((Date.now() - new Date(doc.uploadedAt)) / (1000 * 60 * 60 * 24));
            return {
                ...doc,
                daysSincePending,
                isOverdue: daysSincePending > 3, // Consider overdue after 3 days
                priority: daysSincePending > 7 ? 'high' : daysSincePending > 3 ? 'medium' : 'normal'
            };
        });
    }

    async loadDepartmentStats() {
        const allDocuments = JSON.parse(localStorage.getItem('kmrl_documents') || '[]');
        const allUsers = JSON.parse(localStorage.getItem('kmrl_users') || '[]');

        // Filter documents by manager's department
        const departmentDocs = allDocuments.filter(doc => {
            const uploader = allUsers.find(user => user.name === doc.uploadedBy || user.id === doc.uploadedBy);
            return uploader && uploader.department === this.currentDepartment;
        });

        // Calculate department-specific statistics
        const stats = {
            totalDocuments: departmentDocs.length,
            pendingApprovals: departmentDocs.filter(doc => doc.status === 'pending').length,
            approvedDocuments: departmentDocs.filter(doc => doc.status === 'approved').length,
            rejectedDocuments: departmentDocs.filter(doc => doc.status === 'rejected').length,
            monthlySubmissions: this.getMonthlySubmissions(departmentDocs),
            approvalRate: this.calculateApprovalRate(departmentDocs),
            avgProcessingTime: this.calculateAvgProcessingTime(departmentDocs),
            workflowEfficiency: this.calculateWorkflowEfficiency(departmentDocs),
            staffCount: allUsers.filter(user => user.role === 'staff' && user.department === this.currentDepartment).length,
            overdueDocuments: departmentDocs.filter(doc => {
                if (doc.status !== 'pending') return false;
                const daysPending = Math.floor((Date.now() - new Date(doc.uploadedAt)) / (1000 * 60 * 60 * 24));
                return daysPending > 3;
            }).length
        };

        return stats;
    }

    async loadStaffPerformance() {
        // Get all users and their document statistics for manager's department only
        const allUsers = JSON.parse(localStorage.getItem('kmrl_users') || '[]');
        const allDocuments = JSON.parse(localStorage.getItem('kmrl_documents') || '[]');

        // Filter staff users in manager's department
        const departmentStaff = allUsers.filter(user =>
            user.role === 'staff' && user.department === this.currentDepartment
        );

        // Calculate performance for each staff member in department
        return departmentStaff.map(staff => {
            const staffDocs = allDocuments.filter(doc =>
                doc.uploadedBy === staff.name || doc.uploadedBy === staff.id
            );
            const approvedDocs = staffDocs.filter(doc => doc.status === 'approved');
            const rejectedDocs = staffDocs.filter(doc => doc.status === 'rejected');
            const pendingDocs = staffDocs.filter(doc => doc.status === 'pending');

            const approvalRate = staffDocs.length > 0 ?
                Math.round((approvedDocs.length / staffDocs.length) * 100) : 0;

            const avgProcessingTime = this.calculateStaffAvgProcessingTime(staffDocs);

            // Calculate overdue submissions
            const overdueSubmissions = pendingDocs.filter(doc => {
                const daysPending = Math.floor((Date.now() - new Date(doc.uploadedAt)) / (1000 * 60 * 60 * 24));
                return daysPending > 3;
            }).length;

            // Determine performance level based on multiple factors
            let performanceLevel = 'average';
            let performanceClass = 'performance-average';

            if (approvalRate >= 90 && overdueSubmissions === 0) {
                performanceLevel = 'excellent';
                performanceClass = 'performance-excellent';
            } else if (approvalRate >= 80 && overdueSubmissions <= 1) {
                performanceLevel = 'good';
                performanceClass = 'performance-good';
            } else if (approvalRate < 60 || overdueSubmissions > 3) {
                performanceLevel = 'needs improvement';
                performanceClass = 'performance-low';
            }

            // Calculate productivity score
            const monthlyDocs = this.getMonthlySubmissions(staffDocs);
            const productivityScore = Math.min(100, (monthlyDocs * 10) + (approvalRate * 0.5));

            return {
                id: staff.id,
                name: staff.name,
                email: staff.email,
                department: staff.department,
                documentsSubmitted: staffDocs.length,
                monthlySubmissions: monthlyDocs,
                approvalRate: approvalRate,
                avgProcessingTime: avgProcessingTime,
                overdueSubmissions: overdueSubmissions,
                performanceLevel: performanceLevel,
                performanceClass: performanceClass,
                productivityScore: Math.round(productivityScore),
                lastSubmission: this.getLastSubmissionDate(staffDocs)
            };
        });
    }

    getMonthlySubmissions(documents) {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        return documents.filter(doc => {
            const docDate = new Date(doc.uploadedAt);
            return docDate.getMonth() === currentMonth && docDate.getFullYear() === currentYear;
        }).length;
    }

    calculateApprovalRate(documents) {
        const approved = documents.filter(doc => doc.status === 'approved').length;
        const total = documents.length;
        return total > 0 ? Math.round((approved / total) * 100) : 0;
    }

    calculateAvgProcessingTime(documents) {
        const processedDocs = documents.filter(doc => doc.status !== 'pending');

        if (processedDocs.length === 0) return '0h';

        const totalHours = processedDocs.reduce((sum, doc) => {
            const uploadTime = new Date(doc.uploadedAt);
            const processTime = new Date(doc.approvedAt || doc.rejectedAt || Date.now());
            const hours = (processTime - uploadTime) / (1000 * 60 * 60);
            return sum + hours;
        }, 0);

        const avgHours = totalHours / processedDocs.length;
        return `${avgHours.toFixed(1)}h`;
    }

    calculateStaffAvgProcessingTime(documents) {
        const processedDocs = documents.filter(doc => doc.status !== 'pending');

        if (processedDocs.length === 0) return '0h';

        const totalHours = processedDocs.reduce((sum, doc) => {
            const uploadTime = new Date(doc.uploadedAt);
            const processTime = new Date(doc.approvedAt || doc.rejectedAt || Date.now());
            const hours = (processTime - uploadTime) / (1000 * 60 * 60);
            return sum + hours;
        }, 0);

        const avgHours = totalHours / processedDocs.length;
        return `${avgHours.toFixed(1)}h`;
    }

    calculateWorkflowEfficiency(documents) {
        if (documents.length === 0) return 0;

        const processedDocs = documents.filter(doc => doc.status !== 'pending');
        const onTimeProcessed = processedDocs.filter(doc => {
            const uploadTime = new Date(doc.uploadedAt);
            const processTime = new Date(doc.approvedAt || doc.rejectedAt);
            const hoursToProcess = (processTime - uploadTime) / (1000 * 60 * 60);
            return hoursToProcess <= 72; // 3 days
        });

        return Math.round((onTimeProcessed.length / processedDocs.length) * 100);
    }

    getLastSubmissionDate(documents) {
        if (documents.length === 0) return 'Never';

        const sortedDocs = documents.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
        const lastDoc = sortedDocs[0];

        const lastDate = new Date(lastDoc.uploadedAt);
        const now = new Date();
        const diffDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return `${Math.floor(diffDays / 30)} months ago`;
    }

    updateManagerWidgets(pendingApprovals, stats) {
        // Update pending approvals count
        const pendingCount = document.getElementById('pendingApprovalsCount');
        if (pendingCount) {
            pendingCount.textContent = pendingApprovals.length;
        }

        // Update department documents count
        const deptCount = document.getElementById('deptDocumentsCount');
        if (deptCount) {
            deptCount.textContent = stats.totalDocuments;
        }

        // Update workflow efficiency
        const efficiency = document.getElementById('workflowEfficiency');
        if (efficiency) {
            efficiency.textContent = `${stats.approvalRate}%`;
        }

        // Update analytics cards
        const monthlySubs = document.getElementById('monthlySubmissions');
        if (monthlySubs) {
            monthlySubs.textContent = stats.monthlySubmissions;
        }

        const approvalRate = document.getElementById('approvalRate');
        if (approvalRate) {
            approvalRate.textContent = `${stats.approvalRate}%`;
        }

        const avgTime = document.getElementById('avgProcessingTime');
        if (avgTime) {
            avgTime.textContent = stats.avgProcessingTime;
        }

        const staffActivity = document.getElementById('staffActivity');
        if (staffActivity) {
            // Calculate active staff percentage
            const allUsers = JSON.parse(localStorage.getItem('kmrl_users') || '[]');
            const staffUsers = allUsers.filter(user => user.role === 'staff');
            const activeStaff = staffUsers.filter(staff => {
                // Consider staff active if they uploaded documents in last 30 days
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                const staffDocs = pendingApprovals.filter(doc => doc.uploadedBy === staff.name);
                return staffDocs.some(doc => new Date(doc.uploadedAt) > thirtyDaysAgo);
            }).length;

            const activityRate = staffUsers.length > 0 ?
                Math.round((activeStaff / staffUsers.length) * 100) : 0;
            staffActivity.textContent = `${activityRate}%`;
        }
    }

    displayPendingApprovals(approvals) {
        const approvalList = document.getElementById('approvalList');
        if (!approvalList) return;

        if (approvals.length === 0) {
            approvalList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle"></i>
                    <h4>No Pending Approvals</h4>
                    <p>All documents have been reviewed.</p>
                </div>
            `;
            return;
        }

        approvalList.innerHTML = approvals.map(doc => `
            <div class="approval-item" data-doc-id="${doc.id}">
                <div class="approval-content">
                    <div class="doc-info">
                        <div class="doc-title">${doc.title}</div>
                        <div class="doc-meta">
                            <span>Uploaded by: ${doc.uploadedBy}</span> |
                            <span>Category: ${doc.category}</span> |
                            <span>${this.formatDate(doc.uploadedAt)}</span>
                        </div>
                    </div>
                    <div class="approval-actions">
                        <button class="btn-reject" onclick="managerPanel.rejectDocument('${doc.id}')">
                            <i class="fas fa-times"></i> Reject
                        </button>
                        <button class="btn-approve" onclick="managerPanel.approveDocument('${doc.id}')">
                            <i class="fas fa-check"></i> Approve
                        </button>
                        <button class="btn btn-secondary" onclick="managerPanel.reviewDocument('${doc.id}')">
                            <i class="fas fa-eye"></i> Review
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    displayStaffPerformance(staffData) {
        const staffTableBody = document.getElementById('staffTableBody');
        if (!staffTableBody) return;

        if (staffData.length === 0) {
            staffTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">No staff members found</td>
                </tr>
            `;
            return;
        }

        staffTableBody.innerHTML = staffData.map(staff => `
            <tr>
                <td>
                    <div class="staff-name">
                        <div class="staff-avatar">${staff.name.charAt(0).toUpperCase()}</div>
                        <div>
                            <div>${staff.name}</div>
                            <small class="text-muted">${staff.email}</small>
                        </div>
                    </div>
                </td>
                <td>${staff.documentsSubmitted}</td>
                <td>${staff.approvalRate}%</td>
                <td>${staff.avgProcessingTime}</td>
                <td>
                    <span class="performance-indicator ${staff.performanceClass}">
                        <i class="fas fa-${staff.performanceLevel === 'good' ? 'star' : staff.performanceLevel === 'average' ? 'minus' : 'exclamation-triangle'}"></i>
                        ${staff.performanceLevel.charAt(0).toUpperCase() + staff.performanceLevel.slice(1)}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="managerPanel.viewStaffDetails('${staff.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async approveDocument(docId) {
        try {
            const documents = JSON.parse(localStorage.getItem('kmrl_documents') || '[]');
            const docIndex = documents.findIndex(doc => doc.id === docId);

            if (docIndex === -1) {
                this.showError('Document not found');
                return;
            }

            // Get review notes from modal
            const reviewNotes = document.getElementById('reviewNotes')?.value || '';

            // Update document status
            documents[docIndex].status = 'approved';
            documents[docIndex].approvedAt = new Date().toISOString();
            documents[docIndex].approvedBy = this.currentUser.name;
            documents[docIndex].managerRemarks = reviewNotes;
            documents[docIndex].reviewedAt = new Date().toISOString();

            // Save back to localStorage
            localStorage.setItem('kmrl_documents', JSON.stringify(documents));

            // Send notification to the staff member
            this.sendApprovalNotification(documents[docIndex], 'approved', reviewNotes);

            // Log activity
            this.logActivity('Document Approval', `Approved document: ${documents[docIndex].title}`);

            // Close modal and refresh data
            document.querySelector('.modal')?.remove();
            this.loadManagerData();

            this.showSuccess('Document approved successfully');

        } catch (error) {
            console.error('Error approving document:', error);
            this.showError('Failed to approve document');
        }
    }

    async rejectDocument(docId) {
        try {
            const documents = JSON.parse(localStorage.getItem('kmrl_documents') || '[]');
            const docIndex = documents.findIndex(doc => doc.id === docId);

            if (docIndex === -1) {
                this.showError('Document not found');
                return;
            }

            // Get review notes from modal
            const reviewNotes = document.getElementById('reviewNotes')?.value || '';

            if (!reviewNotes.trim()) {
                this.showError('Please provide rejection reason in review notes');
                return;
            }

            // Update document status
            documents[docIndex].status = 'rejected';
            documents[docIndex].rejectedAt = new Date().toISOString();
            documents[docIndex].rejectedBy = this.currentUser.name;
            documents[docIndex].managerRemarks = reviewNotes;
            documents[docIndex].reviewedAt = new Date().toISOString();

            // Save back to localStorage
            localStorage.setItem('kmrl_documents', JSON.stringify(documents));

            // Send notification to the staff member
            this.sendApprovalNotification(documents[docIndex], 'rejected', reviewNotes);

            // Log activity
            this.logActivity('Document Rejection', `Rejected document: ${documents[docIndex].title}`);

            // Close modal and refresh data
            document.querySelector('.modal')?.remove();
            this.loadManagerData();

            this.showSuccess('Document rejected with feedback sent to staff');

        } catch (error) {
            console.error('Error rejecting document:', error);
            this.showError('Failed to reject document');
        }
    }

    reviewDocument(docId) {
        const documents = JSON.parse(localStorage.getItem('kmrl_documents') || '[]');
        const doc = documents.find(d => d.id === docId);

        if (!doc) {
            this.showError('Document not found');
            return;
        }

        // Create review modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">Review Document: ${doc.title}</h3>
                        <button type="button" class="close" onclick="this.closest('.modal').remove()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="document-details">
                            <div class="row">
                                <div class="col-md-6">
                                    <h5>Document Information</h5>
                                    <p><strong>Title:</strong> ${doc.title}</p>
                                    <p><strong>Category:</strong> ${doc.category}</p>
                                    <p><strong>Uploaded by:</strong> ${doc.uploadedBy}</p>
                                    <p><strong>Upload Date:</strong> ${this.formatDate(doc.uploadedAt)}</p>
                                    <p><strong>Description:</strong> ${doc.description || 'No description'}</p>
                                    <p><strong>Tags:</strong> ${doc.tags ? doc.tags.join(', ') : 'None'}</p>
                                </div>
                                <div class="col-md-6">
                                    <h5>Files</h5>
                                    <ul>
                                        ${doc.files.map(file => `
                                            <li>
                                                ${file.name} (${this.formatFileSize(file.size)})
                                                <br><small class="text-muted">Modified: ${this.formatDate(file.lastModified)}</small>
                                            </li>
                                        `).join('')}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Review Notes</label>
                            <textarea class="form-control" id="reviewNotes" rows="3" placeholder="Add your review notes..."></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                        <button type="button" class="btn btn-danger" onclick="managerPanel.rejectDocument('${doc.id}')">Reject</button>
                        <button type="button" class="btn btn-success" onclick="managerPanel.approveDocument('${doc.id}')">Approve</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.classList.add('show');
    }

    viewStaffDetails(staffId) {
        const allUsers = JSON.parse(localStorage.getItem('kmrl_users') || '[]');
        const staff = allUsers.find(user => user.id === staffId);

        if (!staff) {
            this.showError('Staff member not found');
            return;
        }

        // Create staff details modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">Staff Details: ${staff.name}</h3>
                        <button type="button" class="close" onclick="this.closest('.modal').remove()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="staff-details">
                            <p><strong>Email:</strong> ${staff.email}</p>
                            <p><strong>Role:</strong> ${staff.role}</p>
                            <p><strong>Department:</strong> ${staff.department || 'Not assigned'}</p>
                            <p><strong>Join Date:</strong> ${this.formatDate(staff.createdAt)}</p>
                        </div>
                        <div class="staff-stats">
                            <h5>Performance Metrics</h5>
                            <div class="row">
                                <div class="col-6">
                                    <div class="stat-card">
                                        <div class="stat-value">${this.getStaffDocumentsCount(staff.name)}</div>
                                        <div class="stat-label">Documents Submitted</div>
                                    </div>
                                </div>
                                <div class="col-6">
                                    <div class="stat-card">
                                        <div class="stat-value">${this.getStaffApprovalRate(staff.name)}%</div>
                                        <div class="stat-label">Approval Rate</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                        <button type="button" class="btn btn-primary" onclick="managerPanel.sendNotification('${staff.email}')">Send Message</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.classList.add('show');
    }

    getStaffDocumentsCount(staffName) {
        const documents = JSON.parse(localStorage.getItem('kmrl_documents') || '[]');
        return documents.filter(doc => doc.uploadedBy === staffName).length;
    }

    getStaffApprovalRate(staffName) {
        const documents = JSON.parse(localStorage.getItem('kmrl_documents') || '[]');
        const staffDocs = documents.filter(doc => doc.uploadedBy === staffName);

        if (staffDocs.length === 0) return 0;

        const approved = staffDocs.filter(doc => doc.status === 'approved').length;
        return Math.round((approved / staffDocs.length) * 100);
    }

    sendNotification(staffEmail) {
        // Implementation for sending notifications to staff
        const message = prompt('Enter message to send:');
        if (message) {
            this.showSuccess(`Message sent to ${staffEmail}`);
            this.logActivity('Staff Communication', `Sent message to ${staffEmail}`);
        }
    }

    sendApprovalNotification(document, action, remarks) {
        // Create notification for staff member
        const notifications = JSON.parse(localStorage.getItem('kmrl_notifications') || '[]');

        const notification = {
            id: Date.now().toString(),
            recipient: document.uploadedBy,
            subject: `Document ${action.charAt(0).toUpperCase() + action.slice(1)}: ${document.title}`,
            message: `Your document "${document.title}" has been ${action} by ${this.currentUser.name}.${remarks ? ` Manager's remarks: ${remarks}` : ''}`,
            type: action === 'approved' ? 'success' : 'warning',
            sentAt: new Date().toISOString(),
            isRead: false,
            sender: this.currentUser.name,
            senderRole: 'manager'
        };

        notifications.push(notification);
        localStorage.setItem('kmrl_notifications', JSON.stringify(notifications));
    }

    setupNotifications() {
        // Setup notification polling for overdue tasks
        this.checkOverdueTasks();

        // Setup periodic checks every 5 minutes
        this.notificationPolling = setInterval(() => {
            this.checkOverdueTasks();
        }, 5 * 60 * 1000);
    }

    checkOverdueTasks() {
        this.loadPendingApprovals().then(approvals => {
            const overdueCount = approvals.filter(doc => doc.isOverdue).length;

            // Update UI badge
            const badge = document.getElementById('approvalsBadge');
            if (badge) {
                if (overdueCount > 0) {
                    badge.textContent = overdueCount;
                    badge.style.display = 'flex';
                } else {
                    badge.style.display = 'none';
                }
            }

            // Show notification if there are overdue tasks
            if (overdueCount > 0 && !this.overdueNotificationShown) {
                this.showNotificationToast(
                    'Overdue Documents',
                    `You have ${overdueCount} document(s) pending approval for more than 3 days.`,
                    'warning'
                );
                this.overdueNotificationShown = true;
            }
        });
    }

    showNotificationToast(title, message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = 'notification-toast manager-toast';
        toast.innerHTML = `
            <div class="toast-header">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
                <strong>${title}</strong>
                <button class="toast-close" onclick="this.closest('.notification-toast').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="toast-body">
                <p>${message}</p>
                <small>${new Date().toLocaleTimeString()}</small>
            </div>
        `;

        document.body.appendChild(toast);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }

    filterApprovals() {
        const filter = document.getElementById('approvalFilter').value;
        // Re-load approvals with filter
        this.loadPendingApprovals().then(approvals => {
            let filteredApprovals = approvals;

            switch (filter) {
                case 'urgent':
                    // Filter for urgent documents (could be based on priority or deadline)
                    filteredApprovals = approvals.filter(doc => doc.priority === 'High');
                    break;
                case 'overdue':
                    // Filter for overdue documents (documents pending for more than 7 days)
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                    filteredApprovals = approvals.filter(doc =>
                        new Date(doc.uploadedAt) < sevenDaysAgo
                    );
                    break;
                default:
                    // Show all
                    break;
            }

            this.displayPendingApprovals(filteredApprovals);
        });
    }

    logActivity(action, details) {
        const activityLog = JSON.parse(localStorage.getItem('kmrl_activity_logs') || '[]');
        activityLog.push({
            id: Date.now().toString(),
            user: this.currentUser.name,
            role: this.currentUser.role,
            action: action,
            details: details,
            timestamp: new Date().toISOString()
        });

        // Keep only last 1000 entries
        if (activityLog.length > 1000) {
            activityLog.splice(0, activityLog.length - 1000);
        }

        localStorage.setItem('kmrl_activity_logs', JSON.stringify(activityLog));
    }

    logout() {
        localStorage.removeItem('kmrl_user');
        window.location.href = 'login.html';
    }

    formatDate(dateStr) {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString();
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showSuccess(message) {
        if (window.showNotification) {
            window.showNotification(message, 'success');
        } else {
            alert(message);
        }
    }

    showError(message) {
        if (window.showNotification) {
            window.showNotification(message, 'error');
        } else {
            alert(message);
        }
    }

    addCustomStyles() {
        const style = document.createElement('style');
        style.textContent = `
        .manager-widget {
            border-left: 4px solid #059669;
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

        .manager-toast {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border-radius: 0.5rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            border-left: 4px solid #059669;
            max-width: 400px;
            z-index: 1060;
            animation: slideInRight 0.3s ease;
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

        .toast-body p {
            margin: 0 0 0.5rem 0;
            color: #4b5563;
            font-size: 0.9rem;
        }

        .toast-body small {
            color: #6b7280;
        }

        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        .performance-excellent {
            background: #dcfce7;
            color: #166534;
            padding: 0.25rem 0.5rem;
            border-radius: 0.375rem;
            font-size: 0.75rem;
            font-weight: 500;
        }

        .performance-good {
            background: #dbeafe;
            color: #1e40af;
            padding: 0.25rem 0.5rem;
            border-radius: 0.375rem;
            font-size: 0.75rem;
            font-weight: 500;
        }

        .performance-average {
            background: #fef3c7;
            color: #92400e;
            padding: 0.25rem 0.5rem;
            border-radius: 0.375rem;
            font-size: 0.75rem;
            font-weight: 500;
        }

        .performance-low {
            background: #fee2e2;
            color: #991b1b;
            padding: 0.25rem 0.5rem;
            border-radius: 0.375rem;
            font-size: 0.75rem;
            font-weight: 500;
        }

        .staff-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: #2563eb;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            margin-right: 0.75rem;
        }

        .staff-name {
            display: flex;
            align-items: center;
        }

        .document-priority-high {
            border-left: 4px solid #dc2626;
        }

        .document-priority-medium {
            border-left: 4px solid #d97706;
        }

        .document-priority-normal {
            border-left: 4px solid #059669;
        }

        .overdue-indicator {
            background: #fee2e2;
            color: #991b1b;
            padding: 0.125rem 0.375rem;
            border-radius: 0.25rem;
            font-size: 0.75rem;
            font-weight: 500;
        }
        `;

        document.head.appendChild(style);
    }
}

// Initialize manager panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.manager-container')) {
        window.managerPanel = new ManagerPanel();
    }
});
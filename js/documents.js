// KMRL Document Management System - Documents JavaScript

class DocumentsManager {
    constructor() {
        this.documents = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.currentUser = this.getCurrentUser();
        this.init();
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

    // Authorization methods
    canUserApprove(document) {
        if (!this.currentUser) return false;
        const role = this.currentUser.role;

        // Only admins and managers can approve
        if (!['admin', 'manager'].includes(role)) return false;

        // Document must be pending
        if (document.status !== 'pending') return false;

        // Managers can only approve documents from their department
        if (role === 'manager') {
            return this.isDocumentInUserDepartment(document);
        }

        return true; // Admin can approve all
    }

    canUserReject(document) {
        return this.canUserApprove(document); // Same rules as approve
    }

    canUserEdit(document) {
        if (!this.currentUser) return false;
        const role = this.currentUser.role;

        // Admin can edit all documents
        if (role === 'admin') return true;

        // Staff can only edit their own documents if pending
        if (role === 'staff') {
            return (document.uploadedBy === this.currentUser.name ||
                document.uploadedBy === this.currentUser.id) &&
                document.status === 'pending';
        }

        // Managers cannot edit documents
        return false;
    }

    canUserDelete(document) {
        if (!this.currentUser) return false;

        // Only admin can delete documents
        return this.currentUser.role === 'admin';
    }

    canUserView(document) {
        if (!this.currentUser) return false;
        const role = this.currentUser.role;

        // Admin can view all
        if (role === 'admin') return true;

        // Manager can view documents from their department
        if (role === 'manager') {
            return this.isDocumentInUserDepartment(document);
        }

        // Staff can only view their own documents
        if (role === 'staff') {
            return document.uploadedBy === this.currentUser.name ||
                document.uploadedBy === this.currentUser.id;
        }

        return false;
    }

    isDocumentInUserDepartment(document) {
        if (!this.currentUser.department) return false;

        // Check if document has department field
        if (document.department) {
            return document.department === this.currentUser.department;
        }

        // Check uploader's department
        const users = JSON.parse(localStorage.getItem('kmrl_users') || '[]');
        const uploader = users.find(user =>
            user.name === document.uploadedBy || user.id === document.uploadedBy
        );

        return uploader && uploader.department === this.currentUser.department;
    }

    init() {
        this.loadDocuments();
        this.setupEventListeners();
        this.renderDocuments();
    }

    setupEventListeners() {
        document.getElementById('searchInput')?.addEventListener('input', () => this.applyFilters());
        document.getElementById('categoryFilter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('statusFilter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('selectAll')?.addEventListener('change', (e) => this.selectAll(e.target.checked));
    }

    loadDocuments() {
        const storedDocs = localStorage.getItem('kmrl_documents');
        let allDocuments = storedDocs ? JSON.parse(storedDocs) : this.generateSampleDocuments();

        // Filter documents based on user permissions
        this.documents = allDocuments.filter(doc => this.canUserView(doc));

        // Store sample documents if they don't exist
        if (!storedDocs) {
            localStorage.setItem('kmrl_documents', JSON.stringify(allDocuments));
        }
    }

    generateSampleDocuments() {
        // Generate realistic document data that changes over time
        const documentCount = Math.floor(Math.random() * 30) + 20; // Between 20-50 documents
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

        return sampleDocuments;
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

    applyFilters() {
        const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
        const category = document.getElementById('categoryFilter')?.value || '';
        const status = document.getElementById('statusFilter')?.value || '';

        const filtered = this.documents.filter(doc => {
            const matchesSearch = doc.title.toLowerCase().includes(search) ||
                doc.category.toLowerCase().includes(search);
            const matchesCategory = !category || doc.category === category;
            const matchesStatus = !status || doc.status === status;

            return matchesSearch && matchesCategory && matchesStatus;
        });

        this.renderDocuments(filtered);
    }

    renderDocuments(docs = this.documents) {
        const tbody = document.getElementById('documentsTableBody');
        const countEl = document.getElementById('documentCount');

        if (!tbody) return;

        tbody.innerHTML = '';

        // Update document count with animation
        if (countEl) {
            this.animateValue(countEl, parseInt(countEl.textContent) || 0, docs.length, 500);
        }

        docs.forEach(doc => {
            const row = document.createElement('tr');
            row.className = 'document-row';
            row.innerHTML = `
                <td><input type="checkbox" class="doc-checkbox" data-id="${doc.id}"></td>
                <td>
                    <div class="file-info">
                        <div class="file-icon" style="background: #eff6ff; color: #2563eb;">
                            <i class="fas fa-file-pdf"></i>
                        </div>
                        <div class="file-details">
                            <h4>${doc.title}</h4>
                            <div class="file-meta">${doc.files[0]?.name || 'Unknown'}</div>
                        </div>
                    </div>
                </td>
                <td><span class="badge badge-secondary">${doc.category}</span></td>
                <td>${this.formatDate(doc.uploadedAt)}</td>
                <td><span class="status-badge status-${doc.status}">${doc.status}</span></td>
                <td>${this.formatFileSize(doc.files[0]?.size || 0)}</td>
                <td>
                    <div class="document-actions">
                        <button class="action-btn action-view" onclick="viewDocument('${doc.id}')" title="View document">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn action-download" onclick="downloadDocument('${doc.id}')" title="Download document">
                            <i class="fas fa-download"></i>
                        </button>
                        ${this.canUserApprove(doc) ? `
                        <button class="action-btn action-approve" onclick="approveDocument('${doc.id}')" data-action="approve" title="Approve document">
                            <i class="fas fa-check"></i>
                        </button>` : ''}
                        ${this.canUserReject(doc) ? `
                        <button class="action-btn action-reject" onclick="rejectDocument('${doc.id}')" data-action="reject" title="Reject document">
                            <i class="fas fa-times"></i>
                        </button>` : ''}
                        ${this.canUserEdit(doc) ? `
                        <button class="action-btn action-edit" onclick="editDocument('${doc.id}')" data-action="edit" title="Edit document">
                            <i class="fas fa-edit"></i>
                        </button>` : ''}
                        ${this.canUserDelete(doc) ? `
                        <button class="action-btn action-delete" onclick="deleteDocument('${doc.id}')" data-action="delete" title="Delete document">
                            <i class="fas fa-trash"></i>
                        </button>` : ''}
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Add animation function for document count
    animateValue(element, start, end, duration) {
        if (start === end) return;

        const range = end - start;
        let current = start;
        const increment = end > start ? 1 : -1;
        const stepTime = Math.abs(Math.floor(duration / range));

        const timer = setInterval(() => {
            current += increment;
            element.textContent = current;

            if (current === end) {
                clearInterval(timer);
            }
        }, stepTime || 10);
    }

    selectAll(checked) {
        document.querySelectorAll('.doc-checkbox').forEach(cb => cb.checked = checked);
    }

    formatDate(dateStr) {
        return new Date(dateStr).toLocaleDateString();
    }

    formatFileSize(bytes) {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    updateDocumentCount() {
        const countEl = document.getElementById('documentCount');
        if (countEl) {
            const documents = JSON.parse(localStorage.getItem('kmrl_documents') || '[]');
            this.animateValue(countEl, parseInt(countEl.textContent) || 0, documents.length, 500);
        }
    }
}

function applyFilters() {
    window.documentsManager?.applyFilters();
}

function viewDocument(id) {
    // Get document details
    const documents = JSON.parse(localStorage.getItem('kmrl_documents') || '[]');
    const document = documents.find(doc => doc.id === id);

    if (!document) {
        alert('Document not found');
        return;
    }

    // Increment view count
    document.views = (document.views || 0) + 1;
    localStorage.setItem('kmrl_documents', JSON.stringify(documents));

    // Create and show modal with document details
    const modal = createDocumentViewModal(document);
    document.body.appendChild(modal);
    modal.classList.add('show');
}

function createDocumentViewModal(doc) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1050;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;

    modal.innerHTML = `
        <div class="modal-dialog" style="max-width: 800px; width: 90%; max-height: 90vh; overflow-y: auto;">
            <div class="modal-content" style="background: white; border-radius: 1rem; box-shadow: 0 20px 40px rgba(0,0,0,0.15);">
                <div class="modal-header" style="padding: 2rem 2rem 1rem 2rem; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h2 style="margin: 0; color: #1e293b; font-size: 1.5rem;">
                            <i class="fas fa-file-alt" style="color: #2563eb; margin-right: 0.5rem;"></i>
                            ${doc.title}
                        </h2>
                        <p style="margin: 0.5rem 0 0 0; color: #64748b;">Document Details & Attributes</p>
                    </div>
                    <button type="button" class="close-btn" onclick="this.closest('.modal').remove()" style="background: none; border: none; font-size: 1.5rem; color: #6b7280; cursor: pointer; padding: 0.5rem;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body" style="padding: 2rem;">
                    <!-- Document Info Grid -->
                    <div class="doc-info-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-bottom: 2rem;">
                        
                        <!-- Basic Information -->
                        <div class="info-section">
                            <h4 style="margin: 0 0 1rem 0; color: #374151; font-size: 1.1rem; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem;">
                                <i class="fas fa-info-circle" style="color: #2563eb; margin-right: 0.5rem;"></i>
                                Basic Information
                            </h4>
                            <div class="info-item" style="margin-bottom: 1rem;">
                                <label style="font-weight: 600; color: #4b5563; display: block; margin-bottom: 0.25rem;">Title:</label>
                                <span style="color: #1e293b;">${doc.title}</span>
                            </div>
                            <div class="info-item" style="margin-bottom: 1rem;">
                                <label style="font-weight: 600; color: #4b5563; display: block; margin-bottom: 0.25rem;">Category:</label>
                                <span class="badge" style="background: #eff6ff; color: #2563eb; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.8rem; text-transform: capitalize;">${doc.category}</span>
                            </div>
                            <div class="info-item" style="margin-bottom: 1rem;">
                                <label style="font-weight: 600; color: #4b5563; display: block; margin-bottom: 0.25rem;">Status:</label>
                                <span class="status-badge status-${doc.status}" style="padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 500; text-transform: capitalize;">${doc.status}</span>
                            </div>
                            <div class="info-item" style="margin-bottom: 1rem;">
                                <label style="font-weight: 600; color: #4b5563; display: block; margin-bottom: 0.25rem;">Access Level:</label>
                                <span style="color: #1e293b; text-transform: capitalize;">${doc.accessLevel || 'Not specified'}</span>
                            </div>
                            <div class="info-item" style="margin-bottom: 1rem;">
                                <label style="font-weight: 600; color: #4b5563; display: block; margin-bottom: 0.25rem;">Description:</label>
                                <span style="color: #1e293b;">${doc.description || 'No description available'}</span>
                            </div>
                        </div>

                        <!-- Upload Information -->
                        <div class="info-section">
                            <h4 style="margin: 0 0 1rem 0; color: #374151; font-size: 1.1rem; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem;">
                                <i class="fas fa-upload" style="color: #059669; margin-right: 0.5rem;"></i>
                                Upload Information
                            </h4>
                            <div class="info-item" style="margin-bottom: 1rem;">
                                <label style="font-weight: 600; color: #4b5563; display: block; margin-bottom: 0.25rem;">Uploaded By:</label>
                                <span style="color: #1e293b;">${doc.uploadedBy}</span>
                            </div>
                            <div class="info-item" style="margin-bottom: 1rem;">
                                <label style="font-weight: 600; color: #4b5563; display: block; margin-bottom: 0.25rem;">Upload Date:</label>
                                <span style="color: #1e293b;">${new Date(doc.uploadedAt).toLocaleString()}</span>
                            </div>
                            <div class="info-item" style="margin-bottom: 1rem;">
                                <label style="font-weight: 600; color: #4b5563; display: block; margin-bottom: 0.25rem;">Document ID:</label>
                                <span style="color: #6b7280; font-family: monospace; font-size: 0.9rem;">${doc.id}</span>
                            </div>
                        </div>
                    </div>

                    <!-- File Information -->
                    <div class="file-info-section" style="margin-bottom: 2rem;">
                        <h4 style="margin: 0 0 1rem 0; color: #374151; font-size: 1.1rem; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem;">
                            <i class="fas fa-file" style="color: #d97706; margin-right: 0.5rem;"></i>
                            File Information
                        </h4>
                        ${doc.files && doc.files.length > 0 ? doc.files.map(file => `
                            <div class="file-item" style="background: #f8fafc; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; border: 1px solid #e5e7eb;">
                                <div style="display: flex; align-items: center; justify-content: between; margin-bottom: 0.5rem;">
                                    <div style="display: flex; align-items: center; flex: 1;">
                                        <i class="fas fa-file-${getFileIcon(file.type)}" style="color: #2563eb; margin-right: 0.5rem; font-size: 1.2rem;"></i>
                                        <span style="font-weight: 600; color: #1e293b;">${file.name}</span>
                                    </div>
                                    <span style="background: #e5e7eb; color: #374151; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.8rem;">${formatFileSize(file.size)}</span>
                                </div>
                                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; font-size: 0.9rem;">
                                    <div>
                                        <label style="font-weight: 600; color: #4b5563;">Type:</label>
                                        <span style="color: #1e293b;">${file.type || 'Unknown'}</span>
                                    </div>
                                    <div>
                                        <label style="font-weight: 600; color: #4b5563;">Size:</label>
                                        <span style="color: #1e293b;">${formatFileSize(file.size)}</span>
                                    </div>
                                    ${file.lastModified ? `
                                    <div>
                                        <label style="font-weight: 600; color: #4b5563;">Modified:</label>
                                        <span style="color: #1e293b;">${new Date(file.lastModified).toLocaleDateString()}</span>
                                    </div>` : ''}
                                </div>
                            </div>
                        `).join('') : '<p style="color: #6b7280; font-style: italic;">No file information available</p>'}
                    </div>

                    <!-- Tags & Statistics -->
                    <div class="tags-stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
                        
                        <!-- Tags -->
                        <div class="tags-section">
                            <h4 style="margin: 0 0 1rem 0; color: #374151; font-size: 1.1rem; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem;">
                                <i class="fas fa-tags" style="color: #7c3aed; margin-right: 0.5rem;"></i>
                                Tags
                            </h4>
                            <div class="tags-container">
                                ${doc.tags && doc.tags.length > 0 ?
            doc.tags.map(tag => `<span class="tag" style="display: inline-block; background: #f3f4f6; color: #374151; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.8rem; margin: 0.25rem 0.25rem 0.25rem 0;">${tag}</span>`).join('') :
            '<p style="color: #6b7280; font-style: italic;">No tags assigned</p>'
        }
                            </div>
                        </div>

                        <!-- Statistics -->
                        <div class="stats-section">
                            <h4 style="margin: 0 0 1rem 0; color: #374151; font-size: 1.1rem; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem;">
                                <i class="fas fa-chart-bar" style="color: #dc2626; margin-right: 0.5rem;"></i>
                                Statistics
                            </h4>
                            <div class="stats-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                                <div class="stat-item" style="text-align: center; padding: 1rem; background: #f0fdf4; border-radius: 0.5rem; border: 1px solid #dcfce7;">
                                    <div style="font-size: 1.5rem; font-weight: 700; color: #059669;">${doc.views || 0}</div>
                                    <div style="font-size: 0.8rem; color: #065f46;">Views</div>
                                </div>
                                <div class="stat-item" style="text-align: center; padding: 1rem; background: #eff6ff; border-radius: 0.5rem; border: 1px solid #bfdbfe;">
                                    <div style="font-size: 1.5rem; font-weight: 700; color: #2563eb;">${doc.downloads || 0}</div>
                                    <div style="font-size: 0.8rem; color: #1e40af;">Downloads</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer" style="padding: 1rem 2rem 2rem 2rem; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 1rem;">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()" style="padding: 0.75rem 1.5rem; border: 1px solid #d1d5db; background: white; color: #374151; border-radius: 0.5rem; cursor: pointer;">
                        Close
                    </button>
                    <button type="button" class="btn btn-primary" onclick="downloadDocument('${doc.id}'); this.closest('.modal').remove();" style="padding: 0.75rem 1.5rem; background: #2563eb; color: white; border: none; border-radius: 0.5rem; cursor: pointer;">
                        <i class="fas fa-download" style="margin-right: 0.5rem;"></i>
                        Download
                    </button>
                </div>
            </div>
        </div>
    `;

    // Add show class for animation
    setTimeout(() => {
        modal.style.opacity = '1';
    }, 10);

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });

    return modal;
}

function getFileIcon(mimeType) {
    if (!mimeType) return 'file';

    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'word';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'excel';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'powerpoint';
    if (mimeType.includes('image')) return 'image';
    if (mimeType.includes('video')) return 'video';
    if (mimeType.includes('audio')) return 'audio';
    if (mimeType.includes('text')) return 'alt';
    if (mimeType.includes('zip') || mimeType.includes('archive')) return 'archive';

    return 'file';
}

function formatFileSize(bytes) {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function downloadDocument(id) {
    alert('Download document: ' + id);
}

function approveDocument(id) {
    // Backend validation - Check user permissions
    const currentUser = JSON.parse(localStorage.getItem('kmrl_user') || 'null');
    if (!currentUser) {
        if (window.showNotification) {
            window.showNotification('Access Denied: Please log in to continue', 'error');
        }
        return;
    }

    if (!['admin', 'manager'].includes(currentUser.role)) {
        if (window.showNotification) {
            window.showNotification('Access Denied: You do not have permission to approve documents', 'error');
        } else {
            alert('Access Denied: You do not have permission to approve documents');
        }
        return;
    }

    try {
        // Get existing documents
        const documents = JSON.parse(localStorage.getItem('kmrl_documents') || '[]');

        // Find and validate the document
        const docIndex = documents.findIndex(doc => doc.id === id);
        if (docIndex === -1) {
            throw new Error('Document not found');
        }

        const document = documents[docIndex];

        // Additional validation for managers - department check
        if (currentUser.role === 'manager') {
            const users = JSON.parse(localStorage.getItem('kmrl_users') || '[]');
            const uploader = users.find(user =>
                user.name === document.uploadedBy || user.id === document.uploadedBy
            );

            if (!uploader || uploader.department !== currentUser.department) {
                throw new Error('You can only approve documents from your department');
            }
        }

        // Check if document is in pending status
        if (document.status !== 'pending') {
            throw new Error('Only pending documents can be approved');
        }

        // Update document status
        documents[docIndex].status = 'approved';
        documents[docIndex].approvedAt = new Date().toISOString();
        documents[docIndex].approvedBy = currentUser.name;

        // Save back to localStorage
        localStorage.setItem('kmrl_documents', JSON.stringify(documents));

        // Log the approval
        logSecurityAction('approve_document', {
            documentId: id,
            documentTitle: document.title,
            approvedBy: currentUser.name,
            timestamp: new Date().toISOString()
        });

        // Show success notification
        if (window.showNotification) {
            window.showNotification('Document approved successfully!', 'success');
        } else {
            alert('Document approved successfully!');
        }

        // Refresh the documents list
        if (window.documentsManager) {
            window.documentsManager.loadDocuments();
            window.documentsManager.applyFilters();
        }
    } catch (error) {
        console.error('Error approving document:', error);
        if (window.showNotification) {
            window.showNotification('Failed to approve document: ' + error.message, 'error');
        } else {
            alert('Failed to approve document: ' + error.message);
        }
    }
}

function deleteDocument(id) {
    // Backend validation - Check user permissions
    const currentUser = JSON.parse(localStorage.getItem('kmrl_user') || 'null');
    if (!currentUser || currentUser.role !== 'admin') {
        if (window.showNotification) {
            window.showNotification('Access Denied: Only administrators can delete documents', 'error');
        } else {
            alert('Access Denied: Only administrators can delete documents');
        }
        return;
    }

    if (confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
        try {
            // Get existing documents
            const documents = JSON.parse(localStorage.getItem('kmrl_documents') || '[]');

            // Additional validation - ensure document exists
            const docIndex = documents.findIndex(doc => doc.id === id);
            if (docIndex === -1) {
                throw new Error('Document not found');
            }

            // Log the deletion attempt
            logSecurityAction('delete_document', {
                documentId: id,
                documentTitle: documents[docIndex].title,
                user: currentUser.name,
                timestamp: new Date().toISOString()
            });

            // Filter out the document to delete
            const updatedDocuments = documents.filter(doc => doc.id !== id);

            // Save back to localStorage
            localStorage.setItem('kmrl_documents', JSON.stringify(updatedDocuments));

            // Show success notification
            if (window.showNotification) {
                window.showNotification('Document deleted successfully!', 'success');
            } else {
                alert('Document deleted successfully!');
            }

            // Refresh the documents list
            if (window.documentsManager) {
                window.documentsManager.loadDocuments();
                window.documentsManager.applyFilters();
            }
        } catch (error) {
            console.error('Error deleting document:', error);
            if (window.showNotification) {
                window.showNotification('Failed to delete document: ' + error.message, 'error');
            } else {
                alert('Failed to delete document: ' + error.message);
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.documentsManager = new DocumentsManager();

    // Add sample documents if none exist
    const existingDocs = JSON.parse(localStorage.getItem('kmrl_documents') || '[]');
    if (existingDocs.length === 0) {
        const sampleDocs = [
            {
                id: 'sample_001',
                title: 'Engineering Safety Report 2024',
                category: 'technical',
                description: 'Annual safety report for engineering operations',
                tags: ['safety', 'engineering', 'annual'],
                accessLevel: 'internal',
                files: [{
                    name: 'Engineering_Safety_Report_2024.txt',
                    size: 15420,
                    type: 'text/plain',
                    lastModified: Date.now()
                }],
                uploadedBy: 'John Doe',
                uploadedAt: new Date().toISOString(),
                status: 'pending',
                downloads: 0,
                views: 0
            },
            {
                id: 'sample_002',
                title: 'HR Policy Manual 2024',
                category: 'hr',
                description: 'Updated HR policies and procedures',
                tags: ['hr', 'policy', 'manual'],
                accessLevel: 'internal',
                files: [{
                    name: 'HR_Policy_Manual_2024.txt',
                    size: 28450,
                    type: 'text/plain',
                    lastModified: Date.now() - 86400000
                }],
                uploadedBy: 'Jane Smith',
                uploadedAt: new Date(Date.now() - 86400000).toISOString(),
                status: 'approved',
                downloads: 5,
                views: 12
            },
            {
                id: 'sample_003',
                title: 'Financial Quarter Report Q3',
                category: 'financial',
                description: 'Q3 financial performance analysis',
                tags: ['financial', 'quarterly', 'report'],
                accessLevel: 'confidential',
                files: [{
                    name: 'Finance_Q3_2024_Report.txt',
                    size: 42350,
                    type: 'text/plain',
                    lastModified: Date.now() - 172800000
                }],
                uploadedBy: 'Finance Team',
                uploadedAt: new Date(Date.now() - 172800000).toISOString(),
                status: 'pending',
                downloads: 0,
                views: 3
            }
        ];

        localStorage.setItem('kmrl_documents', JSON.stringify(sampleDocs));
    }
});

// Refresh documents function
function refreshDocuments() {
    if (window.documentsManager) {
        window.documentsManager.loadDocuments();
        window.documentsManager.applyFilters();
        
        // Show refresh notification
        if (window.showNotification) {
            window.showNotification('Documents refreshed successfully!', 'success');
        }
    }
}

// Reject document function with backend validation
function rejectDocument(id) {
    // Backend validation - Check user permissions
    const currentUser = JSON.parse(localStorage.getItem('kmrl_user') || 'null');
    if (!currentUser) {
        if (window.showNotification) {
            window.showNotification('Access Denied: Please log in to continue', 'error');
        }
        return;
    }

    if (!['admin', 'manager'].includes(currentUser.role)) {
        if (window.showNotification) {
            window.showNotification('Access Denied: You do not have permission to reject documents', 'error');
        } else {
            alert('Access Denied: You do not have permission to reject documents');
        }
        return;
    }

    // Get rejection reason
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason || !reason.trim()) {
        if (window.showNotification) {
            window.showNotification('Rejection reason is required', 'warning');
        }
        return;
    }

    try {
        // Get existing documents
        const documents = JSON.parse(localStorage.getItem('kmrl_documents') || '[]');

        // Find and validate the document
        const docIndex = documents.findIndex(doc => doc.id === id);
        if (docIndex === -1) {
            throw new Error('Document not found');
        }

        const document = documents[docIndex];

        // Additional validation for managers - department check
        if (currentUser.role === 'manager') {
            const users = JSON.parse(localStorage.getItem('kmrl_users') || '[]');
            const uploader = users.find(user =>
                user.name === document.uploadedBy || user.id === document.uploadedBy
            );

            if (!uploader || uploader.department !== currentUser.department) {
                throw new Error('You can only reject documents from your department');
            }
        }

        // Check if document is in pending status
        if (document.status !== 'pending') {
            throw new Error('Only pending documents can be rejected');
        }

        // Update document status
        documents[docIndex].status = 'rejected';
        documents[docIndex].rejectedAt = new Date().toISOString();
        documents[docIndex].rejectedBy = currentUser.name;
        documents[docIndex].rejectionReason = reason;

        // Save back to localStorage
        localStorage.setItem('kmrl_documents', JSON.stringify(documents));

        // Log the rejection
        logSecurityAction('reject_document', {
            documentId: id,
            documentTitle: document.title,
            rejectedBy: currentUser.name,
            reason: reason,
            timestamp: new Date().toISOString()
        });

        // Show success notification
        if (window.showNotification) {
            window.showNotification('Document rejected successfully!', 'success');
        } else {
            alert('Document rejected successfully!');
        }

        // Refresh the documents list
        if (window.documentsManager) {
            window.documentsManager.loadDocuments();
            window.documentsManager.applyFilters();
        }
    } catch (error) {
        console.error('Error rejecting document:', error);
        if (window.showNotification) {
            window.showNotification('Failed to reject document: ' + error.message, 'error');
        } else {
            alert('Failed to reject document: ' + error.message);
        }
    }
}

// Edit document function with validation
function editDocument(id) {
    const currentUser = JSON.parse(localStorage.getItem('kmrl_user') || 'null');
    if (!currentUser) {
        if (window.showNotification) {
            window.showNotification('Access Denied: Please log in to continue', 'error');
        }
        return;
    }

    // Get document and validate permissions
    const documents = JSON.parse(localStorage.getItem('kmrl_documents') || '[]');
    const document = documents.find(doc => doc.id === id);

    if (!document) {
        if (window.showNotification) {
            window.showNotification('Document not found', 'error');
        }
        return;
    }

    // Check permissions
    if (currentUser.role !== 'admin' &&
        (currentUser.role !== 'staff' || document.uploadedBy !== currentUser.name)) {
        if (window.showNotification) {
            window.showNotification('Access Denied: You can only edit your own documents', 'error');
        }
        return;
    }

    // Only allow editing of pending documents
    if (document.status !== 'pending' && currentUser.role !== 'admin') {
        if (window.showNotification) {
            window.showNotification('You can only edit pending documents', 'warning');
        }
        return;
    }

    // Redirect to upload page with edit parameters
    window.location.href = `upload.html?edit=${id}`;
}

// Security logging function
function logSecurityAction(action, details) {
    try {
        const securityLog = JSON.parse(localStorage.getItem('kmrl_security_log') || '[]');

        const logEntry = {
            id: Date.now().toString(),
            action: action,
            details: details,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            sessionId: localStorage.getItem('kmrl_session_id') || 'unknown'
        };

        securityLog.push(logEntry);

        // Keep only last 1000 entries
        if (securityLog.length > 1000) {
            securityLog.splice(0, securityLog.length - 1000);
        }

        localStorage.setItem('kmrl_security_log', JSON.stringify(securityLog));

        // In production, this would also send to server
        console.log('Security action logged:', logEntry);
    } catch (error) {
        console.error('Failed to log security action:', error);
    }
}
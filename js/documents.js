// KMRL Document Management System - Documents JavaScript

class DocumentsManager {
    constructor() {
        this.currentUser = window.KMRL.getCurrentUser();
        this.documents = [];
        this.filteredDocuments = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.selectedDocuments = new Set();
        this.init();
    }

    async init() {
        if (!this.currentUser) {
            window.KMRL.redirectToLogin();
            return;
        }

        this.setupEventListeners();
        await this.loadDocuments();
        this.handleURLParams();
    }

    setupEventListeners() {
        // Search
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.handleSearch());
        }

        // Filters
        document.getElementById('departmentFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('statusFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('sortBy').addEventListener('change', () => this.applyFilters());

        // Bulk actions
        document.getElementById('selectAll').addEventListener('change', (e) => this.handleSelectAll(e));
        document.getElementById('bulkApprove').addEventListener('click', () => this.handleBulkAction('approve'));
        document.getElementById('bulkReject').addEventListener('click', () => this.handleBulkAction('reject'));
        document.getElementById('bulkDownload').addEventListener('click', () => this.handleBulkDownload());

        // New document button
        document.getElementById('newDocumentBtn').addEventListener('click', () => {
            window.location.href = 'upload.html';
        });

        // Modal
        document.getElementById('closeModal').addEventListener('click', () => this.closeDocumentModal());
        document.getElementById('downloadDoc').addEventListener('click', () => this.downloadDocument());
        document.getElementById('approveDoc').addEventListener('click', () => this.approveDocument());
        document.getElementById('rejectDoc').addEventListener('click', () => this.rejectDocument());
    }

    async loadDocuments() {
        const loadingState = document.getElementById('loadingState');
        loadingState.style.display = 'block';

        try {
            // Load from localStorage (demo data) and API simulation
            const storedUploads = JSON.parse(localStorage.getItem('kmrl_uploads') || '[]');
            const mockDocuments = window.KMRL.generateMockDocuments();

            this.documents = [...storedUploads, ...mockDocuments];

            // Apply role-based filtering
            if (this.currentUser.role === 'staff') {
                this.documents = this.documents.filter(doc =>
                    doc.uploadedBy === this.currentUser.email
                );
            }

            this.applyFilters();
        } catch (error) {
            console.error('Failed to load documents:', error);
            window.KMRL.showToast('Failed to load documents', 'error');
        } finally {
            loadingState.style.display = 'none';
        }
    }

    handleURLParams() {
        const urlParams = new URLSearchParams(window.location.search);

        const filter = urlParams.get('filter');
        if (filter === 'my') {
            // Show user's documents
            this.documents = this.documents.filter(doc =>
                doc.uploadedBy === this.currentUser.email
            );
        } else if (filter === 'pending') {
            document.getElementById('statusFilter').value = 'pending';
        }

        const focus = urlParams.get('focus');
        if (focus === 'search') {
            document.getElementById('searchInput').focus();
        }

        this.applyFilters();
    }

    handleSearch() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();

        if (searchTerm.length === 0) {
            this.filteredDocuments = [...this.documents];
        } else {
            this.filteredDocuments = this.documents.filter(doc =>
                doc.title.toLowerCase().includes(searchTerm) ||
                doc.department.toLowerCase().includes(searchTerm) ||
                doc.uploadedBy.toLowerCase().includes(searchTerm) ||
                (doc.description && doc.description.toLowerCase().includes(searchTerm))
            );
        }

        this.currentPage = 1;
        this.renderDocuments();
        this.renderPagination();
    }

    applyFilters() {
        let filtered = [...this.documents];

        // Department filter
        const departmentFilter = document.getElementById('departmentFilter').value;
        if (departmentFilter) {
            filtered = filtered.filter(doc => doc.department === departmentFilter);
        }

        // Status filter
        const statusFilter = document.getElementById('statusFilter').value;
        if (statusFilter) {
            filtered = filtered.filter(doc => doc.status === statusFilter);
        }

        // Apply search
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(doc =>
                doc.title.toLowerCase().includes(searchTerm) ||
                doc.department.toLowerCase().includes(searchTerm) ||
                doc.uploadedBy.toLowerCase().includes(searchTerm)
            );
        }

        // Sort
        const sortBy = document.getElementById('sortBy').value;
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'date_desc':
                    return new Date(b.uploadDate) - new Date(a.uploadDate);
                case 'date_asc':
                    return new Date(a.uploadDate) - new Date(b.uploadDate);
                case 'title_asc':
                    return a.title.localeCompare(b.title);
                case 'title_desc':
                    return b.title.localeCompare(a.title);
                default:
                    return 0;
            }
        });

        this.filteredDocuments = filtered;
        this.currentPage = 1;
        this.renderDocuments();
        this.renderPagination();
    }

    renderDocuments() {
        const tbody = document.getElementById('documentsTableBody');
        const emptyState = document.getElementById('emptyState');

        if (this.filteredDocuments.length === 0) {
            tbody.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageDocuments = this.filteredDocuments.slice(startIndex, endIndex);

        tbody.innerHTML = pageDocuments.map(doc => `
            <tr>
                <td>
                    <input type="checkbox" class="doc-select" data-doc-id="${doc.id}" 
                           onchange="documentsManager.handleDocumentSelect('${doc.id}', this.checked)">
                </td>
                <td>
                    <div class="document-info">
                        <div class="doc-title">
                            <a href="#" onclick="documentsManager.viewDocument('${doc.id}')">${doc.title}</a>
                        </div>
                        <div class="doc-meta">
                            ${doc.fileCount || 1} file(s) • ${this.formatFileSize(doc.fileSize || 1024000)}
                        </div>
                    </div>
                </td>
                <td>
                    <span class="department-badge">${doc.department}</span>
                </td>
                <td>${doc.uploadedBy}</td>
                <td>${window.KMRL.formatDate(doc.uploadDate)}</td>
                <td>
                    <span class="badge badge-${this.getStatusClass(doc.status)}">${doc.status}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-secondary" onclick="documentsManager.viewDocument('${doc.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-primary" onclick="documentsManager.downloadDocument('${doc.id}')">
                            <i class="fas fa-download"></i>
                        </button>
                        ${this.canManageDocument(doc) ? `
                            <button class="btn btn-sm btn-success" onclick="documentsManager.approveDocument('${doc.id}')">
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="documentsManager.rejectDocument('${doc.id}')">
                                <i class="fas fa-times"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');

        this.updatePaginationInfo();
    }

    renderPagination() {
        const pagination = document.getElementById('pagination');
        const totalPages = Math.ceil(this.filteredDocuments.length / this.itemsPerPage);

        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let paginationHTML = '';

        // Previous button
        if (this.currentPage > 1) {
            paginationHTML += `<button onclick="documentsManager.goToPage(${this.currentPage - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>`;
        }

        // Page numbers
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(totalPages, this.currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `<button class="${i === this.currentPage ? 'active' : ''}" 
                               onclick="documentsManager.goToPage(${i})">${i}</button>`;
        }

        // Next button
        if (this.currentPage < totalPages) {
            paginationHTML += `<button onclick="documentsManager.goToPage(${this.currentPage + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>`;
        }

        pagination.innerHTML = paginationHTML;
    }

    updatePaginationInfo() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredDocuments.length);

        document.getElementById('itemsStart').textContent = this.filteredDocuments.length > 0 ? startIndex + 1 : 0;
        document.getElementById('itemsEnd').textContent = endIndex;
        document.getElementById('totalItems').textContent = this.filteredDocuments.length;
    }

    goToPage(page) {
        this.currentPage = page;
        this.renderDocuments();
        this.renderPagination();
    }

    handleDocumentSelect(docId, checked) {
        if (checked) {
            this.selectedDocuments.add(docId);
        } else {
            this.selectedDocuments.delete(docId);
        }

        this.updateBulkActions();
        this.updateSelectAllState();
    }

    handleSelectAll(e) {
        const checkboxes = document.querySelectorAll('.doc-select');
        checkboxes.forEach(checkbox => {
            checkbox.checked = e.target.checked;
            this.handleDocumentSelect(checkbox.dataset.docId, checkbox.checked);
        });
    }

    updateSelectAllState() {
        const selectAll = document.getElementById('selectAll');
        const checkboxes = document.querySelectorAll('.doc-select');
        const checkedBoxes = document.querySelectorAll('.doc-select:checked');

        if (checkedBoxes.length === 0) {
            selectAll.indeterminate = false;
            selectAll.checked = false;
        } else if (checkedBoxes.length === checkboxes.length) {
            selectAll.indeterminate = false;
            selectAll.checked = true;
        } else {
            selectAll.indeterminate = true;
            selectAll.checked = false;
        }
    }

    updateBulkActions() {
        const bulkActions = document.getElementById('bulkActions');
        const selectedCount = document.getElementById('selectedCount');

        if (this.selectedDocuments.size > 0) {
            bulkActions.style.display = 'flex';
            selectedCount.textContent = this.selectedDocuments.size;
        } else {
            bulkActions.style.display = 'none';
        }
    }

    async handleBulkAction(action) {
        const actionText = action === 'approve' ? 'approved' : 'rejected';

        try {
            // Simulate bulk processing
            window.KMRL.showToast(`Processing ${this.selectedDocuments.size} documents...`, 'info');

            await window.KMRL.delay(2000);

            // Update document statuses
            this.selectedDocuments.forEach(docId => {
                const doc = this.documents.find(d => d.id === docId);
                if (doc) {
                    doc.status = action === 'approve' ? 'approved' : 'rejected';
                }
            });

            // Update localStorage
            this.updateStoredDocuments();

            window.KMRL.showToast(`${this.selectedDocuments.size} documents ${actionText} successfully`, 'success');

            // Clear selection and refresh
            this.selectedDocuments.clear();
            this.renderDocuments();
            this.updateBulkActions();

        } catch (error) {
            window.KMRL.showToast(`Failed to ${action} documents`, 'error');
        }
    }

    async handleBulkDownload() {
        window.KMRL.showToast(`Preparing download for ${this.selectedDocuments.size} documents...`, 'info');

        // Simulate download preparation
        await window.KMRL.delay(2000);

        window.KMRL.showToast('Download started successfully', 'success');
    }

    viewDocument(docId) {
        const doc = this.documents.find(d => d.id === docId);
        if (!doc) return;

        const modal = document.getElementById('documentModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');

        modalTitle.textContent = doc.title;
        modalBody.innerHTML = `
            <div class="document-details">
                <div class="detail-row">
                    <label>Department:</label>
                    <span>${doc.department}</span>
                </div>
                <div class="detail-row">
                    <label>Uploaded by:</label>
                    <span>${doc.uploadedBy}</span>
                </div>
                <div class="detail-row">
                    <label>Upload date:</label>
                    <span>${window.KMRL.formatDate(doc.uploadDate, true)}</span>
                </div>
                <div class="detail-row">
                    <label>Status:</label>
                    <span class="badge badge-${this.getStatusClass(doc.status)}">${doc.status}</span>
                </div>
                ${doc.description ? `
                    <div class="detail-row">
                        <label>Description:</label>
                        <p>${doc.description}</p>
                    </div>
                ` : ''}
                <div class="detail-row">
                    <label>Files:</label>
                    <div class="file-list">
                        ${doc.files ? doc.files.map(file => `
                            <div class="file-item-preview">
                                <i class="fas ${this.getFileIcon(file.name)}"></i>
                                <span>${file.name}</span>
                                <small>(${this.formatFileSize(file.size)})</small>
                            </div>
                        `).join('') : `<div class="file-item-preview">
                            <i class="fas fa-file"></i>
                            <span>${doc.title}</span>
                        </div>`}
                    </div>
                </div>
            </div>
        `;

        // Store current document for modal actions
        this.currentModalDocument = doc;

        modal.classList.add('show');
    }

    closeDocumentModal() {
        const modal = document.getElementById('documentModal');
        modal.classList.remove('show');
        this.currentModalDocument = null;
    }

    async downloadDocument(docId) {
        const doc = docId ? this.documents.find(d => d.id === docId) : this.currentModalDocument;
        if (!doc) return;

        window.KMRL.showToast(`Downloading ${doc.title}...`, 'info');

        // Simulate download
        await window.KMRL.delay(1500);

        window.KMRL.showToast('Download completed successfully', 'success');
    }

    async approveDocument(docId) {
        const doc = docId ? this.documents.find(d => d.id === docId) : this.currentModalDocument;
        if (!doc) return;

        try {
            doc.status = 'approved';
            this.updateStoredDocuments();

            window.KMRL.showToast(`Document "${doc.title}" approved successfully`, 'success');

            if (this.currentModalDocument) {
                this.closeDocumentModal();
            }

            this.renderDocuments();

        } catch (error) {
            window.KMRL.showToast('Failed to approve document', 'error');
        }
    }

    async rejectDocument(docId) {
        const doc = docId ? this.documents.find(d => d.id === docId) : this.currentModalDocument;
        if (!doc) return;

        try {
            doc.status = 'rejected';
            this.updateStoredDocuments();

            window.KMRL.showToast(`Document "${doc.title}" rejected`, 'warning');

            if (this.currentModalDocument) {
                this.closeDocumentModal();
            }

            this.renderDocuments();

        } catch (error) {
            window.KMRL.showToast('Failed to reject document', 'error');
        }
    }

    updateStoredDocuments() {
        const storedUploads = this.documents.filter(doc => doc.id && doc.id.startsWith('upload_'));
        localStorage.setItem('kmrl_uploads', JSON.stringify(storedUploads));
    }

    canManageDocument(doc) {
        return this.currentUser.role === 'admin' ||
            (this.currentUser.role === 'manager' && doc.status === 'pending');
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

    getFileIcon(fileName) {
        const extension = fileName.split('.').pop().toLowerCase();
        const icons = {
            'pdf': 'fa-file-pdf',
            'docx': 'fa-file-word',
            'xlsx': 'fa-file-excel',
            'png': 'fa-file-image',
            'jpg': 'fa-file-image',
            'jpeg': 'fa-file-image'
        };
        return icons[extension] || 'fa-file';
    }

    formatFileSize(bytes) {
        return window.KMRL.formatFileSize(bytes);
    }
}

// Initialize documents manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.documentsManager = new DocumentsManager();
});
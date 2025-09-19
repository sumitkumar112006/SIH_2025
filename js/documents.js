// KMRL Document Management System - Documents JavaScript

class DocumentsManager {
    constructor() {
        this.documents = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.init();
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
        this.documents = storedDocs ? JSON.parse(storedDocs) : this.generateSampleDocuments();
        localStorage.setItem('kmrl_documents', JSON.stringify(this.documents));
    }

    generateSampleDocuments() {
        return [
            {
                id: 'doc_1',
                title: 'Financial Report Q4 2024',
                category: 'financial',
                files: [{ name: 'financial_report_q4.pdf', size: 2048000, type: 'application/pdf' }],
                uploadedAt: '2024-01-15T10:30:00Z',
                uploadedBy: 'Admin User',
                status: 'approved',
                downloads: 15,
                views: 45
            },
            {
                id: 'doc_2',
                title: 'Employee Handbook 2024',
                category: 'hr',
                files: [{ name: 'employee_handbook.docx', size: 1536000, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }],
                uploadedAt: '2024-01-10T14:20:00Z',
                uploadedBy: 'Manager User',
                status: 'pending',
                downloads: 8,
                views: 22
            }
        ];
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
        countEl.textContent = docs.length;

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
                        <button class="action-btn action-view" onclick="viewDocument('${doc.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn action-download" onclick="downloadDocument('${doc.id}')">
                            <i class="fas fa-download"></i>
                        </button>
                        ${doc.status === 'pending' ? `
                        <button class="action-btn action-approve" onclick="approveDocument('${doc.id}')">
                            <i class="fas fa-check"></i>
                        </button>` : ''}
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
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
}

function applyFilters() {
    window.documentsManager?.applyFilters();
}

function viewDocument(id) { alert('View document: ' + id); }
function downloadDocument(id) { alert('Download document: ' + id); }
function approveDocument(id) {
    alert('Approve document: ' + id);
    window.documentsManager?.applyFilters();
}

document.addEventListener('DOMContentLoaded', () => {
    window.documentsManager = new DocumentsManager();
});
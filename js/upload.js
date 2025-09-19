// KMRL Document Management System - Upload JavaScript

class UploadManager {
    constructor() {
        this.init();
        this.setupEventListeners();
        this.uploadedFiles = [];
    }

    init() {
        this.currentUser = this.getCurrentUser();
        this.setupDropZone();
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

    setupEventListeners() {
        const fileInput = document.getElementById('fileInput');
        const documentForm = document.getElementById('documentForm');

        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        if (documentForm) {
            documentForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
    }

    setupDropZone() {
        const dropZone = document.getElementById('dropZone');
        if (!dropZone) return;

        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, this.preventDefaults, false);
            document.body.addEventListener(eventName, this.preventDefaults, false);
        });

        // Highlight drop zone when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
        });

        // Handle dropped files
        dropZone.addEventListener('drop', (e) => this.handleDrop(e), false);

        // Handle click to browse
        dropZone.addEventListener('click', () => {
            const fileInput = document.getElementById('fileInput');
            if (fileInput) fileInput.click();
        });
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        this.handleFiles(files);
    }

    handleFileSelect(e) {
        const files = e.target.files;
        this.handleFiles(files);
    }

    handleFiles(files) {
        this.uploadedFiles = Array.from(files);

        if (this.uploadedFiles.length === 0) return;

        // Validate files
        const validFiles = this.validateFiles(this.uploadedFiles);

        if (validFiles.length === 0) {
            this.showError('No valid files selected. Please choose supported file types.');
            return;
        }

        this.uploadedFiles = validFiles;
        this.showUploadProgress();
        this.simulateUpload();
    }

    validateFiles(files) {
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain',
            'image/jpeg',
            'image/png',
            'image/gif'
        ];

        const maxSize = 50 * 1024 * 1024; // 50MB

        return files.filter(file => {
            if (!allowedTypes.includes(file.type)) {
                this.showError(`File type not supported: ${file.name}`);
                return false;
            }

            if (file.size > maxSize) {
                this.showError(`File too large: ${file.name} (max 50MB)`);
                return false;
            }

            return true;
        });
    }

    showUploadProgress() {
        const uploadProgress = document.getElementById('uploadProgress');
        const progressList = document.getElementById('progressList');

        if (!uploadProgress || !progressList) return;

        uploadProgress.style.display = 'block';
        progressList.innerHTML = '';

        this.uploadedFiles.forEach((file, index) => {
            const progressItem = document.createElement('div');
            progressItem.className = 'progress-item';
            progressItem.innerHTML = `
                <div class="file-icon">
                    <i class="${this.getFileIcon(file.type)}"></i>
                </div>
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${this.formatFileSize(file.size)}</div>
                </div>
                <div class="progress">
                    <div class="progress-bar" id="progress-${index}" style="width: 0%"></div>
                </div>
            `;
            progressList.appendChild(progressItem);
        });
    }

    async simulateUpload() {
        for (let i = 0; i < this.uploadedFiles.length; i++) {
            const progressBar = document.getElementById(`progress-${i}`);

            // Simulate upload progress
            for (let progress = 0; progress <= 100; progress += 10) {
                await this.delay(100);
                if (progressBar) {
                    progressBar.style.width = `${progress}%`;
                }
            }
        }

        // Show success and form
        this.showSuccess('Files uploaded successfully!');
        this.showDocumentForm();
    }

    showDocumentForm() {
        const uploadForm = document.getElementById('uploadForm');
        if (uploadForm) {
            uploadForm.style.display = 'block';

            // Auto-fill title if single file
            if (this.uploadedFiles.length === 1) {
                const titleInput = document.getElementById('documentTitle');
                if (titleInput) {
                    const fileName = this.uploadedFiles[0].name;
                    const titleWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
                    titleInput.value = titleWithoutExt;
                }
            }
        }
    }

    async handleFormSubmit(e) {
        e.preventDefault();

        const formData = {
            title: document.getElementById('documentTitle').value,
            category: document.getElementById('documentCategory').value,
            description: document.getElementById('documentDescription').value,
            tags: document.getElementById('documentTags').value,
            accessLevel: document.getElementById('accessLevel').value,
            files: this.uploadedFiles,
            uploadedBy: this.currentUser?.name || 'Unknown',
            uploadedAt: new Date().toISOString()
        };

        // Validate form
        if (!this.validateForm(formData)) {
            return;
        }

        try {
            // Show loading
            const submitBtn = e.target.querySelector('button[type="submit"]');
            this.setButtonLoading(submitBtn, true);

            // Simulate API call
            await this.delay(2000);

            // Save to localStorage (demo)
            this.saveDocument(formData);

            this.showSuccess('Document saved successfully!');

            // Reset form after delay
            setTimeout(() => {
                this.resetUpload();
                window.location.href = 'documents.html';
            }, 2000);

        } catch (error) {
            this.showError('Failed to save document. Please try again.');
        } finally {
            const submitBtn = e.target.querySelector('button[type="submit"]');
            this.setButtonLoading(submitBtn, false);
        }
    }

    validateForm(formData) {
        if (!formData.title.trim()) {
            this.showError('Document title is required');
            return false;
        }

        if (!formData.category) {
            this.showError('Please select a category');
            return false;
        }

        if (!formData.accessLevel) {
            this.showError('Please select an access level');
            return false;
        }

        return true;
    }

    saveDocument(formData) {
        // Get existing documents
        const existingDocs = JSON.parse(localStorage.getItem('kmrl_documents') || '[]');

        // Create new document record
        const newDoc = {
            id: this.generateId(),
            title: formData.title,
            category: formData.category,
            description: formData.description,
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
            accessLevel: formData.accessLevel,
            files: formData.files.map(file => ({
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified
            })),
            uploadedBy: formData.uploadedBy,
            uploadedAt: formData.uploadedAt,
            status: 'pending',
            downloads: 0,
            views: 0
        };

        // Add to documents array
        existingDocs.push(newDoc);

        // Save back to localStorage
        localStorage.setItem('kmrl_documents', JSON.stringify(existingDocs));
    }

    resetUpload() {
        // Reset file input
        const fileInput = document.getElementById('fileInput');
        if (fileInput) fileInput.value = '';

        // Hide progress and form
        const uploadProgress = document.getElementById('uploadProgress');
        const uploadForm = document.getElementById('uploadForm');

        if (uploadProgress) uploadProgress.style.display = 'none';
        if (uploadForm) uploadForm.style.display = 'none';

        // Reset form
        const documentForm = document.getElementById('documentForm');
        if (documentForm) documentForm.reset();

        // Clear uploaded files
        this.uploadedFiles = [];
    }

    getFileIcon(fileType) {
        const iconMap = {
            'application/pdf': 'fas fa-file-pdf text-danger',
            'application/msword': 'fas fa-file-word text-primary',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'fas fa-file-word text-primary',
            'application/vnd.ms-excel': 'fas fa-file-excel text-success',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'fas fa-file-excel text-success',
            'application/vnd.ms-powerpoint': 'fas fa-file-powerpoint text-warning',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'fas fa-file-powerpoint text-warning',
            'text/plain': 'fas fa-file-alt',
            'image/jpeg': 'fas fa-file-image text-info',
            'image/png': 'fas fa-file-image text-info',
            'image/gif': 'fas fa-file-image text-info'
        };

        return iconMap[fileType] || 'fas fa-file';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    setButtonLoading(button, loading) {
        if (!button) return;

        if (loading) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        } else {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-save"></i> Save Document';
        }
    }

    showSuccess(message) {
        if (window.showNotification) {
            window.showNotification(message, 'success');
        }
    }

    showError(message) {
        if (window.showNotification) {
            window.showNotification(message, 'error');
        }
    }

    generateId() {
        return 'doc_' + Math.random().toString(36).substr(2, 9);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Global function for reset
function resetUpload() {
    if (window.uploadManager) {
        window.uploadManager.resetUpload();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.uploadManager = new UploadManager();
});
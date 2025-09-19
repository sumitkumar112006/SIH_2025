// KMRL Document Management System - Upload JavaScript

class UploadManager {
    constructor() {
        this.selectedFiles = [];
        this.uploadQueue = [];
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.allowedTypes = ['.pdf', '.docx', '.xlsx', '.png', '.jpg', '.jpeg'];
        this.currentUser = window.KMRL.getCurrentUser();
        this.init();
    }

    init() {
        if (!this.currentUser) {
            window.KMRL.redirectToLogin();
            return;
        }

        this.setupEventListeners();
        this.setupDragAndDrop();
        this.loadRecentUploads();
        this.initializeChatbot();
    }

    setupEventListeners() {
        // File input
        const fileInput = document.getElementById('fileInput');
        const browseBtn = document.getElementById('browseBtn');
        const dropZone = document.getElementById('dropZone');

        if (browseBtn && fileInput) {
            browseBtn.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        if (dropZone) {
            dropZone.addEventListener('click', () => fileInput.click());
        }

        // Form submission
        const uploadForm = document.getElementById('uploadForm');
        if (uploadForm) {
            uploadForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Form buttons
        const resetBtn = document.getElementById('resetBtn');
        const saveDraftBtn = document.getElementById('saveDraftBtn');

        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetForm());
        }

        if (saveDraftBtn) {
            saveDraftBtn.addEventListener('click', () => this.saveDraft());
        }

        // Advanced options toggle
        const advancedToggle = document.getElementById('advancedToggle');
        const advancedOptions = document.getElementById('advancedOptions');

        if (advancedToggle && advancedOptions) {
            advancedToggle.addEventListener('click', () => {
                advancedToggle.classList.toggle('active');
                advancedOptions.classList.toggle('show');
            });
        }

        // Real-time validation
        document.getElementById('documentTitle').addEventListener('blur', () => this.validateTitle());
        document.getElementById('department').addEventListener('change', () => this.validateDepartment());
    }

    setupDragAndDrop() {
        const dropZone = document.getElementById('dropZone');
        if (!dropZone) return;

        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, this.preventDefaults);
            document.body.addEventListener(eventName, this.preventDefaults);
        });

        // Highlight drop zone when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.add('drag-over');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.remove('drag-over');
            });
        });

        // Handle dropped files
        dropZone.addEventListener('drop', (e) => {
            const files = Array.from(e.dataTransfer.files);
            this.processFiles(files);
        });
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        this.processFiles(files);
    }

    processFiles(files) {
        const validFiles = [];
        const errors = [];

        files.forEach(file => {
            const validation = this.validateFile(file);
            if (validation.valid) {
                validFiles.push(file);
            } else {
                errors.push(`${file.name}: ${validation.error}`);
            }
        });

        // Show errors if any
        if (errors.length > 0) {
            window.KMRL.showToast(`File validation errors: ${errors.join(', ')}`, 'error');
        }

        // Add valid files
        validFiles.forEach(file => {
            if (!this.selectedFiles.find(f => f.name === file.name && f.size === file.size)) {
                const fileData = {
                    file: file,
                    id: Date.now() + Math.random(),
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    lastModified: file.lastModified
                };
                this.selectedFiles.push(fileData);
            }
        });

        this.renderSelectedFiles();
        this.updateUploadButton();
    }

    validateFile(file) {
        // Check file size
        if (file.size > this.maxFileSize) {
            return {
                valid: false,
                error: `File too large. Maximum size is ${this.formatFileSize(this.maxFileSize)}`
            };
        }

        // Check file type
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        if (!this.allowedTypes.includes(fileExtension)) {
            return {
                valid: false,
                error: `File type not allowed. Supported: ${this.allowedTypes.join(', ')}`
            };
        }

        return { valid: true };
    }

    renderSelectedFiles() {
        const container = document.getElementById('selectedFiles');
        if (!container) return;

        if (this.selectedFiles.length === 0) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = this.selectedFiles.map(fileData => `
            <div class="file-item" data-file-id="${fileData.id}">
                <div class="file-info">
                    <div class="file-icon ${this.getFileIconClass(fileData.name)}">
                        <i class="fas ${this.getFileIcon(fileData.name)}"></i>
                    </div>
                    <div class="file-details">
                        <div class="file-name">${fileData.name}</div>
                        <div class="file-meta">
                            ${this.formatFileSize(fileData.size)} • 
                            ${new Date(fileData.lastModified).toLocaleDateString()}
                        </div>
                    </div>
                </div>
                <div class="file-actions">
                    <button type="button" class="file-remove" onclick="uploadManager.removeFile('${fileData.id}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    removeFile(fileId) {
        this.selectedFiles = this.selectedFiles.filter(f => f.id !== fileId);
        this.renderSelectedFiles();
        this.updateUploadButton();
    }

    getFileIconClass(fileName) {
        const extension = fileName.split('.').pop().toLowerCase();
        const iconClasses = {
            'pdf': 'pdf',
            'docx': 'docx',
            'xlsx': 'xlsx',
            'png': 'image',
            'jpg': 'image',
            'jpeg': 'image'
        };
        return iconClasses[extension] || 'default';
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

    updateUploadButton() {
        const uploadBtn = document.getElementById('uploadBtn');
        const btnText = uploadBtn.querySelector('.btn-text');

        if (this.selectedFiles.length === 0) {
            uploadBtn.disabled = true;
            btnText.textContent = 'Select Files to Upload';
        } else {
            uploadBtn.disabled = false;
            btnText.textContent = `Upload ${this.selectedFiles.length} Document${this.selectedFiles.length > 1 ? 's' : ''}`;
        }
    }

    async handleFormSubmit(e) {
        e.preventDefault();

        if (!this.validateForm()) {
            return;
        }

        const formData = this.gatherFormData();

        try {
            await this.uploadFiles(formData);
        } catch (error) {
            console.error('Upload failed:', error);
            window.KMRL.showToast('Upload failed. Please try again.', 'error');
        }
    }

    validateForm() {
        let isValid = true;

        // Validate required fields
        if (!this.validateTitle()) isValid = false;
        if (!this.validateDepartment()) isValid = false;

        // Validate files
        if (this.selectedFiles.length === 0) {
            window.KMRL.showToast('Please select at least one file to upload', 'error');
            isValid = false;
        }

        return isValid;
    }

    validateTitle() {
        const title = document.getElementById('documentTitle').value.trim();
        const errorElement = document.getElementById('titleError');

        if (!title) {
            errorElement.textContent = 'Document title is required';
            return false;
        } else if (title.length < 3) {
            errorElement.textContent = 'Title must be at least 3 characters long';
            return false;
        } else {
            errorElement.textContent = '';
            return true;
        }
    }

    validateDepartment() {
        const department = document.getElementById('department').value;
        const errorElement = document.getElementById('departmentError');

        if (!department) {
            errorElement.textContent = 'Please select a department';
            return false;
        } else {
            errorElement.textContent = '';
            return true;
        }
    }

    gatherFormData() {
        return {
            title: document.getElementById('documentTitle').value.trim(),
            department: document.getElementById('department').value,
            description: document.getElementById('description').value.trim(),
            category: document.getElementById('category').value,
            priority: document.getElementById('priority').value,
            tags: document.getElementById('tags').value.trim(),
            expiryDate: document.getElementById('expiryDate').value,
            version: document.getElementById('version').value.trim(),
            confidential: document.getElementById('confidential').checked,
            autoOCR: document.getElementById('autoOCR').checked,
            aiSummary: document.getElementById('aiSummary').checked,
            files: this.selectedFiles,
            uploadedBy: this.currentUser.email,
            uploadDate: new Date().toISOString()
        };
    }

    async uploadFiles(formData) {
        const uploadBtn = document.getElementById('uploadBtn');
        const progressSection = document.getElementById('uploadProgressSection');
        const progressList = document.getElementById('progressList');

        // Show loading state
        this.setUploadButtonState(true);
        progressSection.style.display = 'block';

        try {
            // Create progress items for each file
            const progressItems = formData.files.map(fileData => ({
                id: fileData.id,
                name: fileData.name,
                progress: 0,
                status: 'uploading',
                fileData: fileData
            }));

            this.renderProgressItems(progressItems);

            // Upload files sequentially
            for (let i = 0; i < progressItems.length; i++) {
                const item = progressItems[i];
                await this.uploadSingleFile(item, formData);

                // Update progress
                item.progress = 100;
                item.status = 'completed';
                this.updateProgressItem(item);
            }

            // Simulate additional processing
            await this.simulateProcessing(formData);

            // Success
            window.KMRL.showToast('Documents uploaded successfully!', 'success');
            window.KMRL.addNotification(
                'Upload Successful',
                `${formData.files.length} document(s) uploaded and sent for approval`,
                'success',
                true
            );

            // Reset form
            this.resetForm();
            this.loadRecentUploads();

        } catch (error) {
            window.KMRL.showToast('Upload failed: ' + error.message, 'error');
            throw error;
        } finally {
            this.setUploadButtonState(false);
            // Hide progress section after a delay
            setTimeout(() => {
                progressSection.style.display = 'none';
            }, 3000);
        }
    }

    renderProgressItems(items) {
        const progressList = document.getElementById('progressList');

        progressList.innerHTML = items.map(item => `
            <div class="progress-item" data-item-id="${item.id}">
                <div class="progress-info">
                    <div class="progress-name">${item.name}</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${item.progress}%"></div>
                    </div>
                </div>
                <div class="progress-status">
                    <span class="progress-percentage">${item.progress}%</span>
                    <span class="status-text">${this.getStatusText(item.status)}</span>
                </div>
            </div>
        `).join('');
    }

    updateProgressItem(item) {
        const progressItem = document.querySelector(`[data-item-id="${item.id}"]`);
        if (!progressItem) return;

        const progressFill = progressItem.querySelector('.progress-fill');
        const progressPercentage = progressItem.querySelector('.progress-percentage');
        const statusText = progressItem.querySelector('.status-text');

        progressFill.style.width = `${item.progress}%`;
        progressPercentage.textContent = `${item.progress}%`;
        statusText.textContent = this.getStatusText(item.status);

        // Add completion animation
        if (item.status === 'completed') {
            progressItem.classList.add('completed');
        }
    }

    async uploadSingleFile(progressItem, formData) {
        const steps = [
            { name: 'Validating file', duration: 500 },
            { name: 'Uploading', duration: 2000 },
            { name: 'Processing', duration: 1000 },
            { name: 'Completed', duration: 100 }
        ];

        let totalProgress = 0;

        for (const step of steps) {
            progressItem.status = step.name.toLowerCase();

            // Simulate progress
            const startProgress = totalProgress;
            const endProgress = totalProgress + (100 / steps.length);

            await this.animateProgress(progressItem, startProgress, endProgress, step.duration);
            totalProgress = endProgress;
        }

        // Simulate OCR and AI processing if enabled
        if (formData.autoOCR) {
            await this.simulateOCR(progressItem);
        }

        if (formData.aiSummary) {
            await this.simulateAISummary(progressItem);
        }
    }

    async animateProgress(progressItem, startProgress, endProgress, duration) {
        const steps = 20;
        const stepDuration = duration / steps;
        const progressStep = (endProgress - startProgress) / steps;

        for (let i = 0; i <= steps; i++) {
            progressItem.progress = Math.min(startProgress + (progressStep * i), endProgress);
            this.updateProgressItem(progressItem);
            await this.delay(stepDuration);
        }
    }

    async simulateOCR(progressItem) {
        progressItem.status = 'ocr_processing';
        this.updateProgressItem(progressItem);
        await this.delay(1500);

        // Simulate OCR completion
        window.KMRL.showToast(`OCR processing completed for ${progressItem.name}`, 'info');
    }

    async simulateAISummary(progressItem) {
        progressItem.status = 'ai_summary';
        this.updateProgressItem(progressItem);
        await this.delay(1000);

        // Simulate AI summary completion
        window.KMRL.showToast(`AI summary generated for ${progressItem.name}`, 'info');
    }

    async simulateProcessing(formData) {
        // Simulate additional backend processing
        await this.delay(1000);

        // Store in localStorage for demo purposes
        this.saveUploadRecord(formData);
    }

    saveUploadRecord(formData) {
        const uploads = JSON.parse(localStorage.getItem('kmrl_uploads') || '[]');

        const uploadRecord = {
            id: 'upload_' + Date.now(),
            title: formData.title,
            department: formData.department,
            description: formData.description,
            category: formData.category,
            priority: formData.priority,
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
            fileCount: formData.files.length,
            files: formData.files.map(f => ({
                name: f.name,
                size: f.size,
                type: f.type
            })),
            uploadedBy: formData.uploadedBy,
            uploadDate: formData.uploadDate,
            status: 'pending',
            confidential: formData.confidential,
            version: formData.version,
            expiryDate: formData.expiryDate
        };

        uploads.unshift(uploadRecord);
        localStorage.setItem('kmrl_uploads', JSON.stringify(uploads.slice(0, 50))); // Keep only last 50
    }

    getStatusText(status) {
        const statusTexts = {
            'uploading': 'Uploading...',
            'validating file': 'Validating...',
            'processing': 'Processing...',
            'ocr_processing': 'OCR Processing...',
            'ai_summary': 'Generating Summary...',
            'completed': 'Completed',
            'error': 'Error'
        };
        return statusTexts[status] || status;
    }

    setUploadButtonState(loading) {
        const uploadBtn = document.getElementById('uploadBtn');
        const btnText = uploadBtn.querySelector('.btn-text');
        const spinner = uploadBtn.querySelector('.spinner');

        uploadBtn.disabled = loading;
        uploadBtn.classList.toggle('loading', loading);

        if (loading) {
            btnText.style.opacity = '0';
            spinner.classList.remove('d-none');
        } else {
            btnText.style.opacity = '1';
            spinner.classList.add('d-none');
        }
    }

    resetForm() {
        // Clear files
        this.selectedFiles = [];
        this.renderSelectedFiles();
        this.updateUploadButton();

        // Reset form fields
        document.getElementById('uploadForm').reset();

        // Clear errors
        document.getElementById('titleError').textContent = '';
        document.getElementById('departmentError').textContent = '';

        // Hide progress section
        document.getElementById('uploadProgressSection').style.display = 'none';

        // Reset advanced options
        const advancedToggle = document.getElementById('advancedToggle');
        const advancedOptions = document.getElementById('advancedOptions');
        advancedToggle.classList.remove('active');
        advancedOptions.classList.remove('show');

        window.KMRL.showToast('Form reset successfully', 'info');
    }

    async saveDraft() {
        if (!this.validateTitle()) {
            window.KMRL.showToast('Please enter a document title to save draft', 'warning');
            return;
        }

        const formData = this.gatherFormData();

        // Save draft to localStorage
        const drafts = JSON.parse(localStorage.getItem('kmrl_drafts') || '[]');
        const draftId = 'draft_' + Date.now();

        const draft = {
            id: draftId,
            ...formData,
            savedAt: new Date().toISOString()
        };

        drafts.unshift(draft);
        localStorage.setItem('kmrl_drafts', JSON.stringify(drafts.slice(0, 10))); // Keep only last 10 drafts

        window.KMRL.showToast('Draft saved successfully', 'success');
    }

    async loadRecentUploads() {
        const container = document.getElementById('recentUploadsList');
        if (!container) return;

        try {
            const uploads = JSON.parse(localStorage.getItem('kmrl_uploads') || '[]');
            const recentUploads = uploads
                .filter(upload => upload.uploadedBy === this.currentUser.email)
                .slice(0, 5);

            if (recentUploads.length === 0) {
                container.innerHTML = '<div class="empty-state">No recent uploads</div>';
                return;
            }

            container.innerHTML = recentUploads.map(upload => `
                <div class="recent-upload-item">
                    <div class="upload-item-info">
                        <div class="upload-item-title">${upload.title}</div>
                        <div class="upload-item-meta">
                            ${upload.department} • ${upload.fileCount} file(s) • 
                            ${window.KMRL.formatRelativeTime(new Date(upload.uploadDate))}
                        </div>
                    </div>
                    <div class="upload-item-status">
                        <span class="badge badge-${this.getStatusClass(upload.status)}">${upload.status}</span>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('Failed to load recent uploads:', error);
            container.innerHTML = '<div class="error-state">Failed to load recent uploads</div>';
        }
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

    // Chatbot functionality
    initializeChatbot() {
        const chatbotToggle = document.getElementById('chatbotToggle');
        const chatbotContainer = document.getElementById('chatbotContainer');
        const chatbotClose = document.getElementById('chatbotClose');
        const chatbotSend = document.getElementById('chatbotSend');
        const chatbotInput = document.getElementById('chatbotInput');

        if (chatbotToggle) {
            chatbotToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.showChatbot();
            });
        }

        if (chatbotClose) {
            chatbotClose.addEventListener('click', () => {
                chatbotContainer.classList.remove('show');
            });
        }

        if (chatbotSend) {
            chatbotSend.addEventListener('click', () => this.sendChatMessage());
        }

        if (chatbotInput) {
            chatbotInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendChatMessage();
                }
            });
        }
    }

    showChatbot() {
        const chatbotContainer = document.getElementById('chatbotContainer');
        if (chatbotContainer) {
            chatbotContainer.classList.add('show');
            document.getElementById('chatbotInput').focus();
        }
    }

    async sendChatMessage() {
        const input = document.getElementById('chatbotInput');
        const messagesContainer = document.getElementById('chatbotMessages');

        if (!input.value.trim()) return;

        const userMessage = input.value.trim();
        input.value = '';

        // Add user message
        this.addChatMessage(userMessage, 'user');

        // Simulate AI response
        setTimeout(() => {
            const response = this.generateUploadChatResponse(userMessage);
            this.addChatMessage(response, 'bot');
        }, 1000);
    }

    addChatMessage(message, type) {
        const messagesContainer = document.getElementById('chatbotMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        messageDiv.innerHTML = `
            <div class="message-content">${message}</div>
            <div class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        `;

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    generateUploadChatResponse(userMessage) {
        const responses = {
            'file types': 'You can upload PDF, DOCX, XLSX, PNG, and JPG files. Maximum file size is 10MB per file.',
            'drag drop': 'Yes! You can drag and drop files directly onto the upload area or click to browse and select files.',
            'progress': 'Upload progress is shown in real-time with status updates for each file. You\'ll see validation, upload, and processing steps.',
            'ocr': 'OCR (Optical Character Recognition) automatically extracts text from your documents, making them searchable.',
            'ai summary': 'AI Summary generates a brief overview of your document content automatically after upload.',
            'department': 'Please select the appropriate department for your document to ensure proper routing for approval.',
            'tags': 'Tags help organize and search documents. Use relevant keywords separated by commas.',
            'approval': 'After upload, documents are sent to your department manager for approval. You\'ll receive notifications about status changes.',
            'draft': 'You can save your form as a draft to complete later. Drafts are saved locally in your browser.',
            'error': 'If you encounter upload errors, check file size (max 10MB), file type, and your internet connection.',
            'default': 'I can help with file uploads, supported formats, progress tracking, OCR processing, and approval workflow. What would you like to know?'
        };

        const lowerMessage = userMessage.toLowerCase();

        for (const [key, response] of Object.entries(responses)) {
            if (lowerMessage.includes(key.replace(' ', ''))) {
                return response;
            }
        }

        return responses.default;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize upload manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.uploadManager = new UploadManager();
});
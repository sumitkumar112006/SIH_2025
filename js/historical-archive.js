// KMRL Historical Archive System
// Maintain record of all past tenders and tech updates for future reference

class HistoricalArchive {
    constructor() {
        this.archivedTenders = [];
        this.archivedTechUpdates = [];
        this.archivedProjects = [];
        this.currentUser = this.getCurrentUser();
        this.userPermissions = this.getUserPermissions();
        this.init();
    }

    init() {
        this.loadArchivedData();
        this.createArchiveInterface();
        this.setupEventListeners();
    }

    getCurrentUser() {
        try {
            const userData = localStorage.getItem('kmrl_user');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            return null;
        }
    }

    getUserPermissions() {
        if (!this.currentUser) return { canView: false, canManage: false };

        const role = this.currentUser.role;
        const permissions = {
            admin: { canView: true, canManage: true, canDelete: true },
            manager: { canView: true, canManage: true, canDelete: false },
            staff: { canView: true, canManage: false, canDelete: false }
        };

        return permissions[role] || permissions.staff;
    }

    loadArchivedData() {
        try {
            this.archivedTenders = JSON.parse(localStorage.getItem('kmrl_archived_tenders') || '[]');
            this.archivedTechUpdates = JSON.parse(localStorage.getItem('kmrl_archived_tech') || '[]');
            this.archivedProjects = JSON.parse(localStorage.getItem('kmrl_archived_projects') || '[]');
        } catch (error) {
            this.archivedTenders = [];
            this.archivedTechUpdates = [];
            this.archivedProjects = [];
        }
    }

    saveData() {
        localStorage.setItem('kmrl_archived_tenders', JSON.stringify(this.archivedTenders));
        localStorage.setItem('kmrl_archived_tech', JSON.stringify(this.archivedTechUpdates));
        localStorage.setItem('kmrl_archived_projects', JSON.stringify(this.archivedProjects));
    }

    createArchiveInterface() {
        if (!this.userPermissions.canView) return;

        this.createArchiveWidget();
        this.addArchiveNavigation();
    }

    createArchiveWidget() {
        const container = document.querySelector('.dashboard-widgets') ||
            document.querySelector('.widgets-grid') ||
            document.querySelector('.main-content');

        if (container) {
            const archiveWidget = document.createElement('div');
            archiveWidget.className = 'widget archive-widget';
            archiveWidget.innerHTML = `
                <div class="widget-header">
                    <div class="widget-title">
                        <i class="fas fa-archive"></i>
                        <span>Historical Archive</span>
                    </div>
                    <div class="widget-actions">
                        <button id="openArchiveManager" class="btn-icon" title="Manage">
                            <i class="fas fa-folder-open"></i>
                        </button>
                    </div>
                </div>
                <div class="widget-content">
                    <div class="archive-stats">
                        <div class="stat-item">
                            <div class="stat-number" id="archivedTendersCount">0</div>
                            <div class="stat-label">Archived Tenders</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number" id="archivedTechCount">0</div>
                            <div class="stat-label">Tech Updates</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number" id="archivedProjectsCount">0</div>
                            <div class="stat-label">Projects</div>
                        </div>
                    </div>
                    <div class="recent-archive" id="recentArchiveList">
                        <div class="no-archive">No archived items</div>
                    </div>
                </div>
            `;

            container.appendChild(archiveWidget);
        }
    }

    addArchiveNavigation() {
        const sidebar = document.querySelector('.sidebar-nav') || document.querySelector('.nav-menu');
        if (sidebar) {
            const archiveNavItem = document.createElement('li');
            archiveNavItem.innerHTML = `
                <a href="#" id="archiveNav" class="nav-link">
                    <i class="fas fa-archive"></i>
                    <span>Archive</span>
                </a>
            `;
            sidebar.appendChild(archiveNavItem);
        }
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.id === 'openArchiveManager' || e.target.id === 'archiveNav') {
                e.preventDefault();
                this.openArchiveModal();
            }
        });
    }

    updateArchiveWidget() {
        document.getElementById('archivedTendersCount').textContent = this.archivedTenders.length;
        document.getElementById('archivedTechCount').textContent = this.archivedTechUpdates.length;
        document.getElementById('archivedProjectsCount').textContent = this.archivedProjects.length;

        this.updateRecentArchiveList();
    }

    updateRecentArchiveList() {
        const container = document.getElementById('recentArchiveList');
        if (!container) return;

        // Get recent archived items from all categories
        const allItems = [
            ...this.archivedTenders.map(item => ({ ...item, type: 'tender', archivedDate: item.archivedDate || new Date() })),
            ...this.archivedTechUpdates.map(item => ({ ...item, type: 'tech', archivedDate: item.archivedDate || new Date() })),
            ...this.archivedProjects.map(item => ({ ...item, type: 'project', archivedDate: item.archivedDate || new Date() }))
        ];

        // Sort by archived date (newest first)
        allItems.sort((a, b) => new Date(b.archivedDate) - new Date(a.archivedDate));

        const recentItems = allItems.slice(0, 5);

        if (recentItems.length === 0) {
            container.innerHTML = '<div class="no-archive">No archived items</div>';
            return;
        }

        container.innerHTML = recentItems.map(item => this.renderArchiveItem(item)).join('');
    }

    renderArchiveItem(item) {
        const iconMap = {
            tender: 'fa-gavel',
            tech: 'fa-microchip',
            project: 'fa-project-diagram'
        };

        const typeLabels = {
            tender: 'Tender',
            tech: 'Technology',
            project: 'Project'
        };

        return `
            <div class="archive-item">
                <div class="archive-icon">
                    <i class="fas ${iconMap[item.type]}"></i>
                </div>
                <div class="archive-info">
                    <div class="archive-title">${item.title || item.name}</div>
                    <div class="archive-meta">
                        <span class="archive-type">${typeLabels[item.type]}</span>
                        <span class="archive-date">${this.formatDate(item.archivedDate)}</span>
                    </div>
                </div>
                <div class="archive-actions">
                    <button class="btn-icon" onclick="archiveSystem.viewArchivedItem('${item.id}', '${item.type}')" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        `;
    }

    openArchiveModal() {
        if (!document.getElementById('archiveModal')) {
            this.createArchiveModal();
        }

        const modal = document.getElementById('archiveModal');
        modal.style.display = 'flex';
        this.updateArchiveModal();
    }

    createArchiveModal() {
        const modal = document.createElement('div');
        modal.id = 'archiveModal';
        modal.className = 'modal archive-modal';
        modal.style.display = 'none';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-container extra-large">
                <div class="modal-header">
                    <h2><i class="fas fa-archive"></i> Historical Archive</h2>
                    <button id="closeArchiveModal" class="close-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-content">
                    <div class="archive-filters">
                        <select id="archiveTypeFilter">
                            <option value="">All Types</option>
                            <option value="tender">Tenders</option>
                            <option value="tech">Technology Updates</option>
                            <option value="project">Projects</option>
                        </select>
                        <select id="archiveYearFilter">
                            <option value="">All Years</option>
                            <option value="2024">2024</option>
                            <option value="2023">2023</option>
                            <option value="2022">2022</option>
                        </select>
                        <input type="text" id="archiveSearch" placeholder="Search archived items...">
                    </div>
                    
                    <div class="archive-tabs">
                        <button class="tab-btn active" data-tab="all">All Items</button>
                        <button class="tab-btn" data-tab="tenders">Tenders (${this.archivedTenders.length})</button>
                        <button class="tab-btn" data-tab="tech">Technology (${this.archivedTechUpdates.length})</button>
                        <button class="tab-btn" data-tab="projects">Projects (${this.archivedProjects.length})</button>
                    </div>
                    
                    <div class="archive-content">
                        <div class="archive-list" id="archiveList">
                            <!-- Archive items will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Setup modal event listeners
        document.getElementById('closeArchiveModal').addEventListener('click', () => {
            modal.style.display = 'none';
        });

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.updateArchiveList(e.target.dataset.tab);
            });
        });

        // Filter events
        document.getElementById('archiveTypeFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('archiveYearFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('archiveSearch').addEventListener('input', () => this.applyFilters());
    }

    updateArchiveModal() {
        this.updateArchiveList('all');
    }

    updateArchiveList(tab) {
        const list = document.getElementById('archiveList');
        if (!list) return;

        let items = [];

        switch (tab) {
            case 'tenders':
                items = this.archivedTenders.map(item => ({ ...item, type: 'tender' }));
                break;
            case 'tech':
                items = this.archivedTechUpdates.map(item => ({ ...item, type: 'tech' }));
                break;
            case 'projects':
                items = this.archivedProjects.map(item => ({ ...item, type: 'project' }));
                break;
            default:
                items = [
                    ...this.archivedTenders.map(item => ({ ...item, type: 'tender' })),
                    ...this.archivedTechUpdates.map(item => ({ ...item, type: 'tech' })),
                    ...this.archivedProjects.map(item => ({ ...item, type: 'project' }))
                ];
        }

        // Apply filters
        items = this.applyFiltersToItems(items);

        // Sort by archived date (newest first)
        items.sort((a, b) => new Date(b.archivedDate) - new Date(a.archivedDate));

        if (items.length === 0) {
            list.innerHTML = '<div class="no-archive-results">No archived items found</div>';
            return;
        }

        list.innerHTML = items.map(item => this.renderArchiveListItem(item)).join('');
    }

    applyFiltersToItems(items) {
        const typeFilter = document.getElementById('archiveTypeFilter')?.value;
        const yearFilter = document.getElementById('archiveYearFilter')?.value;
        const searchFilter = document.getElementById('archiveSearch')?.value.toLowerCase();

        return items.filter(item => {
            // Type filter
            if (typeFilter && item.type !== typeFilter) return false;

            // Year filter
            if (yearFilter && new Date(item.archivedDate).getFullYear().toString() !== yearFilter) return false;

            // Search filter
            if (searchFilter) {
                const searchText = (item.title || item.name || '').toLowerCase();
                if (!searchText.includes(searchFilter)) return false;
            }

            return true;
        });
    }

    applyFilters() {
        // Get current active tab
        const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab || 'all';
        this.updateArchiveList(activeTab);
    }

    renderArchiveListItem(item) {
        const iconMap = {
            tender: 'fa-gavel',
            tech: 'fa-microchip',
            project: 'fa-project-diagram'
        };

        const typeLabels = {
            tender: 'Tender',
            tech: 'Technology',
            project: 'Project'
        };

        return `
            <div class="archive-list-item">
                <div class="item-header">
                    <div class="item-icon">
                        <i class="fas ${iconMap[item.type]}"></i>
                    </div>
                    <div class="item-info">
                        <div class="item-title">${item.title || item.name}</div>
                        <div class="item-meta">
                            <span class="item-type">${typeLabels[item.type]}</span>
                            <span class="item-date">Archived: ${this.formatDate(item.archivedDate)}</span>
                            ${item.organization ? `<span class="item-org">${item.organization}</span>` : ''}
                        </div>
                    </div>
                    <div class="item-actions">
                        <button class="btn btn-outline" onclick="archiveSystem.viewArchivedItem('${item.id}', '${item.type}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                        ${this.userPermissions.canManage ? `
                            <button class="btn btn-secondary" onclick="archiveSystem.restoreItem('${item.id}', '${item.type}')">
                                <i class="fas fa-redo"></i> Restore
                            </button>
                        ` : ''}
                    </div>
                </div>
                <div class="item-preview">
                    <p>${item.description || item.summary || 'No description available'}</p>
                </div>
            </div>
        `;
    }

    viewArchivedItem(itemId, type) {
        let item = null;

        switch (type) {
            case 'tender':
                item = this.archivedTenders.find(t => t.id === itemId);
                break;
            case 'tech':
                item = this.archivedTechUpdates.find(t => t.id === itemId);
                break;
            case 'project':
                item = this.archivedProjects.find(p => p.id === itemId);
                break;
        }

        if (item) {
            this.showArchivedItemDetails(item, type);
        }
    }

    showArchivedItemDetails(item, type) {
        const detailModal = document.createElement('div');
        detailModal.className = 'modal archive-detail-modal';
        detailModal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-container large">
                <div class="modal-header">
                    <h2>${item.title || item.name}</h2>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-content">
                    <div class="archive-item-details">
                        ${this.renderItemDetails(item, type)}
                    </div>
                    <div class="archive-item-actions">
                        ${this.userPermissions.canManage ? `
                            <button class="btn btn-primary" onclick="archiveSystem.restoreItem('${item.id}', '${type}')">
                                <i class="fas fa-redo"></i> Restore to Active
                            </button>
                        ` : ''}
                        <button class="btn btn-outline" onclick="this.closest('.modal').remove()">
                            <i class="fas fa-times"></i> Close
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(detailModal);
        detailModal.style.display = 'flex';
    }

    renderItemDetails(item, type) {
        switch (type) {
            case 'tender':
                return `
                    <div class="detail-section">
                        <h3>Tender Details</h3>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <label>Organization:</label>
                                <span>${item.organization}</span>
                            </div>
                            <div class="detail-item">
                                <label>Category:</label>
                                <span>${item.category}</span>
                            </div>
                            <div class="detail-item">
                                <label>Value:</label>
                                <span>₹${this.formatCurrency(item.value)}</span>
                            </div>
                            <div class="detail-item">
                                <label>Deadline:</label>
                                <span>${this.formatDate(item.submissionDeadline)}</span>
                            </div>
                            <div class="detail-item">
                                <label>Published:</label>
                                <span>${this.formatDate(item.publishDate)}</span>
                            </div>
                            <div class="detail-item">
                                <label>Status:</label>
                                <span class="status-badge ${item.status}">${item.status}</span>
                            </div>
                        </div>
                    </div>
                    <div class="detail-section">
                        <h3>Description</h3>
                        <p>${item.description}</p>
                    </div>
                    <div class="detail-section">
                        <h3>Archived Information</h3>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <label>Archived Date:</label>
                                <span>${this.formatDate(item.archivedDate)}</span>
                            </div>
                            <div class="detail-item">
                                <label>Reason:</label>
                                <span>${item.archiveReason || 'Manual archive'}</span>
                            </div>
                        </div>
                    </div>
                `;

            case 'tech':
                return `
                    <div class="detail-section">
                        <h3>Technology Update</h3>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <label>Source:</label>
                                <span>${item.source}</span>
                            </div>
                            <div class="detail-item">
                                <label>Category:</label>
                                <span>${item.category}</span>
                            </div>
                            <div class="detail-item">
                                <label>Relevance Score:</label>
                                <span>${item.relevanceScore}%</span>
                            </div>
                            <div class="detail-item">
                                <label>Published:</label>
                                <span>${this.formatDate(item.publishDate)}</span>
                            </div>
                        </div>
                    </div>
                    <div class="detail-section">
                        <h3>Summary</h3>
                        <p>${item.summary}</p>
                    </div>
                    <div class="detail-section">
                        <h3>Tags</h3>
                        <div class="tag-list">
                            ${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                    <div class="detail-section">
                        <h3>Archived Information</h3>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <label>Archived Date:</label>
                                <span>${this.formatDate(item.archivedDate)}</span>
                            </div>
                        </div>
                    </div>
                `;

            case 'project':
                return `
                    <div class="detail-section">
                        <h3>Project Details</h3>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <label>Department:</label>
                                <span>${item.department}</span>
                            </div>
                            <div class="detail-item">
                                <label>Manager:</label>
                                <span>${item.manager}</span>
                            </div>
                            <div class="detail-item">
                                <label>Status:</label>
                                <span class="status-badge ${item.status}">${item.status}</span>
                            </div>
                            <div class="detail-item">
                                <label>Start Date:</label>
                                <span>${this.formatDate(item.startDate)}</span>
                            </div>
                            <div class="detail-item">
                                <label>End Date:</label>
                                <span>${this.formatDate(item.endDate)}</span>
                            </div>
                            <div class="detail-item">
                                <label>Progress:</label>
                                <span>${item.progress}%</span>
                            </div>
                        </div>
                    </div>
                    <div class="detail-section">
                        <h3>Description</h3>
                        <p>${item.description}</p>
                    </div>
                    <div class="detail-section">
                        <h3>Archived Information</h3>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <label>Archived Date:</label>
                                <span>${this.formatDate(item.archivedDate)}</span>
                            </div>
                            <div class="detail-item">
                                <label>Reason:</label>
                                <span>${item.archiveReason || 'Project completion'}</span>
                            </div>
                        </div>
                    </div>
                `;
        }
    }

    restoreItem(itemId, type) {
        let item = null;
        let sourceArray = null;
        let targetArray = null;

        // Find the item and determine source/target arrays
        switch (type) {
            case 'tender':
                sourceArray = this.archivedTenders;
                targetArray = window.tenderTracker ? window.tenderTracker.tenders : [];
                item = this.archivedTenders.find(t => t.id === itemId);
                break;
            case 'tech':
                sourceArray = this.archivedTechUpdates;
                targetArray = window.techTracker ? window.techTracker.techUpdates : [];
                item = this.archivedTechUpdates.find(t => t.id === itemId);
                break;
            case 'project':
                sourceArray = this.archivedProjects;
                targetArray = window.projectTracker ? window.projectTracker.projects : [];
                item = this.archivedProjects.find(p => p.id === itemId);
                break;
        }

        if (item && targetArray) {
            // Remove from archive
            const index = sourceArray.findIndex(i => i.id === itemId);
            if (index > -1) {
                sourceArray.splice(index, 1);
            }

            // Add to active system
            // Remove archivedDate and archiveReason before restoring
            const restoredItem = { ...item };
            delete restoredItem.archivedDate;
            delete restoredItem.archiveReason;

            targetArray.push(restoredItem);

            // Save changes
            this.saveData();

            // Save to respective system
            if (type === 'tender' && window.tenderTracker) {
                window.tenderTracker.saveData();
            } else if (type === 'tech' && window.techTracker) {
                window.techTracker.saveData();
            } else if (type === 'project' && window.projectTracker) {
                window.projectTracker.saveData();
            }

            // Close detail modal if open
            const detailModal = document.querySelector('.archive-detail-modal');
            if (detailModal) {
                detailModal.remove();
            }

            // Show notification
            if (window.showNotification) {
                window.showNotification(`${type} restored successfully`, 'success');
            }

            // Update UI
            this.updateArchiveModal();
        }
    }

    // Methods for archiving items from other systems
    archiveTender(tender) {
        const archivedTender = {
            ...tender,
            archivedDate: new Date().toISOString(),
            archiveReason: 'Manual archive'
        };

        this.archivedTenders.push(archivedTender);
        this.saveData();
        this.updateArchiveWidget();

        if (window.showNotification) {
            window.showNotification('Tender archived successfully', 'success');
        }
    }

    archiveTechUpdate(techUpdate) {
        const archivedTech = {
            ...techUpdate,
            archivedDate: new Date().toISOString()
        };

        this.archivedTechUpdates.push(archivedTech);
        this.saveData();
        this.updateArchiveWidget();

        if (window.showNotification) {
            window.showNotification('Technology update archived successfully', 'success');
        }
    }

    archiveProject(project) {
        const archivedProject = {
            ...project,
            archivedDate: new Date().toISOString(),
            archiveReason: 'Project completion'
        };

        this.archivedProjects.push(archivedProject);
        this.saveData();
        this.updateArchiveWidget();

        if (window.showNotification) {
            window.showNotification('Project archived successfully', 'success');
        }
    }

    formatCurrency(amount) {
        if (amount >= 10000000) {
            return (amount / 10000000).toFixed(1) + ' Cr';
        } else if (amount >= 100000) {
            return (amount / 100000).toFixed(1) + ' L';
        } else {
            return (amount / 1000).toFixed(0) + ' K';
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }
}

// Initialize archive system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.archiveSystem = new HistoricalArchive();
});

window.HistoricalArchive = HistoricalArchive;
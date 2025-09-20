// KMRL Tender Tracking and Notification System

class TenderTracker {
    constructor() {
        this.tenders = [];
        this.notifications = [];
        this.monitoring = false;
        this.currentUser = this.getCurrentUser();
        this.userPermissions = this.getUserPermissions();
        this.apiEndpoints = {
            government: [
                'https://etenders.gov.in/eprocure',
                'https://gem.gov.in',
                'https://eproc.kerala.gov.in',
                'https://keri.kerala.gov.in'
            ],
            private: [
                'https://tenderdetail.com',
                'https://tenderwizard.com',
                'https://biddingowl.com'
            ]
        };
        this.keywords = [
            'metro', 'railway', 'transport', 'infrastructure', 'rail',
            'kochi metro', 'kmrl', 'signaling', 'rolling stock',
            'electrical', 'civil', 'mechanical', 'safety systems',
            'platform', 'station', 'tracks', 'automation'
        ];
        this.init();
    }

    init() {
        this.loadStoredData();
        this.setupNotificationSystem();
        this.createTenderInterface();
        this.startMonitoring();
        this.setupEventListeners();
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

    getUserPermissions() {
        if (!this.currentUser) return { canView: false, canTrack: false, canManage: false, canExport: false };

        const role = this.currentUser.role;
        const permissions = {
            admin: {
                canView: true,
                canTrack: true,
                canManage: true,
                canExport: true,
                canConfigureMonitoring: true,
                canManagePortals: true,
                canAccessAnalytics: true,
                canManageUsers: true,
                canViewAllTenders: true
            },
            manager: {
                canView: true,
                canTrack: true,
                canManage: true,
                canExport: true,
                canConfigureMonitoring: false,
                canManagePortals: false,
                canAccessAnalytics: true,
                canManageUsers: false,
                canViewAllTenders: true
            },
            staff: {
                canView: true,
                canTrack: true,
                canManage: false,
                canExport: false,
                canConfigureMonitoring: false,
                canManagePortals: false,
                canAccessAnalytics: false,
                canManageUsers: false,
                canViewAllTenders: false
            }
        };

        return permissions[role] || permissions.staff;
    }

    async loadStoredData() {
        try {
            // Load tenders from API instead of localStorage
            if (window.apiClient) {
                this.tenders = await window.apiClient.getTenders();
                this.notifications = await window.apiClient.getNotifications();
            } else {
                // Fallback to localStorage if API client is not available
                this.tenders = JSON.parse(localStorage.getItem('kmrl_tenders') || '[]');
                this.notifications = JSON.parse(localStorage.getItem('kmrl_tender_notifications') || '[]');
            }

            // Load user preferences
            this.preferences = JSON.parse(localStorage.getItem('kmrl_tender_preferences') || JSON.stringify({
                emailNotifications: true,
                dashboardAlerts: true,
                keywordAlerts: true,
                monitoringFrequency: 60, // minutes
                categories: ['all']
            }));
        } catch (error) {
            console.error('Error loading stored data:', error);
            this.tenders = [];
            this.notifications = [];
            this.preferences = {
                emailNotifications: true,
                dashboardAlerts: true,
                keywordAlerts: true,
                monitoringFrequency: 60,
                categories: ['all']
            };
        }
    }

    async saveData() {
        try {
            // Save to localStorage as fallback
            localStorage.setItem('kmrl_tenders', JSON.stringify(this.tenders));
            localStorage.setItem('kmrl_tender_notifications', JSON.stringify(this.notifications));
            localStorage.setItem('kmrl_tender_preferences', JSON.stringify(this.preferences));

            // Also save to API if available
            if (window.apiClient) {
                // In a real implementation, you would save individual items to the API
                // For now, we're just using localStorage as the primary storage
            }
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    setupNotificationSystem() {
        // Create notification container if it doesn't exist
        if (!document.querySelector('.tender-notification-container')) {
            const container = document.createElement('div');
            container.className = 'tender-notification-container';
            container.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                z-index: 9998;
                max-width: 400px;
                max-height: 70vh;
                overflow-y: auto;
            `;
            document.body.appendChild(container);
        }
    }

    createTenderInterface() {
        // Check permissions before creating interface
        if (!this.userPermissions.canView) {
            console.warn('User does not have permission to view tender tracker');
            return;
        }

        // Create tender tracking dashboard widget
        this.createDashboardWidget();

        // Create tender management modal (only if user can manage)
        if (this.userPermissions.canManage || this.userPermissions.canTrack) {
            this.createTenderModal();
        }

        // Add tender menu item to navigation
        this.addNavigationItem();
    }

    createDashboardWidget() {
        const dashboardContainer = document.querySelector('.dashboard-widgets') ||
            document.querySelector('.widgets-grid') ||
            document.querySelector('.main-content');

        if (dashboardContainer) {
            const tenderWidget = document.createElement('div');
            tenderWidget.className = 'widget tender-widget';
            tenderWidget.innerHTML = `
                <div class="widget-header">
                    <div class="widget-title">
                        <i class="fas fa-gavel"></i>
                        <span>Tender Tracker</span>
                    </div>
                    <div class="widget-actions">
                        <button id="refreshTenders" class="btn-icon" title="Refresh">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                        <button id="openTenderManager" class="btn-icon" title="Manage">
                            <i class="fas fa-cog"></i>
                        </button>
                    </div>
                </div>
                <div class="widget-content">
                    <div class="tender-stats">
                        <div class="stat-item">
                            <div class="stat-number" id="activeTendersCount">0</div>
                            <div class="stat-label">Active Tenders</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number" id="newTendersCount">0</div>
                            <div class="stat-label">New Today</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number" id="trackedTendersCount">0</div>
                            <div class="stat-label">Tracked</div>
                        </div>
                    </div>
                    <div class="tender-list-container">
                        <div id="tenderList" class="tender-list"></div>
                    </div>
                </div>
            `;
            dashboardContainer.appendChild(tenderWidget);
            this.updateWidgetStats();
            this.renderTenderList();
        }
    }

    updateWidgetStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const activeTenders = this.tenders.filter(t => t.status === 'active').length;
        const newTenders = this.tenders.filter(t => {
            const addedDate = new Date(t.addedDate);
            return addedDate >= today;
        }).length;
        const trackedTenders = this.tenders.filter(t => t.tracked).length;

        const activeCountEl = document.getElementById('activeTendersCount');
        const newCountEl = document.getElementById('newTendersCount');
        const trackedCountEl = document.getElementById('trackedTendersCount');

        if (activeCountEl) activeCountEl.textContent = activeTenders;
        if (newCountEl) newCountEl.textContent = newTenders;
        if (trackedCountEl) trackedCountEl.textContent = trackedTenders;
    }

    renderTenderList() {
        const tenderListEl = document.getElementById('tenderList');
        if (!tenderListEl) return;

        // Sort tenders by priority and date
        const sortedTenders = [...this.tenders]
            .filter(t => t.status === 'active')
            .sort((a, b) => {
                const priorityOrder = { urgent: 3, high: 2, medium: 1, low: 0 };
                if (priorityOrder[b.priority] !== priorityOrder[a.priority]) {
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                }
                return new Date(b.addedDate) - new Date(a.addedDate);
            })
            .slice(0, 5); // Show only top 5 tenders

        if (sortedTenders.length === 0) {
            tenderListEl.innerHTML = '<div class="no-tenders">No active tenders found</div>';
            return;
        }

        tenderListEl.innerHTML = sortedTenders.map(tender => `
            <div class="tender-item ${tender.priority}-priority" data-tender-id="${tender.id}">
                <div class="tender-header">
                    <div class="tender-title">${tender.title}</div>
                    <div class="tender-priority ${tender.priority}-priority">${tender.priority}</div>
                </div>
                <div class="tender-details">
                    <div class="tender-org">${tender.organization}</div>
                    <div class="tender-value">₹${tender.value.toLocaleString()}</div>
                </div>
                <div class="tender-meta">
                    <div class="tender-deadline">Deadline: ${new Date(tender.submissionDeadline).toLocaleDateString()}</div>
                    <div class="tender-source">${tender.source}</div>
                </div>
            </div>
        `).join('');
    }

    createTenderModal() {
        const modal = document.createElement('div');
        modal.id = 'tenderTrackerModal';
        modal.className = 'modal tender-modal';
        modal.style.display = 'none';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-container large">
                <div class="modal-header">
                    <h2><i class="fas fa-gavel"></i> Tender Tracker Management</h2>
                    <button id="closeTenderModal" class="close-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-content">
                    <div class="tender-tabs">
                        <button class="tab-btn active" data-tab="dashboard">Dashboard</button>
                        ${this.userPermissions.canManage ? '<button class="tab-btn" data-tab="search">Search & Add</button>' : ''}
                        ${this.userPermissions.canConfigureMonitoring ? '<button class="tab-btn" data-tab="monitoring">Monitoring</button>' : ''}
                        <button class="tab-btn" data-tab="settings">Settings</button>
                    </div>
                    
                    <div id="dashboardTab" class="tab-content active">
                        <div class="tender-dashboard">
                            <div class="dashboard-header">
                                <h3>Active Tenders Overview</h3>
                                <div class="dashboard-actions">
                                    ${this.userPermissions.canExport ? '<button id="exportTenders" class="btn btn-outline"><i class="fas fa-download"></i> Export</button>' : ''}
                                    ${this.userPermissions.canManage ? '<button id="bulkActions" class="btn btn-outline"><i class="fas fa-tasks"></i> Bulk Actions</button>' : ''}
                                </div>
                            </div>
                            <div class="tender-filters">
                                <input type="text" id="tenderSearch" placeholder="Search tenders..." class="search-input">
                                <select id="statusFilter" class="filter-select">
                                    <option value="">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="upcoming">Upcoming</option>
                                    <option value="expired">Expired</option>
                                    <option value="applied">Applied</option>
                                </select>
                                <select id="categoryFilter" class="filter-select">
                                    <option value="">All Categories</option>
                                    <option value="infrastructure">Infrastructure</option>
                                    <option value="electrical">Electrical</option>
                                    <option value="mechanical">Mechanical</option>
                                    <option value="civil">Civil</option>
                                    <option value="technology">Technology</option>
                                </select>
                            </div>
                            <div class="tenders-list" id="tendersListContainer">
                                <!-- Tenders will be dynamically loaded here -->
                            </div>
                        </div>
                    </div>
                    
                    <div id="searchTab" class="tab-content">
                        <div class="search-container">
                            <h3>Search for New Tenders</h3>
                            <div class="search-form">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Keywords</label>
                                        <input type="text" id="searchKeywords" placeholder="Enter keywords (e.g., metro, railway, transport)">
                                    </div>
                                    <div class="form-group">
                                        <label>Category</label>
                                        <select id="searchCategory">
                                            <option value="">All Categories</option>
                                            <option value="infrastructure">Infrastructure</option>
                                            <option value="electrical">Electrical</option>
                                            <option value="mechanical">Mechanical</option>
                                            <option value="civil">Civil</option>
                                            <option value="technology">Technology</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Min Value (₹)</label>
                                        <input type="number" id="minValue" placeholder="Minimum tender value">
                                    </div>
                                    <div class="form-group">
                                        <label>Max Value (₹)</label>
                                        <input type="number" id="maxValue" placeholder="Maximum tender value">
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Source</label>
                                        <select id="searchSource">
                                            <option value="all">All Sources</option>
                                            <option value="government">Government Portals</option>
                                            <option value="private">Private Portals</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>Location</label>
                                        <input type="text" id="searchLocation" placeholder="Location/State">
                                    </div>
                                </div>
                                <button id="startSearch" class="btn btn-primary">
                                    <i class="fas fa-search"></i> Search Tenders
                                </button>
                            </div>
                            <div class="search-results" id="searchResults">
                                <!-- Search results will appear here -->
                            </div>
                        </div>
                    </div>
                    
                    <div id="monitoringTab" class="tab-content">
                        <div class="monitoring-container">
                            <h3>Monitoring Configuration</h3>
                            <div class="monitoring-controls">
                                <div class="control-group">
                                    <label class="switch">
                                        <input type="checkbox" id="enableMonitoring" checked>
                                        <span class="slider"></span>
                                    </label>
                                    <span>Enable Automatic Monitoring</span>
                                </div>
                                <div class="form-group">
                                    <label>Monitoring Frequency</label>
                                    <select id="monitoringFrequency">
                                        <option value="15">Every 15 minutes</option>
                                        <option value="30">Every 30 minutes</option>
                                        <option value="60" selected>Every hour</option>
                                        <option value="180">Every 3 hours</option>
                                        <option value="360">Every 6 hours</option>
                                        <option value="720">Every 12 hours</option>
                                        <option value="1440">Daily</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Monitor Keywords</label>
                                    <textarea id="monitorKeywords" rows="3" placeholder="Enter keywords separated by commas"></textarea>
                                </div>
                                <div class="form-group">
                                    <label>Sources to Monitor</label>
                                    <div class="checkbox-group">
                                        <label><input type="checkbox" value="government" checked> Government Portals</label>
                                        <label><input type="checkbox" value="private" checked> Private Portals</label>
                                        <label><input type="checkbox" value="news" checked> News & Updates</label>
                                    </div>
                                </div>
                            </div>
                            <div class="monitoring-status-panel">
                                <h4>Monitoring Status</h4>
                                <div class="status-grid">
                                    <div class="status-item">
                                        <span class="status-label">Status:</span>
                                        <span class="status-value" id="currentStatus">Active</span>
                                    </div>
                                    <div class="status-item">
                                        <span class="status-label">Last Check:</span>
                                        <span class="status-value" id="lastCheck">Just now</span>
                                    </div>
                                    <div class="status-item">
                                        <span class="status-label">New Tenders Found:</span>
                                        <span class="status-value" id="newTendersToday">0</span>
                                    </div>
                                    <div class="status-item">
                                        <span class="status-label">Next Check:</span>
                                        <span class="status-value" id="nextCheck">In 60 minutes</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div id="settingsTab" class="tab-content">
                        <div class="settings-container">
                            <h3>Notification Settings</h3>
                            <div class="settings-form">
                                <div class="setting-group">
                                    <h4>Notification Channels</h4>
                                    <div class="setting-item">
                                        <label class="switch">
                                            <input type="checkbox" id="dashboardNotifications" checked>
                                            <span class="slider"></span>
                                        </label>
                                        <div class="setting-info">
                                            <span class="setting-title">Dashboard Notifications</span>
                                            <span class="setting-desc">Show alerts on the dashboard</span>
                                        </div>
                                    </div>
                                    <div class="setting-item">
                                        <label class="switch">
                                            <input type="checkbox" id="emailNotifications" checked>
                                            <span class="slider"></span>
                                        </label>
                                        <div class="setting-info">
                                            <span class="setting-title">Email Notifications</span>
                                            <span class="setting-desc">Send notifications to email</span>
                                        </div>
                                    </div>
                                    <div class="setting-item">
                                        <label class="switch">
                                            <input type="checkbox" id="mobileAlerts">
                                            <span class="slider"></span>
                                        </label>
                                        <div class="setting-info">
                                            <span class="setting-title">Mobile Alerts</span>
                                            <span class="setting-desc">Push notifications to mobile app</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="setting-group">
                                    <h4>Notification Timing</h4>
                                    <div class="form-group">
                                        <label>Immediate Notifications For</label>
                                        <div class="checkbox-group">
                                            <label><input type="checkbox" value="urgent" checked> Urgent Tenders</label>
                                            <label><input type="checkbox" value="high-value" checked> High Value Tenders</label>
                                            <label><input type="checkbox" value="keyword-match" checked> Keyword Matches</label>
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label>Daily Summary Time</label>
                                        <input type="time" id="summaryTime" value="09:00">
                                    </div>
                                </div>
                                
                                <div class="setting-group">
                                    <h4>Data Management</h4>
                                    <div class="data-actions">
                                        <button id="exportData" class="btn btn-outline">
                                            <i class="fas fa-download"></i> Export All Data
                                        </button>
                                        <button id="importData" class="btn btn-outline">
                                            <i class="fas fa-upload"></i> Import Data
                                        </button>
                                        <button id="clearData" class="btn btn-danger">
                                            <i class="fas fa-trash"></i> Clear All Data
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.addModalStyles();
    }

    addNavigationItem() {
        // Add tender tracker to main navigation if sidebar exists
        const sidebar = document.querySelector('.sidebar-nav') || document.querySelector('.nav-menu');
        if (sidebar) {
            const tenderNavItem = document.createElement('li');
            tenderNavItem.innerHTML = `
                <a href="#" id="tenderTrackerNav" class="nav-link">
                    <i class="fas fa-gavel"></i>
                    <span>Tender Tracker</span>
                    <span class="notification-badge" id="tenderNotificationBadge" style="display: none;">0</span>
                </a>
            `;
            sidebar.appendChild(tenderNavItem);
        }
    }

    startMonitoring() {
        if (this.preferences.monitoringFrequency > 0) {
            this.monitoring = true;

            // Initial search
            this.performAutomaticSearch();

            // Set up periodic monitoring
            this.monitoringInterval = setInterval(() => {
                this.performAutomaticSearch();
            }, this.preferences.monitoringFrequency * 60 * 1000);

            this.updateMonitoringIndicator();
        }
    }

    stopMonitoring() {
        this.monitoring = false;
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
        this.updateMonitoringIndicator();
    }

    toggleMonitoring(enabled) {
        if (enabled) {
            this.startMonitoring();
        } else {
            this.stopMonitoring();
        }

        this.preferences.enableMonitoring = enabled;
        this.saveData();
    }

    updateMonitoringFrequency(minutes) {
        this.preferences.monitoringFrequency = minutes;
        this.saveData();

        // Restart monitoring with new frequency
        if (this.monitoring) {
            this.stopMonitoring();
            this.startMonitoring();
        }
    }

    async performAutomaticSearch() {
        try {
            const newTenders = await this.searchTenders({
                keywords: this.keywords.join(','),
                category: 'all',
                source: 'all',
                automated: true
            });

            this.processTenderResults(newTenders);
            this.updateLastSearchTime();

        } catch (error) {
            console.error('Automatic search failed:', error);
        }
    }

    async performManualSearch() {
        this.showLoadingState();

        try {
            const searchParams = {
                keywords: this.keywords.join(','),
                category: 'all',
                source: 'all',
                automated: false
            };

            const tenders = await this.searchTenders(searchParams);
            this.processTenderResults(tenders);

            if (window.showNotification) {
                window.showNotification(`Found ${tenders.length} tenders`, 'success');
            }

        } catch (error) {
            console.error('Manual search failed:', error);
            if (window.showNotification) {
                window.showNotification('Search failed. Please try again.', 'error');
            }
        } finally {
            this.hideLoadingState();
        }
    }

    async performCustomSearch() {
        const keywords = document.getElementById('searchKeywords')?.value || '';
        const category = document.getElementById('searchCategory')?.value || '';
        const minValue = document.getElementById('minValue')?.value || '';
        const maxValue = document.getElementById('maxValue')?.value || '';
        const source = document.getElementById('searchSource')?.value || 'all';
        const location = document.getElementById('searchLocation')?.value || '';

        const searchParams = {
            keywords,
            category,
            minValue: minValue ? parseInt(minValue) : null,
            maxValue: maxValue ? parseInt(maxValue) : null,
            source,
            location,
            automated: false
        };

        this.showSearchLoading();

        try {
            const tenders = await this.searchTenders(searchParams);
            this.displaySearchResults(tenders);

        } catch (error) {
            console.error('Custom search failed:', error);
            this.displaySearchError('Search failed. Please try again.');
        } finally {
            this.hideSearchLoading();
        }
    }

    async searchTenders(params) {
        // Simulate API calls to various tender portals
        // In a real implementation, this would integrate with actual APIs

        const mockTenders = await this.generateMockTenders(params);
        return mockTenders;
    }

    async generateMockTenders(params) {
        // Simulate API delay
        await this.delay(2000 + Math.random() * 3000);

        const tenderCategories = ['infrastructure', 'electrical', 'mechanical', 'civil', 'technology'];
        const locations = ['Kerala', 'Kochi', 'Ernakulam', 'Thiruvananthapuram', 'Kozhikode'];
        const organizations = [
            'Kerala Rail Development Corporation',
            'Kerala State Road Transport Corporation',
            'Kerala Water Authority',
            'Indian Railways',
            'Metro Rail Corporation',
            'Public Works Department',
            'Kerala State Electricity Board'
        ];

        const mockTenders = [];
        const tenderCount = Math.floor(Math.random() * 15) + 5;

        for (let i = 0; i < tenderCount; i++) {
            const category = tenderCategories[Math.floor(Math.random() * tenderCategories.length)];
            const location = locations[Math.floor(Math.random() * locations.length)];
            const organization = organizations[Math.floor(Math.random() * organizations.length)];

            const tender = {
                id: this.generateTenderId(),
                title: this.generateTenderTitle(category),
                description: this.generateTenderDescription(category),
                category: category,
                organization: organization,
                location: location,
                value: Math.floor(Math.random() * 10000000) + 100000, // ₹1L to ₹1Cr
                publishDate: this.generateRandomDate(-7, 0), // Last 7 days
                submissionDeadline: this.generateRandomDate(7, 30), // Next 7-30 days
                status: this.getRandomStatus(),
                source: params.source === 'government' ? 'Government Portal' :
                    params.source === 'private' ? 'Private Portal' :
                        Math.random() > 0.5 ? 'Government Portal' : 'Private Portal',
                url: `https://example-tender-portal.com/tender/${this.generateTenderId()}`,
                keywords: this.generateTenderKeywords(category),
                eligibility: this.generateEligibility(),
                documents: this.generateDocumentsList(),
                contactInfo: this.generateContactInfo(),
                addedDate: new Date().toISOString(),
                priority: this.calculatePriority(category, Math.floor(Math.random() * 10000000) + 100000),
                tracked: false
            };

            // Filter based on search parameters
            if (this.matchesCriteria(tender, params)) {
                mockTenders.push(tender);
            }
        }

        return mockTenders;
    }

    generateTenderId() {
        return 'TND' + Date.now() + Math.floor(Math.random() * 1000);
    }

    generateTenderTitle(category) {
        const titles = {
            infrastructure: [
                'Metro Station Construction Project',
                'Railway Platform Development',
                'Bridge Construction and Maintenance',
                'Road Infrastructure Development',
                'Transport Terminal Construction'
            ],
            electrical: [
                'Electrical System Installation',
                'Power Supply and Distribution',
                'Signaling System Implementation',
                'LED Lighting Installation',
                'Electrical Maintenance Contract'
            ],
            mechanical: [
                'HVAC System Installation',
                'Elevator and Escalator Maintenance',
                'Mechanical Equipment Supply',
                'Ventilation System Upgrade',
                'Rolling Stock Maintenance'
            ],
            civil: [
                'Civil Construction Works',
                'Structural Engineering Project',
                'Building Construction Contract',
                'Infrastructure Development',
                'Architectural Services'
            ],
            technology: [
                'IT Infrastructure Setup',
                'Software Development Project',
                'Ticketing System Implementation',
                'Digital Signage Installation',
                'Communication System Upgrade'
            ]
        };

        const categoryTitles = titles[category] || titles.infrastructure;
        return categoryTitles[Math.floor(Math.random() * categoryTitles.length)];
    }

    generateTenderDescription(category) {
        const descriptions = {
            infrastructure: 'Comprehensive infrastructure development project including design, construction, and implementation of modern transit systems.',
            electrical: 'Electrical systems installation, maintenance, and upgrade projects for metro rail infrastructure.',
            mechanical: 'Mechanical equipment supply, installation, and maintenance contracts for rolling stock and station equipment.',
            civil: 'Civil engineering and construction projects for metro stations, tunnels, and supporting infrastructure.',
            technology: 'Technology implementation projects including IT systems, software development, and digital infrastructure.'
        };

        return descriptions[category] || descriptions.infrastructure;
    }

    generateTenderKeywords(category) {
        const keywords = {
            infrastructure: ['metro', 'railway', 'station', 'platform', 'infrastructure'],
            electrical: ['electrical', 'power', 'signaling', 'lighting', 'systems'],
            mechanical: ['mechanical', 'hvac', 'elevator', 'escalator', 'equipment'],
            civil: ['civil', 'construction', 'building', 'structural', 'concrete'],
            technology: ['technology', 'software', 'IT', 'digital', 'communication']
        };

        return keywords[category] || keywords.infrastructure;
    }

    generateRandomDate(minDays, maxDays) {
        const now = new Date();
        const randomDays = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
        const date = new Date(now.getTime() + randomDays * 24 * 60 * 60 * 1000);
        return date.toISOString();
    }

    getRandomStatus() {
        const statuses = ['active', 'upcoming', 'extended', 'closing-soon'];
        return statuses[Math.floor(Math.random() * statuses.length)];
    }

    generateEligibility() {
        return 'Registered contractors with minimum turnover of ₹50 lakhs and relevant experience';
    }

    generateDocumentsList() {
        return [
            'Technical Specification Document',
            'Financial Bid Format',
            'Tender Application Form',
            'Eligibility Criteria Document',
            'Terms and Conditions'
        ];
    }

    generateContactInfo() {
        return {
            name: 'Tender Officer',
            email: 'tenders@kmrl.org',
            phone: '+91-484-2533000',
            office: 'KMRL Head Office, Kochi'
        };
    }

    calculatePriority(category, value) {
        let priority = 'medium';

        if (value > 5000000) priority = 'high'; // Above 50L
        if (value > 10000000) priority = 'urgent'; // Above 1Cr

        if (['infrastructure', 'electrical'].includes(category)) {
            priority = priority === 'medium' ? 'high' : priority;
        }

        return priority;
    }

    matchesCriteria(tender, params) {
        // Check keywords
        if (params.keywords) {
            const keywords = params.keywords.toLowerCase().split(',').map(k => k.trim());
            const tenderText = `${tender.title} ${tender.description} ${tender.keywords.join(' ')}`.toLowerCase();
            const hasKeyword = keywords.some(keyword => tenderText.includes(keyword));
            if (!hasKeyword) return false;
        }

        // Check category
        if (params.category && params.category !== 'all' && tender.category !== params.category) {
            return false;
        }

        // Check value range
        if (params.minValue && tender.value < params.minValue) return false;
        if (params.maxValue && tender.value > params.maxValue) return false;

        // Check location
        if (params.location && !tender.location.toLowerCase().includes(params.location.toLowerCase())) {
            return false;
        }

        // Check source
        if (params.source && params.source !== 'all') {
            const isGovSource = tender.source.includes('Government');
            if (params.source === 'government' && !isGovSource) return false;
            if (params.source === 'private' && isGovSource) return false;
        }

        return true;
    }

    processTenderResults(tenders) {
        let newTendersCount = 0;

        tenders.forEach(tender => {
            // Check if tender already exists
            const exists = this.tenders.find(t => t.id === tender.id);
            if (!exists) {
                this.tenders.push(tender);
                newTendersCount++;

                // Create notification for new tender
                this.createNotification(tender);
            }
        });

        if (newTendersCount > 0) {
            this.saveData();
            this.updateWidgetStats();

            if (window.showNotification) {
                window.showNotification(`${newTendersCount} new tenders found!`, 'success');
            }
        }
    }

    createNotification(tender) {
        const notification = {
            id: this.generateNotificationId(),
            tenderId: tender.id,
            title: 'New Tender Found',
            message: `${tender.title} - ${tender.organization}`,
            type: 'new-tender',
            priority: tender.priority,
            created: new Date().toISOString(),
            read: false,
            actions: [
                { label: 'View Details', action: 'view' },
                { label: 'Track', action: 'track' },
                { label: 'Dismiss', action: 'dismiss' }
            ]
        };

        this.notifications.unshift(notification);

        // Show immediate notification if enabled
        if (this.preferences.dashboardAlerts) {
            this.showTenderNotification(notification);
        }

        // Update notification badge
        this.updateNotificationBadge();
    }

    generateNotificationId() {
        return 'NTF' + Date.now() + Math.floor(Math.random() * 1000);
    }

    showTenderNotification(notification) {
        const container = document.querySelector('.tender-notification-container');
        if (!container) return;

        const notificationElement = document.createElement('div');
        notificationElement.className = `tender-notification ${notification.priority}-priority`;
        notificationElement.innerHTML = `
            <div class="notification-header">
                <i class="fas fa-gavel"></i>
                <span class="notification-title">${notification.title}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="notification-body">
                <p>${notification.message}</p>
                <div class="notification-actions">
                    ${notification.actions.map(action =>
            `<button class="notification-btn" data-action="${action.action}" data-tender-id="${notification.tenderId}">
                            ${action.label}
                        </button>`
        ).join('')}
                </div>
            </div>
        `;

        container.appendChild(notificationElement);

        // Auto-remove after 10 seconds if not urgent
        if (notification.priority !== 'urgent') {
            setTimeout(() => {
                if (notificationElement.parentNode) {
                    notificationElement.remove();
                }
            }, 10000);
        }
    }

    updateNotificationBadge() {
        const badge = document.getElementById('tenderNotificationBadge');
        const unreadCount = this.notifications.filter(n => !n.read).length;

        if (badge) {
            if (unreadCount > 0) {
                badge.textContent = unreadCount;
                badge.style.display = 'inline';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    updateWidgetStats() {
        const activeTenders = this.tenders.filter(t => ['active', 'upcoming'].includes(t.status));
        const todayTenders = this.getTodayTenders();
        const urgentTenders = this.tenders.filter(t => t.priority === 'urgent');

        // Update widget counters
        this.updateCounter('activeTendersCount', activeTenders.length);
        this.updateCounter('newTendersCount', todayTenders.length);
        this.updateCounter('urgentTendersCount', urgentTenders.length);

        // Update recent tenders list
        this.updateRecentTendersList();
    }

    getTodayTenders() {
        const today = new Date().toDateString();
        return this.tenders.filter(t =>
            new Date(t.addedDate).toDateString() === today
        );
    }

    updateCounter(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            // Animate counter
            const currentValue = parseInt(element.textContent) || 0;
            const increment = value > currentValue ? 1 : -1;
            const step = () => {
                const current = parseInt(element.textContent) || 0;
                if (current !== value) {
                    element.textContent = current + increment;
                    setTimeout(step, 50);
                }
            };
            step();
        }
    }

    updateRecentTendersList() {
        const container = document.getElementById('recentTendersList');
        if (!container) return;

        const recentTenders = this.tenders
            .sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate))
            .slice(0, 5);

        if (recentTenders.length === 0) {
            container.innerHTML = '<div class="no-tenders">No tenders found</div>';
            return;
        }

        container.innerHTML = recentTenders.map(tender => `
            <div class="tender-item ${tender.priority}-priority">
                <div class="tender-info">
                    <div class="tender-title">${tender.title}</div>
                    <div class="tender-meta">
                        <span class="tender-org">${tender.organization}</span>
                        <span class="tender-value">₹${this.formatValue(tender.value)}</span>
                    </div>
                    <div class="tender-deadline">
                        Deadline: ${this.formatDate(tender.submissionDeadline)}
                    </div>
                </div>
                <div class="tender-actions">
                    <button class="btn-icon" onclick="tenderTracker.viewTender('${tender.id}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" onclick="tenderTracker.trackTender('${tender.id}')" title="Track">
                        <i class="fas fa-bookmark"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    updateMonitoringIndicator() {
        const indicator = document.getElementById('monitoringStatus');
        const lastUpdate = document.getElementById('lastUpdateTime');

        if (indicator) {
            const icon = indicator.querySelector('i');
            const text = indicator.querySelector('span');

            if (this.monitoring) {
                icon.className = 'fas fa-circle text-success';
                text.textContent = 'Monitoring: Active';
            } else {
                icon.className = 'fas fa-circle text-danger';
                text.textContent = 'Monitoring: Stopped';
            }
        }

        if (lastUpdate) {
            const lastSearchTime = localStorage.getItem('tender_last_search');
            if (lastSearchTime) {
                lastUpdate.textContent = `Last update: ${this.formatRelativeTime(lastSearchTime)}`;
            }
        }
    }

    updateLastSearchTime() {
        const now = new Date().toISOString();
        localStorage.setItem('tender_last_search', now);
        this.updateMonitoringIndicator();
    }

    formatValue(value) {
        if (value >= 10000000) {
            return (value / 10000000).toFixed(1) + ' Cr';
        } else if (value >= 100000) {
            return (value / 100000).toFixed(1) + ' L';
        } else {
            return (value / 1000).toFixed(0) + ' K';
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

    formatRelativeTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minutes ago`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} hours ago`;

        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} days ago`;
    }

    showLoadingState() {
        const refreshBtn = document.getElementById('refreshTenders');
        if (refreshBtn) {
            refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            refreshBtn.disabled = true;
        }
    }

    hideLoadingState() {
        const refreshBtn = document.getElementById('refreshTenders');
        if (refreshBtn) {
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
            refreshBtn.disabled = false;
        }
    }

    showSearchLoading() {
        const searchBtn = document.getElementById('startSearch');
        if (searchBtn) {
            searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
            searchBtn.disabled = true;
        }
    }

    hideSearchLoading() {
        const searchBtn = document.getElementById('startSearch');
        if (searchBtn) {
            searchBtn.innerHTML = '<i class="fas fa-search"></i> Search Tenders';
            searchBtn.disabled = false;
        }
    }

    displaySearchResults(tenders) {
        const container = document.getElementById('searchResults');
        if (!container) return;

        if (tenders.length === 0) {
            container.innerHTML = '<div class="no-results">No tenders found matching your criteria.</div>';
            return;
        }

        container.innerHTML = `
            <div class="search-results-header">
                <h4>Search Results (${tenders.length} found)</h4>
                <button id="addAllTenders" class="btn btn-primary">Add All to Tracker</button>
            </div>
            <div class="search-results-list">
                ${tenders.map(tender => this.renderTenderCard(tender, 'search')).join('')}
            </div>
        `;
    }

    displaySearchError(message) {
        const container = document.getElementById('searchResults');
        if (container) {
            container.innerHTML = `<div class="search-error">${message}</div>`;
        }
    }

    renderTenderCard(tender, context = 'dashboard') {
        return `
            <div class="tender-card ${tender.priority}-priority" data-tender-id="${tender.id}">
                <div class="tender-card-header">
                    <h5 class="tender-title">${tender.title}</h5>
                    <span class="priority-badge ${tender.priority}">${tender.priority.toUpperCase()}</span>
                </div>
                <div class="tender-card-body">
                    <div class="tender-meta">
                        <div class="meta-item">
                            <i class="fas fa-building"></i>
                            <span>${tender.organization}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${tender.location}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-rupee-sign"></i>
                            <span>₹${this.formatValue(tender.value)}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-calendar"></i>
                            <span>Deadline: ${this.formatDate(tender.submissionDeadline)}</span>
                        </div>
                    </div>
                    <p class="tender-description">${tender.description}</p>
                    <div class="tender-keywords">
                        ${tender.keywords.map(keyword => `<span class="keyword-tag">${keyword}</span>`).join('')}
                    </div>
                </div>
                <div class="tender-card-actions">
                    ${context === 'search' ?
                `<button class="btn btn-outline" onclick="tenderTracker.addTender('${tender.id}')">
                            <i class="fas fa-plus"></i> Add to Tracker
                        </button>` :
                `<button class="btn btn-outline" onclick="tenderTracker.toggleTracking('${tender.id}')">
                            <i class="fas fa-bookmark"></i> ${tender.tracked ? 'Untrack' : 'Track'}
                        </button>`
            }
                    <button class="btn btn-primary" onclick="tenderTracker.viewTender('${tender.id}')">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                    <a href="${tender.url}" target="_blank" class="btn btn-secondary">
                        <i class="fas fa-external-link-alt"></i> Open Portal
                    </a>
                </div>
            </div>
        `;
    }

    updateTenderDashboard() {
        const container = document.getElementById('tendersListContainer');
        if (!container) return;

        // Apply filters
        const searchTerm = document.getElementById('tenderSearch')?.value.toLowerCase() || '';
        const statusFilter = document.getElementById('statusFilter')?.value || '';
        const categoryFilter = document.getElementById('categoryFilter')?.value || '';

        let filteredTenders = this.tenders.filter(tender => {
            const matchesSearch = !searchTerm ||
                tender.title.toLowerCase().includes(searchTerm) ||
                tender.organization.toLowerCase().includes(searchTerm);

            const matchesStatus = !statusFilter || tender.status === statusFilter;
            const matchesCategory = !categoryFilter || tender.category === categoryFilter;

            return matchesSearch && matchesStatus && matchesCategory;
        });

        // Sort by priority and date
        filteredTenders.sort((a, b) => {
            const priorityOrder = { urgent: 3, high: 2, medium: 1, low: 0 };
            const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
            if (priorityDiff !== 0) return priorityDiff;

            return new Date(b.addedDate) - new Date(a.addedDate);
        });

        if (filteredTenders.length === 0) {
            container.innerHTML = '<div class="no-tenders">No tenders match your criteria.</div>';
            return;
        }

        container.innerHTML = filteredTenders.map(tender =>
            this.renderTenderCard(tender, 'dashboard')
        ).join('');
    }

    updateMonitoringStatus() {
        // Update monitoring tab content
        const enableCheckbox = document.getElementById('enableMonitoring');
        const frequencySelect = document.getElementById('monitoringFrequency');
        const keywordsTextarea = document.getElementById('monitorKeywords');

        if (enableCheckbox) enableCheckbox.checked = this.monitoring;
        if (frequencySelect) frequencySelect.value = this.preferences.monitoringFrequency;
        if (keywordsTextarea) keywordsTextarea.value = this.keywords.join(', ');

        // Update status display
        document.getElementById('currentStatus').textContent = this.monitoring ? 'Active' : 'Stopped';
        document.getElementById('newTendersToday').textContent = this.getTodayTenders().length;

        const lastCheck = localStorage.getItem('tender_last_search');
        if (lastCheck) {
            document.getElementById('lastCheck').textContent = this.formatRelativeTime(lastCheck);
        }

        const nextCheckTime = new Date(Date.now() + this.preferences.monitoringFrequency * 60 * 1000);
        document.getElementById('nextCheck').textContent = `In ${this.preferences.monitoringFrequency} minutes`;
    }

    loadSettings() {
        // Load notification settings
        document.getElementById('dashboardNotifications').checked = this.preferences.dashboardAlerts;
        document.getElementById('emailNotifications').checked = this.preferences.emailNotifications;
        document.getElementById('mobileAlerts').checked = this.preferences.mobileAlerts || false;
    }

    exportTenderData() {
        const data = {
            tenders: this.tenders,
            notifications: this.notifications,
            preferences: this.preferences,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `kmrl-tender-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);

        if (window.showNotification) {
            window.showNotification('Tender data exported successfully', 'success');
        }
    }

    // Public methods for UI interactions
    viewTender(tenderId) {
        const tender = this.tenders.find(t => t.id === tenderId);
        if (tender) {
            this.showTenderDetails(tender);
        }
    }

    trackTender(tenderId) {
        const tender = this.tenders.find(t => t.id === tenderId);
        if (tender) {
            tender.tracked = !tender.tracked;
            this.saveData();
            this.updateTenderDashboard();

            if (window.showNotification) {
                const message = tender.tracked ? 'Tender added to tracking' : 'Tender removed from tracking';
                window.showNotification(message, 'success');
            }
        }
    }

    addTender(tenderId) {
        // This method is called when adding from search results
        this.trackTender(tenderId);
    }

    toggleTracking(tenderId) {
        this.trackTender(tenderId);
    }

    showTenderDetails(tender) {
        // Create detailed view modal
        const detailModal = document.createElement('div');
        detailModal.className = 'modal tender-detail-modal';
        detailModal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-container large">
                <div class="modal-header">
                    <h2>${tender.title}</h2>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-content">
                    <div class="tender-details">
                        <div class="detail-section">
                            <h3>Basic Information</h3>
                            <div class="detail-grid">
                                <div class="detail-item">
                                    <label>Organization:</label>
                                    <span>${tender.organization}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Category:</label>
                                    <span>${tender.category}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Location:</label>
                                    <span>${tender.location}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Value:</label>
                                    <span>₹${this.formatValue(tender.value)}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Status:</label>
                                    <span class="status-badge ${tender.status}">${tender.status}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Priority:</label>
                                    <span class="priority-badge ${tender.priority}">${tender.priority}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h3>Timeline</h3>
                            <div class="detail-grid">
                                <div class="detail-item">
                                    <label>Published:</label>
                                    <span>${this.formatDate(tender.publishDate)}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Submission Deadline:</label>
                                    <span class="deadline">${this.formatDate(tender.submissionDeadline)}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Days Remaining:</label>
                                    <span class="days-remaining">${this.calculateDaysRemaining(tender.submissionDeadline)}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h3>Description</h3>
                            <p>${tender.description}</p>
                        </div>
                        
                        <div class="detail-section">
                            <h3>Eligibility</h3>
                            <p>${tender.eligibility}</p>
                        </div>
                        
                        <div class="detail-section">
                            <h3>Required Documents</h3>
                            <ul class="document-list">
                                ${tender.documents.map(doc => `<li>${doc}</li>`).join('')}
                            </ul>
                        </div>
                        
                        <div class="detail-section">
                            <h3>Contact Information</h3>
                            <div class="contact-info">
                                <p><strong>Name:</strong> ${tender.contactInfo.name}</p>
                                <p><strong>Email:</strong> ${tender.contactInfo.email}</p>
                                <p><strong>Phone:</strong> ${tender.contactInfo.phone}</p>
                                <p><strong>Office:</strong> ${tender.contactInfo.office}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tender-actions">
                        <button class="btn btn-primary" onclick="tenderTracker.trackTender('${tender.id}'); this.closest('.modal').remove();">
                            <i class="fas fa-bookmark"></i> ${tender.tracked ? 'Untrack' : 'Track'} Tender
                        </button>
                        <a href="${tender.url}" target="_blank" class="btn btn-secondary">
                            <i class="fas fa-external-link-alt"></i> Open in Portal
                        </a>
                        <button class="btn btn-outline" onclick="tenderTracker.exportTenderPDF('${tender.id}')">
                            <i class="fas fa-file-pdf"></i> Export PDF
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(detailModal);
        detailModal.style.display = 'flex';
    }

    calculateDaysRemaining(deadline) {
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const diffTime = deadlineDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'Expired';
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return '1 day';
        return `${diffDays} days`;
    }

    exportTenderPDF(tenderId) {
        // This would integrate with a PDF generation service
        if (window.showNotification) {
            window.showNotification('PDF export feature coming soon', 'info');
        }
    }

    addModalStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .tender-widget {
                background: white;
                border-radius: 12px;
                padding: 1.5rem;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                margin-bottom: 1rem;
            }
            
            .widget-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
                padding-bottom: 0.5rem;
                border-bottom: 2px solid #f0f0f0;
            }
            
            .widget-title {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-weight: 600;
                color: #1f2937;
            }
            
            .widget-actions {
                display: flex;
                gap: 0.5rem;
            }
            
            .btn-icon {
                background: none;
                border: 1px solid #e5e7eb;
                padding: 0.5rem;
                border-radius: 6px;
                cursor: pointer;
                color: #6b7280;
                transition: all 0.2s;
            }
            
            .btn-icon:hover {
                background: #f3f4f6;
                color: #374151;
            }
            
            .tender-stats {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 1rem;
                margin-bottom: 1.5rem;
            }
            
            .stat-item {
                text-align: center;
                padding: 1rem;
                background: #f8fafc;
                border-radius: 8px;
            }
            
            .stat-number {
                font-size: 2rem;
                font-weight: 700;
                color: #2563eb;
            }
            
            .stat-label {
                font-size: 0.875rem;
                color: #6b7280;
                margin-top: 0.25rem;
            }
            
            .tender-item {
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 1rem;
                margin-bottom: 0.75rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
                transition: all 0.2s;
            }
            
            .tender-item:hover {
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            
            .tender-item.urgent-priority {
                border-left: 4px solid #dc2626;
            }
            
            .tender-item.high-priority {
                border-left: 4px solid #f59e0b;
            }
            
            .tender-item.medium-priority {
                border-left: 4px solid #10b981;
            }
            
            .tender-title {
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 0.25rem;
            }
            
            .tender-meta {
                font-size: 0.875rem;
                color: #6b7280;
                display: flex;
                gap: 1rem;
                margin-bottom: 0.25rem;
            }
            
            .tender-deadline {
                font-size: 0.75rem;
                color: #dc2626;
                font-weight: 500;
            }
            
            .tender-actions {
                display: flex;
                gap: 0.5rem;
            }
            
            .monitoring-status {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-top: 1rem;
                border-top: 1px solid #e5e7eb;
                font-size: 0.875rem;
            }
            
            .status-indicator {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .status-indicator .fa-circle {
                font-size: 0.75rem;
            }
            
            .text-success {
                color: #10b981 !important;
            }
            
            .text-danger {
                color: #dc2626 !important;
            }
            
            .tender-modal .modal-container {
                width: 95%;
                max-width: 1400px;
                height: 90%;
            }
            
            .tender-tabs {
                display: flex;
                border-bottom: 2px solid #e5e7eb;
                margin-bottom: 2rem;
            }
            
            .tab-btn {
                background: none;
                border: none;
                padding: 1rem 2rem;
                cursor: pointer;
                font-weight: 500;
                color: #6b7280;
                border-bottom: 2px solid transparent;
                transition: all 0.2s;
            }
            
            .tab-btn.active {
                color: #2563eb;
                border-bottom-color: #2563eb;
            }
            
            .tab-content {
                display: none;
            }
            
            .tab-content.active {
                display: block;
            }
            
            .search-form {
                background: #f8fafc;
                padding: 2rem;
                border-radius: 12px;
                margin-bottom: 2rem;
            }
            
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
                margin-bottom: 1rem;
            }
            
            .form-group {
                margin-bottom: 1rem;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: 500;
                color: #374151;
            }
            
            .form-group input,
            .form-group select,
            .form-group textarea {
                width: 100%;
                padding: 0.75rem;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 0.875rem;
            }
            
            .tender-card {
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                padding: 1.5rem;
                margin-bottom: 1rem;
                background: white;
                transition: all 0.2s;
            }
            
            .tender-card:hover {
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            
            .tender-card.urgent-priority {
                border-left: 4px solid #dc2626;
            }
            
            .tender-card.high-priority {
                border-left: 4px solid #f59e0b;
            }
            
            .tender-card.medium-priority {
                border-left: 4px solid #10b981;
            }
            
            .tender-card-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 1rem;
            }
            
            .priority-badge {
                padding: 0.25rem 0.75rem;
                border-radius: 20px;
                font-size: 0.75rem;
                font-weight: 600;
                text-transform: uppercase;
            }
            
            .priority-badge.urgent {
                background: #fef2f2;
                color: #dc2626;
            }
            
            .priority-badge.high {
                background: #fffbeb;
                color: #f59e0b;
            }
            
            .priority-badge.medium {
                background: #f0fdf4;
                color: #10b981;
            }
            
            .meta-item {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                margin-bottom: 0.5rem;
                font-size: 0.875rem;
                color: #6b7280;
            }
            
            .keyword-tag {
                background: #e0e7ff;
                color: #3730a3;
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                font-size: 0.75rem;
                margin-right: 0.5rem;
                margin-bottom: 0.25rem;
                display: inline-block;
            }
            
            .tender-card-actions {
                display: flex;
                gap: 0.75rem;
                margin-top: 1.5rem;
                padding-top: 1rem;
                border-top: 1px solid #e5e7eb;
            }
            
            .tender-notification {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                margin-bottom: 1rem;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                overflow: hidden;
            }
            
            .tender-notification.urgent-priority {
                border-left: 4px solid #dc2626;
            }
            
            .notification-header {
                background: #f8fafc;
                padding: 1rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .notification-title {
                font-weight: 600;
                color: #1f2937;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: #6b7280;
                cursor: pointer;
                padding: 0.25rem;
            }
            
            .notification-body {
                padding: 1rem;
            }
            
            .notification-actions {
                display: flex;
                gap: 0.5rem;
                margin-top: 1rem;
            }
            
            .notification-btn {
                background: #f3f4f6;
                border: 1px solid #d1d5db;
                padding: 0.5rem 1rem;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.875rem;
                transition: all 0.2s;
            }
            
            .notification-btn:hover {
                background: #e5e7eb;
            }
            
            .switch {
                position: relative;
                display: inline-block;
                width: 60px;
                height: 34px;
            }
            
            .switch input {
                opacity: 0;
                width: 0;
                height: 0;
            }
            
            .slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: #ccc;
                transition: 0.4s;
                border-radius: 34px;
            }
            
            .slider:before {
                position: absolute;
                content: "";
                height: 26px;
                width: 26px;
                left: 4px;
                bottom: 4px;
                background-color: white;
                transition: 0.4s;
                border-radius: 50%;
            }
            
            input:checked + .slider {
                background-color: #2563eb;
            }
            
            input:checked + .slider:before {
                transform: translateX(26px);
            }
            
            .setting-item {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 1rem;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                margin-bottom: 1rem;
            }
            
            .setting-info {
                flex: 1;
            }
            
            .setting-title {
                font-weight: 500;
                color: #1f2937;
                display: block;
            }
            
            .setting-desc {
                font-size: 0.875rem;
                color: #6b7280;
            }
            
            .btn {
                background: #2563eb;
                color: white;
                border: 1px solid #2563eb;
                padding: 0.75rem 1.5rem;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
                text-decoration: none;
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                transition: all 0.2s;
            }
            
            .btn:hover {
                background: #1d4ed8;
                border-color: #1d4ed8;
            }
            
            .btn-outline {
                background: white;
                color: #2563eb;
            }
            
            .btn-outline:hover {
                background: #eff6ff;
            }
            
            .btn-secondary {
                background: #6b7280;
                border-color: #6b7280;
            }
            
            .btn-secondary:hover {
                background: #4b5563;
                border-color: #4b5563;
            }
            
            .btn-danger {
                background: #dc2626;
                border-color: #dc2626;
            }
            
            .btn-danger:hover {
                background: #b91c1c;
                border-color: #b91c1c;
            }
            
            .notification-badge {
                background: #dc2626;
                color: white;
                font-size: 0.75rem;
                padding: 0.25rem 0.5rem;
                border-radius: 10px;
                margin-left: 0.5rem;
            }
            
            @media (max-width: 768px) {
                .tender-stats {
                    grid-template-columns: 1fr;
                }
                
                .form-row {
                    grid-template-columns: 1fr;
                }
                
                .tender-card-actions {
                    flex-direction: column;
                }
                
                .tender-modal .modal-container {
                    width: 98%;
                    height: 95%;
                }
            }
        `;
        document.head.appendChild(style);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize tender tracker
document.addEventListener('DOMContentLoaded', () => {
    window.tenderTracker = new TenderTracker();
});

// Export for global access
window.TenderTracker = TenderTracker;
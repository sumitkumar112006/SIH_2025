// KMRL Technology Updates Tracker
// Monitors new technologies in rail construction, signaling, safety, and infrastructure

class TechnologyTracker {
    constructor() {
        this.techUpdates = [];
        this.monitoring = false;
        this.currentUser = this.getCurrentUser();
        this.userPermissions = this.getUserPermissions();
        this.techCategories = [
            'rail-construction',
            'signaling-systems',
            'safety-technology',
            'infrastructure',
            'rolling-stock',
            'automation',
            'green-technology',
            'digital-systems'
        ];
        this.sources = [
            {
                id: 'railway-tech',
                name: 'Railway Technology International',
                url: 'https://railwaytechnology.com',
                type: 'industry'
            },
            {
                id: 'ieee-rail',
                name: 'IEEE Railway Technology',
                url: 'https://ieee.org/rail',
                type: 'research'
            },
            {
                id: 'govt-innovation',
                name: 'Government Innovation Portal',
                url: 'https://innovation.gov.in',
                type: 'government'
            },
            {
                id: 'metro-tech',
                name: 'Metro Technology Updates',
                url: 'https://metro-technology.com',
                type: 'industry'
            }
        ];
        this.init();
    }

    init() {
        this.loadStoredData();
        this.createTechInterface();
        this.startTechMonitoring();
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
            admin: { canView: true, canManage: true, canConfigure: true },
            manager: { canView: true, canManage: true, canConfigure: false },
            staff: { canView: true, canManage: false, canConfigure: false }
        };

        return permissions[role] || permissions.staff;
    }

    loadStoredData() {
        try {
            this.techUpdates = JSON.parse(localStorage.getItem('kmrl_tech_updates') || '[]');
            this.preferences = JSON.parse(localStorage.getItem('kmrl_tech_preferences') || JSON.stringify({
                categories: ['all'],
                notificationFrequency: 'daily',
                autoRelevanceFilter: true
            }));
        } catch (error) {
            this.techUpdates = [];
            this.preferences = {
                categories: ['all'],
                notificationFrequency: 'daily',
                autoRelevanceFilter: true
            };
        }
    }

    saveData() {
        localStorage.setItem('kmrl_tech_updates', JSON.stringify(this.techUpdates));
        localStorage.setItem('kmrl_tech_preferences', JSON.stringify(this.preferences));
    }

    createTechInterface() {
        if (!this.userPermissions.canView) return;

        this.createTechWidget();
        this.addTechNavigation();
    }

    createTechWidget() {
        const container = document.querySelector('.dashboard-widgets') ||
            document.querySelector('.widgets-grid') ||
            document.querySelector('.main-content');

        if (container) {
            const techWidget = document.createElement('div');
            techWidget.className = 'widget tech-widget';
            techWidget.innerHTML = `
                <div class="widget-header">
                    <div class="widget-title">
                        <i class="fas fa-microchip"></i>
                        <span>Technology Updates</span>
                    </div>
                    <div class="widget-actions">
                        <button id="refreshTech" class="btn-icon" title="Refresh">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                        <button id="openTechManager" class="btn-icon" title="Manage">
                            <i class="fas fa-cog"></i>
                        </button>
                    </div>
                </div>
                <div class="widget-content">
                    <div class="tech-stats">
                        <div class="stat-item">
                            <div class="stat-number" id="newTechCount">0</div>
                            <div class="stat-label">New This Week</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number" id="relevantTechCount">0</div>
                            <div class="stat-label">Relevant Updates</div>
                        </div>
                    </div>
                    <div class="recent-tech" id="recentTechList">
                        <div class="no-tech">No technology updates</div>
                    </div>
                </div>
            `;

            container.appendChild(techWidget);
        }
    }

    addTechNavigation() {
        const sidebar = document.querySelector('.sidebar-nav') || document.querySelector('.nav-menu');
        if (sidebar) {
            const techNavItem = document.createElement('li');
            techNavItem.innerHTML = `
                <a href="#" id="techTrackerNav" class="nav-link">
                    <i class="fas fa-microchip"></i>
                    <span>Tech Updates</span>
                    <span class="notification-badge" id="techNotificationBadge" style="display: none;">0</span>
                </a>
            `;
            sidebar.appendChild(techNavItem);
        }
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.id === 'refreshTech') {
                this.performTechScan();
            }

            if (e.target.id === 'openTechManager' || e.target.id === 'techTrackerNav') {
                e.preventDefault();
                this.openTechModal();
            }
        });
    }

    startTechMonitoring() {
        this.monitoring = true;

        // Initial scan
        this.performTechScan();

        // Schedule periodic scans
        const frequency = this.preferences.notificationFrequency === 'daily' ? 24 * 60 * 60 * 1000 :
            this.preferences.notificationFrequency === 'weekly' ? 7 * 24 * 60 * 60 * 1000 :
                60 * 60 * 1000; // hourly

        setInterval(() => {
            this.performTechScan();
        }, frequency);
    }

    async performTechScan() {
        try {
            const newUpdates = await this.scanTechSources();
            this.processTechUpdates(newUpdates);
            this.updateTechWidget();
        } catch (error) {
            console.error('Tech scan failed:', error);
        }
    }

    async scanTechSources() {
        // Simulate API calls to technology sources
        const mockUpdates = [];

        for (const source of this.sources) {
            const updates = await this.simulateTechScan(source);
            mockUpdates.push(...updates);
        }

        return mockUpdates;
    }

    async simulateTechScan(source) {
        await this.delay(1000 + Math.random() * 2000);

        const techTitles = {
            'rail-construction': [
                'New High-Speed Rail Construction Techniques',
                'Sustainable Materials for Railway Infrastructure',
                'Advanced Track Laying Technologies',
                'Smart Construction Monitoring Systems'
            ],
            'signaling-systems': [
                'Next-Gen Railway Signaling Technology',
                'AI-Powered Traffic Control Systems',
                'Wireless Communication for Rail Networks',
                'Predictive Maintenance for Signaling Equipment'
            ],
            'safety-technology': [
                'Advanced Collision Avoidance Systems',
                'Real-time Safety Monitoring Solutions',
                'Emergency Response Automation',
                'Passenger Safety Enhancement Technologies'
            ],
            'infrastructure': [
                'Smart Station Infrastructure',
                'Energy-Efficient Rail Systems',
                'Climate-Resilient Railway Design',
                'Integrated Transportation Hubs'
            ]
        };

        const categories = Object.keys(techTitles);
        const selectedCategory = categories[Math.floor(Math.random() * categories.length)];
        const titles = techTitles[selectedCategory];

        const updateCount = Math.floor(Math.random() * 3) + 1;
        const updates = [];

        for (let i = 0; i < updateCount; i++) {
            const update = {
                id: `tech_${source.id}_${Date.now()}_${i}`,
                title: titles[Math.floor(Math.random() * titles.length)],
                summary: this.generateTechSummary(selectedCategory),
                category: selectedCategory,
                source: source.name,
                sourceType: source.type,
                publishDate: this.generateRecentDate(-7, 0),
                relevanceScore: this.calculateRelevance(selectedCategory),
                tags: this.generateTechTags(selectedCategory),
                readTime: Math.floor(Math.random() * 10) + 3,
                priority: this.calculateTechPriority(selectedCategory),
                url: `${source.url}/article/${Date.now()}`,
                discovered: new Date().toISOString()
            };

            updates.push(update);
        }

        return updates;
    }

    generateTechSummary(category) {
        const summaries = {
            'rail-construction': 'Revolutionary construction methodology reducing project timelines by 30% while improving structural integrity and environmental sustainability.',
            'signaling-systems': 'Advanced signaling technology leveraging AI and machine learning to optimize traffic flow and enhance safety protocols.',
            'safety-technology': 'Cutting-edge safety system providing real-time monitoring and predictive analysis to prevent accidents and improve passenger security.',
            'infrastructure': 'Innovative infrastructure solution combining smart technology with sustainable design for next-generation transportation systems.'
        };

        return summaries[category] || 'Emerging technology with potential applications in railway and metro systems.';
    }

    generateTechTags(category) {
        const tagSets = {
            'rail-construction': ['construction', 'engineering', 'materials', 'sustainability'],
            'signaling-systems': ['signaling', 'automation', 'AI', 'communication'],
            'safety-technology': ['safety', 'monitoring', 'emergency', 'prevention'],
            'infrastructure': ['infrastructure', 'smart-tech', 'energy', 'design']
        };

        return tagSets[category] || ['technology', 'innovation'];
    }

    calculateRelevance(category) {
        const relevanceScores = {
            'rail-construction': 95,
            'signaling-systems': 90,
            'safety-technology': 85,
            'infrastructure': 80
        };

        return relevanceScores[category] + Math.floor(Math.random() * 10) - 5;
    }

    calculateTechPriority(category) {
        const highPriorityCategories = ['safety-technology', 'signaling-systems'];
        return highPriorityCategories.includes(category) ? 'high' : 'medium';
    }

    processTechUpdates(newUpdates) {
        let addedCount = 0;

        newUpdates.forEach(update => {
            // Check if update already exists
            const exists = this.techUpdates.find(t => t.id === update.id);
            if (!exists && this.isRelevantUpdate(update)) {
                this.techUpdates.unshift(update);
                addedCount++;

                // Create notification
                this.createTechNotification(update);
            }
        });

        if (addedCount > 0) {
            this.saveData();

            if (window.showNotification) {
                window.showNotification(`${addedCount} new technology updates found!`, 'info');
            }
        }
    }

    isRelevantUpdate(update) {
        if (!this.preferences.autoRelevanceFilter) return true;
        return update.relevanceScore >= 70;
    }

    createTechNotification(update) {
        if (window.notificationSystem) {
            window.notificationSystem.createNotification({
                type: 'tech-update',
                title: 'New Technology Update',
                message: `${update.title} - ${update.source}`,
                category: 'technology',
                priority: update.priority,
                channels: ['dashboard', 'email'],
                data: {
                    techId: update.id,
                    category: update.category,
                    relevanceScore: update.relevanceScore
                }
            });
        }
    }

    updateTechWidget() {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const newThisWeek = this.techUpdates.filter(t =>
            new Date(t.discovered) > weekAgo
        ).length;

        const relevantUpdates = this.techUpdates.filter(t =>
            t.relevanceScore >= 70
        ).length;

        document.getElementById('newTechCount').textContent = newThisWeek;
        document.getElementById('relevantTechCount').textContent = relevantUpdates;

        this.updateRecentTechList();
    }

    updateRecentTechList() {
        const container = document.getElementById('recentTechList');
        if (!container) return;

        const recentUpdates = this.techUpdates.slice(0, 5);

        if (recentUpdates.length === 0) {
            container.innerHTML = '<div class="no-tech">No technology updates</div>';
            return;
        }

        container.innerHTML = recentUpdates.map(update => `
            <div class="tech-item ${update.priority}-priority">
                <div class="tech-info">
                    <div class="tech-title">${update.title}</div>
                    <div class="tech-meta">
                        <span class="tech-source">${update.source}</span>
                        <span class="tech-category">${update.category.replace('-', ' ')}</span>
                        <span class="relevance-score">${update.relevanceScore}% relevant</span>
                    </div>
                </div>
                <div class="tech-actions">
                    <button class="btn-icon" onclick="techTracker.viewTechUpdate('${update.id}')" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    openTechModal() {
        // Create and show technology management modal
        if (!document.getElementById('techModal')) {
            this.createTechModal();
        }

        const modal = document.getElementById('techModal');
        modal.style.display = 'flex';
        this.updateTechModal();
    }

    createTechModal() {
        const modal = document.createElement('div');
        modal.id = 'techModal';
        modal.className = 'modal tech-modal';
        modal.style.display = 'none';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-container large">
                <div class="modal-header">
                    <h2><i class="fas fa-microchip"></i> Technology Updates</h2>
                    <button id="closeTechModal" class="close-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-content">
                    <div class="tech-filters">
                        <select id="categoryFilter">
                            <option value="">All Categories</option>
                            <option value="rail-construction">Rail Construction</option>
                            <option value="signaling-systems">Signaling Systems</option>
                            <option value="safety-technology">Safety Technology</option>
                            <option value="infrastructure">Infrastructure</option>
                        </select>
                        <select id="relevanceFilter">
                            <option value="">All Relevance</option>
                            <option value="high">High (80%+)</option>
                            <option value="medium">Medium (60-80%)</option>
                        </select>
                        <input type="text" id="techSearch" placeholder="Search updates...">
                    </div>
                    <div class="tech-grid" id="techGrid">
                        <!-- Technology updates will be loaded here -->
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Setup modal event listeners
        document.getElementById('closeTechModal').addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    updateTechModal() {
        const grid = document.getElementById('techGrid');
        if (!grid) return;

        const filteredUpdates = this.getFilteredTechUpdates();

        grid.innerHTML = filteredUpdates.map(update => this.renderTechCard(update)).join('');
    }

    getFilteredTechUpdates() {
        // Apply filters from modal
        return this.techUpdates.sort((a, b) =>
            new Date(b.discovered) - new Date(a.discovered)
        );
    }

    renderTechCard(update) {
        return `
            <div class="tech-card ${update.priority}-priority">
                <div class="tech-card-header">
                    <h4>${update.title}</h4>
                    <span class="priority-badge ${update.priority}">${update.priority}</span>
                </div>
                <div class="tech-card-body">
                    <p class="tech-summary">${update.summary}</p>
                    <div class="tech-meta-grid">
                        <div class="meta-item">
                            <i class="fas fa-tag"></i>
                            <span>${update.category.replace('-', ' ')}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-globe"></i>
                            <span>${update.source}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-clock"></i>
                            <span>${update.readTime} min read</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-chart-line"></i>
                            <span>${update.relevanceScore}% relevant</span>
                        </div>
                    </div>
                    <div class="tech-tags">
                        ${update.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
                <div class="tech-card-actions">
                    <button class="btn btn-primary" onclick="window.open('${update.url}', '_blank')">
                        <i class="fas fa-external-link-alt"></i> Read More
                    </button>
                    <button class="btn btn-outline" onclick="techTracker.markAsReviewed('${update.id}')">
                        <i class="fas fa-check"></i> Mark Reviewed
                    </button>
                </div>
            </div>
        `;
    }

    viewTechUpdate(updateId) {
        const update = this.techUpdates.find(t => t.id === updateId);
        if (update) {
            window.open(update.url, '_blank');
        }
    }

    markAsReviewed(updateId) {
        const update = this.techUpdates.find(t => t.id === updateId);
        if (update) {
            update.reviewed = true;
            update.reviewedDate = new Date().toISOString();
            this.saveData();
            this.updateTechModal();

            if (window.showNotification) {
                window.showNotification('Technology update marked as reviewed', 'success');
            }
        }
    }

    generateRecentDate(minDays, maxDays) {
        const now = new Date();
        const randomDays = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
        const date = new Date(now.getTime() + randomDays * 24 * 60 * 60 * 1000);
        return date.toISOString();
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize technology tracker when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.techTracker = new TechnologyTracker();
});

window.TechnologyTracker = TechnologyTracker;
// KMRL Portal Monitoring System for Automated Tender Tracking

class PortalMonitor {
    constructor() {
        this.portals = [];
        this.monitoringActive = false;
        this.searchKeywords = ['metro', 'railway', 'transport', 'infrastructure', 'kmrl', 'kochi'];
        this.lastScanTime = null;
        this.foundTenders = [];
        this.init();
    }

    init() {
        this.setupPortals();
        this.loadConfiguration();
        this.startMonitoring();
    }

    setupPortals() {
        // Portals are now managed by the backend
        // We'll load them from the API
        this.loadPortalsFromAPI();
    }

    async loadPortalsFromAPI() {
        if (window.apiClient) {
            try {
                this.portals = await window.apiClient.getPortals();
            } catch (error) {
                console.error('Error loading portals from API:', error);
                // Fallback to default portals
                this.setupDefaultPortals();
            }
        } else {
            // Fallback to default portals if API client is not available
            this.setupDefaultPortals();
        }
    }

    setupDefaultPortals() {
        this.portals = [
            {
                id: 'etenders-gov',
                name: 'Government e-Tenders Portal',
                url: 'https://etenders.gov.in',
                type: 'government',
                active: true,
                searchEndpoint: '/api/search',
                lastScanned: null,
                totalTenders: 0,
                newTenders: 0
            },
            {
                id: 'gem-portal',
                name: 'Government e-Marketplace (GeM)',
                url: 'https://gem.gov.in',
                type: 'government',
                active: true,
                searchEndpoint: '/api/tenders',
                lastScanned: null,
                totalTenders: 0,
                newTenders: 0
            },
            {
                id: 'kerala-eproc',
                name: 'Kerala e-Procurement',
                url: 'https://eproc.kerala.gov.in',
                type: 'government',
                active: true,
                searchEndpoint: '/tender/search',
                lastScanned: null,
                totalTenders: 0,
                newTenders: 0
            },
            {
                id: 'tenderwizard',
                name: 'TenderWizard',
                url: 'https://tenderwizard.com',
                type: 'private',
                active: true,
                searchEndpoint: '/api/search-tenders',
                lastScanned: null,
                totalTenders: 0,
                newTenders: 0
            },
            {
                id: 'biddingowl',
                name: 'BiddingOwl',
                url: 'https://biddingowl.com',
                type: 'private',
                active: true,
                searchEndpoint: '/search',
                lastScanned: null,
                totalTenders: 0,
                newTenders: 0
            },
            {
                id: 'indian-railways',
                name: 'Indian Railways Tenders',
                url: 'https://indianrailways.gov.in',
                type: 'government',
                active: true,
                searchEndpoint: '/tender-search',
                lastScanned: null,
                totalTenders: 0,
                newTenders: 0
            }
        ];
    }

    loadConfiguration() {
        try {
            const config = JSON.parse(localStorage.getItem('portal_monitor_config') || '{}');

            this.monitoringInterval = config.interval || 60; // minutes
            this.searchKeywords = config.keywords || this.searchKeywords;
            this.enabledPortals = config.enabledPortals || this.portals.map(p => p.id);
            this.notificationSettings = config.notifications || {
                immediate: true,
                email: true,
                summary: true
            };

            // Update portal active status
            this.portals.forEach(portal => {
                portal.active = this.enabledPortals.includes(portal.id);
            });

        } catch (error) {
            console.error('Error loading monitor configuration:', error);
        }
    }

    saveConfiguration() {
        const config = {
            interval: this.monitoringInterval,
            keywords: this.searchKeywords,
            enabledPortals: this.portals.filter(p => p.active).map(p => p.id),
            notifications: this.notificationSettings
        };

        localStorage.setItem('portal_monitor_config', JSON.stringify(config));
    }

    async startMonitoring() {
        if (this.monitoringActive) return;

        this.monitoringActive = true;
        console.log('Portal monitoring started');

        // If API client is available, start monitoring on the backend
        if (window.apiClient) {
            try {
                await window.apiClient.startMonitoring();
            } catch (error) {
                console.error('Error starting backend monitoring:', error);
                // Fallback to client-side monitoring
                this.startClientSideMonitoring();
            }
        } else {
            // Fallback to client-side monitoring
            this.startClientSideMonitoring();
        }

        // Update UI
        this.updateMonitoringStatus();
    }

    startClientSideMonitoring() {
        // Initial scan
        this.performScan();

        // Schedule periodic scans
        this.monitoringTimer = setInterval(() => {
            this.performScan();
        }, this.monitoringInterval * 60 * 1000);
    }

    async stopMonitoring() {
        this.monitoringActive = false;

        // If API client is available, stop monitoring on the backend
        if (window.apiClient) {
            try {
                await window.apiClient.stopMonitoring();
            } catch (error) {
                console.error('Error stopping backend monitoring:', error);
            }
        }

        if (this.monitoringTimer) {
            clearInterval(this.monitoringTimer);
            this.monitoringTimer = null;
        }

        console.log('Portal monitoring stopped');
        this.updateMonitoringStatus();
    }

    async performScan() {
        console.log('Starting portal scan...');
        this.lastScanTime = new Date();

        const activePortals = this.portals.filter(p => p.active);
        const scanPromises = activePortals.map(portal => this.scanPortal(portal));

        try {
            const results = await Promise.allSettled(scanPromises);
            this.processScanResults(results, activePortals);
        } catch (error) {
            console.error('Error during portal scan:', error);
        }

        this.updateMonitoringStatus();
    }

    async scanPortal(portal) {
        try {
            console.log(`Scanning ${portal.name}...`);

            // Simulate API call to portal
            const tenders = await this.simulatePortalSearch(portal);

            portal.lastScanned = new Date();
            portal.totalTenders = tenders.length;

            // Check for new tenders
            const newTenders = this.identifyNewTenders(tenders, portal.id);
            portal.newTenders = newTenders.length;

            if (newTenders.length > 0) {
                this.foundTenders.push(...newTenders);
                this.notifyNewTenders(newTenders, portal);
            }

            return {
                portal: portal,
                tenders: tenders,
                newTenders: newTenders,
                success: true
            };

        } catch (error) {
            console.error(`Error scanning ${portal.name}:`, error);
            return {
                portal: portal,
                error: error,
                success: false
            };
        }
    }

    async simulatePortalSearch(portal) {
        // Simulate network delay
        await this.delay(2000 + Math.random() * 3000);

        // Generate mock tender data
        const tenderCount = Math.floor(Math.random() * 10) + 2;
        const mockTenders = [];

        for (let i = 0; i < tenderCount; i++) {
            const tender = {
                id: `${portal.id}_${Date.now()}_${i}`,
                title: this.generateTenderTitle(portal.type),
                organization: this.generateOrganization(portal.type),
                description: this.generateTenderDescription(),
                value: Math.floor(Math.random() * 50000000) + 500000,
                publishDate: this.generateRecentDate(-5, 0),
                submissionDeadline: this.generateRecentDate(10, 60),
                location: this.generateLocation(),
                category: this.generateCategory(),
                keywords: this.generateKeywords(),
                source: portal.name,
                sourceUrl: portal.url,
                portalId: portal.id,
                discovered: new Date().toISOString()
            };

            // Only include tenders that match our keywords
            if (this.matchesKeywords(tender)) {
                mockTenders.push(tender);
            }
        }

        return mockTenders;
    }

    generateTenderTitle(portalType) {
        const titles = {
            government: [
                'Metro Rail Infrastructure Development',
                'Railway Signal System Upgrade',
                'Public Transport Modernization',
                'Station Platform Construction',
                'Electrical Systems Installation',
                'Civil Construction Works',
                'Rolling Stock Maintenance',
                'Safety Systems Implementation'
            ],
            private: [
                'Transportation Technology Solutions',
                'Infrastructure Engineering Services',
                'Metro Equipment Supply',
                'Railway Consulting Services',
                'Smart Transit Systems',
                'Maintenance and Operations',
                'Technical Support Services',
                'Equipment Procurement'
            ]
        };

        const typeTitle = titles[portalType] || titles.government;
        return typeTitle[Math.floor(Math.random() * typeTitle.length)];
    }

    generateOrganization(portalType) {
        const orgs = {
            government: [
                'Kerala Metro Rail Limited',
                'Indian Railways',
                'Kerala State Road Transport Corporation',
                'Public Works Department Kerala',
                'Kerala Water Authority',
                'Kochi Corporation',
                'Kerala State Electricity Board'
            ],
            private: [
                'Metro Infrastructure Pvt Ltd',
                'Railway Solutions Inc',
                'Transport Tech Solutions',
                'Infrastructure Development Corp',
                'Engineering Services Ltd',
                'Construction and Projects',
                'Technology Systems Pvt Ltd'
            ]
        };

        const typeOrgs = orgs[portalType] || orgs.government;
        return typeOrgs[Math.floor(Math.random() * typeOrgs.length)];
    }

    generateTenderDescription() {
        const descriptions = [
            'Comprehensive infrastructure development project for modern transportation systems',
            'Technical implementation and maintenance of railway safety systems',
            'Design and construction of metro station facilities and platforms',
            'Supply and installation of electrical and signaling equipment',
            'Civil engineering works for transportation infrastructure',
            'Maintenance and operational support for metro rail systems'
        ];

        return descriptions[Math.floor(Math.random() * descriptions.length)];
    }

    generateRecentDate(minDays, maxDays) {
        const now = new Date();
        const randomDays = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
        const date = new Date(now.getTime() + randomDays * 24 * 60 * 60 * 1000);
        return date.toISOString();
    }

    generateLocation() {
        const locations = ['Kochi', 'Ernakulam', 'Kerala', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur'];
        return locations[Math.floor(Math.random() * locations.length)];
    }

    generateCategory() {
        const categories = ['infrastructure', 'electrical', 'mechanical', 'civil', 'technology', 'maintenance'];
        return categories[Math.floor(Math.random() * categories.length)];
    }

    generateKeywords() {
        const keywords = ['metro', 'railway', 'transport', 'infrastructure', 'station', 'platform', 'safety'];
        const selected = [];
        const count = Math.floor(Math.random() * 3) + 2;

        for (let i = 0; i < count; i++) {
            const keyword = keywords[Math.floor(Math.random() * keywords.length)];
            if (!selected.includes(keyword)) {
                selected.push(keyword);
            }
        }

        return selected;
    }

    matchesKeywords(tender) {
        const tenderText = `${tender.title} ${tender.description} ${tender.keywords.join(' ')}`.toLowerCase();
        return this.searchKeywords.some(keyword => tenderText.includes(keyword.toLowerCase()));
    }

    identifyNewTenders(tenders, portalId) {
        // Get previously found tenders for this portal
        const existingTenders = JSON.parse(localStorage.getItem(`portal_tenders_${portalId}`) || '[]');
        const existingIds = existingTenders.map(t => t.id);

        // Find new tenders
        const newTenders = tenders.filter(tender => !existingIds.includes(tender.id));

        // Update stored tenders
        const updatedTenders = [...existingTenders, ...newTenders];
        localStorage.setItem(`portal_tenders_${portalId}`, JSON.stringify(updatedTenders));

        return newTenders;
    }

    notifyNewTenders(newTenders, portal) {
        if (window.notificationSystem) {
            newTenders.forEach(tender => {
                window.notificationSystem.createNotification({
                    type: 'new-tender',
                    title: 'New Tender Found',
                    message: `${tender.title} found on ${portal.name}`,
                    category: 'tender',
                    priority: this.calculateTenderPriority(tender),
                    channels: ['dashboard', 'email'],
                    data: {
                        tenderId: tender.id,
                        portalId: portal.id,
                        portalName: portal.name,
                        tenderData: tender
                    }
                });
            });
        }

        // Also add to tender tracker if available
        if (window.tenderTracker) {
            newTenders.forEach(tender => {
                const tenderForTracker = {
                    ...tender,
                    priority: this.calculateTenderPriority(tender),
                    status: 'active',
                    tracked: false,
                    addedDate: new Date().toISOString()
                };

                window.tenderTracker.tenders.push(tenderForTracker);
            });

            window.tenderTracker.saveData();
            window.tenderTracker.updateWidgetStats();
        }
    }

    calculateTenderPriority(tender) {
        if (tender.value > 10000000) return 'urgent';
        if (tender.value > 5000000) return 'high';
        if (tender.keywords.some(k => ['metro', 'railway', 'kmrl'].includes(k.toLowerCase()))) return 'high';
        return 'medium';
    }

    processScanResults(results, portals) {
        let totalNewTenders = 0;
        let successfulScans = 0;
        let failedScans = 0;

        results.forEach((result, index) => {
            const portal = portals[index];

            if (result.status === 'fulfilled' && result.value.success) {
                successfulScans++;
                totalNewTenders += result.value.newTenders.length;
            } else {
                failedScans++;
                console.error(`Failed to scan ${portal.name}:`, result.reason || result.value.error);
            }
        });

        // Create summary notification if new tenders found
        if (totalNewTenders > 0 && window.notificationSystem) {
            window.notificationSystem.createNotification({
                type: 'scan-summary',
                title: 'Portal Scan Complete',
                message: `Found ${totalNewTenders} new tender(s) across ${successfulScans} portal(s)`,
                category: 'system',
                priority: 'medium',
                channels: ['dashboard'],
                data: {
                    totalNewTenders,
                    successfulScans,
                    failedScans,
                    scanTime: this.lastScanTime
                }
            });
        }

        // Update scan statistics
        this.updateScanStatistics({
            totalNewTenders,
            successfulScans,
            failedScans,
            scanTime: this.lastScanTime
        });
    }

    updateScanStatistics(stats) {
        // Store scan statistics
        const scanHistory = JSON.parse(localStorage.getItem('portal_scan_history') || '[]');
        scanHistory.unshift(stats);

        // Keep only last 50 scans
        if (scanHistory.length > 50) {
            scanHistory.splice(50);
        }

        localStorage.setItem('portal_scan_history', JSON.stringify(scanHistory));
    }

    updateMonitoringStatus() {
        // Update any UI elements showing monitoring status
        const statusElements = document.querySelectorAll('.monitoring-status');
        statusElements.forEach(element => {
            element.textContent = this.monitoringActive ? 'Active' : 'Stopped';
            element.className = `monitoring-status ${this.monitoringActive ? 'active' : 'stopped'}`;
        });

        // Update last scan time
        const lastScanElements = document.querySelectorAll('.last-scan-time');
        lastScanElements.forEach(element => {
            if (this.lastScanTime) {
                element.textContent = this.formatRelativeTime(this.lastScanTime);
            }
        });
    }

    formatRelativeTime(date) {
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

    // Configuration methods
    updateKeywords(keywords) {
        this.searchKeywords = keywords;
        this.saveConfiguration();
    }

    updateMonitoringInterval(minutes) {
        this.monitoringInterval = minutes;
        this.saveConfiguration();

        // Restart monitoring with new interval
        if (this.monitoringActive) {
            this.stopMonitoring();
            this.startMonitoring();
        }
    }

    togglePortal(portalId, active) {
        const portal = this.portals.find(p => p.id === portalId);
        if (portal) {
            portal.active = active;
            this.saveConfiguration();

            // Update portal on backend if API client is available
            if (window.apiClient) {
                window.apiClient.updatePortal(portalId, { active: active });
            }
        }
    }

    // API methods for integration
    getPortalStatus() {
        return {
            active: this.monitoringActive,
            portals: this.portals.map(p => ({
                id: p.id,
                name: p.name,
                active: p.active,
                lastScanned: p.lastScanned,
                totalTenders: p.totalTenders,
                newTenders: p.newTenders
            })),
            lastScanTime: this.lastScanTime,
            nextScanTime: this.monitoringActive ?
                new Date(Date.now() + this.monitoringInterval * 60 * 1000) : null
        };
    }

    getFoundTenders() {
        return this.foundTenders;
    }

    getScanHistory() {
        return JSON.parse(localStorage.getItem('portal_scan_history') || '[]');
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize portal monitor
document.addEventListener('DOMContentLoaded', () => {
    window.portalMonitor = new PortalMonitor();
});

// Export for global access
window.PortalMonitor = PortalMonitor;
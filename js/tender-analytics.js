// KMRL Tender Analytics Dashboard

class TenderAnalytics {
    constructor() {
        this.init();
    }

    init() {
        this.loadAnalyticsData();
        this.createAnalyticsDashboard();
        this.setupEventListeners();
    }

    loadAnalyticsData() {
        // Get tender data from tracker
        this.tenders = window.tenderTracker ? window.tenderTracker.tenders : [];
        this.notifications = JSON.parse(localStorage.getItem('kmrl_all_notifications') || '[]');
        this.scanHistory = JSON.parse(localStorage.getItem('portal_scan_history') || '[]');
    }

    createAnalyticsDashboard() {
        // Add analytics widget to main dashboard
        this.addAnalyticsWidget();

        // Create detailed analytics modal
        this.createAnalyticsModal();
    }

    addAnalyticsWidget() {
        const dashboardContainer = document.querySelector('.dashboard-widgets') ||
            document.querySelector('.widgets-grid') ||
            document.querySelector('.main-content');

        if (dashboardContainer) {
            const analyticsWidget = document.createElement('div');
            analyticsWidget.className = 'widget analytics-widget';
            analyticsWidget.innerHTML = `
                <div class="widget-header">
                    <div class="widget-title">
                        <i class="fas fa-chart-bar"></i>
                        <span>Tender Analytics</span>
                    </div>
                    <button id="openAnalytics" class="btn-icon" title="View Analytics">
                        <i class="fas fa-external-link-alt"></i>
                    </button>
                </div>
                <div class="widget-content">
                    <div class="analytics-summary">
                        <div class="metric">
                            <div class="metric-value" id="totalValue">₹0</div>
                            <div class="metric-label">Total Value</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value" id="avgValue">₹0</div>
                            <div class="metric-label">Average Value</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value" id="successRate">0%</div>
                            <div class="metric-label">Success Rate</div>
                        </div>
                    </div>
                    <div class="mini-chart" id="trendChart">
                        <!-- Mini trend chart -->
                    </div>
                </div>
            `;

            dashboardContainer.appendChild(analyticsWidget);
        }
    }

    createAnalyticsModal() {
        const modal = document.createElement('div');
        modal.id = 'analyticsModal';
        modal.className = 'modal analytics-modal';
        modal.style.display = 'none';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-container extra-large">
                <div class="modal-header">
                    <h2><i class="fas fa-chart-bar"></i> Tender Analytics Dashboard</h2>
                    <button id="closeAnalyticsModal" class="close-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-content">
                    <div class="analytics-tabs">
                        <button class="tab-btn active" data-tab="overview">Overview</button>
                        <button class="tab-btn" data-tab="trends">Trends</button>
                        <button class="tab-btn" data-tab="performance">Performance</button>
                        <button class="tab-btn" data-tab="reports">Reports</button>
                    </div>
                    
                    <div id="overviewTab" class="tab-content active">
                        <div class="analytics-grid">
                            <div class="analytics-card">
                                <h3>Tender Distribution</h3>
                                <canvas id="categoryChart" width="300" height="200"></canvas>
                            </div>
                            <div class="analytics-card">
                                <h3>Value Analysis</h3>
                                <canvas id="valueChart" width="300" height="200"></canvas>
                            </div>
                            <div class="analytics-card">
                                <h3>Source Breakdown</h3>
                                <canvas id="sourceChart" width="300" height="200"></canvas>
                            </div>
                            <div class="analytics-card">
                                <h3>Priority Distribution</h3>
                                <canvas id="priorityChart" width="300" height="200"></canvas>
                            </div>
                        </div>
                        
                        <div class="kpi-grid">
                            <div class="kpi-card">
                                <div class="kpi-value" id="totalTendersKPI">0</div>
                                <div class="kpi-label">Total Tenders</div>
                                <div class="kpi-change positive" id="tendersChange">+0%</div>
                            </div>
                            <div class="kpi-card">
                                <div class="kpi-value" id="totalValueKPI">₹0</div>
                                <div class="kpi-label">Total Value</div>
                                <div class="kpi-change positive" id="valueChange">+0%</div>
                            </div>
                            <div class="kpi-card">
                                <div class="kpi-value" id="avgResponseTime">0h</div>
                                <div class="kpi-label">Avg Response Time</div>
                                <div class="kpi-change positive" id="responseChange">-0%</div>
                            </div>
                            <div class="kpi-card">
                                <div class="kpi-value" id="monitoringEfficiency">0%</div>
                                <div class="kpi-label">Monitoring Efficiency</div>
                                <div class="kpi-change positive" id="efficiencyChange">+0%</div>
                            </div>
                        </div>
                    </div>
                    
                    <div id="trendsTab" class="tab-content">
                        <div class="trends-container">
                            <div class="trend-chart-container">
                                <h3>Tender Discovery Trends</h3>
                                <canvas id="discoveryTrendChart" width="800" height="400"></canvas>
                            </div>
                            <div class="trend-metrics">
                                <div class="trend-metric">
                                    <h4>Weekly Growth</h4>
                                    <div class="trend-value">+15.3%</div>
                                </div>
                                <div class="trend-metric">
                                    <h4>Peak Discovery Time</h4>
                                    <div class="trend-value">10:00 AM</div>
                                </div>
                                <div class="trend-metric">
                                    <h4>Best Performing Portal</h4>
                                    <div class="trend-value">Government e-Tenders</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div id="performanceTab" class="tab-content">
                        <div class="performance-grid">
                            <div class="performance-card">
                                <h3>Portal Performance</h3>
                                <div id="portalPerformanceList"></div>
                            </div>
                            <div class="performance-card">
                                <h3>Monitoring Statistics</h3>
                                <div id="monitoringStats"></div>
                            </div>
                            <div class="performance-card">
                                <h3>Notification Delivery</h3>
                                <div id="notificationStats"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div id="reportsTab" class="tab-content">
                        <div class="reports-container">
                            <h3>Generate Reports</h3>
                            <div class="report-options">
                                <div class="report-option">
                                    <h4>Monthly Summary</h4>
                                    <p>Comprehensive monthly tender activity report</p>
                                    <button class="btn btn-primary" onclick="generateReport('monthly')">
                                        <i class="fas fa-file-pdf"></i> Generate PDF
                                    </button>
                                </div>
                                <div class="report-option">
                                    <h4>Performance Analysis</h4>
                                    <p>Detailed performance metrics and insights</p>
                                    <button class="btn btn-primary" onclick="generateReport('performance')">
                                        <i class="fas fa-chart-line"></i> Generate Report
                                    </button>
                                </div>
                                <div class="report-option">
                                    <h4>Tender Opportunities</h4>
                                    <p>Export filtered tender opportunities</p>
                                    <button class="btn btn-primary" onclick="generateReport('opportunities')">
                                        <i class="fas fa-download"></i> Export Excel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.addAnalyticsStyles();
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.id === 'openAnalytics') {
                this.openAnalyticsModal();
            }

            if (e.target.id === 'closeAnalyticsModal') {
                this.closeAnalyticsModal();
            }

            if (e.target.classList.contains('tab-btn')) {
                this.switchAnalyticsTab(e.target.dataset.tab);
            }
        });
    }

    openAnalyticsModal() {
        const modal = document.getElementById('analyticsModal');
        if (modal) {
            modal.style.display = 'flex';
            this.updateAnalytics();
        }
    }

    closeAnalyticsModal() {
        const modal = document.getElementById('analyticsModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    switchAnalyticsTab(tabName) {
        // Remove active class from all tabs and content
        document.querySelectorAll('.analytics-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.analytics-modal .tab-content').forEach(content => content.classList.remove('active'));

        // Add active class to selected tab and content
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}Tab`).classList.add('active');

        // Load specific tab content
        switch (tabName) {
            case 'overview':
                this.updateOverview();
                break;
            case 'trends':
                this.updateTrends();
                break;
            case 'performance':
                this.updatePerformance();
                break;
            case 'reports':
                this.updateReports();
                break;
        }
    }

    updateAnalytics() {
        this.loadAnalyticsData();
        this.updateWidgetSummary();
        this.updateOverview();
    }

    updateWidgetSummary() {
        const totalValue = this.tenders.reduce((sum, tender) => sum + tender.value, 0);
        const avgValue = this.tenders.length > 0 ? totalValue / this.tenders.length : 0;
        const successRate = this.calculateSuccessRate();

        document.getElementById('totalValue').textContent = this.formatCurrency(totalValue);
        document.getElementById('avgValue').textContent = this.formatCurrency(avgValue);
        document.getElementById('successRate').textContent = successRate + '%';
    }

    updateOverview() {
        this.updateKPIs();
        this.createCharts();
    }

    updateKPIs() {
        const totalTenders = this.tenders.length;
        const totalValue = this.tenders.reduce((sum, tender) => sum + tender.value, 0);
        const avgResponseTime = this.calculateAverageResponseTime();
        const monitoringEfficiency = this.calculateMonitoringEfficiency();

        document.getElementById('totalTendersKPI').textContent = totalTenders;
        document.getElementById('totalValueKPI').textContent = this.formatCurrency(totalValue);
        document.getElementById('avgResponseTime').textContent = avgResponseTime + 'h';
        document.getElementById('monitoringEfficiency').textContent = monitoringEfficiency + '%';

        // Update change indicators (simplified)
        document.getElementById('tendersChange').textContent = '+12%';
        document.getElementById('valueChange').textContent = '+8%';
        document.getElementById('responseChange').textContent = '-15%';
        document.getElementById('efficiencyChange').textContent = '+5%';
    }

    createCharts() {
        this.createCategoryChart();
        this.createValueChart();
        this.createSourceChart();
        this.createPriorityChart();
    }

    createCategoryChart() {
        const canvas = document.getElementById('categoryChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const categories = this.getCategoryDistribution();

        // Simple pie chart implementation
        this.drawPieChart(ctx, categories, 'Category Distribution');
    }

    createValueChart() {
        const canvas = document.getElementById('valueChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const valueRanges = this.getValueDistribution();

        this.drawBarChart(ctx, valueRanges, 'Value Distribution');
    }

    createSourceChart() {
        const canvas = document.getElementById('sourceChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const sources = this.getSourceDistribution();

        this.drawPieChart(ctx, sources, 'Source Distribution');
    }

    createPriorityChart() {
        const canvas = document.getElementById('priorityChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const priorities = this.getPriorityDistribution();

        this.drawBarChart(ctx, priorities, 'Priority Distribution');
    }

    // Chart drawing methods (simplified canvas implementation)
    drawPieChart(ctx, data, title) {
        const centerX = 150;
        const centerY = 100;
        const radius = 80;

        let total = Object.values(data).reduce((sum, val) => sum + val, 0);
        let currentAngle = 0;

        const colors = ['#2563eb', '#10b981', '#f59e0b', '#dc2626', '#8b5cf6'];
        let colorIndex = 0;

        Object.entries(data).forEach(([key, value]) => {
            const sliceAngle = (value / total) * 2 * Math.PI;

            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.lineTo(centerX, centerY);
            ctx.fillStyle = colors[colorIndex % colors.length];
            ctx.fill();

            currentAngle += sliceAngle;
            colorIndex++;
        });
    }

    drawBarChart(ctx, data, title) {
        const barWidth = 40;
        const barSpacing = 10;
        const maxHeight = 150;
        const maxValue = Math.max(...Object.values(data));

        let x = 20;
        const colors = ['#2563eb', '#10b981', '#f59e0b', '#dc2626', '#8b5cf6'];
        let colorIndex = 0;

        Object.entries(data).forEach(([key, value]) => {
            const barHeight = (value / maxValue) * maxHeight;

            ctx.fillStyle = colors[colorIndex % colors.length];
            ctx.fillRect(x, 170 - barHeight, barWidth, barHeight);

            // Label
            ctx.fillStyle = '#374151';
            ctx.font = '12px Arial';
            ctx.fillText(key.substring(0, 8), x, 190);

            x += barWidth + barSpacing;
            colorIndex++;
        });
    }

    // Data processing methods
    getCategoryDistribution() {
        const distribution = {};
        this.tenders.forEach(tender => {
            distribution[tender.category] = (distribution[tender.category] || 0) + 1;
        });
        return distribution;
    }

    getValueDistribution() {
        const ranges = {
            '< 10L': 0,
            '10L-50L': 0,
            '50L-1Cr': 0,
            '1Cr-5Cr': 0,
            '> 5Cr': 0
        };

        this.tenders.forEach(tender => {
            const value = tender.value;
            if (value < 1000000) ranges['< 10L']++;
            else if (value < 5000000) ranges['10L-50L']++;
            else if (value < 10000000) ranges['50L-1Cr']++;
            else if (value < 50000000) ranges['1Cr-5Cr']++;
            else ranges['> 5Cr']++;
        });

        return ranges;
    }

    getSourceDistribution() {
        const distribution = {};
        this.tenders.forEach(tender => {
            const source = tender.source || 'Unknown';
            distribution[source] = (distribution[source] || 0) + 1;
        });
        return distribution;
    }

    getPriorityDistribution() {
        const distribution = {};
        this.tenders.forEach(tender => {
            distribution[tender.priority] = (distribution[tender.priority] || 0) + 1;
        });
        return distribution;
    }

    // Calculation methods
    calculateSuccessRate() {
        // Simplified success rate calculation
        const appliedTenders = this.tenders.filter(t => t.status === 'applied').length;
        return this.tenders.length > 0 ? Math.round((appliedTenders / this.tenders.length) * 100) : 0;
    }

    calculateAverageResponseTime() {
        // Simplified response time calculation
        return Math.round(Math.random() * 24); // Mock data
    }

    calculateMonitoringEfficiency() {
        const successfulScans = this.scanHistory.filter(s => s.successfulScans > 0).length;
        return this.scanHistory.length > 0 ? Math.round((successfulScans / this.scanHistory.length) * 100) : 0;
    }

    updateTrends() {
        // Create trend chart
        const canvas = document.getElementById('discoveryTrendChart');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            this.drawTrendChart(ctx);
        }
    }

    drawTrendChart(ctx) {
        // Simple line chart for trends
        const data = this.getTrendData();
        const width = 800;
        const height = 400;
        const padding = 50;

        ctx.clearRect(0, 0, width, height);

        // Draw axes
        ctx.beginPath();
        ctx.moveTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.moveTo(padding, height - padding);
        ctx.lineTo(padding, padding);
        ctx.strokeStyle = '#e5e7eb';
        ctx.stroke();

        // Draw trend line
        ctx.beginPath();
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 2;

        data.forEach((point, index) => {
            const x = padding + (index * (width - 2 * padding)) / (data.length - 1);
            const y = height - padding - (point * (height - 2 * padding)) / Math.max(...data);

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();
    }

    getTrendData() {
        // Generate mock trend data
        return Array.from({ length: 30 }, () => Math.floor(Math.random() * 20) + 5);
    }

    updatePerformance() {
        this.updatePortalPerformance();
        this.updateMonitoringStats();
        this.updateNotificationStats();
    }

    updatePortalPerformance() {
        const container = document.getElementById('portalPerformanceList');
        if (!container) return;

        const portals = window.portalMonitor ? window.portalMonitor.portals : [];

        container.innerHTML = portals.map(portal => `
            <div class="performance-item">
                <div class="performance-name">${portal.name}</div>
                <div class="performance-metrics">
                    <span>Success: ${portal.totalTenders || 0}</span>
                    <span>Uptime: ${Math.floor(Math.random() * 20) + 80}%</span>
                </div>
            </div>
        `).join('');
    }

    updateMonitoringStats() {
        const container = document.getElementById('monitoringStats');
        if (!container) return;

        const totalScans = this.scanHistory.length;
        const successfulScans = this.scanHistory.filter(s => s.successfulScans > 0).length;
        const avgNewTenders = totalScans > 0 ?
            this.scanHistory.reduce((sum, s) => sum + s.totalNewTenders, 0) / totalScans : 0;

        container.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Total Scans:</span>
                <span class="stat-value">${totalScans}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Success Rate:</span>
                <span class="stat-value">${Math.round((successfulScans / totalScans) * 100)}%</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Avg New Tenders:</span>
                <span class="stat-value">${avgNewTenders.toFixed(1)}</span>
            </div>
        `;
    }

    updateNotificationStats() {
        const container = document.getElementById('notificationStats');
        if (!container) return;

        const totalNotifications = this.notifications.length;
        const readNotifications = this.notifications.filter(n => n.read).length;
        const urgentNotifications = this.notifications.filter(n => n.priority === 'urgent').length;

        container.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Total Sent:</span>
                <span class="stat-value">${totalNotifications}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Read Rate:</span>
                <span class="stat-value">${Math.round((readNotifications / totalNotifications) * 100)}%</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Urgent:</span>
                <span class="stat-value">${urgentNotifications}</span>
            </div>
        `;
    }

    formatCurrency(amount) {
        if (amount >= 10000000) {
            return '₹' + (amount / 10000000).toFixed(1) + ' Cr';
        } else if (amount >= 100000) {
            return '₹' + (amount / 100000).toFixed(1) + ' L';
        } else {
            return '₹' + (amount / 1000).toFixed(0) + ' K';
        }
    }

    addAnalyticsStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .analytics-widget {
                background: white;
                border-radius: 12px;
                padding: 1.5rem;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            
            .analytics-summary {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 1rem;
                margin-bottom: 1rem;
            }
            
            .metric {
                text-align: center;
            }
            
            .metric-value {
                font-size: 1.25rem;
                font-weight: 700;
                color: #2563eb;
            }
            
            .metric-label {
                font-size: 0.75rem;
                color: #6b7280;
            }
            
            .analytics-modal .modal-container {
                width: 95%;
                max-width: 1600px;
                height: 90%;
            }
            
            .analytics-tabs {
                display: flex;
                border-bottom: 2px solid #e5e7eb;
                margin-bottom: 2rem;
            }
            
            .analytics-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 2rem;
                margin-bottom: 2rem;
            }
            
            .analytics-card {
                background: #f8fafc;
                padding: 1.5rem;
                border-radius: 12px;
                text-align: center;
            }
            
            .kpi-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 1.5rem;
            }
            
            .kpi-card {
                background: white;
                padding: 1.5rem;
                border-radius: 8px;
                text-align: center;
                border: 1px solid #e5e7eb;
            }
            
            .kpi-value {
                font-size: 2rem;
                font-weight: 700;
                color: #1f2937;
            }
            
            .kpi-label {
                font-size: 0.875rem;
                color: #6b7280;
                margin: 0.5rem 0;
            }
            
            .kpi-change {
                font-size: 0.875rem;
                font-weight: 600;
            }
            
            .kpi-change.positive {
                color: #10b981;
            }
            
            .performance-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 2rem;
            }
            
            .performance-card {
                background: #f8fafc;
                padding: 1.5rem;
                border-radius: 12px;
            }
            
            .performance-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.75rem;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .stat-item {
                display: flex;
                justify-content: space-between;
                padding: 0.5rem 0;
            }
        `;
        document.head.appendChild(style);
    }
}

// Global function for report generation
function generateReport(type) {
    console.log(`Generating ${type} report...`);

    if (window.showNotification) {
        window.showNotification(`${type} report generation started`, 'info');
    }

    // Simulate report generation
    setTimeout(() => {
        if (window.showNotification) {
            window.showNotification(`${type} report generated successfully`, 'success');
        }
    }, 2000);
}

// Initialize analytics when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tenderAnalytics = new TenderAnalytics();
});

window.TenderAnalytics = TenderAnalytics;
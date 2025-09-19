// KMRL Document Management System - Analytics JavaScript

class AnalyticsManager {
    constructor() {
        this.currentUser = window.KMRL.getCurrentUser();
        this.charts = {};
        this.analyticsData = {};
        this.timePeriod = 'month';
        this.init();
    }

    async init() {
        if (!this.currentUser) {
            window.KMRL.redirectToLogin();
            return;
        }

        this.setupEventListeners();
        await this.loadAnalyticsData();
        this.renderKPIs();
        this.initializeCharts();
        this.loadRecentActivity();
    }

    setupEventListeners() {
        // Time period selector
        document.getElementById('timePeriod').addEventListener('change', (e) => {
            this.timePeriod = e.target.value;
            this.refreshAnalytics();
        });

        // Export button
        document.getElementById('exportBtn').addEventListener('click', () => this.exportReport());

        // Chart type toggles
        document.querySelectorAll('.chart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleChartTypeChange(e));
        });

        // Refresh activity
        const refreshBtn = document.getElementById('refreshActivity');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadRecentActivity());
        }
    }

    async loadAnalyticsData() {
        try {
            // Load from localStorage and generate mock data
            const storedUploads = JSON.parse(localStorage.getItem('kmrl_uploads') || '[]');
            const mockData = window.KMRL.generateMockAnalytics();

            this.analyticsData = {
                ...mockData,
                uploads: storedUploads,
                period: this.timePeriod
            };

            // Generate time-series data based on period
            this.analyticsData.timeSeriesData = this.generateTimeSeriesData();

        } catch (error) {
            console.error('Failed to load analytics data:', error);
            window.KMRL.showToast('Failed to load analytics data', 'error');
        }
    }

    generateTimeSeriesData() {
        const periods = {
            week: { days: 7, interval: 'day' },
            month: { days: 30, interval: 'day' },
            quarter: { days: 90, interval: 'week' },
            year: { days: 365, interval: 'month' }
        };

        const config = periods[this.timePeriod];
        const data = [];
        const labels = [];

        for (let i = config.days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);

            let label;
            if (config.interval === 'day') {
                label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            } else if (config.interval === 'week') {
                label = `Week ${Math.ceil((config.days - i) / 7)}`;
            } else {
                label = date.toLocaleDateString('en-US', { month: 'short' });
            }

            labels.push(label);
            data.push(Math.floor(Math.random() * 15) + 5);
        }

        return { labels, data };
    }

    renderKPIs() {
        // Update KPI values
        document.getElementById('totalDocuments').textContent = this.analyticsData.documentsUploaded;
        document.getElementById('approvedDocuments').textContent = this.analyticsData.approvedDocuments;
        document.getElementById('pendingDocuments').textContent = this.analyticsData.pendingApprovals;
        document.getElementById('activeUsers').textContent = Math.floor(Math.random() * 50) + 25;

        // Update KPI changes (mock data)
        document.getElementById('documentsChange').textContent = '+12%';
        document.getElementById('approvedChange').textContent = '+8%';
        document.getElementById('pendingChange').textContent = '+3';
        document.getElementById('usersChange').textContent = '+5%';
    }

    initializeCharts() {
        this.createUploadsChart();
        this.createDepartmentChart();
        this.createStatusChart();
        this.createEfficiencyChart();
    }

    createUploadsChart() {
        const ctx = document.getElementById('uploadsChart').getContext('2d');

        this.charts.uploads = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.analyticsData.timeSeriesData.labels,
                datasets: [{
                    label: 'Documents Uploaded',
                    data: this.analyticsData.timeSeriesData.data,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#e2e8f0'
                        }
                    },
                    x: {
                        grid: {
                            color: '#e2e8f0'
                        }
                    }
                }
            }
        });
    }

    createDepartmentChart() {
        const ctx = document.getElementById('departmentChart').getContext('2d');

        const departmentData = Object.entries(this.analyticsData.departmentStats);

        this.charts.department = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: departmentData.map(([dept]) => dept),
                datasets: [{
                    data: departmentData.map(([, count]) => count),
                    backgroundColor: [
                        '#2563eb',
                        '#10b981',
                        '#f59e0b',
                        '#ef4444',
                        '#8b5cf6',
                        '#06b6d4'
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    createStatusChart() {
        const ctx = document.getElementById('statusChart').getContext('2d');

        const statusData = [
            { label: 'Approved', value: this.analyticsData.approvedDocuments, color: '#10b981' },
            { label: 'Pending', value: this.analyticsData.pendingApprovals, color: '#f59e0b' },
            { label: 'Rejected', value: this.analyticsData.rejectedDocuments, color: '#ef4444' },
            { label: 'Under Review', value: Math.floor(Math.random() * 10) + 5, color: '#06b6d4' }
        ];

        this.charts.status = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: statusData.map(item => item.label),
                datasets: [{
                    data: statusData.map(item => item.value),
                    backgroundColor: statusData.map(item => item.color),
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    createEfficiencyChart() {
        const ctx = document.getElementById('efficiencyChart').getContext('2d');

        // Generate efficiency data over time
        const labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        const efficiency = [75, 82, 78, 87];
        const target = [80, 80, 80, 80];

        this.charts.efficiency = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Actual Efficiency',
                        data: efficiency,
                        backgroundColor: 'rgba(37, 99, 235, 0.8)',
                        borderColor: '#2563eb',
                        borderWidth: 1
                    },
                    {
                        label: 'Target',
                        data: target,
                        backgroundColor: 'rgba(16, 185, 129, 0.3)',
                        borderColor: '#10b981',
                        borderWidth: 2,
                        type: 'line',
                        tension: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: '#e2e8f0'
                        },
                        ticks: {
                            callback: function (value) {
                                return value + '%';
                            }
                        }
                    },
                    x: {
                        grid: {
                            color: '#e2e8f0'
                        }
                    }
                }
            }
        });
    }

    handleChartTypeChange(e) {
        const button = e.target;
        const chartName = button.dataset.chart;
        const chartType = button.dataset.type;

        // Update active button
        const allButtons = document.querySelectorAll(`[data-chart="${chartName}"]`);
        allButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Update chart type
        if (this.charts[chartName]) {
            this.charts[chartName].destroy();

            if (chartName === 'uploads') {
                const ctx = document.getElementById('uploadsChart').getContext('2d');
                this.charts.uploads = new Chart(ctx, {
                    type: chartType,
                    data: {
                        labels: this.analyticsData.timeSeriesData.labels,
                        datasets: [{
                            label: 'Documents Uploaded',
                            data: this.analyticsData.timeSeriesData.data,
                            borderColor: '#2563eb',
                            backgroundColor: chartType === 'line' ? 'rgba(37, 99, 235, 0.1)' : '#2563eb',
                            borderWidth: 2,
                            fill: chartType === 'line',
                            tension: chartType === 'line' ? 0.4 : 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                grid: {
                                    color: '#e2e8f0'
                                }
                            },
                            x: {
                                grid: {
                                    color: '#e2e8f0'
                                }
                            }
                        }
                    }
                });
            }
        }
    }

    async refreshAnalytics() {
        // Show loading state
        window.KMRL.showToast('Refreshing analytics...', 'info');

        try {
            await this.loadAnalyticsData();
            this.renderKPIs();

            // Update all charts
            Object.values(this.charts).forEach(chart => chart.destroy());
            this.charts = {};
            this.initializeCharts();

            window.KMRL.showToast('Analytics refreshed successfully', 'success');

        } catch (error) {
            console.error('Failed to refresh analytics:', error);
            window.KMRL.showToast('Failed to refresh analytics', 'error');
        }
    }

    async loadRecentActivity() {
        const activityList = document.getElementById('activityList');
        if (!activityList) return;

        try {
            const activities = window.KMRL.generateMockActivities();

            activityList.innerHTML = activities.slice(0, 5).map(activity => `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="fas ${this.getActivityIcon(activity.action)}"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-title">${activity.action}</div>
                        <div class="activity-meta">
                            ${activity.user} • ${window.KMRL.formatRelativeTime(activity.timestamp)}
                        </div>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('Failed to load recent activity:', error);
            activityList.innerHTML = '<div class="error-state">Failed to load activity</div>';
        }
    }

    getActivityIcon(action) {
        const iconMap = {
            'Document uploaded by user': 'fa-upload',
            'Document approved by manager': 'fa-check',
            'New user registered': 'fa-user-plus',
            'System backup completed': 'fa-database',
            'Workflow updated': 'fa-cogs',
            'Report generated': 'fa-chart-line'
        };

        for (const [key, icon] of Object.entries(iconMap)) {
            if (action.toLowerCase().includes(key.toLowerCase())) {
                return icon;
            }
        }
        return 'fa-bell';
    }

    async exportReport() {
        window.KMRL.showToast('Preparing analytics report...', 'info');

        try {
            // Simulate report generation
            await window.KMRL.delay(2000);

            // Create downloadable content
            const reportData = {
                period: this.timePeriod,
                generatedAt: new Date().toISOString(),
                kpis: {
                    totalDocuments: this.analyticsData.documentsUploaded,
                    approvedDocuments: this.analyticsData.approvedDocuments,
                    pendingDocuments: this.analyticsData.pendingApprovals,
                    rejectedDocuments: this.analyticsData.rejectedDocuments
                },
                departmentStats: this.analyticsData.departmentStats,
                timeSeriesData: this.analyticsData.timeSeriesData
            };

            // Convert to CSV format for demo
            const csvContent = this.generateCSVReport(reportData);
            this.downloadCSV(csvContent, `KMRL_Analytics_Report_${new Date().toISOString().split('T')[0]}.csv`);

            window.KMRL.showToast('Analytics report downloaded successfully', 'success');

        } catch (error) {
            console.error('Failed to export report:', error);
            window.KMRL.showToast('Failed to export report', 'error');
        }
    }

    generateCSVReport(data) {
        let csv = 'KMRL Document Management System - Analytics Report\n';
        csv += `Generated: ${new Date(data.generatedAt).toLocaleString()}\n`;
        csv += `Period: ${data.period}\n\n`;

        csv += 'Key Performance Indicators\n';
        csv += 'Metric,Value\n';
        csv += `Total Documents,${data.kpis.totalDocuments}\n`;
        csv += `Approved Documents,${data.kpis.approvedDocuments}\n`;
        csv += `Pending Documents,${data.kpis.pendingDocuments}\n`;
        csv += `Rejected Documents,${data.kpis.rejectedDocuments}\n\n`;

        csv += 'Department Statistics\n';
        csv += 'Department,Document Count\n';
        Object.entries(data.departmentStats).forEach(([dept, count]) => {
            csv += `${dept},${count}\n`;
        });

        csv += '\nUpload Trends\n';
        csv += 'Period,Uploads\n';
        data.timeSeriesData.labels.forEach((label, index) => {
            csv += `${label},${data.timeSeriesData.data[index]}\n`;
        });

        return csv;
    }

    downloadCSV(content, filename) {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');

        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    destroy() {
        // Clean up charts when leaving page
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
    }
}

// Initialize analytics manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.analyticsManager = new AnalyticsManager();
});

// Clean up when leaving page
window.addEventListener('beforeunload', () => {
    if (window.analyticsManager) {
        window.analyticsManager.destroy();
    }
});
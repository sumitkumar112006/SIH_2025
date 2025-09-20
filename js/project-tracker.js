// KMRL Project Status Tracker
// Track ongoing projects: construction, rail lines, maintenance workflows

class ProjectStatusTracker {
    constructor() {
        this.projects = [];
        this.workflows = [];
        this.currentUser = this.getCurrentUser();
        this.userPermissions = this.getUserPermissions();
        this.init();
    }

    init() {
        this.loadStoredData();
        this.createProjectInterface();
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
            admin: { canView: true, canManage: true, canApprove: true },
            manager: { canView: true, canManage: true, canApprove: true },
            staff: { canView: true, canManage: false, canApprove: false }
        };

        return permissions[role] || permissions.staff;
    }

    loadStoredData() {
        try {
            this.projects = JSON.parse(localStorage.getItem('kmrl_projects') || '[]');
            this.workflows = JSON.parse(localStorage.getItem('kmrl_workflows') || '[]');
        } catch (error) {
            this.projects = [];
            this.workflows = [];
        }

        // Initialize with sample data if empty
        if (this.projects.length === 0) {
            this.initializeSampleData();
        }
    }

    saveData() {
        localStorage.setItem('kmrl_projects', JSON.stringify(this.projects));
        localStorage.setItem('kmrl_workflows', JSON.stringify(this.workflows));
    }

    initializeSampleData() {
        this.projects = [
            {
                id: 'proj_001',
                name: 'Kochi Metro Line 2 Extension',
                description: 'Extension of Kochi Metro Rail from Aluva to Kakkanad',
                status: 'in-progress',
                progress: 65,
                startDate: '2023-01-15',
                endDate: '2025-12-31',
                department: 'Construction',
                budget: 2500000000,
                spent: 1625000000,
                manager: 'Rajesh Kumar',
                priority: 'high',
                milestones: [
                    { id: 'm1', name: 'Land Acquisition', status: 'completed', date: '2023-03-30' },
                    { id: 'm2', name: 'Foundation Work', status: 'completed', date: '2023-08-15' },
                    { id: 'm3', name: 'Pillar Construction', status: 'in-progress', date: '2024-06-30' },
                    { id: 'm4', name: 'Track Laying', status: 'pending', date: '2025-03-15' },
                    { id: 'm5', name: 'Station Development', status: 'pending', date: '2025-09-30' }
                ],
                risks: [
                    { id: 'r1', description: 'Land acquisition delays', severity: 'medium', mitigation: 'Engage with local authorities' },
                    { id: 'r2', description: 'Monsoon construction delays', severity: 'low', mitigation: 'Adjust construction schedule' }
                ]
            },
            {
                id: 'proj_002',
                name: 'Signaling System Upgrade',
                description: 'Modernization of signaling systems for existing metro lines',
                status: 'in-progress',
                progress: 45,
                startDate: '2023-06-01',
                endDate: '2024-11-30',
                department: 'Operations',
                budget: 800000000,
                spent: 360000000,
                manager: 'Priya Sharma',
                priority: 'high',
                milestones: [
                    { id: 'm1', name: 'System Design', status: 'completed', date: '2023-09-30' },
                    { id: 'm2', name: 'Hardware Procurement', status: 'completed', date: '2023-12-15' },
                    { id: 'm3', name: 'Installation Phase 1', status: 'in-progress', date: '2024-04-30' },
                    { id: 'm4', name: 'Testing & Commissioning', status: 'pending', date: '2024-09-30' }
                ],
                risks: [
                    { id: 'r1', description: 'Technology integration challenges', severity: 'high', mitigation: 'Engage vendor support team' }
                ]
            },
            {
                id: 'proj_003',
                name: 'Station Modernization',
                description: 'Upgrading existing stations with modern amenities',
                status: 'pending',
                progress: 0,
                startDate: '2024-03-01',
                endDate: '2025-08-31',
                department: 'Facilities',
                budget: 500000000,
                spent: 0,
                manager: 'Anil Verma',
                priority: 'medium',
                milestones: [
                    { id: 'm1', name: 'Design Finalization', status: 'pending', date: '2024-05-31' },
                    { id: 'm2', name: 'Contractor Selection', status: 'pending', date: '2024-07-31' }
                ],
                risks: []
            }
        ];

        this.workflows = [
            {
                id: 'wf_001',
                projectId: 'proj_001',
                name: 'Pillar Construction Approval',
                status: 'pending',
                assignedTo: 'Rajesh Kumar',
                dueDate: '2024-01-31',
                priority: 'high',
                documents: ['Design_Specs_v3.pdf', 'Safety_Checklist.pdf'],
                approvals: [
                    { role: 'Engineer', status: 'approved', date: '2024-01-15' },
                    { role: 'Manager', status: 'pending', date: null },
                    { role: 'Director', status: 'pending', date: null }
                ]
            },
            {
                id: 'wf_002',
                projectId: 'proj_002',
                name: 'System Testing Protocol',
                status: 'in-progress',
                assignedTo: 'Priya Sharma',
                dueDate: '2024-02-29',
                priority: 'high',
                documents: ['Test_Plan_v2.pdf', 'Safety_Protocol.pdf'],
                approvals: [
                    { role: 'Engineer', status: 'approved', date: '2024-01-20' },
                    { role: 'Manager', status: 'approved', date: '2024-01-25' },
                    { role: 'Director', status: 'pending', date: null }
                ]
            }
        ];

        this.saveData();
    }

    createProjectInterface() {
        if (!this.userPermissions.canView) return;

        this.createProjectWidget();
        this.addProjectNavigation();
    }

    createProjectWidget() {
        const container = document.querySelector('.dashboard-widgets') ||
            document.querySelector('.widgets-grid') ||
            document.querySelector('.main-content');

        if (container) {
            const projectWidget = document.createElement('div');
            projectWidget.className = 'widget project-widget';
            projectWidget.innerHTML = `
                <div class="widget-header">
                    <div class="widget-title">
                        <i class="fas fa-project-diagram"></i>
                        <span>Project Status</span>
                    </div>
                    <div class="widget-actions">
                        <button id="refreshProjects" class="btn-icon" title="Refresh">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                        <button id="openProjectManager" class="btn-icon" title="Manage">
                            <i class="fas fa-cog"></i>
                        </button>
                    </div>
                </div>
                <div class="widget-content">
                    <div class="project-stats">
                        <div class="stat-item">
                            <div class="stat-number" id="activeProjectsCount">0</div>
                            <div class="stat-label">Active Projects</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number" id="pendingApprovalsCount">0</div>
                            <div class="stat-label">Pending Approvals</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number" id="overdueTasksCount">0</div>
                            <div class="stat-label">Overdue Tasks</div>
                        </div>
                    </div>
                    <div class="recent-projects" id="recentProjectsList">
                        <div class="no-projects">No projects to display</div>
                    </div>
                </div>
            `;

            container.appendChild(projectWidget);
        }
    }

    addProjectNavigation() {
        const sidebar = document.querySelector('.sidebar-nav') || document.querySelector('.nav-menu');
        if (sidebar) {
            const projectNavItem = document.createElement('li');
            projectNavItem.innerHTML = `
                <a href="#" id="projectTrackerNav" class="nav-link">
                    <i class="fas fa-project-diagram"></i>
                    <span>Project Tracker</span>
                    <span class="notification-badge" id="projectNotificationBadge" style="display: none;">0</span>
                </a>
            `;
            sidebar.appendChild(projectNavItem);
        }
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.id === 'refreshProjects') {
                this.updateProjectWidget();
            }

            if (e.target.id === 'openProjectManager' || e.target.id === 'projectTrackerNav') {
                e.preventDefault();
                this.openProjectModal();
            }
        });
    }

    updateProjectWidget() {
        const activeProjects = this.projects.filter(p => p.status === 'in-progress').length;
        const pendingApprovals = this.workflows.filter(w => w.status === 'pending').length;
        const overdueTasks = this.getOverdueTasks().length;

        document.getElementById('activeProjectsCount').textContent = activeProjects;
        document.getElementById('pendingApprovalsCount').textContent = pendingApprovals;
        document.getElementById('overdueTasksCount').textContent = overdueTasks;

        this.updateRecentProjectsList();
    }

    getOverdueTasks() {
        const today = new Date();
        const overdue = [];

        this.workflows.forEach(workflow => {
            if (workflow.status === 'pending' && new Date(workflow.dueDate) < today) {
                overdue.push(workflow);
            }
        });

        this.projects.forEach(project => {
            project.milestones.forEach(milestone => {
                if (milestone.status === 'pending' && new Date(milestone.date) < today) {
                    overdue.push({
                        id: milestone.id,
                        name: `${project.name} - ${milestone.name}`,
                        dueDate: milestone.date,
                        projectId: project.id
                    });
                }
            });
        });

        return overdue;
    }

    updateRecentProjectsList() {
        const container = document.getElementById('recentProjectsList');
        if (!container) return;

        const activeProjects = this.projects.filter(p => p.status === 'in-progress');

        if (activeProjects.length === 0) {
            container.innerHTML = '<div class="no-projects">No active projects</div>';
            return;
        }

        container.innerHTML = activeProjects.map(project => `
            <div class="project-item ${project.priority}-priority">
                <div class="project-info">
                    <div class="project-title">${project.name}</div>
                    <div class="project-meta">
                        <span class="project-department">${project.department}</span>
                        <span class="project-progress">${project.progress}% complete</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${project.progress}%"></div>
                    </div>
                </div>
                <div class="project-actions">
                    <button class="btn-icon" onclick="projectTracker.viewProject('${project.id}')" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    openProjectModal() {
        if (!document.getElementById('projectModal')) {
            this.createProjectModal();
        }

        const modal = document.getElementById('projectModal');
        modal.style.display = 'flex';
        this.updateProjectModal();
    }

    createProjectModal() {
        const modal = document.createElement('div');
        modal.id = 'projectModal';
        modal.className = 'modal project-modal';
        modal.style.display = 'none';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-container extra-large">
                <div class="modal-header">
                    <h2><i class="fas fa-project-diagram"></i> Project Status Tracker</h2>
                    <button id="closeProjectModal" class="close-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-content">
                    <div class="project-tabs">
                        <button class="tab-btn active" data-tab="projects">Projects</button>
                        <button class="tab-btn" data-tab="workflows">Workflows</button>
                        <button class="tab-btn" data-tab="analytics">Analytics</button>
                    </div>
                    
                    <div id="projectsTab" class="tab-content active">
                        <div class="project-grid" id="projectGrid">
                            <!-- Projects will be loaded here -->
                        </div>
                    </div>
                    
                    <div id="workflowsTab" class="tab-content">
                        <div class="workflow-list" id="workflowList">
                            <!-- Workflows will be loaded here -->
                        </div>
                    </div>
                    
                    <div id="analyticsTab" class="tab-content">
                        <div class="analytics-container">
                            <div class="chart-container">
                                <canvas id="projectProgressChart" width="400" height="200"></canvas>
                            </div>
                            <div class="metrics-grid">
                                <div class="metric-card">
                                    <div class="metric-value" id="totalBudget">₹0</div>
                                    <div class="metric-label">Total Budget</div>
                                </div>
                                <div class="metric-card">
                                    <div class="metric-value" id="budgetUtilization">0%</div>
                                    <div class="metric-label">Budget Utilization</div>
                                </div>
                                <div class="metric-card">
                                    <div class="metric-value" id="avgProgress">0%</div>
                                    <div class="metric-label">Avg. Progress</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Setup modal event listeners
        document.getElementById('closeProjectModal').addEventListener('click', () => {
            modal.style.display = 'none';
        });

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

                e.target.classList.add('active');
                document.getElementById(`${e.target.dataset.tab}Tab`).classList.add('active');

                if (e.target.dataset.tab === 'analytics') {
                    this.updateAnalyticsTab();
                }
            });
        });
    }

    updateProjectModal() {
        this.updateProjectsTab();
        this.updateWorkflowsTab();
    }

    updateProjectsTab() {
        const grid = document.getElementById('projectGrid');
        if (!grid) return;

        grid.innerHTML = this.projects.map(project => this.renderProjectCard(project)).join('');
    }

    updateWorkflowsTab() {
        const list = document.getElementById('workflowList');
        if (!list) return;

        list.innerHTML = this.workflows.map(workflow => this.renderWorkflowCard(workflow)).join('');
    }

    updateAnalyticsTab() {
        this.updateMetrics();
        this.createProgressChart();
    }

    renderProjectCard(project) {
        const pendingMilestones = project.milestones.filter(m => m.status === 'pending').length;
        const completedMilestones = project.milestones.filter(m => m.status === 'completed').length;

        return `
            <div class="project-card ${project.priority}-priority">
                <div class="project-card-header">
                    <h3>${project.name}</h3>
                    <span class="status-badge ${project.status}">${project.status.replace('-', ' ')}</span>
                </div>
                <div class="project-card-body">
                    <p class="project-description">${project.description}</p>
                    <div class="project-meta-grid">
                        <div class="meta-item">
                            <i class="fas fa-user"></i>
                            <span>${project.manager}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-building"></i>
                            <span>${project.department}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-rupee-sign"></i>
                            <span>₹${this.formatCurrency(project.budget)}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-percentage"></i>
                            <span>${project.progress}% complete</span>
                        </div>
                    </div>
                    <div class="progress-container">
                        <div class="progress-label">Progress</div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${project.progress}%"></div>
                        </div>
                    </div>
                    <div class="milestone-summary">
                        <span>${completedMilestones} completed</span>
                        <span>${pendingMilestones} pending</span>
                    </div>
                </div>
                <div class="project-card-actions">
                    <button class="btn btn-primary" onclick="projectTracker.viewProject('${project.id}')">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                    ${this.userPermissions.canManage ? `
                        <button class="btn btn-outline" onclick="projectTracker.editProject('${project.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderWorkflowCard(workflow) {
        const project = this.projects.find(p => p.id === workflow.projectId);
        const pendingApprovals = workflow.approvals.filter(a => a.status === 'pending').length;

        return `
            <div class="workflow-item ${workflow.priority}-priority">
                <div class="workflow-info">
                    <div class="workflow-title">${workflow.name}</div>
                    <div class="workflow-project">${project ? project.name : 'Unknown Project'}</div>
                    <div class="workflow-meta">
                        <span class="assigned-to">Assigned to: ${workflow.assignedTo}</span>
                        <span class="due-date">Due: ${this.formatDate(workflow.dueDate)}</span>
                        <span class="pending-approvals">${pendingApprovals} pending approvals</span>
                    </div>
                    <div class="approval-status">
                        ${workflow.approvals.map(approval => `
                            <span class="approval-badge ${approval.status}">
                                ${approval.role}: ${approval.status}
                            </span>
                        `).join('')}
                    </div>
                </div>
                <div class="workflow-actions">
                    <button class="btn btn-primary" onclick="projectTracker.viewWorkflow('${workflow.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    ${this.userPermissions.canApprove ? `
                        <button class="btn btn-outline" onclick="projectTracker.approveWorkflow('${workflow.id}')">
                            <i class="fas fa-check"></i> Approve
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    viewProject(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            this.showProjectDetails(project);
        }
    }

    showProjectDetails(project) {
        const detailModal = document.createElement('div');
        detailModal.className = 'modal project-detail-modal';
        detailModal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-container large">
                <div class="modal-header">
                    <h2>${project.name}</h2>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-content">
                    <div class="project-details">
                        <div class="detail-section">
                            <h3>Project Overview</h3>
                            <div class="detail-grid">
                                <div class="detail-item">
                                    <label>Description:</label>
                                    <span>${project.description}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Status:</label>
                                    <span class="status-badge ${project.status}">${project.status}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Department:</label>
                                    <span>${project.department}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Manager:</label>
                                    <span>${project.manager}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Start Date:</label>
                                    <span>${this.formatDate(project.startDate)}</span>
                                </div>
                                <div class="detail-item">
                                    <label>End Date:</label>
                                    <span>${this.formatDate(project.endDate)}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Budget:</label>
                                    <span>₹${this.formatCurrency(project.budget)}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Spent:</label>
                                    <span>₹${this.formatCurrency(project.spent)}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h3>Progress</h3>
                            <div class="progress-container large">
                                <div class="progress-label">${project.progress}% Complete</div>
                                <div class="progress-bar large">
                                    <div class="progress-fill" style="width: ${project.progress}%"></div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h3>Milestones</h3>
                            <div class="milestone-timeline">
                                ${project.milestones.map(milestone => `
                                    <div class="milestone-item ${milestone.status}">
                                        <div class="milestone-date">${this.formatDate(milestone.date)}</div>
                                        <div class="milestone-content">
                                            <div class="milestone-name">${milestone.name}</div>
                                            <div class="milestone-status ${milestone.status}">${milestone.status}</div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        ${project.risks.length > 0 ? `
                            <div class="detail-section">
                                <h3>Risks</h3>
                                <div class="risks-list">
                                    ${project.risks.map(risk => `
                                        <div class="risk-item ${risk.severity}">
                                            <div class="risk-description">${risk.description}</div>
                                            <div class="risk-mitigation">Mitigation: ${risk.mitigation}</div>
                                            <div class="risk-severity">Severity: ${risk.severity}</div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(detailModal);
        detailModal.style.display = 'flex';
    }

    viewWorkflow(workflowId) {
        const workflow = this.workflows.find(w => w.id === workflowId);
        if (workflow) {
            // Implementation for workflow details
            console.log('Viewing workflow:', workflow);
        }
    }

    updateMetrics() {
        const totalBudget = this.projects.reduce((sum, project) => sum + project.budget, 0);
        const totalSpent = this.projects.reduce((sum, project) => sum + project.spent, 0);
        const budgetUtilization = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
        const avgProgress = this.projects.length > 0 ?
            Math.round(this.projects.reduce((sum, project) => sum + project.progress, 0) / this.projects.length) : 0;

        document.getElementById('totalBudget').textContent = `₹${this.formatCurrency(totalBudget)}`;
        document.getElementById('budgetUtilization').textContent = `${budgetUtilization}%`;
        document.getElementById('avgProgress').textContent = `${avgProgress}%`;
    }

    createProgressChart() {
        const canvas = document.getElementById('projectProgressChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const projects = this.projects.slice(0, 5); // Top 5 projects

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw bars
        const barWidth = 50;
        const spacing = 20;
        const maxHeight = 150;

        projects.forEach((project, index) => {
            const x = 50 + index * (barWidth + spacing);
            const barHeight = (project.progress / 100) * maxHeight;
            const y = 180 - barHeight;

            // Draw bar
            ctx.fillStyle = this.getProgressColor(project.progress);
            ctx.fillRect(x, y, barWidth, barHeight);

            // Draw project name
            ctx.fillStyle = '#333';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(project.name.substring(0, 15), x + barWidth / 2, 200);

            // Draw percentage
            ctx.fillText(`${project.progress}%`, x + barWidth / 2, y - 5);
        });
    }

    getProgressColor(progress) {
        if (progress >= 80) return '#10b981'; // Green
        if (progress >= 50) return '#f59e0b'; // Yellow
        return '#dc2626'; // Red
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

// Initialize project tracker when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.projectTracker = new ProjectStatusTracker();
});

window.ProjectStatusTracker = ProjectStatusTracker;
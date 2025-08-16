
let currentUser = null;
let employees = [];
let projects = [];

// Check authentication
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    
    if (!token || userType !== 'admin') {
        window.location.href = 'login.html?type=admin';
        return;
    }
    
    currentUser = JSON.parse(localStorage.getItem('userData'));
    document.getElementById('adminName').textContent = currentUser.name;
    
    loadDashboardData();
});

// Navigation
function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Show selected section
    document.getElementById(sectionName).classList.add('active');
    
    // Update navigation
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => link.classList.remove('active'));
    event.target.classList.add('active');
    
    // Load section-specific data
    switch(sectionName) {
        case 'employees':
            loadEmployees();
            break;
        case 'projects':
            loadProjects();
            break;
        case 'tasks':
            loadTaskAssignmentData();
            break;
        case 'reports':
            loadDailyReports();
            break;
        case 'attendance':
            loadAttendanceReport();
            break;
    }
}

// API helper function
async function apiCall(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const config = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };
    
    try {
        const response = await fetch(endpoint, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'API call failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Dashboard functions
async function loadDashboardData() {
    try {
        const [employeesData, projectsData, reportsData, attendanceData] = await Promise.all([
            apiCall('/api/admin/employees'),
            apiCall('/api/admin/projects'),
            apiCall('/api/admin/reports'),
            apiCall('/api/admin/attendance')
        ]);
        
        employees = employeesData;
        projects = projectsData;
        
        // Update dashboard stats
        document.getElementById('totalEmployees').textContent = employees.length;
        document.getElementById('activeProjects').textContent = 
            projects.filter(p => p.status === 'in_progress').length;
        
        // Calculate today's reports
        const today = new Date().toISOString().split('T')[0];
        const todayReports = reportsData.filter(r => r.report_date === today);
        document.getElementById('todayReports').textContent = todayReports.length;
        
        // This would require additional task data - simplified for now
        document.getElementById('pendingTasks').textContent = '0';
        
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
    }
}

// Employee functions - Enhanced with loading states and better UX
async function loadEmployees() {
    try {
        // Show loading state
        const employeesList = document.getElementById('employeesList');
        employeesList.innerHTML = '<p>Loading employees...</p>';
        
        const employeesData = await apiCall('/api/admin/employees');
        employees = employeesData;
        renderEmployees();
    } catch (error) {
        console.error('Failed to load employees:', error);
        const employeesList = document.getElementById('employeesList');
        employeesList.innerHTML = '<p>Failed to load employees. Please try again.</p>';
    }
}

function renderEmployees() {
    const container = document.getElementById('employeesList');
    
    if (employees.length === 0) {
        container.innerHTML = '<p>No employees found. <a href="add-employee.html">Add your first employee</a></p>';
        return;
    }
    
    const tableHTML = `
        <div class="employee-stats">
            <p><strong>Total Employees:</strong> ${employees.length}</p>
        </div>
        <div class="data-table">
            <table>
                <thead>
                    <tr>
                        <th>Employee ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Position</th>
                        <th>Department</th>
                        <th>Joining Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${employees.map(emp => `
                        <tr>
                            <td><strong>${emp.employee_id}</strong></td>
                            <td>${emp.name}</td>
                            <td>${emp.email}</td>
                            <td>${emp.position}</td>
                            <td>${emp.department}</td>
                            <td>${new Date(emp.joining_date).toLocaleDateString()}</td>
                            <td><span class="status-badge status-${emp.status}">${emp.status}</span></td>
                            <td>
                                <button onclick="editEmployee(${emp.id})" class="btn-small btn-primary">Edit</button>
                                <button onclick="deactivateEmployee(${emp.id})" class="btn-small btn-secondary">
                                    ${emp.status === 'active' ? 'Deactivate' : 'Activate'}
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = tableHTML;
}

// Employee action functions
function editEmployee(employeeId) {
    alert('Edit employee functionality coming soon!');
}

function deactivateEmployee(employeeId) {
    if (confirm('Are you sure you want to change this employee\'s status?')) {
        // Implementation for status change
        alert('Status change functionality coming soon!');
    }
}

// Project functions
async function loadProjects() {
    try {
        const projectsData = await apiCall('/api/admin/projects');
        projects = projectsData;
        renderProjects();
    } catch (error) {
        console.error('Failed to load projects:', error);
    }
}

function renderProjects() {
    const container = document.getElementById('projectsList');
    
    if (projects.length === 0) {
        container.innerHTML = '<p>No projects found.</p>';
        return;
    }
    
    const tableHTML = `
        <div class="data-table">
            <table>
                <thead>
                    <tr>
                        <th>Project Name</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Created By</th>
                    </tr>
                </thead>
                <tbody>
                    ${projects.map(project => `
                        <tr>
                            <td>${project.project_name}</td>
                            <td><span class="status-badge status-${project.status.replace('_', '-')}">${project.status.replace('_', ' ')}</span></td>
                            <td><span class="priority-${project.priority}">${project.priority}</span></td>
                            <td>${new Date(project.start_date).toLocaleDateString()}</td>
                            <td>${new Date(project.end_date).toLocaleDateString()}</td>
                            <td>${project.created_by_name || 'Unknown'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = tableHTML;
}

function showCreateProjectForm() {
    document.getElementById('createProjectForm').style.display = 'block';
}

function hideCreateProjectForm() {
    document.getElementById('createProjectForm').style.display = 'none';
    document.getElementById('projectForm').reset();
}

// Project form submission
document.getElementById('projectForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const projectData = {
        project_name: document.getElementById('projectName').value,
        description: document.getElementById('projectDescription').value,
        start_date: document.getElementById('startDate').value,
        end_date: document.getElementById('endDate').value,
        status: 'planning',
        priority: document.getElementById('projectPriority').value
    };
    
    try {
        await apiCall('/api/admin/projects', {
            method: 'POST',
            body: JSON.stringify(projectData)
        });
        
        alert('Project created successfully!');
        hideCreateProjectForm();
        loadProjects();
    } catch (error) {
        alert('Failed to create project: ' + error.message);
    }
});

// Task assignment functions
async function loadTaskAssignmentData() {
    if (employees.length === 0) {
        await loadEmployees();
    }
    if (projects.length === 0) {
        await loadProjects();
    }
    
    populateTaskDropdowns();
}

function populateTaskDropdowns() {
    const projectSelect = document.getElementById('taskProject');
    const employeeSelect = document.getElementById('taskEmployee');
    
    // Populate projects
    projectSelect.innerHTML = '<option value="">Select Project</option>';
    projects.forEach(project => {
        projectSelect.innerHTML += `<option value="${project.id}">${project.project_name}</option>`;
    });
    
    // Populate employees
    employeeSelect.innerHTML = '<option value="">Select Employee</option>';
    employees.forEach(employee => {
        employeeSelect.innerHTML += `<option value="${employee.id}">${employee.name} (${employee.employee_id})</option>`;
    });
}

function showAssignTaskForm() {
    document.getElementById('assignTaskForm').style.display = 'block';
}

function hideAssignTaskForm() {
    document.getElementById('assignTaskForm').style.display = 'none';
    document.getElementById('taskForm').reset();
}

// Task form submission
document.getElementById('taskForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const taskData = {
        project_id: document.getElementById('taskProject').value,
        assigned_to: document.getElementById('taskEmployee').value,
        task_name: document.getElementById('taskName').value,
        description: document.getElementById('taskDescription').value,
        due_date: document.getElementById('taskDueDate').value,
        status: 'pending',
        priority: document.getElementById('taskPriority').value
    };
    
    try {
        await apiCall('/api/admin/tasks', {
            method: 'POST',
            body: JSON.stringify(taskData)
        });
        
        alert('Task assigned successfully!');
        hideAssignTaskForm();
    } catch (error) {
        alert('Failed to assign task: ' + error.message);
    }
});

// Reports functions
async function loadDailyReports() {
    try {
        const reportsData = await apiCall('/api/admin/reports');
        renderDailyReports(reportsData);
    } catch (error) {
        console.error('Failed to load reports:', error);
    }
}

function renderDailyReports(reports) {
    const container = document.getElementById('reportsList');
    
    if (reports.length === 0) {
        container.innerHTML = '<p>No reports found.</p>';
        return;
    }
    
    const reportsHTML = reports.map(report => `
        <div class="data-table" style="margin-bottom: 20px;">
            <h4>${report.employee_name} (${report.employee_id}) - ${new Date(report.report_date).toLocaleDateString()}</h4>
            <div style="padding: 15px; background: white;">
                <p><strong>Working Hours:</strong> ${report.working_hours} hours</p>
                <p><strong>Tasks Completed:</strong></p>
                <p style="margin-left: 20px;">${report.tasks_completed}</p>
                <p><strong>Challenges Faced:</strong></p>
                <p style="margin-left: 20px;">${report.challenges_faced || 'None'}</p>
                <p><strong>Tomorrow's Plan:</strong></p>
                <p style="margin-left: 20px;">${report.tomorrow_plan || 'Not specified'}</p>
                <p><small>Submitted: ${new Date(report.created_at).toLocaleString()}</small></p>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = reportsHTML;
}

// Attendance functions
async function loadAttendanceReport() {
    try {
        const attendanceData = await apiCall('/api/admin/attendance');
        renderAttendanceReport(attendanceData);
    } catch (error) {
        console.error('Failed to load attendance:', error);
    }
}

function renderAttendanceReport(attendance) {
    const container = document.getElementById('attendanceList');
    
    if (attendance.length === 0) {
        container.innerHTML = '<p>No attendance records found.</p>';
        return;
    }
    
    const tableHTML = `
        <div class="data-table">
            <table>
                <thead>
                    <tr>
                        <th>Employee</th>
                        <th>Date</th>
                        <th>Login Time</th>
                        <th>Logout Time</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${attendance.map(record => `
                        <tr>
                            <td>${record.employee_name} (${record.employee_id})</td>
                            <td>${new Date(record.attendance_date).toLocaleDateString()}</td>
                            <td>${record.login_time ? new Date(record.login_time).toLocaleTimeString() : '-'}</td>
                            <td>${record.logout_time ? new Date(record.logout_time).toLocaleTimeString() : '-'}</td>
                            <td><span class="status-badge status-${record.status}">${record.status}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = tableHTML;
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
    window.location.href = 'index.html';
}
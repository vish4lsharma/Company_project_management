
let currentUser = null;
let myProjects = [];
let myTasks = [];

// Check authentication
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    
    if (!token || userType !== 'employee') {
        window.location.href = 'login.html?type=employee';
        return;
    }
    
    currentUser = JSON.parse(localStorage.getItem('userData'));
    document.getElementById('employeeName').textContent = currentUser.name;
    document.getElementById('employeeId').textContent = currentUser.employee_id;
    
    // Set today's date as default for report
    document.getElementById('reportDate').value = new Date().toISOString().split('T')[0];
    
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
        case 'projects':
            loadMyProjects();
            break;
        case 'tasks':
            loadMyTasks();
            break;
        case 'attendance':
            loadMyAttendance();
            break;
    }
}
// Add these functions to your employee dashboard JavaScript

// Submit a new query
async function submitQuery(toEmployeeId, subject, question) {
    const response = await fetch('/api/employee/queries/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
            to_employee_id: toEmployeeId,
            subject: subject,
            question: question
        })
    });
    return response.json();
}

// Get queries I sent
async function getMyQueries() {
    const response = await fetch('/api/employee/queries/sent', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.json();
}

// Get queries received for me
async function getQueriesForMe() {
    const response = await fetch('/api/employee/queries/received', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.json();
}

// Respond to a query
async function respondToQuery(queryId, response) {
    const result = await fetch('/api/employee/queries/respond', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
            queryId: queryId,
            response: response
        })
    });
    return result.json();
}

// Get all employees list
async function getAllEmployees() {
    const response = await fetch('/api/employee/employees/list', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.json();
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
        const [projectsData, tasksData, attendanceData] = await Promise.all([
            apiCall('/api/employee/projects'),
            apiCall('/api/employee/tasks'),
            apiCall('/api/employee/attendance')
        ]);
        
        myProjects = projectsData;
        myTasks = tasksData;
        
        // Update dashboard stats
        document.getElementById('myProjectsCount').textContent = myProjects.length;
        document.getElementById('myPendingTasks').textContent = 
            myTasks.filter(t => t.status === 'pending').length;
        document.getElementById('myCompletedTasks').textContent = 
            myTasks.filter(t => t.status === 'completed').length;
        
        // Calculate monthly attendance
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyAttendance = attendanceData.filter(record => {
            const recordDate = new Date(record.attendance_date);
            return recordDate.getMonth() === currentMonth && 
                   recordDate.getFullYear() === currentYear &&
                   record.status === 'present';
        });
        document.getElementById('monthlyAttendance').textContent = monthlyAttendance.length;
        
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
    }
}

// Projects functions
async function loadMyProjects() {
    try {
        const projectsData = await apiCall('/api/employee/projects');
        myProjects = projectsData;
        renderMyProjects();
    } catch (error) {
        console.error('Failed to load projects:', error);
    }
}

function renderMyProjects() {
    const container = document.getElementById('projectsList');
    
    if (myProjects.length === 0) {
        container.innerHTML = '<p>No projects assigned to you.</p>';
        return;
    }
    
    const tableHTML = `
        <div class="data-table">
            <table>
                <thead>
                    <tr>
                        <th>Project Name</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${myProjects.map(project => `
                        <tr>
                            <td><strong>${project.project_name}</strong></td>
                            <td>${project.description || 'No description'}</td>
                            <td><span class="status-badge status-${project.status.replace('_', '-')}">${project.status.replace('_', ' ')}</span></td>
                            <td><span class="priority-${project.priority}">${project.priority}</span></td>
                            <td>${new Date(project.start_date).toLocaleDateString()}</td>
                            <td>${new Date(project.end_date).toLocaleDateString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = tableHTML;
}

// Tasks functions
async function loadMyTasks() {
    try {
        const tasksData = await apiCall('/api/employee/tasks');
        myTasks = tasksData;
        renderMyTasks();
    } catch (error) {
        console.error('Failed to load tasks:', error);
    }
}

function renderMyTasks() {
    const container = document.getElementById('tasksList');
    
    if (myTasks.length === 0) {
        container.innerHTML = '<p>No tasks assigned to you.</p>';
        return;
    }
    
    const tasksHTML = myTasks.map(task => `
        <div class="data-table" style="margin-bottom: 15px;">
            <div style="padding: 15px; background: white;">
                <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 10px;">
                    <h4>${task.task_name}</h4>
                    <div>
                        <span class="status-badge status-${task.status.replace('_', '-')}">${task.status.replace('_', ' ')}</span>
                        <span class="priority-${task.priority}" style="margin-left: 10px;">${task.priority}</span>
                    </div>
                </div>
                <p><strong>Project:</strong> ${task.project_name}</p>
                <p><strong>Description:</strong> ${task.description || 'No description'}</p>
                <p><strong>Due Date:</strong> ${new Date(task.due_date).toLocaleDateString()}</p>
                <div style="margin-top: 10px;">
                    <button onclick="updateTaskStatus(${task.id}, 'in_progress')" 
                            class="btn btn-primary" 
                            ${task.status === 'in_progress' || task.status === 'completed' ? 'disabled' : ''}>
                        Start Task
                    </button>
                    <button onclick="updateTaskStatus(${task.id}, 'completed')" 
                            class="btn btn-success" 
                            ${task.status === 'completed' ? 'disabled' : ''}>
                        Mark Complete
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = tasksHTML;
}

// Update task status
async function updateTaskStatus(taskId, status) {
    try {
        await apiCall('/api/employee/tasks/status', {
            method: 'PUT',
            body: JSON.stringify({ taskId, status })
        });
        
        alert('Task status updated successfully!');
        loadMyTasks();
        loadDashboardData(); // Refresh dashboard stats
    } catch (error) {
        alert('Failed to update task status: ' + error.message);
    }
}

// Daily report submission
document.getElementById('dailyReportForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const reportData = {
        report_date: document.getElementById('reportDate').value,
        tasks_completed: document.getElementById('tasksCompleted').value,
        challenges_faced: document.getElementById('challengesFaced').value,
        tomorrow_plan: document.getElementById('tomorrowPlan').value,
        working_hours: parseFloat(document.getElementById('workingHours').value)
    };
    
    try {
        await apiCall('/api/employee/reports', {
            method: 'POST',
            body: JSON.stringify(reportData)
        });
        
        alert('Daily report submitted successfully!');
        document.getElementById('dailyReportForm').reset();
        document.getElementById('reportDate').value = new Date().toISOString().split('T')[0];
    } catch (error) {
        alert('Failed to submit report: ' + error.message);
    }
});

// Attendance functions
async function loadMyAttendance() {
    try {
        const attendanceData = await apiCall('/api/employee/attendance');
        renderMyAttendance(attendanceData);
    } catch (error) {
        console.error('Failed to load attendance:', error);
    }
}

function renderMyAttendance(attendance) {
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
                        <th>Date</th>
                        <th>Login Time</th>
                        <th>Logout Time</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${attendance.map(record => `
                        <tr>
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

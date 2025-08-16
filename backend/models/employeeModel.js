const db = require('../config/db');

class EmployeeModel {
    static findByEmail(email, callback) {
        const query = 'SELECT * FROM employees WHERE email = ?';
        db.query(query, [email], callback);
    }

    static markAttendance(employeeId, callback) {
        const today = new Date().toISOString().split('T')[0];
        const query = `
            INSERT INTO attendance (employee_id, attendance_date, login_time, status) 
            VALUES (?, ?, NOW(), 'present') 
            ON DUPLICATE KEY UPDATE login_time = NOW(), status = 'present'
        `;
        db.query(query, [employeeId, today], callback);
    }

    static getMyProjects(employeeId, callback) {
        const query = `
            SELECT DISTINCT p.* 
            FROM projects p 
            JOIN tasks t ON p.id = t.project_id 
            WHERE t.assigned_to = ?
            ORDER BY p.created_at DESC
        `;
        db.query(query, [employeeId], callback);
    }

    static getMyTasks(employeeId, callback) {
        const query = `
            SELECT t.*, p.project_name 
            FROM tasks t 
            JOIN projects p ON t.project_id = p.id 
            WHERE t.assigned_to = ? 
            ORDER BY t.due_date ASC
        `;
        db.query(query, [employeeId], callback);
    }

    static submitDailyReport(reportData, callback) {
        const query = `
            INSERT INTO daily_reports (employee_id, report_date, tasks_completed, 
                                     challenges_faced, tomorrow_plan, working_hours) 
            VALUES (?, ?, ?, ?, ?, ?) 
            ON DUPLICATE KEY UPDATE 
            tasks_completed = VALUES(tasks_completed),
            challenges_faced = VALUES(challenges_faced),
            tomorrow_plan = VALUES(tomorrow_plan),
            working_hours = VALUES(working_hours)
        `;
        db.query(query, [
            reportData.employee_id,
            reportData.report_date,
            reportData.tasks_completed,
            reportData.challenges_faced,
            reportData.tomorrow_plan,
            reportData.working_hours
        ], callback);
    }

    static updateTaskStatus(taskId, status, callback) {
        const query = 'UPDATE tasks SET status = ? WHERE id = ?';
        db.query(query, [status, taskId], callback);
    }

    static getMyAttendance(employeeId, callback) {
        const query = `
            SELECT * FROM attendance 
            WHERE employee_id = ? 
            ORDER BY attendance_date DESC 
            LIMIT 30
        `;
        db.query(query, [employeeId], callback);
    }
}

module.exports = EmployeeModel;

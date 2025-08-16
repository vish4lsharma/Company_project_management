const db = require('../config/db');

class AdminModel {
    static findByEmail(email, callback) {
        const query = 'SELECT * FROM admins WHERE email = ?';
        db.query(query, [email], callback);
    }

    static getAllEmployees(callback) {
        const query = `
            SELECT id, employee_id, name, email, phone, position, 
                   department, joining_date, status 
            FROM employees 
            ORDER BY created_at DESC
        `;
        db.query(query, callback);
    }

    static getAllProjects(callback) {
        const query = `
            SELECT p.*, a.name as created_by_name 
            FROM projects p 
            LEFT JOIN admins a ON p.created_by = a.id 
            ORDER BY p.created_at DESC
        `;
        db.query(query, callback);
    }

    static createProject(projectData, callback) {
        const query = `
            INSERT INTO projects (project_name, description, start_date, 
                                  end_date, status, priority, created_by) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(query, [
            projectData.project_name,
            projectData.description,
            projectData.start_date,
            projectData.end_date,
            projectData.status,
            projectData.priority,
            projectData.created_by
        ], callback);
    }

    static assignTask(taskData, callback) {
        const query = `
            INSERT INTO tasks (project_id, assigned_to, task_name, 
                               description, due_date, status, priority) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(query, [
            taskData.project_id,
            taskData.assigned_to,
            taskData.task_name,
            taskData.description,
            taskData.due_date,
            taskData.status,
            taskData.priority
        ], callback);
    }

    static getDailyReports(callback) {
        const query = `
            SELECT dr.*, e.name as employee_name, e.employee_id 
            FROM daily_reports dr 
            JOIN employees e ON dr.employee_id = e.id 
            ORDER BY dr.report_date DESC, dr.created_at DESC
        `;
        db.query(query, callback);
    }

    static getAttendanceReport(callback) {
        const query = `
            SELECT a.*, e.name as employee_name, e.employee_id 
            FROM attendance a 
            JOIN employees e ON a.employee_id = e.id 
            ORDER BY a.attendance_date DESC
        `;
        db.query(query, callback);
    }

    // FIXED: Create Employee
    static createEmployee(employeeData, callback) {
        const query = `
            INSERT INTO employees (employee_id, name, email, password, phone, 
                                   position, department, joining_date, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(query, [
            employeeData.employee_id,
            employeeData.name,
            employeeData.email,
            employeeData.password,
            employeeData.phone,
            employeeData.position,
            employeeData.department,
            employeeData.joining_date,
            employeeData.status || 'active'
        ], callback);
    }

    // FIXED: Check duplicate email or employee ID
    static checkEmployeeExists(email, employee_id, callback) {
        const query = 'SELECT id FROM employees WHERE email = ? OR employee_id = ?';
        db.query(query, [email, employee_id], callback);
    }

    // FIXED: Generate next Employee ID - Simplified query
  // Fixed generateEmployeeId method
static generateEmployeeId(callback) {
    console.log('🆔 Generating employee ID in model...');
    
    const query = `
        SELECT employee_id 
        FROM employees 
        WHERE employee_id LIKE 'EMP%' 
        ORDER BY CAST(SUBSTRING(employee_id, 4) AS UNSIGNED) DESC 
        LIMIT 1
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('❌ Database query error:', err);
            callback(err);
            return;
        }

        console.log('📊 Database results:', results);

        let nextId = 'EMP001';
        if (results && results.length > 0) {
            const lastId = results[0].employee_id;
            console.log('🔍 Last employee ID found:', lastId);
            
            // Extract numeric part from employee_id (e.g., 'EMP001' -> 1)
            const numericPart = parseInt(lastId.substring(3), 10);
            
            if (!isNaN(numericPart)) {
                const nextNumber = numericPart + 1;
                nextId = 'EMP' + nextNumber.toString().padStart(3, '0');
                console.log('🔢 Next ID calculated:', nextId);
            }
        } else {
            console.log('ℹ️ No existing employees, using default ID:', nextId);
        }

        callback(null, { employee_id: nextId });
    });
}

}

module.exports = AdminModel;

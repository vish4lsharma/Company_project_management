const db = require('../config/db');

class AdminModel {
    static findByEmail(email, callback) {
        const query = 'SELECT * FROM admins WHERE email = $1';
        db.query(query, [email], (err, results) => {
            if (err) return callback(err);
            const rows = results.rows || results;
            callback(null, rows);
        });
    }

    static getAllEmployees(callback) {
        const query = `
            SELECT id, employee_id, name, email, phone, position, 
                   department, joining_date, status 
            FROM employees 
            ORDER BY created_at DESC
        `;
        db.query(query, (err, results) => {
            if (err) return callback(err);
            const rows = results.rows || results;
            callback(null, rows);
        });
    }

    static getAllProjects(callback) {
        const query = `
            SELECT p.*, a.name as created_by_name 
            FROM projects p 
            LEFT JOIN admins a ON p.created_by = a.id 
            ORDER BY p.created_at DESC
        `;
        db.query(query, (err, results) => {
            if (err) return callback(err);
            const rows = results.rows || results;
            callback(null, rows);
        });
    }

    static createProject(projectData, callback) {
        const query = `
            INSERT INTO projects (project_name, description, start_date, 
                                  end_date, status, priority, created_by) 
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        `;
        db.query(query, [
            projectData.project_name,
            projectData.description,
            projectData.start_date,
            projectData.end_date,
            projectData.status || 'planning',
            projectData.priority || 'medium',
            projectData.created_by
        ], (err, results) => {
            if (err) return callback(err);
            const insertResult = {
                insertId: results.rows ? results.rows[0].id : results.insertId
            };
            callback(null, insertResult);
        });
    }

    static assignTask(taskData, callback) {
        const query = `
            INSERT INTO tasks (project_id, assigned_to, task_name, 
                               description, due_date, status, priority) 
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        `;
        db.query(query, [
            taskData.project_id,
            taskData.assigned_to,
            taskData.task_name,
            taskData.description,
            taskData.due_date,
            taskData.status || 'pending',
            taskData.priority || 'medium'
        ], (err, results) => {
            if (err) return callback(err);
            const insertResult = {
                insertId: results.rows ? results.rows[0].id : results.insertId
            };
            callback(null, insertResult);
        });
    }

    static getDailyReports(callback) {
        const query = `
            SELECT dr.*, e.name as employee_name, e.employee_id 
            FROM daily_reports dr 
            LEFT JOIN employees e ON dr.employee_id = e.id 
            ORDER BY dr.report_date DESC, dr.created_at DESC
        `;
        db.query(query, (err, results) => {
            if (err) return callback(err);
            const rows = results.rows || results;
            callback(null, rows);
        });
    }

    static getAttendanceReport(callback) {
        const query = `
            SELECT a.*, e.name as employee_name, e.employee_id 
            FROM attendance a 
            LEFT JOIN employees e ON a.employee_id = e.id 
            ORDER BY a.attendance_date DESC
        `;
        db.query(query, (err, results) => {
            if (err) return callback(err);
            const rows = results.rows || results;
            callback(null, rows);
        });
    }

    static createEmployee(employeeData, callback) {
        const query = `
            INSERT INTO employees (employee_id, name, email, password, phone, 
                                   position, department, joining_date, status) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id
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
        ], (err, results) => {
            if (err) return callback(err);
            const insertResult = {
                insertId: results.rows ? results.rows[0].id : results.insertId
            };
            callback(null, insertResult);
        });
    }

    static checkEmployeeExists(email, employee_id, callback) {
        const query = 'SELECT id FROM employees WHERE email = $1 OR employee_id = $2';
        db.query(query, [email, employee_id], (err, results) => {
            if (err) return callback(err);
            const rows = results.rows || results;
            callback(null, rows);
        });
    }

    static getAllTasks(callback) {
        const query = `
            SELECT t.*, p.project_name, e.name as employee_name, e.employee_id
            FROM tasks t 
            LEFT JOIN projects p ON t.project_id = p.id 
            LEFT JOIN employees e ON t.assigned_to = e.id 
            ORDER BY t.created_at DESC
        `;
        db.query(query, (err, results) => {
            if (err) return callback(err);
            const rows = results.rows || results;
            callback(null, rows);
        });
    }

    static generateEmployeeId(callback) {
        console.log('🆔 Generating employee ID in model...');
        
        const query = `
            SELECT employee_id 
            FROM employees 
            WHERE employee_id LIKE 'EMP%' 
            ORDER BY CAST(SUBSTRING(employee_id, 4) AS INTEGER) DESC 
            LIMIT 1
        `;
        
        db.query(query, (err, results) => {
            if (err) {
                console.error('❌ Database query error:', err);
                callback(err);
                return;
            }

            const rows = results.rows || results;
            console.log('📊 Database results:', rows);

            let nextId = 'EMP001';
            if (rows && rows.length > 0) {
                const lastId = rows[0].employee_id;
                console.log('🔍 Last employee ID found:', lastId);
                
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

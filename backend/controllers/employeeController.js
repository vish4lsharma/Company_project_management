const db = require('../config/db');

class EmployeeModel {
    static findByEmail(email, callback) {
        const query = 'SELECT * FROM employees WHERE email = $1 AND status = $2';
        db.query(query, [email, 'active'], (err, results) => {
            if (err) return callback(err);
            const rows = results.rows || results;
            callback(null, rows);
        });
    }

    static markAttendance(employeeId, callback) {
        const today = new Date().toISOString().split('T')[0];
        
        // First check if attendance already exists for today
        const checkQuery = 'SELECT id FROM attendance WHERE employee_id = $1 AND attendance_date = $2';
        db.query(checkQuery, [employeeId, today], (err, results) => {
            if (err) return callback(err);
            
            const rows = results.rows || results;
            if (rows.length > 0) {
                // Already marked, update login time
                const updateQuery = `
                    UPDATE attendance 
                    SET login_time = NOW(), status = $3 
                    WHERE employee_id = $1 AND attendance_date = $2
                    RETURNING id
                `;
                db.query(updateQuery, [employeeId, today, 'present'], (updateErr, updateResults) => {
                    if (updateErr) return callback(updateErr);
                    const updateResult = {
                        insertId: updateResults.rows ? updateResults.rows[0].id : updateResults.insertId
                    };
                    callback(null, updateResult);
                });
            } else {
                // Insert new attendance record
                const insertQuery = `
                    INSERT INTO attendance (employee_id, attendance_date, login_time, status) 
                    VALUES ($1, $2, NOW(), $3) 
                    RETURNING id
                `;
                db.query(insertQuery, [employeeId, today, 'present'], (insertErr, insertResults) => {
                    if (insertErr) return callback(insertErr);
                    const insertResult = {
                        insertId: insertResults.rows ? insertResults.rows[0].id : insertResults.insertId
                    };
                    callback(null, insertResult);
                });
            }
        });
    }

    static getMyProjects(employeeId, callback) {
        const query = `
            SELECT DISTINCT p.* 
            FROM projects p 
            INNER JOIN tasks t ON p.id = t.project_id 
            WHERE t.assigned_to = $1
            ORDER BY p.created_at DESC
        `;
        db.query(query, [employeeId], (err, results) => {
            if (err) return callback(err);
            const rows = results.rows || results;
            callback(null, rows);
        });
    }

    static getMyTasks(employeeId, callback) {
        const query = `
            SELECT t.*, p.project_name 
            FROM tasks t 
            LEFT JOIN projects p ON t.project_id = p.id 
            WHERE t.assigned_to = $1 
            ORDER BY t.due_date ASC
        `;
        db.query(query, [employeeId], (err, results) => {
            if (err) return callback(err);
            const rows = results.rows || results;
            callback(null, rows);
        });
    }

    static submitDailyReport(reportData, callback) {
        // First check if report exists for this date
        const checkQuery = 'SELECT id FROM daily_reports WHERE employee_id = $1 AND report_date = $2';
        db.query(checkQuery, [reportData.employee_id, reportData.report_date], (err, results) => {
            if (err) return callback(err);
            
            const rows = results.rows || results;
            if (rows.length > 0) {
                // Update existing report
                const updateQuery = `
                    UPDATE daily_reports 
                    SET tasks_completed = $3, challenges_faced = $4, 
                        tomorrow_plan = $5, working_hours = $6
                    WHERE employee_id = $1 AND report_date = $2
                    RETURNING id
                `;
                db.query(updateQuery, [
                    reportData.employee_id,
                    reportData.report_date,
                    reportData.tasks_completed,
                    reportData.challenges_faced,
                    reportData.tomorrow_plan,
                    reportData.working_hours
                ], (updateErr, updateResults) => {
                    if (updateErr) return callback(updateErr);
                    const updateResult = {
                        insertId: updateResults.rows ? updateResults.rows[0].id : updateResults.insertId
                    };
                    callback(null, updateResult);
                });
            } else {
                // Insert new report
                const insertQuery = `
                    INSERT INTO daily_reports (employee_id, report_date, tasks_completed, 
                                             challenges_faced, tomorrow_plan, working_hours) 
                    VALUES ($1, $2, $3, $4, $5, $6)
                    RETURNING id
                `;
                db.query(insertQuery, [
                    reportData.employee_id,
                    reportData.report_date,
                    reportData.tasks_completed,
                    reportData.challenges_faced,
                    reportData.tomorrow_plan,
                    reportData.working_hours
                ], (insertErr, insertResults) => {
                    if (insertErr) return callback(insertErr);
                    const insertResult = {
                        insertId: insertResults.rows ? insertResults.rows[0].id : insertResults.insertId
                    };
                    callback(null, insertResult);
                });
            }
        });
    }

    static updateTaskStatus(taskId, status, callback) {
        const query = 'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING id';
        db.query(query, [status, taskId], (err, results) => {
            if (err) return callback(err);
            const affectedRows = results.rows ? results.rows.length : results.affectedRows;
            callback(null, { affectedRows });
        });
    }

    static getMyAttendance(employeeId, callback) {
        const query = `
            SELECT * FROM attendance 
            WHERE employee_id = $1 
            ORDER BY attendance_date DESC 
            LIMIT 30
        `;
        db.query(query, [employeeId], (err, results) => {
            if (err) return callback(err);
            const rows = results.rows || results;
            callback(null, rows);
        });
    }
}

module.exports = EmployeeModel;

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');
const EmployeeModel = require('../models/employeeModel');

class EmployeeController {
    static async login(req, res) {
        console.log('🚀 Employee login attempt for:', req.body.email);
        
        const { email, password } = req.body;

        EmployeeModel.findByEmail(email, async (err, results) => {
            if (err) {
                console.log('❌ Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            if (results.length === 0) {
                console.log('❌ Employee not found:', email);
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const employee = results[0];
            
            try {
                const isValidPassword = await bcrypt.compare(password, employee.password);

                if (!isValidPassword) {
                    console.log('❌ Invalid password for:', email);
                    return res.status(401).json({ error: 'Invalid credentials' });
                }
                
                // Mark attendance on login
                EmployeeModel.markAttendance(employee.id, (attendanceErr) => {
                    if (attendanceErr) {
                        console.error('Failed to mark attendance:', attendanceErr);
                    } else {
                        console.log('✅ Attendance marked for:', employee.name);
                    }
                });

                // Generate token with automatic expiration
                const tokenPayload = {
                    id: employee.id,
                    email: employee.email,
                    role: 'employee',
                    iat: Math.floor(Date.now() / 1000),
                    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
                };

                const token = jwt.sign(tokenPayload, JWT_SECRET);

                console.log('✅ Token generated successfully for:', employee.email);

                res.json({
                    message: 'Login successful',
                    token,
                    expiresIn: 24 * 60 * 60,
                    employee: {
                        id: employee.id,
                        employee_id: employee.employee_id,
                        name: employee.name,
                        email: employee.email,
                        position: employee.position,
                        department: employee.department
                    }
                });
            } catch (error) {
                console.log('❌ Login error:', error);
                res.status(500).json({ error: 'Login failed' });
            }
        });
    }

    static getMyProjects(req, res) {
        console.log('📋 Getting projects for employee:', req.user.email);
        
        EmployeeModel.getMyProjects(req.user.id, (err, results) => {
            if (err) {
                console.log('❌ Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            console.log('✅ Retrieved', results.length, 'projects');
            res.json(results);
        });
    }

    static getMyTasks(req, res) {
        console.log('📝 Getting tasks for employee:', req.user.email);
        
        EmployeeModel.getMyTasks(req.user.id, (err, results) => {
            if (err) {
                console.log('❌ Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            console.log('✅ Retrieved', results.length, 'tasks');
            res.json(results);
        });
    }

    static submitDailyReport(req, res) {
        console.log('📊 Submitting daily report for employee:', req.user.email);
        
        const reportData = {
            ...req.body,
            employee_id: req.user.id
        };

        EmployeeModel.submitDailyReport(reportData, (err, results) => {
            if (err) {
                console.log('❌ Submit report error:', err);
                return res.status(500).json({ error: 'Failed to submit report' });
            }
            console.log('✅ Daily report submitted successfully');
            res.json({ message: 'Daily report submitted successfully' });
        });
    }

    static updateTaskStatus(req, res) {
        console.log('🔄 Updating task status for employee:', req.user.email);
        
        const { taskId, status } = req.body;
        
        EmployeeModel.updateTaskStatus(taskId, status, (err, results) => {
            if (err) {
                console.log('❌ Update task status error:', err);
                return res.status(500).json({ error: 'Failed to update task status' });
            }
            console.log('✅ Task status updated successfully');
            res.json({ message: 'Task status updated successfully' });
        });
    }

    static getMyAttendance(req, res) {
        console.log('👥 Getting attendance for employee:', req.user.email);
        
        EmployeeModel.getMyAttendance(req.user.id, (err, results) => {
            if (err) {
                console.log('❌ Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            console.log('✅ Retrieved', results.length, 'attendance records');
            res.json(results);
        });
    }

    // Auto-refresh token endpoint for employees
    static refreshToken(req, res) {
        console.log('🔄 Refreshing token for employee:', req.user.email);
        
        const newTokenPayload = {
            id: req.user.id,
            email: req.user.email,
            role: req.user.role,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
        };

        const newToken = jwt.sign(newTokenPayload, JWT_SECRET);

        res.json({
            message: 'Token refreshed successfully',
            token: newToken,
            expiresIn: 24 * 60 * 60
        });
    }
    // Add these methods to your existing EmployeeController class

static submitQuery(req, res) {
    console.log('💬 Employee submitting query:', req.user.email);
    
    const queryData = {
        from_employee_id: req.user.id,
        to_employee_id: req.body.to_employee_id,
        subject: req.body.subject,
        question: req.body.question
    };

    EmployeeModel.submitQuery(queryData, (err, results) => {
        if (err) {
            console.log('❌ Submit query error:', err);
            return res.status(500).json({ error: 'Failed to submit query' });
        }
        console.log('✅ Query submitted successfully');
        res.json({ 
            message: 'Query submitted successfully', 
            queryId: results.insertId 
        });
    });
}

static getMyQueries(req, res) {
    console.log('📝 Getting queries sent by employee:', req.user.email);
    
    EmployeeModel.getMyQueries(req.user.id, (err, results) => {
        if (err) {
            console.log('❌ Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        console.log('✅ Retrieved', results.length, 'sent queries');
        res.json(results);
    });
}

static getQueriesForMe(req, res) {
    console.log('📨 Getting queries received by employee:', req.user.email);
    
    EmployeeModel.getQueriesForMe(req.user.id, (err, results) => {
        if (err) {
            console.log('❌ Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        console.log('✅ Retrieved', results.length, 'received queries');
        res.json(results);
    });
}

static respondToQuery(req, res) {
    console.log('💬 Employee responding to query:', req.user.email);
    
    const { queryId, response } = req.body;
    
    EmployeeModel.respondToQuery(queryId, response, (err, results) => {
        if (err) {
            console.log('❌ Respond to query error:', err);
            return res.status(500).json({ error: 'Failed to respond to query' });
        }
        console.log('✅ Response submitted successfully');
        res.json({ message: 'Response submitted successfully' });
    });
}

static getAllEmployees(req, res) {
    console.log('👥 Getting all employees except current user:', req.user.email);
    
    EmployeeModel.getAllEmployeesExceptMe(req.user.id, (err, results) => {
        if (err) {
            console.log('❌ Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        console.log('✅ Retrieved', results.length, 'employees');
        res.json(results);
    });
}

}

module.exports = EmployeeController;

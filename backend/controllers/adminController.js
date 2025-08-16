const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');
const AdminModel = require('../models/adminModel');

class AdminController {
    static async login(req, res) {
        console.log('🚀 Admin login attempt for:', req.body.email);
        
        const { email, password } = req.body;

        AdminModel.findByEmail(email, async (err, results) => {
            if (err) {
                console.log('❌ Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (results.length === 0) {
                console.log('❌ Admin not found:', email);
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const admin = results[0];
            
            try {
                const isValidPassword = await bcrypt.compare(password, admin.password);

                if (!isValidPassword) {
                    console.log('❌ Invalid password for:', email);
                    return res.status(401).json({ error: 'Invalid credentials' });
                }

                // Generate token with automatic expiration
                const tokenPayload = {
                    id: admin.id,
                    email: admin.email,
                    role: 'admin',
                    iat: Math.floor(Date.now() / 1000),
                    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
                };

                const token = jwt.sign(tokenPayload, JWT_SECRET);

                console.log('✅ Token generated successfully for:', admin.email);

                res.json({
                    message: 'Login successful',
                    token,
                    expiresIn: 24 * 60 * 60, // seconds
                    admin: {
                        id: admin.id,
                        name: admin.name,
                        email: admin.email
                    }
                });
            } catch (error) {
                console.log('❌ Login error:', error);
                res.status(500).json({ error: 'Login failed' });
            }
        });
    }
    // Add this method to your AdminController class
static getAllTasks(req, res) {
    console.log('📝 Getting all tasks for user:', req.user.email);
    
    AdminModel.getAllTasks((err, results) => {
        if (err) {
            console.log('❌ Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        console.log('✅ Retrieved', results.length, 'tasks');
        res.json(results);
    });
}

    static getAllEmployees(req, res) {
        console.log('📋 Getting all employees for user:', req.user.email);
        
        AdminModel.getAllEmployees((err, results) => {
            if (err) {
                console.log('❌ Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            console.log('✅ Retrieved', results.length, 'employees');
            res.json(results);
        });
    }

    static getAllProjects(req, res) {
        console.log('📋 Getting all projects for user:', req.user.email);
        
        AdminModel.getAllProjects((err, results) => {
            if (err) {
                console.log('❌ Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            console.log('✅ Retrieved', results.length, 'projects');
            res.json(results);
        });
    }

    static createProject(req, res) {
        console.log('🆕 Creating project for user:', req.user.email);
        
        const projectData = {
            ...req.body,
            created_by: req.user.id
        };

        AdminModel.createProject(projectData, (err, results) => {
            if (err) {
                console.log('❌ Project creation error:', err);
                return res.status(500).json({ error: 'Failed to create project' });
            }
            console.log('✅ Project created with ID:', results.insertId);
            res.json({ 
                message: 'Project created successfully', 
                projectId: results.insertId 
            });
        });
    }

    static assignTask(req, res) {
        console.log('📝 Assigning task for user:', req.user.email);
        
        AdminModel.assignTask(req.body, (err, results) => {
            if (err) {
                console.log('❌ Task assignment error:', err);
                return res.status(500).json({ error: 'Failed to assign task' });
            }
            console.log('✅ Task assigned with ID:', results.insertId);
            res.json({ 
                message: 'Task assigned successfully', 
                taskId: results.insertId 
            });
        });
    }

    static getDailyReports(req, res) {
        console.log('📊 Getting daily reports for user:', req.user.email);
        
        AdminModel.getDailyReports((err, results) => {
            if (err) {
                console.log('❌ Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            console.log('✅ Retrieved', results.length, 'reports');
            res.json(results);
        });
    }

    static getAttendanceReport(req, res) {
        console.log('👥 Getting attendance report for user:', req.user.email);
        
        AdminModel.getAttendanceReport((err, results) => {
            if (err) {
                console.log('❌ Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            console.log('✅ Retrieved', results.length, 'attendance records');
            res.json(results);
        });
    }

    static async createEmployee(req, res) {
        console.log('👤 Creating new employee for user:', req.user.email);
        
        const {
            name, email, password, phone, position, 
            department, joining_date, employee_id
        } = req.body;

        try {
            if (!name || !email || !password || !employee_id) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            AdminModel.checkEmployeeExists(email, employee_id, async (err, results) => {
                if (err) {
                    console.error('❌ Check employee exists error:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
                
                if (results.length > 0) {
                    console.log('❌ Employee already exists:', email);
                    return res.status(400).json({ 
                        error: 'Employee with this email or ID already exists' 
                    });
                }

                try {
                    const hashedPassword = await bcrypt.hash(password, 12); // Increased salt rounds

                    const employeeData = {
                        employee_id,
                        name,
                        email,
                        password: hashedPassword,
                        phone: phone || '',
                        position: position || '',
                        department: department || '',
                        joining_date: joining_date || new Date().toISOString().split('T')[0],
                        status: 'active'
                    };

                    AdminModel.createEmployee(employeeData, (createErr, createResults) => {
                        if (createErr) {
                            console.error('❌ Create employee error:', createErr);
                            return res.status(500).json({ error: 'Failed to create employee' });
                        }
                        
                        console.log('✅ Employee created successfully with ID:', createResults.insertId);
                        res.json({ 
                            message: 'Employee created successfully', 
                            employeeId: createResults.insertId,
                            employee_id: employee_id
                        });
                    });
                } catch (hashError) {
                    console.error('❌ Password hashing error:', hashError);
                    return res.status(500).json({ error: 'Server error' });
                }
            });
        } catch (error) {
            console.error('❌ Create employee error:', error);
            res.status(500).json({ error: 'Server error' });
        }
    }

    static generateEmployeeId(req, res) {
        console.log('🆔 Generating employee ID for user:', req.user.email);
        
        AdminModel.generateEmployeeId((err, results) => {
            if (err) {
                console.error('❌ Generate employee ID error:', err);
                return res.status(500).json({ error: 'Failed to generate employee ID' });
            }
            
            console.log('✅ Generated employee ID:', results.employee_id);
            res.json(results);
        });
    }

    // Auto-refresh token endpoint
    static refreshToken(req, res) {
        console.log('🔄 Refreshing token for user:', req.user.email);
        
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
}

module.exports = AdminController;

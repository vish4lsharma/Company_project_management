const express = require('express');
const EmployeeController = require('../controllers/employeeController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/login', EmployeeController.login);

// Protected routes (require authentication)
router.get('/projects', authenticateToken, EmployeeController.getMyProjects);
router.get('/tasks', authenticateToken, EmployeeController.getMyTasks);
router.post('/reports', authenticateToken, EmployeeController.submitDailyReport);
router.put('/tasks/status', authenticateToken, EmployeeController.updateTaskStatus);
router.get('/attendance', authenticateToken, EmployeeController.getMyAttendance);

// Token refresh endpoint
router.post('/refresh-token', authenticateToken, EmployeeController.refreshToken);

module.exports = router;

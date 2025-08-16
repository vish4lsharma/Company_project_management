const express = require('express');
const EmployeeController = require('../controllers/employeeController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();
// Add these routes to your existing employee routes

router.post('/queries/submit', authenticateToken, EmployeeController.submitQuery);
router.get('/queries/sent', authenticateToken, EmployeeController.getMyQueries);
router.get('/queries/received', authenticateToken, EmployeeController.getQueriesForMe);
router.post('/queries/respond', authenticateToken, EmployeeController.respondToQuery);
router.get('/employees/list', authenticateToken, EmployeeController.getAllEmployees);

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

const express = require('express');
const AdminController = require('../controllers/adminController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/login', AdminController.login);

// Protected routes (require authentication)
router.get('/employees', authenticateToken, AdminController.getAllEmployees);
router.post('/employees', authenticateToken, AdminController.createEmployee);
router.get('/employees/generate-id', authenticateToken, AdminController.generateEmployeeId);

router.get('/projects', authenticateToken, AdminController.getAllProjects);
router.post('/projects', authenticateToken, AdminController.createProject);

router.get('/tasks', authenticateToken, AdminController.getAllTasks);
router.post('/tasks', authenticateToken, AdminController.assignTask);

router.get('/reports', authenticateToken, AdminController.getDailyReports);
router.get('/attendance', authenticateToken, AdminController.getAttendanceReport);

router.post('/refresh-token', authenticateToken, AdminController.refreshToken);

module.exports = router;

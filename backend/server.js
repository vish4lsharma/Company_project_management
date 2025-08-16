const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const adminRoutes = require('./routes/adminRoutes');
const employeeRoutes = require('./routes/employeeRoutes');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API Routes
app.use('/api/admin', adminRoutes);
app.use('/api/employee', employeeRoutes);

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, '../frontend')));

// Root route - serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Health check for Render
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Catch-all handler for SPA routing (Express 5.0 compatible)
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Bind to 0.0.0.0 for Render
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

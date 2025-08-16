const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const adminRoutes = require('./routes/adminRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/employee', employeeRoutes);

// Serve static files
app.use(express.static('../frontend'));

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

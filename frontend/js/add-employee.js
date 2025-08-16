let currentUser = null;

// Check authentication
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    
    if (!token || userType !== 'admin') {
        window.location.href = 'login.html?type=admin';
        return;
    }
    
    currentUser = JSON.parse(localStorage.getItem('userData'));
    document.getElementById('adminName').textContent = currentUser.name;
    
    // Set default joining date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('joiningDate').value = today;
    
    // Generate initial employee ID
    generateEmployeeId();
});

// API helper function
async function apiCall(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const config = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };
    
    try {
        const response = await fetch(endpoint, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'API call failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Generate employee ID with detailed debugging
async function generateEmployeeId() {
    try {
        console.log('🆔 Starting employee ID generation...');
        
        showMessage('Generating employee ID...', 'info');
        
        const response = await apiCall('/api/admin/employees/generate-id');
        
        console.log('✅ Received employee ID response:', response);
        
        document.getElementById('employeeId').value = response.employee_id;
        clearMessages();
        console.log('✅ Employee ID set in form:', response.employee_id);
        
    } catch (error) {
        console.error('❌ Failed to generate employee ID:', error);
        showError('Failed to generate employee ID: ' + error.message);
        
        // Fallback: Set a default ID pattern
        const fallbackId = 'EMP' + Date.now().toString().slice(-3);
        document.getElementById('employeeId').value = fallbackId;
        console.log('🔄 Using fallback ID:', fallbackId);
    }
}

// Generate ID button click handler
document.getElementById('generateIdBtn').addEventListener('click', generateEmployeeId);

// Form validation
function validateForm() {
    const password = document.getElementById('employeePassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return false;
    }
    
    if (password.length < 6) {
        showError('Password must be at least 6 characters long');
        return false;
    }
    
    const email = document.getElementById('employeeEmail').value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('Please enter a valid email address');
        return false;
    }
    
    const phone = document.getElementById('employeePhone').value;
    if (phone && phone.length < 10) {
        showError('Please enter a valid phone number (minimum 10 digits)');
        return false;
    }
    
    const joiningDate = new Date(document.getElementById('joiningDate').value);
    const today = new Date();
    if (joiningDate > today) {
        showError('Joining date cannot be in the future');
        return false;
    }
    
    return true;
}

// Form submission
document.getElementById('addEmployeeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    const formData = new FormData(e.target);
    const employeeData = {
        employee_id: formData.get('employee_id'),
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        phone: formData.get('phone'),
        position: formData.get('position'),
        department: formData.get('department'),
        joining_date: formData.get('joining_date')
    };
    
    console.log('📝 Submitting employee data:', employeeData);
    
    try {
        // Show loading state
        const submitBtn = document.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Creating Employee...';
        submitBtn.disabled = true;
        
        await apiCall('/api/admin/employees', {
            method: 'POST',
            body: JSON.stringify(employeeData)
        });
        
        showSuccess(`Employee ${employeeData.name} created successfully!`);
        
        // Reset form and generate new ID
        resetForm();
        await generateEmployeeId();
        
        // Restore button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
    } catch (error) {
        showError('Failed to create employee: ' + error.message);
        
        // Restore button
        const submitBtn = document.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Create Employee';
        submitBtn.disabled = false;
    }
});

// Reset form
function resetForm() {
    document.getElementById('addEmployeeForm').reset();
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('joiningDate').value = today;
    clearMessages();
}

// Show error message
function showError(message) {
    showMessage(message, 'error');
}

// Show success message
function showSuccess(message) {
    showMessage(message, 'success');
}

// Show message
function showMessage(message, type) {
    const errorDiv = document.getElementById('errorMessage');
    const successDiv = document.getElementById('successMessage');
    
    if (type === 'error') {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        successDiv.style.display = 'none';
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (type === 'success') {
        successDiv.textContent = message;
        successDiv.style.display = 'block';
        errorDiv.style.display = 'none';
        successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (type === 'info') {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        errorDiv.style.backgroundColor = '#d1ecf1';
        errorDiv.style.color = '#0c5460';
        successDiv.style.display = 'none';
    }
}

// Clear messages
function clearMessages() {
    const errorDiv = document.getElementById('errorMessage');
    const successDiv = document.getElementById('successMessage');
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    errorDiv.style.backgroundColor = '#f8d7da';
    errorDiv.style.color = '#721c24';
}

// Clear messages when user starts typing
document.getElementById('addEmployeeForm').addEventListener('input', clearMessages);

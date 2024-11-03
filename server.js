const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
const { db, registerUser } = require('./database');

const app = express();
const dbPath = path.resolve('D:/medical-data-ai-vault/medical_data_vault.db');
const PORT = process.env.PORT || 3000;

// Middleware to enable CORS
app.use(cors());

// Middleware to parse JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (like your HTML, CSS, JS) from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Set the upload directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Save file with timestamp
    }
});

const upload = multer({ storage });

// Sample route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve the dashboard HTML file
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public','dashboard.html'));
});


// Fetch medical data for a user
app.get('/data', (req, res) => {
    const medicalId = req.query.userId;

    // First, retrieve the user info
    const userQuery = 'SELECT medical_id, name FROM Individuals WHERE medical_id = ?';
    db.get(userQuery, [medicalId], (err, user) => {
        if (err) {
            console.error('Database error while fetching user info:', err.message);
            return res.status(500).json({ error: 'Database error while fetching user info' });
        }

        // If the user does not exist
        if (!user) {
            return res.status(404).json({ error: 'No user found for this medical ID' });
        }

        // Next, retrieve the medical records for this user
        const recordsQuery = 'SELECT title, description, hospital_name, doctor_name, prescribed_medicines, lab_tests, date_created FROM MedicalData WHERE medical_id = ?';
        db.all(recordsQuery, [medicalId], (err, medicalRecords) => {
            if (err) {
                console.error('Database error while fetching medical records:', err.message);
                return res.status(500).json({ error: 'Database error while fetching medical records' });
            }

            // Send user info and medical records (empty array if no records)
            res.json({ userInfo: user, medicalRecords: medicalRecords || [] });
        });
    });
});





// Registration endpoint
app.post('/register', async (req, res) => {
    const { userType, name, gender, email, hospitalName, address, contact, password } = req.body;

    // Validate input
    if (!userType || !password) {
        return res.status(400).json({ error: 'User type and password are required.' });
    }

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10); // Increase the salt rounds for stronger security

    try {
        const medicalId = await registerUser(userType, { name, gender, email, hospitalName, address, contact, hashedPassword });
        res.status(201).json({ medicalId }); // Use medicalId as the response
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// New endpoint to add medical data
app.post('/add-medical-data', upload.single('fileUpload'), (req, res) => {
    const { medicalId, title, description, hospitalName, doctorName, medicines, tests } = req.body;
    const filePath = req.file ? req.file.path : null; // Get the file path if a file was uploaded

    // Validate input
    if (!medicalId || !title || !description) {
        return res.status(400).json({ success: false, message: 'Medical ID, Title, and Description are required.' });
    }

    // Check if the medical ID exists in the individuals table
    db.get('SELECT * FROM Individuals WHERE medical_id = ?', [medicalId], (err, row) => {
        if (err) {
            console.error('Database error while checking medical ID:', err.message); // Log error message
            return res.status(500).json({ success: false, message: 'Database error while checking medical ID' });
        }
        if (!row) {
            return res.status(400).json({ success: false, message: 'Medical ID does not exist' });
        }

        // Insert the data into the MedicalData table
        const sql = `INSERT INTO MedicalData (medical_id, title, description, hospital_name, doctor_name, prescribed_medicines, lab_tests, file_upload) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

        db.run(sql, [medicalId, title, description, hospitalName, doctorName, medicines, tests, filePath], function(err) {
            if (err) {
                console.error('Database error while adding medical data:', err.message); // Log error message
                return res.status(500).json({ success: false, message: 'Failed to add medical data' });
            }
            res.json({ success: true });
        });
    });
});

// Login endpoint
app.post('/login', (req, res) => {
    const { medical_id, password } = req.body;

    // Query the database to get the user based on the medical_id
    const query = `SELECT * FROM Individuals WHERE medical_id = ?`;
    db.get(query, [medical_id], async (err, row) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        } 
        if (!row) {
            return res.status(401).json({ success: false, message: 'Invalid medical ID or password' });
        }

        // Use bcrypt to compare the input password with the hashed password in the database
        const match = await bcrypt.compare(password, row.password); // Compare plain password with the hashed password

        if (match) {
            // If the password matches, send a success response with redirect
            res.json({ 
                success: true, 
                medicalId: row.medical_id,  // Include the medical ID in the response
                message: 'Login successful!',
                redirect: '/dashboard' // Redirect URL to the dashboard
            });
        } else {
            // If passwords do not match, send failure response
            res.status(401).json({ success: false, message: 'Invalid medical ID or password' });
        }
    });
});



// Start the server
app.listen(PORT, (err) => {
    if (err) {
        console.error('Error starting the server', err.message);
    } else {
        console.log(`Server is running on http://localhost:${PORT}`);
    }
});

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Use the full path to your database file
const dbPath = path.join('D:', 'medical-data-ai-vault', 'medical_data_vault.db'); 

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Database opening error: ', err);
    } else {
        console.log('Connected to the SQLite database.');
        // Create necessary tables if they do not exist
        db.run("CREATE TABLE IF NOT EXISTS Individuals (medical_id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, gender TEXT, email TEXT, password TEXT)");
        db.run("CREATE TABLE IF NOT EXISTS hospitals (id INTEGER PRIMARY KEY, name TEXT, address TEXT, contact TEXT, password TEXT)");
        db.run(`CREATE TABLE IF NOT EXISTS MedicalData (
            record_id INTEGER PRIMARY KEY AUTOINCREMENT,
            medical_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            hospital_name TEXT,
            doctor_name TEXT,
            prescribed_medicines TEXT,
            lab_tests TEXT,
            file_upload TEXT,
            date_created TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (medical_id) REFERENCES Individuals (medical_id)
        )`);
    }
});

// Function to register a new user
function registerUser(userType, userDetails) {
    return new Promise((resolve, reject) => {
        const sql = userType === 'individual'
            ? `INSERT INTO Individuals (name, gender, email, password) VALUES (?, ?, ?, ?)`
            : `INSERT INTO hospitals (name, address, contact, password) VALUES (?, ?, ?, ?)`;

        const params = userType === 'individual'
            ? [userDetails.name, userDetails.gender, userDetails.email, userDetails.hashedPassword]
            : [userDetails.hospitalName, userDetails.address, userDetails.contact, userDetails.hashedPassword];

        db.run(sql, params, function(err) {
            if (err) {
                return reject(err);
            }
            resolve(this.lastID); // Return the ID of the new user
        });
    });
}

module.exports = { db, registerUser }; // Export the database and the register function

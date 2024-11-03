// main.js

// This file contains common functions and event listeners for the application

// Function to register a new user
async function registerUser(name, medicalId, password, type) {
    // Prepare data to send to the server
    const userData = {
        name,
        medical_id: medicalId,
        password,
        type
    };

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (response.ok) {
            const result = await response.json();
            alert("Registration successful! Your Medical ID is: " + result.medical_id);
            // Redirect to the login page or dashboard if needed
            // window.location.href = 'dashboard.html'; // Uncomment if needed
        } else {
            const errorData = await response.json();
            alert("Registration failed: " + (errorData.error || "Please try again."));
        }
    } catch (error) {
        console.error('Error during registration:', error);
        alert("An error occurred. Please try again later.");
    }
}

// Function to validate user login
async function loginUser(medicalId, password) {
    const credentials = { medical_id: medicalId, password };

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        if (response.ok) {
            const result = await response.json();
            alert("Login successful! Welcome " + result.name);
            // Redirect to dashboard
            window.location.href = `dashboard.html?id=${result.id}&userType=${result.type}`;
        } else {
            const errorData = await response.json();
            alert("Invalid Medical ID or Password: " + (errorData.error || "Please try again."));
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert("An error occurred. Please try again later.");
    }
}

// Event listeners for form submissions can be added here
document.addEventListener('DOMContentLoaded', function () {
    console.log("Main JS file loaded");

    // Example: Add event listener for registration form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function (event) {
            event.preventDefault(); // Prevent default form submission
            const name = document.getElementById('name').value;
            const medicalId = document.getElementById('medicalId').value;
            const password = document.getElementById('password').value;
            const type = document.querySelector('input[name="type"]:checked').value; // Assuming radio buttons for user type
            registerUser(name, medicalId, password, type);
        });
    }

    // Example: Add event listener for login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (event) {
            event.preventDefault(); // Prevent default form submission
            const medicalId = document.getElementById('loginMedicalId').value;
            const password = document.getElementById('loginPassword').value;
            loginUser(medicalId, password);
        });
    }
});

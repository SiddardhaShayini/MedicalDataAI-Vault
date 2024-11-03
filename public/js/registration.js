document.addEventListener("DOMContentLoaded", function () {
    const registrationForm = document.getElementById("registrationForm");
    const togglePassword = document.getElementById("togglePassword");

    if (togglePassword) {
        const passwordInput = document.getElementById("password");
        togglePassword.addEventListener("click", function () {
            const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
            passwordInput.setAttribute("type", type);
            this.textContent = type === "password" ? "Show Password" : "Hide Password";
        });
    }

    if (registrationForm) {
        registrationForm.addEventListener("submit", handleFormSubmit);
    }

    // Handle continue button click to navigate to the right registration page
    const continueBtn = document.getElementById("continueBtn");
    if (continueBtn) {
        continueBtn.addEventListener("click", handleContinue);
    }

    function handleContinue() {
        const userType = document.getElementById("userType").value;
        if (userType === "individual") {
            window.location.href = "register_individual.html";
        } else if (userType === "hospital") {
            window.location.href = "register_hospital.html";
        } else {
            alert("Please select a user type.");
        }
    }

    async function handleFormSubmit(event) {
        event.preventDefault();
        
        // Collect user data (unchanged code here)
        const userType = document.getElementById("userType") ? document.getElementById("userType").value : (document.getElementById("name") ? "individual" : "hospital");
        const password = document.getElementById("password").value.trim();
        const email = document.getElementById("email") ? document.getElementById("email").value.trim() : '';
        const contactNumber = document.getElementById("contact") ? document.getElementById("contact").value.trim() : '';
    
        const errors = [];
        const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
        const contactPattern = /^[0-9]{10}$/;
    
        // Perform validation checks (unchanged code here)
        if (userType === 'individual' && !emailPattern.test(email)) {
            errors.push("Please enter a valid email address.");
        }
        if (userType === 'hospital' && !contactPattern.test(contactNumber)) {
            errors.push("Please enter a valid 10-digit contact number.");
        }
    
        if (errors.length > 0) {
            alert(errors.join("\n"));
            return;
        }
    
        // Prepare data for the server
        const formData = {
            userType,
            name: document.getElementById("name") ? document.getElementById("name").value.trim() : '',
            gender: document.getElementById("gender") ? document.getElementById("gender").value : '',
            email,
            hospitalName: document.getElementById("hospitalName") ? document.getElementById("hospitalName").value.trim() : '',
            address: document.getElementById("address") ? document.getElementById("address").value.trim() : '',
            contact: contactNumber,
            password
        };
    
        // Send data to the server
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });
    
        // Handle the response from the server
        if (response.ok) {
            const data = await response.json(); // Get the response data
            
            // Show success popup with medical ID
            alert(`Successfully registered! Your medical ID: ${data.medicalId}`);
            
            // Redirect to index.html after 2 seconds
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000); // Redirect after 2 seconds
        } else {
            const errorData = await response.json();
            alert("Registration failed: " + (errorData.error || "Please try again."));
        }
    }
    
    
    
});

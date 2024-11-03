document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const medical_id = document.getElementById('medical_id').value;
    const password = document.getElementById('password').value;

    fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ medical_id, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Store medical ID in session storage
            sessionStorage.setItem('medicalId', data.medicalId);

            // Redirect to the dashboard
            window.location.href = '/dashboard';  // Use the dashboard URL directly
        } else {
            alert(data.message); // Show the error message in a popup
        }
    })
    .catch(error => console.error('Error:', error));
});

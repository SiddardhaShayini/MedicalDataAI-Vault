document.addEventListener('DOMContentLoaded', async function () {
    const dataList = document.getElementById('dataList');
    const userId = sessionStorage.getItem('medicalId') || getUserIdFromUrl();

    if (!userId) {
        alert('User not logged in. Please log in again.');
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch(`/data?userId=${userId}`);
        if (!response.ok) throw new Error('Failed to fetch user data');

        const { userInfo, medicalRecords } = await response.json();

        // Capitalize the user's name
        const userName = userInfo.name.charAt(0).toUpperCase() + userInfo.name.slice(1);

        // Display user info
        document.getElementById('userInfo').innerHTML = `
            <h2>Welcome, <strong>${userName}</strong>! Your Medical ID: <strong>${userInfo.medical_id}</strong></h2>
        `;

        // Check if there are medical records
        if (!medicalRecords || medicalRecords.length === 0) {
            dataList.innerHTML = '<li>No data added.</li>';
        } else {
            dataList.innerHTML = ''; // Clear previous content
            const monthlyCounts = {};

            medicalRecords.forEach(record => {
                const listItem = document.createElement('li');
                const imageSrc = record.file_upload ? record.file_upload.replace(/\\/g, '/') : null;

                // Display medical record information
                listItem.innerHTML = `
                    <strong>${record.title || 'Not available'}</strong> (Date: ${record.date_created || 'Not available'})<br>
                    <ul>
                        <li>Description: ${record.description || 'Not available'}</li>
                        <li>Hospital Name: ${record.hospital_name || 'Not available'}</li>
                        <li>Doctor Name: ${record.doctor_name || 'Not available'}</li>
                        <li>Prescribed Medicines: ${record.prescribed_medicines || 'Not available'}</li>
                        <li>Lab Tests: ${record.lab_tests || 'Not available'}</li>
                        <li>File: ${imageSrc ? `<img src="${imageSrc}" alt="Uploaded Image" style="max-width: 200px; max-height: 200px;">` : 'Not available'}</li>
                    </ul>
                `;
                dataList.appendChild(listItem);

                // Update monthly counts for chart data
                const date = new Date(record.date_created);
                const month = date.toLocaleString('default', { month: 'short' });
                monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
            });

            // Generate chart data
            renderChart(monthlyCounts);
        }
    } catch (error) {
        console.error('Error fetching user info:', error);
        dataList.innerHTML = "<li>Failed to load user info. Please try again later.</li>";
    }
});

// Function to extract user ID from the URL
function getUserIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id'); // Assuming user ID is passed as a query parameter
}

// Function to render chart using Chart.js
function renderChart(monthlyCounts) {
    const ctx = document.getElementById('medicalChart').getContext('2d');
    const months = Object.keys(monthlyCounts);
    const counts = Object.values(monthlyCounts);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Number of Medical Records',
                data: counts,
                fill: false,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                tension: 0.1, // Lower tension for sharper angles
                borderDash: [5, 5], // Optional: make the line dashed
                pointStyle: 'circle', // Optional: change the point style
                pointRadius: 5, // Optional: size of points
                pointHoverRadius: 7 // Optional: size of points on hover
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        // Optional: customize tick format
                        callback: function(value) {
                            return value; // Format values if necessary
                        }
                    }
                },
                x: {
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 10 // Limit the number of x-axis ticks
                    }
                }
            },
            elements: {
                line: {
                    tension: 0.1 // Lower tension for sharper line transitions
                },
                point: {
                    radius: 5 // Point size on the line
                }
            }
        }
    });
}


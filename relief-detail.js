document.addEventListener("DOMContentLoaded", function() {
    // Auto-resize Reason textarea if present
    const textarea = document.querySelector("textarea");
    if (textarea) {
        textarea.addEventListener("input", function() {
            // Reset the height to allow shrinking
            this.style.height = "auto";
            // Set the height based on the scroll height
            this.style.height = (this.scrollHeight) + "px";
        });
    }

    // Function to fetch names from the CSV file
    async function fetchNames() {
        const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vTnGJsECSsHaqp1pQySQZ7SzjCCBRxaWU9o2L5rMb_cdYpDieAVexbfrrPviD1NK17RVFwBJeE2eGpi/pub?output=csv');
        const data = await response.text();
        const rows = data.split('\n').map(row => row.split(','));
        return rows.reduce((acc, [id, name]) => {
            acc[id.toUpperCase()] = name; // Convert ID to uppercase for case-insensitive matching
            return acc;
        }, {});
    }

    // Store names in a variable for quick access
    let nameLookup = {};

    // Load names on page load
    fetchNames().then(names => {
        nameLookup = names;
    });

    // Function to set the current date
    function setCurrentDate() {
        const dateInput = document.getElementById("relief-date");
        if (dateInput) {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
            const day = String(today.getDate()).padStart(2, '0');

            // Format the date as yyyy-mm-dd
            const formattedDate = `${year}-${month}-${day}`;
            dateInput.value = formattedDate;
        }
    }

    // Call the function to set the current date on page load
    setCurrentDate();

    // Function to handle ID input and display name or error message
    function handleIdInput(id, nameElementId, nameHiddenElementId, mobileHiddenElementId) {
        const info = nameLookup[id] || {};
        const name = info.name || 'PLEASE CHECK ID';
        const mobile = info.mobile || '';
        document.getElementById(nameElementId).textContent = name !== 'PLEASE CHECK ID' ? `Name: ${name}` : name;
        document.getElementById(nameHiddenElementId).value = name !== 'PLEASE CHECK ID' ? name : '';
        document.getElementById(mobileHiddenElementId).value = name !== 'PLEASE CHECK ID' ? mobile : '';
    }

    // Event listener for LP ID input
    document.getElementById("lp-id").addEventListener("input", function() {
        const id = this.value.toUpperCase();
        handleIdInput(id, "lp-name", "lp-name-hidden", "lp-mobile-hidden");
    });

    // Event listener for ALP ID input
    document.getElementById("alp-id").addEventListener("input", function() {
        const id = this.value.toUpperCase();
        handleIdInput(id, "alp-name", "alp-name-hidden", "alp-mobile-hidden");
    });

    // Initialize Flatpickr for the time input with 24-hour format
    flatpickr("#relief-time", {
        enableTime: true,
        noCalendar: true,
        dateFormat: "H:i",
        time_24hr: true // Ensures the picker uses 24-hour format
    });

    // Form submission logic
    document.getElementById("relief-form").addEventListener("submit", function(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const submitButton = e.target.querySelector('button[type="submit"]');
        const spinner = document.getElementById('spinner'); // Reference to the spinner

        // Disable the submit button and show the spinner
        submitButton.disabled = true;
        spinner.style.display = 'flex';

        // Set the timestamp
        const timestamp = new Date().toISOString();
        document.getElementById('timestamp').value = timestamp;

        // Convert all form data to uppercase
        for (let [key, value] of formData.entries()) {
            formData.set(key, value.toUpperCase());
        }

        fetch('https://script.google.com/macros/s/AKfycbwm8qIiM812OEQHmtYsxZ-nBpC0nv6ldGrUOOl-yAppfBC4LkzfPiXw7OG9nQjKn-wc/exec', { // Replace with your Web App URL
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            spinner.style.display = 'none'; // Hide spinner after submission

            if (data.result === 'success') {
                // Show success message and redirect after user clicks OK
                if (confirm('Form submitted successfully! Click OK to go to the Homepage.')) {
                    window.location.href = 'index.html';
                }
            } else {
                // Re-enable the submit button and show error message
                submitButton.disabled = false;
                document.getElementById("message").textContent = `Error: ${data.error}`;
            }
        })
        .catch(error => {
            // Hide spinner in case of error
            spinner.style.display = 'none';

            // Re-enable the submit button and show error message
            submitButton.disabled = false;
            document.getElementById("message").textContent = "Error Submitting Form.";
            console.error("Error:", error);
        });
    });
});
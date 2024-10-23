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
        return rows.reduce((acc, [id, name, password, mobile]) => {
            acc[id.toUpperCase()] = { name, mobile }; // Convert ID to uppercase for case-insensitive matching
            return acc;
        }, {});
    }

    // Store names in a variable for quick access
    let nameLookup = {};

    // Load names on page load
    fetchNames().then(data => {
        nameLookup = data;
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
        const mobile = info.mobile || 'PLEASE CHECK ID';
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

    // Function to convert form data to uppercase
    function convertFormDataToUpperCase(formData) {
        const newFormData = new FormData();
        formData.forEach((value, key) => {
            newFormData.append(key, value.toUpperCase());
        });
        return newFormData;
    }

    // Form submission logic
    document.getElementById("relief-form").addEventListener("submit", function(e) {
        e.preventDefault();

        // Get the values of the date and time fields
        const reliefDate = document.getElementById("relief-date").value;
        const reliefTime = document.getElementById("relief-time").value;

        // fetch properly name and number of LP and ALP
        const lpName = document.getElementById("lp-name-hidden").value;
        const alpName = document.getElementById("alp-name-hidden").value;
        console.log("LP Name:", lpName);
        console.log("ALP Name:", alpName);

        // Combine date and time into the desired format
        const formattedSignOnDateTime = formatDateTime(reliefDate, reliefTime);

        // Log the formatted date-time value for debugging
        console.log("Formatted Sign-On DateTime:", formattedSignOnDateTime);
        
        // Update the value of the sign-on-time input to include both date and time
        document.getElementById("sign-on-time").value = formattedSignOnDateTime;

        // Capture current timestamp in the required format
        const currentTimestamp = formatTimestamp(new Date());
        document.getElementById("timestamp").value = currentTimestamp;

        // Proceed with form submission
        const formData = new FormData(e.target);
        const uppercaseFormData = convertFormDataToUpperCase(formData);
        const submitButton = e.target.querySelector('button[type="submit"]');
        const spinnerContainer = document.getElementById("spinner-container"); // Reference to the spinner

        // Show the spinner
        spinnerContainer.style.display = "block";

        // Disable the submit button
        submitButton.disabled = true;

        fetch('https://script.google.com/macros/s/AKfycbwm8qIiM812OEQHmtYsxZ-nBpC0nv6ldGrUOOl-yAppfBC4LkzfPiXw7OG9nQjKn-wc/exec', { // Replace with your Web App URL
            method: 'POST',
            body: uppercaseFormData
        })
        .then(response => response.json())
        .then(data => {
            spinnerContainer.style.display = 'none'; // Hide spinner after submission

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
            spinnerContainer.style.display = 'none';

            // Re-enable the submit button and show error message
            submitButton.disabled = false;
            document.getElementById("message").textContent = "Error Submitting Form.";
            console.error("Error:", error);
        });
    });

    // Function to format the date and time as "DD/MM/YYYY HH:MM:SS"
    function formatDateTime(date, time) {
        const [year, month, day] = date.split("-");
        
        // Ensure that time does not already include seconds
        if (time.length === 5) {  // If time is in "HH:MM" format
            time += ":00";  // Add seconds only if not present
        }
        
        return `${day}/${month}/${year} ${time}`;  // Format: "DD/MM/YYYY HH:MM:SS"
    }
        
    // Function to format the timestamp as "DD/MM/YYYY HH:MM:SS"
    function formatTimestamp(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
    
        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    }
});
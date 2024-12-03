// Object to store unique passwords for each login ID
const passwords = {
    "DGG": "1575",
    "G": "1593",
    "TMR": "5040",
    "DBEC": "1317",
    "CHCR": "1944",
    "KAV": "2715",
    "SCLN": "1428",
    "CWA": "2213",
    "NIR": "2520",
    "NITR": "1680",
    "NAB": "2331",
    "JESG": "1331"
};

// Function to handle login form submission
document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent form submission

    const loginId = document.getElementById("loginId").value;
    const password = document.getElementById("password").value;

    // Validate the entered password against the stored password
    if (password === passwords[loginId]) {
        // Login successful
        alert(`Welcome ${loginId}! Login successful.`);
        // Redirect to sutra-off.html after successful login
        window.location.href = "sutra-off.html";
    } else {
        // Show error message
        document.getElementById("errorMessage").textContent = "Incorrect password. Try again.";
    }
});

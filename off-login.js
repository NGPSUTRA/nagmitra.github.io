// Object to store unique passwords for each login ID
const passwords = {
    "DGG": "ATCN",
    "G": "ATCN",
    "TMR": "ATCN",
    "DBEC": "ATCN",
    "CHCR": "ATCN",
    "KAV": "ATCN",
    "SCLN": "ATCN",
    "CWA": "ATCN",
    "NIR": "ATCN",
    "NITR": "ATCN",
    "NAB": "ATCN",
    "JESG": "ATCN"
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

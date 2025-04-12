// Authentication related JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Get navigation elements
    var loginRegisterLinks = document.querySelectorAll('.login-register-links');
    var userDropdown = document.querySelector('.user-dropdown');
    var userName = document.getElementById('user-name');
    
    if (currentUser) {
        // User is logged in
        // Hide login/register links
        loginRegisterLinks.forEach(function(link) {
            link.classList.add('d-none');
        });
        
        // Show user dropdown and set name
        if (userDropdown) {
            userDropdown.classList.remove('d-none');
        }
        
        if (userName) {
            userName.textContent = currentUser.name;
        }
    } else {
        // User is not logged in
        // Show login/register links
        loginRegisterLinks.forEach(function(link) {
            link.classList.remove('d-none');
        });
        
        // Hide user dropdown
        if (userDropdown) {
            userDropdown.classList.add('d-none');
        }
    }
});

// Function to handle logout
function logout() {
    // Clear current user from localStorage
    localStorage.removeItem('currentUser');
    
    // Redirect to home page
    window.location.href = 'index.html';
}
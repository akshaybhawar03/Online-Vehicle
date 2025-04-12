// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    })

    // Get URL parameters (for booking page)
    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    // If on booking page and car parameter exists, pre-select the car
    if (window.location.pathname.includes('booking.html')) {
        var carParam = getUrlParameter('car');
        if (carParam) {
            var carSelect = document.getElementById('car-select');
            if (carSelect) {
                for (var i = 0; i < carSelect.options.length; i++) {
                    if (carSelect.options[i].value === carParam) {
                        carSelect.selectedIndex = i;
                        // Trigger change event to update price
                        var event = new Event('change');
                        carSelect.dispatchEvent(event);
                        break;
                    }
                }
            }
        }

        // Calculate rental price based on selected car and duration
        var carSelect = document.getElementById('car-select');
        var pickupDate = document.getElementById('pickup-date');
        var returnDate = document.getElementById('return-date');
        var totalPrice = document.getElementById('total-price');

        function updatePrice() {
            if (carSelect && pickupDate && returnDate && totalPrice) {
                var selectedOption = carSelect.options[carSelect.selectedIndex];
                if (selectedOption && pickupDate.value && returnDate.value) {
                    var pricePerDay = parseFloat(selectedOption.getAttribute('data-price') || 0);
                    var start = new Date(pickupDate.value);
                    var end = new Date(returnDate.value);
                    var days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
                    
                    if (days > 0 && pricePerDay > 0) {
                        var price = days * pricePerDay;
                        totalPrice.textContent = '₹' + price.toLocaleString('en-IN');
                    } else {
                        totalPrice.textContent = 'Please select valid dates';
                    }
                }
            }
        }

        // Add event listeners to update price
        if (carSelect) carSelect.addEventListener('change', updatePrice);
        if (pickupDate) pickupDate.addEventListener('change', updatePrice);
        if (returnDate) returnDate.addEventListener('change', updatePrice);
    }

    // Form validation
    var forms = document.querySelectorAll('.needs-validation');
    Array.prototype.slice.call(forms).forEach(function (form) {
        form.addEventListener('submit', function (event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });

    // Filter cars on cars.html page
    if (window.location.pathname.includes('cars.html')) {
        var filterForm = document.getElementById('filter-form');
        var carCards = document.querySelectorAll('.car-card');

        if (filterForm) {
            filterForm.addEventListener('submit', function(event) {
                event.preventDefault();
                
                var carType = document.getElementById('car-type').value;
                var minPrice = parseFloat(document.getElementById('min-price').value) || 0;
                var maxPrice = parseFloat(document.getElementById('max-price').value) || 1000;
                
                carCards.forEach(function(card) {
                    var cardType = card.getAttribute('data-type');
                    var cardPrice = parseFloat(card.getAttribute('data-price'));
                    
                    var typeMatch = carType === 'all' || cardType === carType;
                    var priceMatch = cardPrice >= minPrice && cardPrice <= maxPrice;
                    
                    if (typeMatch && priceMatch) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        }
    }

    // Admin dashboard charts (if on admin page)
    if (window.location.pathname.includes('admin-dashboard.html')) {
        // Sample data for charts
        var bookingsData = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Bookings',
                data: [65, 59, 80, 81, 56, 55],
                backgroundColor: 'rgba(13, 110, 253, 0.2)',
                borderColor: 'rgba(13, 110, 253, 1)',
                borderWidth: 1
            }]
        };

        var revenueData = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Revenue ($)',
                data: [12500, 11000, 15000, 16000, 10500, 10000],
                backgroundColor: 'rgba(25, 135, 84, 0.2)',
                borderColor: 'rgba(25, 135, 84, 1)',
                borderWidth: 1
            }]
        };

        // If Chart.js is loaded, create charts
        if (typeof Chart !== 'undefined') {
            var bookingsChart = new Chart(
                document.getElementById('bookings-chart'),
                {
                    type: 'bar',
                    data: bookingsData,
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                }
            );

            var revenueChart = new Chart(
                document.getElementById('revenue-chart'),
                {
                    type: 'line',
                    data: revenueData,
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                }
            );
        }
    }
});

// Function to handle login form submission
function handleLogin(event) {
    event.preventDefault();
    
    var email = document.getElementById('login-email').value;
    var password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        alert('Please enter both email and password.');
        return;
    }
    
    // Get stored users from localStorage
    var users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Check if user exists and password matches
    var user = users.find(function(u) { return u.email === email && u.password === password; });
    
    if (user) {
        // Store logged in user info
        localStorage.setItem('currentUser', JSON.stringify({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            isAdmin: user.isAdmin || false
        }));
        
        // Redirect based on user role
        if (user.isAdmin) {
            window.location.href = 'admin-dashboard.html';
        } else {
            // Redirect to home page instead of dashboard
            window.location.href = 'index.html';
        }
    } else {
        alert('Invalid email or password. Please try again.');
    }
}

// Function to handle registration form submission
function handleRegister(event) {
    event.preventDefault();
    
    var name = document.getElementById('register-name').value;
    var email = document.getElementById('register-email').value;
    var phone = document.getElementById('register-phone').value;
    var password = document.getElementById('register-password').value;
    var confirmPassword = document.getElementById('register-confirm-password').value;
    
    // Validate password match
    if (password !== confirmPassword) {
        alert('Passwords do not match. Please try again.');
        return;
    }
    
    // Get stored users from localStorage
    var users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Check if email already exists
    if (users.some(function(user) { return user.email === email; })) {
        alert('Email already registered. Please use a different email.');
        return;
    }
    
    // Add new user
    var newUser = {
        id: 'user' + (users.length + 1),
        name: name,
        email: email,
        phone: phone,
        password: password,
        isAdmin: false,
        createdAt: new Date().toISOString(),
        bookings: []
    };
    
    // Add user to array and save to localStorage
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Send user data to server
    fetch('/api/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser)
    })
    .then(response => response.json())
    .then(data => console.log('User registered on server:', data))
    .catch(error => console.error('Error registering user on server:', error));
    
    // Show success message and redirect to login page
    alert('Registration successful! Please login with your new account.');
    window.location.href = 'login.html';
}
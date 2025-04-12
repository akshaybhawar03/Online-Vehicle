// Booking form handling script

document.addEventListener('DOMContentLoaded', function() {
    // Set minimum date for pickup to today
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
    var yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;
    
    var pickupDateInput = document.getElementById('pickup-date');
    if (pickupDateInput) {
        pickupDateInput.setAttribute('min', today);
    }
    
    // Update summary when car is selected
    var carSelect = document.getElementById('car-select');
    var summaryCar = document.getElementById('summary-car');
    
    if (carSelect && summaryCar) {
        carSelect.addEventListener('change', function() {
            var selectedOption = carSelect.options[carSelect.selectedIndex];
            if (selectedOption && selectedOption.value) {
                summaryCar.textContent = selectedOption.text;
            } else {
                summaryCar.textContent = 'Please select a car';
            }
        });
    }
    
    // Update summary when dates are selected
    var pickupDate = document.getElementById('pickup-date');
    var returnDate = document.getElementById('return-date');
    var summaryDates = document.getElementById('summary-dates');
    
    function updateDateSummary() {
        if (pickupDate && returnDate && summaryDates) {
            if (pickupDate.value && returnDate.value) {
                summaryDates.textContent = 'From ' + formatDate(pickupDate.value) + ' to ' + formatDate(returnDate.value);
            } else {
                summaryDates.textContent = 'Please select dates';
            }
        }
    }
    
    if (pickupDate) pickupDate.addEventListener('change', updateDateSummary);
    if (returnDate) returnDate.addEventListener('change', updateDateSummary);
    
    // Format date for display
    function formatDate(dateString) {
        var options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }
    
    // Set return date min value when pickup date changes
    if (pickupDate && returnDate) {
        pickupDate.addEventListener('change', function() {
            returnDate.setAttribute('min', pickupDate.value);
            if (returnDate.value && new Date(returnDate.value) < new Date(pickupDate.value)) {
                returnDate.value = pickupDate.value;
            }
        });
    }
    
    // Handle booking form submission
    var bookingForm = document.getElementById('booking-form');
    
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            if (!bookingForm.checkValidity()) {
                event.stopPropagation();
                bookingForm.classList.add('was-validated');
                return;
            }
            
            // Get current user from localStorage
            var currentUser = JSON.parse(localStorage.getItem('currentUser'));
            
            if (!currentUser) {
                alert('Please login to complete your booking.');
                window.location.href = 'login.html';
                return;
            }
            
            // Get form data
            var carId = document.getElementById('car-select').value;
            var pickupDate = document.getElementById('pickup-date').value;
            var returnDate = document.getElementById('return-date').value;
            var fullName = document.getElementById('full-name').value;
            var email = document.getElementById('email').value;
            var phone = document.getElementById('phone').value;
            
            // Calculate total price
            var selectedOption = document.getElementById('car-select').options[document.getElementById('car-select').selectedIndex];
            var pricePerDay = parseFloat(selectedOption.getAttribute('data-price') || 0);
            var start = new Date(pickupDate);
            var end = new Date(returnDate);
            var days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            var totalAmount = days * pricePerDay;
            
            // Create booking object
            var booking = {
                id: 'BK' + Math.floor(Math.random() * 10000).toString().padStart(3, '0'),
                userId: currentUser.id,
                carId: carId,
                pickupDate: pickupDate,
                returnDate: returnDate,
                status: 'pending',
                totalAmount: totalAmount,
                paymentStatus: 'pending',
                createdAt: new Date().toISOString()
            };
            
            // Save booking to localStorage for demo purposes
            // Also send to server for persistence
            var bookings = JSON.parse(localStorage.getItem('bookings')) || [];
            bookings.push(booking);
            localStorage.setItem('bookings', JSON.stringify(bookings));
            
            // Send booking to server
            fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(booking)
            })
            .then(response => response.json())
            .then(data => console.log('Booking saved to server:', data))
            .catch(error => console.error('Error saving booking to server:', error));
            
            // Update user's bookings
            var users = JSON.parse(localStorage.getItem('users')) || [];
            var userIndex = users.findIndex(function(u) { return u.id === currentUser.id; });
            
            if (userIndex !== -1) {
                if (!users[userIndex].bookings) {
                    users[userIndex].bookings = [];
                }
                users[userIndex].bookings.push(booking.id);
                localStorage.setItem('users', JSON.stringify(users));
            }
            
            // Show success message and redirect
            alert('Booking successful! Your booking ID is ' + booking.id);
            window.location.href = 'index.html';
        });
    }
});
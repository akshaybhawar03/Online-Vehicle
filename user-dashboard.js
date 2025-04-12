// User Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        // Redirect to login page if not logged in
        window.location.href = 'login.html';
        return;
    }
    
    // Set user name in the navigation
    document.getElementById('user-name').textContent = currentUser.name;
    
    // Load user profile information
    loadUserProfile(currentUser.id);
    
    // Load user bookings
    loadUserBookings(currentUser.id);
    
    // Load booked cars
    loadBookedCars(currentUser.id);
    
    // Load user car listings
    loadUserCarListings(currentUser.id);
});

// Function to load user profile information
function loadUserProfile(userId) {
    // Get user details
    var user = getUserById(userId);
    
    if (user) {
        // Set profile information
        document.getElementById('profile-name').textContent = user.name;
        document.getElementById('profile-email').textContent = user.email;
        document.getElementById('profile-phone').textContent = user.phone;
        
        // Format and set creation date
        var createdDate = new Date(user.createdAt);
        document.getElementById('profile-created').textContent = createdDate.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Get user bookings
        var bookings = getUserBookings(userId);
        
        // Set booking counts
        document.getElementById('total-bookings').textContent = bookings.length;
        
        // Count active bookings
        var activeBookings = bookings.filter(function(booking) {
            return booking.status === 'active' || booking.status === 'pending' || booking.status === 'reserved';
        });
        
        document.getElementById('active-bookings').textContent = activeBookings.length;
    }
}

// Function to load user bookings
function loadUserBookings(userId) {
    var bookings = getUserBookings(userId);
    var tableBody = document.getElementById('bookings-table-body');
    
    // Clear existing content
    tableBody.innerHTML = '';
    
    if (bookings.length === 0) {
        // Display message if no bookings
        var row = document.createElement('tr');
        row.innerHTML = '<td colspan="7" class="text-center">No bookings found.</td>';
        tableBody.appendChild(row);
        return;
    }
    
    // Sort bookings by date (newest first)
    bookings.sort(function(a, b) {
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    // Add each booking to the table
    bookings.forEach(function(booking) {
        var car = getCarById(booking.carId);
        var row = document.createElement('tr');
        
        // Format dates
        var pickupDate = new Date(booking.pickupDate).toLocaleDateString('en-IN');
        var returnDate = new Date(booking.returnDate).toLocaleDateString('en-IN');
        
        // Format amount in Indian Rupees
        var formattedAmount = '₹' + booking.totalAmount.toLocaleString('en-IN');
        
        // Set status class
        var statusClass = '';
        switch(booking.status) {
            case 'active':
                statusClass = 'bg-success';
                break;
            case 'pending':
                statusClass = 'bg-warning';
                break;
            case 'completed':
                statusClass = 'bg-info';
                break;
            case 'cancelled':
                statusClass = 'bg-danger';
                break;
            case 'reserved':
                statusClass = 'bg-primary';
                break;
        }
        
        // Create row content
        row.innerHTML = `
            <td>${booking.id}</td>
            <td>${car ? car.name : 'Unknown Car'}</td>
            <td>${pickupDate}</td>
            <td>${returnDate}</td>
            <td>${formattedAmount}</td>
            <td><span class="badge ${statusClass}">${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="viewBookingDetails('${booking.id}')">View</button>
                ${booking.status === 'pending' || booking.status === 'reserved' ? 
                    `<button class="btn btn-sm btn-outline-danger ms-1" onclick="cancelBooking('${booking.id}')">Cancel</button>` : ''}
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Function to load booked cars
function loadBookedCars(userId) {
    var bookings = getUserBookings(userId);
    var container = document.getElementById('booked-cars-container');
    
    // Clear existing content
    container.innerHTML = '';
    
    // Add a "Book New Car" button at the top
    var bookNewSection = document.createElement('div');
    bookNewSection.className = 'col-12 mb-4';
    bookNewSection.innerHTML = `
        <div class="card dashboard-card">
            <div class="card-body text-center">
                <h5 class="card-title"><i class="fas fa-plus-circle me-2"></i>Want to book a new car?</h5>
                <p class="card-text">Explore our wide range of vehicles and find your perfect ride.</p>
                <a href="booking.html" class="btn btn-primary">Book Now</a>
            </div>
        </div>
    `;
    container.appendChild(bookNewSection);
    
    if (bookings.length === 0) {
        // Display message if no bookings
        var noBookingsDiv = document.createElement('div');
        noBookingsDiv.className = 'col-12 text-center mt-4';
        noBookingsDiv.innerHTML = '<div class="alert alert-info"><i class="fas fa-info-circle me-2"></i>No booked cars found. Book your first car now!</div>';
        container.appendChild(noBookingsDiv);
        return;
    }
    
    // Add section title for active bookings
    var sectionTitle = document.createElement('div');
    sectionTitle.className = 'col-12 mt-4 mb-3';
    sectionTitle.innerHTML = '<h4><i class="fas fa-car me-2"></i>Your Current Bookings</h4>';
    container.appendChild(sectionTitle);
    
    // Get active bookings
    var activeBookings = bookings.filter(function(booking) {
        return booking.status === 'active' || booking.status === 'pending' || booking.status === 'reserved';
    });
    
    if (activeBookings.length === 0) {
        // Display message if no active bookings
        var noActiveDiv = document.createElement('div');
        noActiveDiv.className = 'col-12 text-center';
        noActiveDiv.innerHTML = '<div class="alert alert-info"><i class="fas fa-info-circle me-2"></i>No currently active bookings.</div>';
        container.appendChild(noActiveDiv);
    } else {
        // Add each active booked car to the container
        activeBookings.forEach(function(booking) {
            var car = getCarById(booking.carId);
            
            if (!car) return;
            
            // Format dates
            var pickupDate = new Date(booking.pickupDate).toLocaleDateString('en-IN');
            var returnDate = new Date(booking.returnDate).toLocaleDateString('en-IN');
            
            // Format amount in Indian Rupees
            var formattedAmount = '₹' + booking.totalAmount.toLocaleString('en-IN');
            
            // Create car card
            var carCard = document.createElement('div');
            carCard.className = 'col-md-4 mb-4';
            
            // Calculate rental duration in days
            var start = new Date(booking.pickupDate);
            var end = new Date(booking.returnDate);
            var days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            
            // Get payment status badge
            var paymentBadge = booking.paymentStatus === 'paid' ? 
                '<span class="badge bg-success"><i class="fas fa-check-circle me-1"></i>Paid</span>' : 
                '<span class="badge bg-warning"><i class="fas fa-clock me-1"></i>Pending</span>';
            
            carCard.innerHTML = `
                <div class="card dashboard-card car-booking-card h-100" onclick="viewBookingDetails('${booking.id}')">
                    <div class="position-relative">
                        <img src="images/${car.image}" class="card-img-top" alt="${car.name}">
                        <span class="position-absolute top-0 end-0 badge ${booking.status === 'active' ? 'bg-success' : booking.status === 'pending' ? 'bg-warning' : booking.status === 'reserved' ? 'bg-primary' : 'bg-secondary'} m-2">
                            ${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                        <div class="position-absolute bottom-0 start-0 m-2">
                            <span class="badge bg-dark">${car.type.charAt(0).toUpperCase() + car.type.slice(1)}</span>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h5 class="card-title mb-0">${car.name}</h5>
                            ${paymentBadge}
                        </div>
                        <div class="car-features mb-3">
                            <span class="badge bg-primary me-2"><i class="fas fa-user me-1"></i> ${car.seats} Seats</span>
                            <span class="badge bg-primary me-2"><i class="fas fa-suitcase me-1"></i> ${car.bags} Bags</span>
                            <span class="badge bg-primary"><i class="fas fa-gas-pump me-1"></i> ${car.fuelType}</span>
                        </div>
                        <div class="booking-details">
                            <div class="row mb-2">
                                <div class="col-6">
                                    <p class="card-text small mb-0"><i class="fas fa-calendar-alt text-primary me-1"></i> <strong>Pickup:</strong></p>
                                    <p class="card-text">${pickupDate}</p>
                                </div>
                                <div class="col-6">
                                    <p class="card-text small mb-0"><i class="fas fa-calendar-check text-primary me-1"></i> <strong>Return:</strong></p>
                                    <p class="card-text">${returnDate}</p>
                                </div>
                            </div>
                            <p class="card-text"><i class="fas fa-clock text-primary me-1"></i> <strong>Duration:</strong> ${days} day${days !== 1 ? 's' : ''}</p>
                            <p class="card-text"><i class="fas fa-tag text-primary me-1"></i> <strong>Booking ID:</strong> ${booking.id}</p>
                            <p class="card-text"><i class="fas fa-rupee-sign text-primary me-1"></i> <strong>Total:</strong> ${formattedAmount}</p>
                        </div>
                        <p class="card-text small text-muted mt-2"><i class="fas fa-clock me-1"></i> Booked on: ${new Date(booking.createdAt).toLocaleDateString('en-IN', {year: 'numeric', month: 'long', day: 'numeric'})}</p>
                    </div>
                    <div class="card-footer bg-transparent border-top-0 text-center">
                        <button class="btn btn-sm btn-outline-primary" onclick="event.stopPropagation(); viewBookingDetails('${booking.id}')"><i class="fas fa-info-circle me-1"></i>View Details</button>
                        ${booking.status === 'pending' || booking.status === 'reserved' ? 
                            `<button class="btn btn-sm btn-outline-danger ms-1" onclick="event.stopPropagation(); cancelBooking('${booking.id}')"><i class="fas fa-ban me-1"></i>Cancel</button>` : ''}
                    </div>
                </div>
            `;
            
            container.appendChild(carCard);
        });
    }
}

// Function to view booking details
function viewBookingDetails(bookingId) {
    // Get booking details
    var bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    var booking = bookings.find(function(b) { return b.id === bookingId; });
    
    if (!booking) {
        alert('Booking not found.');
        return;
    }
    
    var car = getCarById(booking.carId);
    
    // Format dates
    var pickupDate = new Date(booking.pickupDate).toLocaleDateString('en-IN');
    var returnDate = new Date(booking.returnDate).toLocaleDateString('en-IN');
    var createdDate = new Date(booking.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Format amount in Indian Rupees
    var formattedAmount = '₹' + booking.totalAmount.toLocaleString('en-IN');
    var dailyRate = car ? '₹' + car.price.toLocaleString('en-IN') : 'Unknown';
    
    // Calculate rental duration in days
    var start = new Date(booking.pickupDate);
    var end = new Date(booking.returnDate);
    var days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    // Get status badge class
    var statusBadgeClass = '';
    switch(booking.status) {
        case 'active':
            statusBadgeClass = 'bg-success';
            break;
        case 'pending':
            statusBadgeClass = 'bg-warning';
            break;
        case 'completed':
            statusBadgeClass = 'bg-info';
            break;
        case 'cancelled':
            statusBadgeClass = 'bg-danger';
            break;
        case 'reserved':
            statusBadgeClass = 'bg-primary';
            break;
        default:
            statusBadgeClass = 'bg-secondary';
    }
    
    // Create modal content with enhanced car details
    var modalContent = `
        <div class="modal fade" id="bookingDetailsModal" tabindex="-1" aria-labelledby="bookingDetailsModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header ${statusBadgeClass} text-white">
                        <h5 class="modal-title" id="bookingDetailsModalLabel">
                            <i class="fas fa-bookmark me-2"></i>Booking Details: ${booking.id}
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="alert ${statusBadgeClass} text-white">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <i class="fas fa-info-circle me-2"></i>
                                    <strong>Status:</strong> ${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                </div>
                                <div>
                                    <strong>Payment:</strong> ${booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                                </div>
                            </div>
                        </div>
                        
                        <div class="row mb-4">
                            <div class="col-md-5">
                                <div class="position-relative">
                                    ${car ? `<img src="images/${car.image}" class="img-fluid rounded shadow" alt="${car.name}">` : ''}
                                    <span class="position-absolute bottom-0 start-0 badge bg-dark m-2">${car ? car.type.charAt(0).toUpperCase() + car.type.slice(1) : 'Unknown'}</span>
                                </div>
                            </div>
                            <div class="col-md-7">
                                <h4 class="mb-3">${car ? car.name : 'Unknown Car'}</h4>
                                <div class="car-features mb-3">
                                    <span class="badge bg-primary me-2"><i class="fas fa-user me-1"></i> ${car ? car.seats : '0'} Seats</span>
                                    <span class="badge bg-primary me-2"><i class="fas fa-suitcase me-1"></i> ${car ? car.bags : '0'} Bags</span>
                                    <span class="badge bg-primary"><i class="fas fa-gas-pump me-1"></i> ${car ? car.fuelType : 'Unknown'}</span>
                                </div>
                                <p>${car ? car.description : 'No description available'}</p>
                                <div class="d-flex justify-content-between align-items-center mt-3">
                                    <div>
                                        <span class="badge bg-success fs-6">${dailyRate}/day</span>
                                    </div>
                                    <div>
                                        <span class="badge bg-dark fs-6"><i class="fas fa-calendar-day me-1"></i> ${days} day${days !== 1 ? 's' : ''}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="card mb-3 shadow-sm">
                                    <div class="card-header bg-light">
                                        <h6 class="mb-0"><i class="fas fa-car me-2"></i>Car Information</h6>
                                    </div>
                                    <div class="card-body">
                                        <p><strong>Car Type:</strong> ${car ? car.type.charAt(0).toUpperCase() + car.type.slice(1) : 'Unknown'}</p>
                                        <p><strong>Daily Rate:</strong> ${dailyRate}/day</p>
                                        <p><strong>Seats:</strong> ${car ? car.seats : '0'}</p>
                                        <p><strong>Luggage Capacity:</strong> ${car ? car.bags : '0'} bags</p>
                                        <p><strong>Fuel Type:</strong> ${car ? car.fuelType : 'Unknown'}</p>
                                        <p><strong>Features:</strong></p>
                                        <ul class="list-group list-group-flush">
                                            ${car ? car.features.map(feature => `<li class="list-group-item"><i class="fas fa-check-circle text-success me-2"></i>${feature}</li>`).join('') : '<li class="list-group-item">No features available</li>'}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="card mb-3 shadow-sm">
                                    <div class="card-header bg-light">
                                        <h6 class="mb-0"><i class="fas fa-calendar-check me-2"></i>Booking Information</h6>
                                    </div>
                                    <div class="card-body">
                                        <div class="row mb-3">
                                            <div class="col-6">
                                                <div class="card bg-light">
                                                    <div class="card-body p-2 text-center">
                                                        <p class="small mb-0"><i class="fas fa-calendar-alt text-primary me-1"></i> <strong>Pickup Date</strong></p>
                                                        <p class="mb-0 fw-bold">${pickupDate}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="col-6">
                                                <div class="card bg-light">
                                                    <div class="card-body p-2 text-center">
                                                        <p class="small mb-0"><i class="fas fa-calendar-check text-primary me-1"></i> <strong>Return Date</strong></p>
                                                        <p class="mb-0 fw-bold">${returnDate}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <p><strong>Booking ID:</strong> ${booking.id}</p>
                                        <p><strong>Total Amount:</strong> ${formattedAmount}</p>
                                        <p><strong>Booking Date:</strong> ${createdDate}</p>
                                        <p><strong>Payment Status:</strong> ${booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"><i class="fas fa-times me-2"></i>Close</button>
                        ${booking.status === 'pending' || booking.status === 'reserved' ? 
                            `<button type="button" class="btn btn-danger" onclick="cancelBooking('${booking.id}'); document.getElementById('bookingDetailsModal').querySelector('.btn-close').click();"><i class="fas fa-ban me-2"></i>Cancel Booking</button>` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to the document
    var modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalContent;
    document.body.appendChild(modalContainer.firstChild);
    
    // Show the modal
    var modal = new bootstrap.Modal(document.getElementById('bookingDetailsModal'));
    modal.show();
    
    // Remove modal from DOM when hidden
    document.getElementById('bookingDetailsModal').addEventListener('hidden.bs.modal', function() {
        document.getElementById('bookingDetailsModal').remove();
    });
}

// Function to cancel a booking
function cancelBooking(bookingId) {
    if (confirm('Are you sure you want to cancel this booking?')) {
        // Get bookings from localStorage
        var bookings = JSON.parse(localStorage.getItem('bookings')) || [];
        
        // Find the booking to cancel
        var bookingIndex = bookings.findIndex(function(booking) {
            return booking.id === bookingId;
        });
        
        if (bookingIndex !== -1) {
            // Update booking status to cancelled
            bookings[bookingIndex].status = 'cancelled';
            
            // Save updated bookings back to localStorage
            localStorage.setItem('bookings', JSON.stringify(bookings));
            
            // Reload bookings display
            loadUserBookings(JSON.parse(localStorage.getItem('currentUser')).id);
            
            alert('Booking cancelled successfully!');
        }
    }
}

// Function to load user's car listings
function loadUserCarListings(userId) {
    // Get car listings from localStorage
    var listings = getCarListingsBySeller(userId);
    var listingsContainer = document.getElementById('my-listings-container');
    
    if (listingsContainer) {
        // Clear container
        listingsContainer.innerHTML = '';
        
        if (listings.length === 0) {
            // No listings message
            listingsContainer.innerHTML = '<div class="col-12"><div class="alert alert-info">You have no car listings. <a href="sell-car.html">Add a new listing</a>.</div></div>';
            return;
        }
        
        // Add each listing to the container
        listings.forEach(function(listing) {
            var statusBadge = '';
            if (listing.status === 'active') {
                statusBadge = '<span class="badge bg-success">Active</span>';
            } else if (listing.status === 'sold') {
                statusBadge = '<span class="badge bg-primary">Sold</span>';
            } else {
                statusBadge = '<span class="badge bg-secondary">Inactive</span>';
            }
            
            var listingCard = document.createElement('div');
            listingCard.className = 'col-md-6 mb-4';
            listingCard.innerHTML = `
                <div class="card h-100">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">${listing.name} (${listing.year})</h5>
                        ${statusBadge}
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-5">
                                <img src="images/${listing.image}" class="img-fluid rounded" alt="${listing.name}" onerror="this.src='images/car1.jpg'">
                            </div>
                            <div class="col-md-7">
                                <p><strong>Price:</strong> ₹${listing.price.toLocaleString('en-IN')}</p>
                                <p><strong>Type:</strong> ${listing.type.charAt(0).toUpperCase() + listing.type.slice(1)}</p>
                                <p><strong>Fuel:</strong> ${listing.fuelType}</p>
                                <p><strong>Kilometers:</strong> ${listing.kilometers.toLocaleString('en-IN')} km</p>
                                <p><strong>Listed on:</strong> ${new Date(listing.listingDate).toLocaleDateString('en-IN')}</p>
                            </div>
                        </div>
                        <div class="mt-3">
                            <p><strong>Description:</strong></p>
                            <p>${listing.description}</p>
                        </div>
                        <div class="mt-2">
                            <p><strong>Features:</strong></p>
                            <p>${listing.features.join(', ') || 'No features specified'}</p>
                        </div>
                    </div>
                    <div class="card-footer">
                        <div class="d-flex justify-content-between">
                            <div>
                                <button class="btn btn-sm btn-outline-primary" onclick="editCarListing('${listing.id}')"><i class="fas fa-edit me-1"></i>Edit</button>
                                <button class="btn btn-sm btn-outline-danger ms-1" onclick="deleteCarListing('${listing.id}')"><i class="fas fa-trash me-1"></i>Delete</button>
                            </div>
                            <div>
                                ${listing.status === 'active' ? 
                                    `<button class="btn btn-sm btn-outline-success" onclick="updateCarListingStatus('${listing.id}', 'sold')"><i class="fas fa-check-circle me-1"></i>Mark as Sold</button>` : 
                                    listing.status === 'sold' ?
                                    `<button class="btn btn-sm btn-outline-warning" onclick="updateCarListingStatus('${listing.id}', 'active')"><i class="fas fa-undo me-1"></i>Unsell</button>` :
                                    `<button class="btn btn-sm btn-outline-secondary" onclick="updateCarListingStatus('${listing.id}', 'active')"><i class="fas fa-redo me-1"></i>Reactivate</button>`
                                }
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            listingsContainer.appendChild(listingCard);
        });
    }
}

// Function to edit a car listing
function editCarListing(listingId) {
    // Redirect to sell-car.html with the listing ID as a parameter
    // In a real application, you would load the listing data into the form
    alert('Edit functionality would be implemented in a real application.');
    // window.location.href = 'sell-car.html?edit=' + listingId;
}

// Function to delete a car listing
function deleteCarListing(listingId) {
    if (confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
        // Call the delete function from car-selling.js
        var success = deleteCarListingFromStorage(listingId);
        
        if (success) {
            // Reload the listings
            loadUserCarListings(JSON.parse(localStorage.getItem('currentUser')).id);
            alert('Listing deleted successfully!');
        } else {
            alert('Failed to delete listing. Please try again.');
        }
    }
}

// Function to update a car listing status
function updateCarListingStatus(listingId, newStatus) {
    // Get existing listings
    let listings = JSON.parse(localStorage.getItem('cars-for-sale')) || [];
    
    // Find and update the listing
    const listingIndex = listings.findIndex(listing => listing.id === listingId);
    
    var success = false;
    if (listingIndex !== -1) {
        listings[listingIndex].status = newStatus;
        
        // Save back to localStorage
        localStorage.setItem('cars-for-sale', JSON.stringify(listings));
        success = true;
    }
    
    if (success) {
        // Reload the listings
        loadUserCarListings(JSON.parse(localStorage.getItem('currentUser')).id);
        
        // Show appropriate message based on the status change
        if (newStatus === 'sold') {
            alert('Car marked as sold successfully!');
        } else if (newStatus === 'active') {
            alert('Car listing reactivated successfully!');
        } else {
            alert('Listing status updated successfully!');
        }
    } else {
        alert('Failed to update listing status. Please try again.');
    }
}

// Function to handle logout
function logout() {
    // Clear current user from localStorage
    localStorage.removeItem('currentUser');
    
    // Redirect to home page
    window.location.href = 'index.html';
}


// Function to delete a car listing from storage
function deleteCarListingFromStorage(listingId) {
    // Call the deleteCarListing function from car-selling.js
    // The deleteCarListing function is already defined in car-selling.js and available globally
    return deleteCarListing(listingId);
}
// JavaScript for car selling functionality

document.addEventListener('DOMContentLoaded', function() {
    // Check if cars-for-sale exists in localStorage, if not initialize it
    if (!localStorage.getItem('cars-for-sale')) {
        localStorage.setItem('cars-for-sale', JSON.stringify([]));
    }

    // If on sell-car page, initialize the form
    if (window.location.pathname.includes('sell-car.html')) {
        // Set min and max year values for the year input
        const currentYear = new Date().getFullYear();
        const yearInput = document.getElementById('car-year');
        if (yearInput) {
            yearInput.setAttribute('max', currentYear.toString());
        }
    }
    
    // If on cars.html page, load cars for sale section
    if (window.location.pathname.includes('cars.html')) {
        loadCarsForSale();
    }
});

// Function to handle car selling form submission
function handleCarSelling(event) {
    event.preventDefault();
    
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('Please login to list your car for sale.');
        window.location.href = 'login.html';
        return;
    }
    
    // Get form values
    const carName = document.getElementById('car-name').value;
    const carType = document.getElementById('car-type').value;
    const carPrice = document.getElementById('car-price').value;
    const carYear = document.getElementById('car-year').value;
    const carFuel = document.getElementById('car-fuel').value;
    const carKm = document.getElementById('car-km').value;
    const carDescription = document.getElementById('car-description').value;
    const contactInfo = document.getElementById('contact-info').value;
    
    // Get selected features
    const features = [];
    if (document.getElementById('feature-ac').checked) features.push('Air Conditioning');
    if (document.getElementById('feature-power-steering').checked) features.push('Power Steering');
    if (document.getElementById('feature-airbags').checked) features.push('Airbags');
    if (document.getElementById('feature-abs').checked) features.push('ABS');
    if (document.getElementById('feature-music').checked) features.push('Music System');
    if (document.getElementById('feature-bluetooth').checked) features.push('Bluetooth');
    
    // Handle image upload (in a real app, this would upload to a server)
    const imageInput = document.getElementById('car-image');
    let imageName = 'default-car.jpg';
    
    if (imageInput.files && imageInput.files[0]) {
        // In a real application, you would upload this file to a server
        // For this demo, we'll just use the file name
        imageName = imageInput.files[0].name;
    }
    
    // Create car listing object
    const carListing = {
        id: 'car-' + Date.now(), // Generate a unique ID
        name: carName,
        type: carType,
        price: parseInt(carPrice),
        year: parseInt(carYear),
        fuelType: carFuel,
        kilometers: parseInt(carKm),
        description: carDescription,
        features: features,
        image: imageName,
        contactInfo: contactInfo,
        sellerId: currentUser.id,
        sellerName: currentUser.name,
        listingDate: new Date().toISOString(),
        status: 'active'
    };
    
    // Save to localStorage
    saveCarListing(carListing);
    
    // Show success message and redirect
    alert('Your car has been listed for sale successfully!');
    window.location.href = 'user-dashboard.html';
}

// Function to save car listing to localStorage
function saveCarListing(carListing) {
    // Get existing listings
    const listings = JSON.parse(localStorage.getItem('cars-for-sale')) || [];
    
    // Add new listing
    listings.push(carListing);
    
    // Save back to localStorage
    localStorage.setItem('cars-for-sale', JSON.stringify(listings));
    
    return true;
}

// Function to get all car listings
function getAllCarListings() {
    return JSON.parse(localStorage.getItem('cars-for-sale')) || [];
}

// Function to get car listings by seller ID
function getCarListingsBySeller(sellerId) {
    const listings = getAllCarListings();
    return listings.filter(listing => listing.sellerId === sellerId);
}

// Function to delete a car listing
function deleteCarListing(listingId) {
    // Get existing listings
    let listings = JSON.parse(localStorage.getItem('cars-for-sale')) || [];
    
    // Filter out the listing to delete
    listings = listings.filter(listing => listing.id !== listingId);
    
    // Save back to localStorage
    localStorage.setItem('cars-for-sale', JSON.stringify(listings));
    
    return true;
}

// Function to delete a car listing with confirmation
function deleteCarListingWithConfirmation(listingId) {
    if (confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
        // Delete the listing
        const success = deleteCarListing(listingId);
        
        if (success) {
            // Close the modal
            document.getElementById('carListingModal').querySelector('.btn-close').click();
            
            // Reload the page to reflect changes
            setTimeout(() => {
                window.location.reload();
            }, 500);
            
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
    
    if (listingIndex !== -1) {
        listings[listingIndex].status = newStatus;
        
        // Save back to localStorage
        localStorage.setItem('cars-for-sale', JSON.stringify(listings));
        return true;
    }
    
    return false;
}

// Function to get car listing by ID
function getCarListingById(listingId) {
    const listings = getAllCarListings();
    return listings.find(listing => listing.id === listingId);
}

// Function to get active car listings
function getActiveCarListings() {
    const listings = getAllCarListings();
    return listings.filter(listing => listing.status === 'active');
}

// Function to load cars for sale on the cars.html page
function loadCarsForSale() {
    // Get container element
    const container = document.querySelector('.container .row');
    if (!container) return;
    
    // Get active car listings
    const listings = getActiveCarListings();
    
    if (listings.length === 0) return; // No listings to display
    
    // Create section title
    const sectionTitle = document.createElement('div');
    sectionTitle.className = 'col-md-12 mt-5';
    sectionTitle.innerHTML = `
        <h2 class="text-center mb-4">Cars For Sale</h2>
        <p class="text-center mb-4">Browse cars listed by our users. Contact the seller directly for inquiries.</p>
        <hr class="mb-4">
    `;
    
    // Add section title after the existing content
    container.appendChild(sectionTitle);
    
    // Create row for car listings
    const listingsRow = document.createElement('div');
    listingsRow.className = 'row';
    
    // Add each car listing
    listings.forEach(listing => {
        const listingCard = document.createElement('div');
        listingCard.className = 'col-md-4 mb-4';
        listingCard.innerHTML = `
            <div class="card car-card h-100" data-type="${listing.type}" data-price="${listing.price}">
                <div class="position-relative">
                    <img src="images/${listing.image}" class="card-img-top" alt="${listing.name}" onerror="this.src='images/car1.jpg'">
                    <span class="position-absolute top-0 start-0 badge bg-warning m-2">For Sale</span>
                </div>
                <div class="card-body">
                    <h3 class="card-title">${listing.name} (${listing.year})</h3>
                    <div class="car-features mb-3">
                        <span class="badge bg-primary me-2"><i class="fas fa-car me-1"></i> ${listing.type.charAt(0).toUpperCase() + listing.type.slice(1)}</span>
                        <span class="badge bg-primary me-2"><i class="fas fa-gas-pump me-1"></i> ${listing.fuelType}</span>
                        <span class="badge bg-primary"><i class="fas fa-tachometer-alt me-1"></i> ${listing.kilometers.toLocaleString('en-IN')} km</span>
                    </div>
                    <p class="card-text">${listing.description.substring(0, 100)}${listing.description.length > 100 ? '...' : ''}</p>
                    <p class="mb-2"><strong>Features:</strong> ${listing.features.join(', ') || 'No features specified'}</p>
                    <p class="mb-2"><strong>Seller:</strong> ${listing.sellerName}</p>
                    <p class="mb-2"><strong>Listed on:</strong> ${new Date(listing.listingDate).toLocaleDateString('en-IN')}</p>
                    <div class="d-flex justify-content-between align-items-center mt-3">
                        <p class="price mb-0">₹${listing.price.toLocaleString('en-IN')}</p>
                        <button class="btn btn-outline-primary" onclick="viewCarListingDetails('${listing.id}')">View Details</button>
                    </div>
                </div>
            </div>
        `;
        
        listingsRow.appendChild(listingCard);
    });
    
    // Add listings row to container
    container.appendChild(listingsRow);
}

// Function to view car listing details
function viewCarListingDetails(listingId) {
    // Get listing details
    const listing = getCarListingById(listingId);
    
    if (!listing) {
        alert('Listing not found.');
        return;
    }
    
    // Check if current user is the owner of this listing
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const isOwner = currentUser && currentUser.id === listing.sellerId;
    
    // Create modal content
    const modalContent = `
        <div class="modal fade" id="carListingModal" tabindex="-1" aria-labelledby="carListingModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title" id="carListingModalLabel">${listing.name} (${listing.year})</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row mb-4">
                            <div class="col-md-6">
                                <img src="images/${listing.image}" class="img-fluid rounded" alt="${listing.name}" onerror="this.src='images/car1.jpg'">
                            </div>
                            <div class="col-md-6">
                                <h4 class="mb-3">${listing.name} (${listing.year})</h4>
                                <p class="price h5 text-primary mb-3">₹${listing.price.toLocaleString('en-IN')}</p>
                                <div class="car-features mb-3">
                                    <span class="badge bg-primary me-2"><i class="fas fa-car me-1"></i> ${listing.type.charAt(0).toUpperCase() + listing.type.slice(1)}</span>
                                    <span class="badge bg-primary me-2"><i class="fas fa-gas-pump me-1"></i> ${listing.fuelType}</span>
                                    <span class="badge bg-primary"><i class="fas fa-tachometer-alt me-1"></i> ${listing.kilometers.toLocaleString('en-IN')} km</span>
                                </div>
                                <p><strong>Seller:</strong> ${listing.sellerName}</p>
                                <p><strong>Listed on:</strong> ${new Date(listing.listingDate).toLocaleDateString('en-IN')}</p>
                                <p><strong>Contact:</strong> ${listing.contactInfo}</p>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-12">
                                <h5>Description</h5>
                                <p>${listing.description}</p>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-12">
                                <h5>Features</h5>
                                <ul class="list-group list-group-flush">
                                    ${listing.features.map(feature => `<li class="list-group-item"><i class="fas fa-check-circle text-success me-2"></i>${feature}</li>`).join('') || '<li class="list-group-item">No features specified</li>'}
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <div class="d-flex justify-content-between w-100">
                            <div>
                                ${isOwner ? `<button type="button" class="btn btn-danger" onclick="deleteCarListingWithConfirmation('${listing.id}')"><i class="fas fa-trash me-2"></i>Delete Listing</button>` : ''}
                            </div>
                            <div>
                                <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">Close</button>
                                <a href="mailto:${listing.contactInfo}" class="btn btn-primary"><i class="fas fa-envelope me-2"></i>Contact Seller</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to the document
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalContent;
    document.body.appendChild(modalContainer.firstChild);
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('carListingModal'));
    modal.show();
    
    // Remove modal from DOM when hidden
    document.getElementById('carListingModal').addEventListener('hidden.bs.modal', function() {
        document.getElementById('carListingModal').remove();
    });
}
// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const button = document.querySelector('button');
const gallery = document.getElementById('gallery');

// NASA API configuration
const API_KEY = window.CONFIG?.NASA_API_KEY || 'DEMO_KEY';
const BASE_URL = window.CONFIG?.BASE_URL || 'https://api.nasa.gov/planetary/apod';

// Call the setupDateInputs function from dateRange.js
setupDateInputs(startInput, endInput);

// Random space facts for LevelUp feature
const spaceFacts = [
  "A day on Venus is longer than its year - it takes 243 Earth days to rotate once but only 225 Earth days to orbit the Sun!",
  "One teaspoon of neutron star material would weigh about 6 billion tons on Earth.",
  "The Milky Way galaxy is on a collision course with the Andromeda galaxy, but don't worry - it won't happen for about 4.5 billion years!",
  "Jupiter's Great Red Spot is a storm that has been raging for at least 400 years and is twice the size of Earth.",
  "Saturn's moon Titan has lakes and rivers of liquid methane and ethane instead of water.",
  "The footprints left by Apollo astronauts on the Moon will last for millions of years due to the lack of atmosphere.",
  "If you could drive a car to the Sun at highway speeds, it would take you over 100 years to get there.",
  "The International Space Station travels at 17,500 mph and orbits Earth every 90 minutes.",
  "A single bolt of lightning is five times hotter than the surface of the Sun.",
  "There are more possible games of chess than there are atoms in the observable universe!"
];

// Display random space fact
function displayRandomSpaceFact() {
  // Remove existing fact if it exists
  const existingFact = document.querySelector('.space-fact');
  if (existingFact) {
    existingFact.remove();
  }
  
  const factIndex = Math.floor(Math.random() * spaceFacts.length);
  const fact = spaceFacts[factIndex];
  
  const factSection = document.createElement('div');
  factSection.className = 'space-fact';
  factSection.innerHTML = `
    <h3>🌟 Did You Know?</h3>
    <p>${fact}</p>
  `;
  
  // Insert before the gallery
  gallery.parentNode.insertBefore(factSection, gallery);
}

// Show loading message
function showLoading() {
  gallery.innerHTML = `
    <div class="placeholder">
      <div class="placeholder-icon">🔄</div>
      <p>Loading space photos...</p>
    </div>
  `;
}

// Fetch APOD data from NASA API
async function fetchAPODData(startDate, endDate) {
  try {
    const url = `${BASE_URL}?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    console.error('Error fetching APOD data:', error);
    throw error;
  }
}

// Create gallery item HTML
function createGalleryItem(item) {
  const galleryItem = document.createElement('div');
  galleryItem.className = 'gallery-item';
  galleryItem.style.cursor = 'pointer';
  
  // Handle both images and videos
  if (item.media_type === 'image') {
    galleryItem.innerHTML = `
      <img src="${item.url}" alt="${item.title}" loading="lazy">
      <p><strong>${item.title}</strong></p>
      <p>${item.date}</p>
    `;
  } else if (item.media_type === 'video') {
    // Extract video thumbnail for YouTube videos
    const videoThumbnail = item.thumbnail_url || 'https://via.placeholder.com/400x200?text=Video+Content';
    galleryItem.innerHTML = `
      <div class="video-thumbnail">
        <img src="${videoThumbnail}" alt="${item.title}" loading="lazy">
        <div class="video-overlay">▶️</div>
      </div>
      <p><strong>${item.title}</strong></p>
      <p>${item.date}</p>
    `;
  }
  
  // Add hover zoom effect
  galleryItem.addEventListener('mouseenter', () => {
    const img = galleryItem.querySelector('img');
    if (img) {
      img.style.transform = 'scale(1.05)';
      img.style.transition = 'transform 0.3s ease';
    }
  });
  
  galleryItem.addEventListener('mouseleave', () => {
    const img = galleryItem.querySelector('img');
    if (img) {
      img.style.transform = 'scale(1)';
    }
  });
  
  // Add click event for modal
  galleryItem.addEventListener('click', () => openModal(item));
  
  return galleryItem;
}

// Create and display gallery
function displayGallery(apodData) {
  gallery.innerHTML = '';
  
  apodData.forEach(item => {
    const galleryItem = createGalleryItem(item);
    gallery.appendChild(galleryItem);
  });
}

// Create modal HTML
function createModal() {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <div class="modal-body">
        <div class="modal-media"></div>
        <div class="modal-info">
          <h2 class="modal-title"></h2>
          <p class="modal-date"></p>
          <p class="modal-explanation"></p>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  return modal;
}

// Open modal with APOD data
function openModal(item) {
  let modal = document.querySelector('.modal');
  if (!modal) {
    modal = createModal();
  }
  
  const modalMedia = modal.querySelector('.modal-media');
  const modalTitle = modal.querySelector('.modal-title');
  const modalDate = modal.querySelector('.modal-date');
  const modalExplanation = modal.querySelector('.modal-explanation');
  
  modalTitle.textContent = item.title;
  modalDate.textContent = item.date;
  modalExplanation.textContent = item.explanation;
  
  // Handle media display
  if (item.media_type === 'image') {
    modalMedia.innerHTML = `<img src="${item.hdurl || item.url}" alt="${item.title}">`;
  } else if (item.media_type === 'video') {
    modalMedia.innerHTML = `
      <div class="video-container">
        <iframe src="${item.url}" frameborder="0" allowfullscreen></iframe>
        <p><a href="${item.url}" target="_blank">Watch on YouTube</a></p>
      </div>
    `;
  }
  
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
  
  // Close modal events
  const closeBtn = modal.querySelector('.close');
  closeBtn.onclick = closeModal;
  
  modal.onclick = (e) => {
    if (e.target === modal) {
      closeModal();
    }
  };
}

// Close modal
function closeModal() {
  const modal = document.querySelector('.modal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

// Main function to get and display space images
async function getSpaceImages() {
  const startDate = startInput.value;
  const endDate = endInput.value;
  
  if (!startDate || !endDate) {
    alert('Please select both start and end dates.');
    return;
  }
  
  if (new Date(startDate) > new Date(endDate)) {
    alert('Start date must be before end date.');
    return;
  }
  
  showLoading();
  
  // Display a new random space fact each time images are fetched
  displayRandomSpaceFact();
  
  try {
    const apodData = await fetchAPODData(startDate, endDate);
    displayGallery(apodData);
  } catch (error) {
    gallery.innerHTML = `
      <div class="placeholder">
        <div class="placeholder-icon">❌</div>
        <p>Error loading space images. Please try again.</p>
        <p style="font-size: 12px; color: #999;">${error.message}</p>
      </div>
    `;
  }
}

// Event listeners
button.addEventListener('click', getSpaceImages);

// Allow Enter key to trigger search
document.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    getSpaceImages();
  }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
  }
});

// Display random space fact on page load
document.addEventListener('DOMContentLoaded', displayRandomSpaceFact);
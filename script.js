// Global variables
let currentImageIndex = 0;
let images = [];

// Helper function to get correct image path for both local and GitHub Pages
function getImagePath(imageName) {
    // Check if we're on GitHub Pages (has a base path)
    const basePath = window.location.pathname.includes('/photofolio/') ? '/photofolio' : '';
    return `${basePath}/images/${imageName}`;
}

// DOM elements
const gallery = document.getElementById('gallery');
const modal = document.getElementById('modal');
const modalImage = document.getElementById('modalImage');
const closeModal = document.getElementById('closeModal');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

// Image file extensions to look for
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'];

// Load images from the images folder
async function loadImages() {
    try {
        // Try to fetch the list of images from the server
        // This will work when served from a web server
        const response = await fetch('/api/images');
        if (response.ok) {
            const imageNames = await response.json();
            if (imageNames.length > 0) {
                imageNames.forEach((imageName, index) => {
                    createGalleryItem(imageName, index);
                });
            } else {
                await loadFallbackImages();
            }
        } else {
            // Fallback: try to load common image names
            await loadFallbackImages();
        }
        
        // Add staggered animation delay to gallery items
        const galleryItems = document.querySelectorAll('.gallery-item');
        galleryItems.forEach((item, index) => {
            item.style.animationDelay = `${0.1 * index}s`;
        });
        
    } catch (error) {
        console.log('Server API not available, using fallback method for GitHub Pages...');
        await loadFallbackImages();
    }
}

// Fallback method to load images
async function loadFallbackImages() {
    console.log('Loading fallback images...');
    
    // Only try the specific images we know exist in the repository
    const knownImages = [
        'DSC00592.jpg', 'DSC00600.jpg', 'DSC00602.jpg', 
        'DSC00608.jpg', 'DSC00610.jpg', 'DSC00617.jpg'
    ];
    
    const foundImages = [];
    
    // Try to load only the known images
    for (const imageName of knownImages) {
        const imagePath = getImagePath(imageName);
        console.log(`Trying to load: ${imagePath}`);
        
        try {
            const img = new Image();
            img.src = imagePath;
            
            await new Promise((resolve, reject) => {
                img.onload = () => {
                    console.log(`Successfully loaded: ${imageName}`);
                    foundImages.push(imageName);
                    resolve();
                };
                img.onerror = () => {
                    console.log(`Failed to load: ${imageName}`);
                    reject();
                };
                // Shorter timeout for faster loading
                setTimeout(() => {
                    console.log(`Timeout loading: ${imageName}`);
                    reject();
                }, 1000);
            });
            
        } catch (error) {
            console.log(`Error loading: ${imageName}`, error);
        }
    }
    
    console.log(`Found ${foundImages.length} images:`, foundImages);
    
    if (foundImages.length > 0) {
        foundImages.forEach((imageName, index) => {
            createGalleryItem(imageName, index);
        });
    } else {
        showPlaceholderMessage();
    }
}

// Create a gallery item
function createGalleryItem(imageName, index) {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.setAttribute('data-index', index);
    
    const img = document.createElement('img');
    img.src = getImagePath(imageName);
    img.alt = `Photography ${index + 1}`;
    img.loading = 'lazy';
    
    // Add error handling for missing images (silent)
    img.onerror = function() {
        // Silently handle missing images without console spam
        this.style.display = 'none';
        this.parentElement.style.display = 'none';
    };
    
    // Detect aspect ratio and apply appropriate class for tiling
    img.onload = function() {
        const aspectRatio = this.naturalWidth / this.naturalHeight;
        
        if (aspectRatio > 1.2) {
            // Landscape (wider than tall) - span 2 columns
            item.classList.add('landscape');
        } else if (aspectRatio < 0.8) {
            // Portrait (taller than wide) - span 2 rows
            item.classList.add('portrait');
        } else {
            // Square-ish - normal size
            item.classList.add('square');
        }
    };
    
    item.appendChild(img);
    item.addEventListener('click', () => openModal(index));
    
    gallery.appendChild(item);
    images.push(imageName);
}

// Show placeholder message when no images are found
function showPlaceholderMessage() {
    const message = document.createElement('div');
    message.style.cssText = `
        text-align: center;
        padding: 60px 20px;
        color: #666;
        font-size: 1.1rem;
    `;
    message.innerHTML = `
        <p>No images found in the images folder.</p>
        <p>Please add your photography images to the <code>images/</code> folder.</p>
        <p>Supported formats: JPG, PNG, GIF, WebP, BMP, TIFF</p>
    `;
    gallery.appendChild(message);
}

// Open modal with image
function openModal(index) {
    currentImageIndex = index;
    const imageName = images[index];
    
    modalImage.src = getImagePath(imageName);
    modalImage.alt = `Photography ${index + 1}`;
    
    modal.style.display = 'block';
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    updateNavigationButtons();
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModalHandler() {
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }, 300);
}

// Navigate to previous image
function prevImage() {
    if (currentImageIndex > 0) {
        currentImageIndex--;
        updateModalImage();
    }
}

// Navigate to next image
function nextImage() {
    if (currentImageIndex < images.length - 1) {
        currentImageIndex++;
        updateModalImage();
    }
}

// Update modal image
function updateModalImage() {
    const imageName = images[currentImageIndex];
    modalImage.src = getImagePath(imageName);
    modalImage.alt = `Photography ${currentImageIndex + 1}`;
    updateNavigationButtons();
}

// Update navigation buttons state
function updateNavigationButtons() {
    prevBtn.disabled = currentImageIndex === 0;
    nextBtn.disabled = currentImageIndex === images.length - 1;
}

// Keyboard navigation
function handleKeyPress(e) {
    if (modal.style.display === 'block') {
        switch(e.key) {
            case 'Escape':
                closeModalHandler();
                break;
            case 'ArrowLeft':
                if (currentImageIndex > 0) {
                    prevImage();
                }
                break;
            case 'ArrowRight':
                if (currentImageIndex < images.length - 1) {
                    nextImage();
                }
                break;
        }
    }
}

// Event listeners
closeModal.addEventListener('click', closeModalHandler);
prevBtn.addEventListener('click', prevImage);
nextBtn.addEventListener('click', nextImage);

// Close modal when clicking outside the image
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModalHandler();
    }
});

// Keyboard navigation
document.addEventListener('keydown', handleKeyPress);

// Touch/swipe support for mobile
let touchStartX = 0;
let touchEndX = 0;

modal.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

modal.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0 && currentImageIndex < images.length - 1) {
            // Swipe left - next image
            nextImage();
        } else if (diff < 0 && currentImageIndex > 0) {
            // Swipe right - previous image
            prevImage();
        }
    }
}

// Initialize the gallery when the page loads
document.addEventListener('DOMContentLoaded', loadImages);

// Intersection Observer for lazy loading and animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe gallery items for smooth animations
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const galleryItems = document.querySelectorAll('.gallery-item');
        galleryItems.forEach(item => {
            observer.observe(item);
        });
    }, 1000);
});

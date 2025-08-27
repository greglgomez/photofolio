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
    // Start with the specific images we know exist in the repository
    const knownImages = [
        'DSC00592.jpg', 'DSC00600.jpg', 'DSC00602.jpg', 
        'DSC00608.jpg', 'DSC00610.jpg', 'DSC00617.jpg'
    ];
    
    // Common camera naming patterns as fallback
    const commonPatterns = [
        // Sony DSC pattern (most common)
        'DSC00001.jpg', 'DSC00002.jpg', 'DSC00003.jpg', 'DSC00004.jpg', 'DSC00005.jpg',
        'DSC00006.jpg', 'DSC00007.jpg', 'DSC00008.jpg', 'DSC00009.jpg', 'DSC00010.jpg',
        'DSC001.jpg', 'DSC002.jpg', 'DSC003.jpg', 'DSC004.jpg', 'DSC005.jpg',
        'DSC006.jpg', 'DSC007.jpg', 'DSC008.jpg', 'DSC009.jpg', 'DSC010.jpg',
        // Canon IMG pattern
        'IMG_0001.jpg', 'IMG_0002.jpg', 'IMG_0003.jpg', 'IMG_0004.jpg', 'IMG_0005.jpg',
        'IMG_001.jpg', 'IMG_002.jpg', 'IMG_003.jpg', 'IMG_004.jpg', 'IMG_005.jpg',
        // Generic patterns
        'photo1.jpg', 'photo2.jpg', 'photo3.jpg', 'photo4.jpg', 'photo5.jpg',
        'image1.jpg', 'image2.jpg', 'image3.jpg', 'image4.jpg', 'image5.jpg',
        'img1.jpg', 'img2.jpg', 'img3.jpg', 'img4.jpg', 'img5.jpg',
        // Simple numbering
        '1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg',
        '01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg'
    ];
    
    // Combine known images with common patterns
    const allPatterns = [...knownImages, ...commonPatterns];
    
    const foundImages = [];
    let checkedCount = 0;
    const maxChecks = 30; // Limit the number of attempts
    
    // Try to load images and see which ones exist
    for (const imageName of allPatterns) {
        if (checkedCount >= maxChecks) break;
        checkedCount++;
        
        try {
            const img = new Image();
            img.src = getImagePath(imageName);
            
            await new Promise((resolve, reject) => {
                img.onload = () => {
                    foundImages.push(imageName);
                    resolve();
                };
                img.onerror = () => {
                    reject();
                };
                // Shorter timeout for faster loading
                setTimeout(() => reject(), 500);
            });
            
            // Stop after finding 15 images to avoid too many requests
            if (foundImages.length >= 15) break;
            
        } catch (error) {
            // Image doesn't exist, continue to next
        }
    }
    
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

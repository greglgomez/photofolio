// Global variables
let currentImageIndex = 0;
let images = [];

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
    // Common image extensions and naming patterns
    const extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const prefixes = ['', 'photo', 'image', 'img', 'DSC', 'IMG_', 'P'];
    const numbers = Array.from({length: 50}, (_, i) => i + 1);
    
    const possibleImageNames = [];
    
    // Generate possible image names
    for (const prefix of prefixes) {
        for (const num of numbers) {
            for (const ext of extensions) {
                if (prefix) {
                    possibleImageNames.push(`${prefix}${num.toString().padStart(2, '0')}.${ext}`);
                    possibleImageNames.push(`${prefix}${num}.${ext}`);
                } else {
                    possibleImageNames.push(`${num}.${ext}`);
                    possibleImageNames.push(`${num.toString().padStart(2, '0')}.${ext}`);
                }
            }
        }
    }
    
    const foundImages = [];
    
    // Try to load images and see which ones exist
    for (const imageName of possibleImageNames) {
        try {
            const img = new Image();
            img.src = `images/${imageName}`;
            
            await new Promise((resolve, reject) => {
                img.onload = () => {
                    foundImages.push(imageName);
                    resolve();
                };
                img.onerror = () => {
                    reject();
                };
                // Timeout after 1 second for faster loading
                setTimeout(() => reject(), 1000);
            });
            
            // Stop after finding 20 images to avoid too many requests
            if (foundImages.length >= 20) break;
            
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
    img.src = `images/${imageName}`;
    img.alt = `Photography ${index + 1}`;
    img.loading = 'lazy';
    
    // Add error handling for missing images
    img.onerror = function() {
        this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzUwIiBoZWlnaHQ9IjI4MCIgdmlld0JveD0iMCAwIDM1MCAyODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzNTAiIGhlaWdodD0iMjgwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xNzUgMTQwQzE3NSAxNDAgMTY1IDEzMCAxNTUgMTMwQzE0NSAxMzAgMTM1IDE0MCAxMzUgMTUwQzEzNSAxNjAgMTQ1IDE3MCAxNTUgMTcwQzE2NSAxNzAgMTc1IDE2MCAxNzUgMTUwWiIgZmlsbD0iI0Q5RDlEOSIvPgo8cGF0aCBkPSJNMTc1IDE0MEMxNzUgMTQwIDE2NSAxMzAgMTU1IDEzMEMxNDUgMTMwIDEzNSAxNDAgMTM1IDE1MEMxMzUgMTYwIDE0NSAxNzAgMTU1IDE3MEMxNjUgMTcwIDE3NSAxNjAgMTc1IDE1MFoiIGZpbGw9IiNENkQ2RDYiLz4KPHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMwIDMwQzMwIDMwIDI1IDI1IDIwIDI1QzE1IDI1IDEwIDMwIDEwIDM1QzEwIDQwIDE1IDQ1IDIwIDQ1QzI1IDQ1IDMwIDQwIDMwIDM1WiIgZmlsbD0iI0M5QzlDOSIvPgo8L3N2Zz4KPC9zdmc+';
        this.alt = 'Image not found';
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
    
    modalImage.src = `images/${imageName}`;
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
    modalImage.src = `images/${imageName}`;
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

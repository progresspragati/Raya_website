/**
 * RAYA Planetary System - Scrollytelling Engine
 * Handles image preloading, scroll mapping, and canvas rendering.
 */

const canvas = document.getElementById('planetary-canvas');
const context = canvas.getContext('2d');
const loadingScreen = document.getElementById('loading-screen');
const loadingBar = document.getElementById('loading-bar');
const loadingText = document.getElementById('loading-text');
const storyTexts = document.querySelectorAll('.story-text');

// Configuration
const frameCount = 192; // Using all available frames
const imageBaseUrl = 'public/animation sequence/';
const imagePrefix = ''; // Naming is 00001.jpg, so no prefix like raya_seq_
const imageExt = '.jpg';

// State
const images = [];
const imageSequence = {
    frame: 0
};

// 1. Preloading Logic
function preloadImages() {
    let loadedCount = 0;

    for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        // Format: 00001, 00002, ..., 00120
        const frameNumber = i.toString().padStart(5, '0');
        img.src = `${imageBaseUrl}${frameNumber}${imageExt}`;
        
        img.onload = () => {
            loadedCount++;
            const progress = Math.floor((loadedCount / frameCount) * 100);
            loadingBar.style.width = `${progress}%`;
            loadingText.innerText = `${progress}%`;

            if (loadedCount === frameCount) {
                initScrolly();
            }
        };

        img.onerror = () => {
            console.error(`Failed to load image: ${img.src}`);
            loadedCount++; // Still increment to avoid getting stuck
            if (loadedCount === frameCount) initScrolly();
        };

        images.push(img);
    }
}

// 2. Initialize Scroll Logic
function initScrolly() {
    // Hide loading screen with a fade
    loadingScreen.style.opacity = '0';
    loadingScreen.style.transition = 'opacity 0.5s ease-out';
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        document.body.style.overflowY = 'auto'; // Re-enable scroll if disabled
    }, 500);

    // Initial draw
    renderCanvas(0);
    updateStoryText(0);

    // Listen for scroll
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const section = document.getElementById('scrolly-section');
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const windowHeight = window.innerHeight;

        // Calculate progress within the 500vh section
        // We subtract windowHeight from sectionHeight because the sticky container 
        // stays pinned for exactly its own height minus the viewport.
        const scrollFraction = Math.max(0, Math.min(1, Math.max(0, scrollTop - sectionTop) / (sectionHeight - windowHeight)));
        
        const frameIndex = Math.min(
            frameCount - 1,
            Math.floor(scrollFraction * frameCount)
        );

        requestAnimationFrame(() => {
            renderCanvas(frameIndex);
            updateStoryText(scrollFraction * 100);
        });
    });

    // Resize handling
    window.addEventListener('resize', () => renderCanvas(imageSequence.frame));
}

// 3. Render Logic
function renderCanvas(index) {
    imageSequence.frame = index;
    const img = images[index];
    if (!img) return;

    // Reset canvas dimensions to match viewport for "object-fit" math
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Object-fit: Cover logic
    const imgWidth = img.width;
    const imgHeight = img.height;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const ratio = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
    const newWidth = imgWidth * ratio;
    const newHeight = imgHeight * ratio;
    const x = (canvasWidth - newWidth) / 2;
    const y = (canvasHeight - newHeight) / 2;

    context.clearRect(0, 0, canvasWidth, canvasHeight);
    context.drawImage(img, x, y, newWidth, newHeight);
}

// 4. Story Triggers
function updateStoryText(percentage) {
    const textElements = document.querySelectorAll('.story-text');
    textElements.forEach(text => {
        const start = parseFloat(text.dataset.start);
        const end = parseFloat(text.dataset.end);

        // Fixed match logic to ensure 0% triggers correctly
        if (percentage >= start && percentage <= end) {
            text.classList.add('opacity-100');
            text.classList.remove('opacity-0');
        } else {
            text.classList.remove('opacity-100');
            text.classList.add('opacity-0');
        }
    });
}

// Start preloading
window.onload = preloadImages;

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
const frameCount = 192;
const imageBaseUrl = 'public/animation sequence/';
const imageExt = '.jpg';

// State
const images = [];
let currentRawFrame = 0;
let smoothFrame = 0;
let lastRenderedFrame = -1;

// 1. Preloading Logic
function preloadImages() {
    let loadedCount = 0;
    for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        const frameNumber = i.toString().padStart(5, '0');
        img.src = `${imageBaseUrl}${frameNumber}${imageExt}`;
        img.onload = () => {
            loadedCount++;
            const progress = Math.floor((loadedCount / frameCount) * 100);
            if (loadingBar) loadingBar.style.width = `${progress}%`;
            if (loadingText) loadingText.innerText = `${progress}%`;
            if (loadedCount === frameCount) initScrolly();
        };
        img.onerror = () => {
            loadedCount++;
            if (loadedCount === frameCount) initScrolly();
        };
        images.push(img);
    }
}

// 2. Initialize Scroll Logic
function initScrolly() {
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => loadingScreen.style.display = 'none', 500);
    }

    // Set initial canvas size
    resizeCanvas();

    // The Animation Loop (Running at 60fps)
    function animate() {
        // Interpolation logic: target smoothFrame towards currentRawFrame
        // 0.1 is the damping factor. Adjust for more/less "floaty" feel.
        const delta = currentRawFrame - smoothFrame;
        smoothFrame += delta * 0.15;

        const frameIndex = Math.floor(smoothFrame);
        
        // Only re-draw if the frame index has changed to save CPU/GPU
        if (frameIndex !== lastRenderedFrame) {
            renderCanvas(frameIndex);
            lastRenderedFrame = frameIndex;
            updateStoryText((frameIndex / (frameCount - 1)) * 100);
        }

        requestAnimationFrame(animate);
    }
    animate();

    // Listen for scroll
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const section = document.getElementById('scrolly-section');
        if (!section) return;

        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const windowHeight = window.innerHeight;

        const scrollFraction = Math.max(0, Math.min(1, Math.max(0, scrollTop - sectionTop) / (sectionHeight - windowHeight)));
        
        // Target the frame we want to be at
        currentRawFrame = scrollFraction * (frameCount - 1);
    }, { passive: true });

    // Resize handling (Debounced or separate to keep render loop fast)
    window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Re-render current frame on resize
    renderCanvas(Math.floor(smoothFrame));
}

// 3. Render Logic (Pure Drawing)
function renderCanvas(index) {
    const img = images[index];
    if (!img || !img.complete) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const imgWidth = img.width;
    const imgHeight = img.height;

    // Object-fit: Cover logic
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
        if (percentage >= start && percentage <= end) {
            text.classList.add('opacity-100');
            text.classList.remove('opacity-0');
        } else {
            text.classList.remove('opacity-100');
            text.classList.add('opacity-0');
        }
    });
}

window.onload = preloadImages;

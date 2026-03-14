/* =========================================
   แมวเป้า.dev_ — Vercel Ship '24 Inspired Script
   ========================================= */

document.addEventListener('DOMContentLoaded', function () {
    initSmoothScrolling();
    initMobileMenu();
    initTextShatter();
    initStickers();
    console.log('Website loaded successfully in new UI mode!');
});

/* === Smooth Scrolling === */
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href').substring(1);
            if (!targetId) return;
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                e.preventDefault();
                const headerOffset = 64; // height of the new header
                const elementPosition = targetSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                closeMobileMenu();
            }
        });
    });
}

/* === Mobile Menu === */
function initMobileMenu() {
    const hamburger = document.getElementById('hamburgerBtn');
    const navMenu = document.getElementById('navMenu');
    const overlay = document.getElementById('navOverlay');

    if (!hamburger || !navMenu) return;

    hamburger.addEventListener('click', function () {
        this.classList.toggle('active');
        navMenu.classList.toggle('active');
        if (overlay) overlay.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    if (overlay) {
        overlay.addEventListener('click', closeMobileMenu);
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeMobileMenu();
    });
}

function closeMobileMenu() {
    const hamburger = document.getElementById('hamburgerBtn');
    const navMenu = document.getElementById('navMenu');
    const overlay = document.getElementById('navOverlay');

    if (hamburger) hamburger.classList.remove('active');
    // if using mobile nav overlay, can keep it synced here
    // Currently relying on desktop nav hiding via media query, but this function restores styles.
    if (navMenu) navMenu.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
}

/* === Copy to Clipboard === */
function copyToClipboard(text, button) {
    if (!navigator.clipboard) {
        // basic fallback
        prompt("Copy to clipboard: Ctrl+C, Enter", text);
        return;
    }

    navigator.clipboard.writeText(text).then(function () {
        const originalText = button.innerText;
        button.innerText = 'COPIED!';
        button.style.color = '#fff';

        setTimeout(function () {
            button.innerText = originalText;
            button.style.color = '';
        }, 2000);
    }).catch(function (err) {
        console.error('Failed to copy: ', err);
        alert('ไม่สามารถคัดลอกได้');
    });
}

/* === Text Shatter Effect === */
function initTextShatter() {
    const wrapper = document.querySelector('.hero-huge-text-wrapper');
    const canvas = document.getElementById('shatterCanvas');
    const textElement = document.getElementById('shatterText');
    if (!wrapper || !canvas || !textElement) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    let particles = [];
    let mouse = { x: -9999, y: -9999, radius: 100 };
    let animationId;
    let isInitialized = false;

    function resize() {
        if (!wrapper.offsetWidth) return;
        canvas.width = wrapper.offsetWidth;
        canvas.height = wrapper.offsetHeight;
        initParticles();
    }

    document.fonts.ready.then(() => {
        setTimeout(resize, 100);
    });

    window.addEventListener('resize', () => {
        clearTimeout(window.resizeTimer);
        window.resizeTimer = setTimeout(resize, 200);
    });

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    canvas.addEventListener('mouseleave', () => {
        mouse.x = -9999;
        mouse.y = -9999;
    });

    class Particle {
        constructor(destX, destY, color, direction, letterIndex, doIntro) {
            this.x = destX + (Math.random() - 0.5) * 2;
            this.originX = destX;
            this.originY = destY;
            this.color = color;
            const step = document.body.clientWidth < 768 ? 3 : 4;
            this.size = step;
            this.vx = 0;
            this.vy = 0;
            this.ease = 0.08 + Math.random() * 0.04;
            this.friction = 0.85;

            if (doIntro) {
                this.y = destY + (direction * window.innerHeight * 0.8);
                this.active = false;
                this.activationTimer = letterIndex * 12; // 12 frames stagger per letter
            } else {
                this.y = destY + (Math.random() - 0.5) * 2;
                this.active = true;
                this.activationTimer = 0;
            }
        }

        update() {
            if (!this.active) {
                if (this.activationTimer > 0) {
                    this.activationTimer--;
                    return;
                } else {
                    this.active = true;
                }
            }

            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouse.radius) {
                let force = (mouse.radius - distance) / mouse.radius;
                let angle = Math.atan2(dy, dx);
                this.vx -= force * Math.cos(angle) * 3;
                this.vy -= force * Math.sin(angle) * 3;
            }

            if (distance >= mouse.radius && Math.abs(this.vx) < 0.1 && Math.abs(this.vy) < 0.1) {
                this.x += (this.originX - this.x) * this.ease;
                this.y += (this.originY - this.y) * this.ease;
            } else {
                this.vx *= this.friction;
                this.vy *= this.friction;
                this.x += this.vx;
                this.y += this.vy;
            }
        }

        draw() {
            if (!this.active) return;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x + this.size / 2, this.y + this.size / 2, this.size / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const letters = textElement.querySelectorAll('.letter');
        const wrapperRect = wrapper.getBoundingClientRect();

        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        const noiseEffectPattern = ctx.createPattern(createNoiseCanvas(), 'repeat');

        letters.forEach(letter => {
            const rect = letter.getBoundingClientRect();
            if (rect.width === 0) return;

            const x = rect.left - wrapperRect.left;
            const y = rect.top - wrapperRect.top;

            const style = window.getComputedStyle(letter);
            ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;

            if (letter.classList.contains('noise-effect')) {
                ctx.fillStyle = noiseEffectPattern || '#888';
            } else {
                ctx.fillStyle = '#ffffff';
            }

            // Adjust y slightly based on baseline offset
            let yOffset = y + (rect.height * 0.12);
            ctx.fillText(letter.innerText, x, yOffset);
        });

        const textCoordinates = ctx.getImageData(0, 0, canvas.width, canvas.height);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const step = document.body.clientWidth < 768 ? 3 : 4;

        const letterBounds = Array.from(letters).map((letter, index) => {
            const r = letter.getBoundingClientRect();
            let order = parseInt(letter.getAttribute('data-order'), 10);
            if (isNaN(order)) order = index;

            let dirAttr = letter.getAttribute('data-direction');
            let direction = dirAttr === 'top' ? -1 : (dirAttr === 'bottom' ? 1 : (index % 2 === 0 ? 1 : -1));

            return { right: r.right - wrapperRect.left, order: order, direction: direction };
        });

        const doIntro = !isInitialized;

        for (let y = 0; y < textCoordinates.height; y += step) {
            for (let x = 0; x < textCoordinates.width; x += step) {
                const index = (y * 4 * textCoordinates.width) + (x * 4);
                const alpha = textCoordinates.data[index + 3];
                if (alpha > 128) {
                    const r = textCoordinates.data[index];
                    const g = textCoordinates.data[index + 1];
                    const b = textCoordinates.data[index + 2];
                    const color = `rgb(${r},${g},${b})`;

                    let letterIndex = letterBounds.length - 1;
                    let animationOrder = letterBounds[letterIndex].order;
                    let direction = letterBounds[letterIndex].direction;
                    for (let i = 0; i < letterBounds.length; i++) {
                        if (x < letterBounds[i].right + 6) {
                            letterIndex = i;
                            animationOrder = letterBounds[i].order;
                            direction = letterBounds[i].direction;
                            break;
                        }
                    }

                    particles.push(new Particle(x, y, color, direction, animationOrder, doIntro));
                }
            }
        }

        if (!isInitialized) {
            isInitialized = true;
            animate();
        }
    }

    function createNoiseCanvas() {
        const nc = document.createElement('canvas');
        nc.width = 100; nc.height = 100;
        const nctx = nc.getContext('2d');
        const imgData = nctx.createImageData(100, 100);
        for (let i = 0; i < imgData.data.length; i += 4) {
            const val = Math.random() * 255;
            imgData.data[i] = val;
            imgData.data[i + 1] = val;
            imgData.data[i + 2] = val;
            imgData.data[i + 3] = 255;
        }
        nctx.putImageData(imgData, 0, 0);
        return nc;
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }
        animationId = requestAnimationFrame(animate);
    }
}

/* === Sticker Lab === */
function initStickers() {
    const toggle = document.getElementById('stickerToggle');
    const tray = document.getElementById('stickerTray');
    const textInput = document.getElementById('stickerTextInput');
    const createBtn = document.getElementById('createTextSticker');
    const styleOptions = document.querySelectorAll('.style-option');
    if (!toggle || !tray) return;

    let highestZIndex = 10000;
    let selectedTextStickerStyle = 'box'; // default
    let currentScale = 0.35;

    // Handle Size Selection
    const sizeSlider = document.getElementById('stickerSizeSlider');
    const sizeValueDisplay = document.getElementById('sizeValue');

    if (sizeSlider) {
        sizeSlider.addEventListener('input', (e) => {
            currentScale = parseFloat(e.target.value);
            if (sizeValueDisplay) sizeValueDisplay.textContent = currentScale.toFixed(2);
        });
    }

    // Handle Style Selection
    styleOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            styleOptions.forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            selectedTextStickerStyle = opt.getAttribute('data-style');
        });
    });

    // Create Text Sticker - Add to Tray
    const createTextSticker = () => {
        const text = textInput.value.trim();
        if (text) {
            addTextToTray(text, selectedTextStickerStyle);
            textInput.value = '';
            // Don't close tray, let user see it added
        }
    };

    function addTextToTray(text, style) {
        const preview = document.createElement('div');
        preview.className = `tray-text-preview`;
        preview.setAttribute('draggable', 'true');

        // Wrapper to apply scale transform via CSS
        const wrapper = document.createElement('div');
        wrapper.className = 'tray-sticker-wrapper';

        const splitText = (str) => {
            if (typeof Intl !== 'undefined' && Intl.Segmenter) {
                const segmenter = new Intl.Segmenter('th', { granularity: 'grapheme' });
                return Array.from(segmenter.segment(str), s => s.segment);
            }
            return str.split('');
        };

        // Use the EXACT same internal logic as actual stickers
        if (style === 'box') {
            wrapper.classList.add('text-type');
            const chars = splitText(text.toUpperCase());
            const cols = chars.length > 4 ? Math.ceil(chars.length / 2) : chars.length;
            wrapper.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

            chars.forEach(char => {
                const box = document.createElement('div');
                box.className = 'text-char-box';
                if (char === '^') box.classList.add('symbol-triangle');
                else if (char === '*') box.classList.add('symbol-globe');
                else box.textContent = char;
                wrapper.appendChild(box);
            });
        } else if (style === '3d') {
            wrapper.classList.add('text-type-3d');
            const chars = splitText(text.toUpperCase());
            chars.forEach(char => {
                if (char === '^') {
                    const span = document.createElement('span');
                    span.className = 'symbol-triangle-3d';
                    wrapper.appendChild(span);
                } else {
                    const span = document.createElement('span');
                    span.textContent = char;
                    wrapper.appendChild(span);
                }
            });
        }

        preview.appendChild(wrapper);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-tray-item';
        deleteBtn.textContent = '×';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            preview.remove();
        };
        preview.appendChild(deleteBtn);

        preview.addEventListener('dragstart', (e) => {
            const data = {
                type: 'text',
                content: text,
                style: style
            };
            e.dataTransfer.setData('application/json', JSON.stringify(data));
            showDroppableAreas();
            setTimeout(() => tray.classList.remove('active'), 100);
        });

        // Prepend to the tray but AFTER the creator and style selector
        // The creator and style selector should stay at the top.
        // Let's find the separator or the first image.
        const images = tray.querySelectorAll('img.t-sticker');
        if (images.length > 0) {
            tray.insertBefore(preview, images[0]);
        } else {
            tray.appendChild(preview);
        }
    }

    createBtn.addEventListener('click', createTextSticker);
    textInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') createTextSticker();
    });

    // Toggle tray
    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        tray.classList.toggle('active');
        updateGuideVisibility();
    });

    // Handle Drag from Tray
    const trayStickers = tray.querySelectorAll('img');
    trayStickers.forEach(sticker => {
        sticker.setAttribute('draggable', 'true');

        sticker.addEventListener('dragstart', (e) => {
            const src = sticker.getAttribute('data-src');
            const data = {
                type: 'image',
                src: src
            };
            e.dataTransfer.setData('application/json', JSON.stringify(data));
            showDroppableAreas();
            setTimeout(() => tray.classList.remove('active'), 50);
        });
    });

    const previewItems = tray.querySelectorAll('.tray-text-preview');
    // Note: dragstart for existing items is handled in addTextToTray, but we should ensure all are covered

    function showDroppableAreas() {
        document.querySelectorAll('.sticker-area').forEach(area => {
            area.classList.add('dragging-active');
        });
        updateGuideVisibility();
    }

    function hideDroppableAreas() {
        document.querySelectorAll('.sticker-area').forEach(area => {
            area.classList.remove('dragging-active');
        });
        updateGuideVisibility();
    }

    function updateGuideVisibility() {
        const guide = document.querySelector('.sticker-controls-guide');
        const tray = document.getElementById('stickerTray');

        // Show if tray is open OR if any area is in dragging-active state
        const isTrayOpen = tray && tray.classList.contains('active');
        const isDragging = document.querySelector('.sticker-area.dragging-active');

        if (guide) {
            if (isTrayOpen || isDragging) {
                guide.classList.add('visible');
            } else {
                guide.classList.remove('visible');
            }
        }
    }

    // Support Drop on document
    document.addEventListener('dragover', (e) => {
        e.preventDefault(); // Allow drop
    });

    document.addEventListener('dragend', (e) => {
        hideDroppableAreas();
    });

    document.addEventListener('drop', (e) => {
        e.preventDefault();
        hideDroppableAreas();
        const rawData = e.dataTransfer.getData('application/json');
        if (!rawData) return;

        const data = JSON.parse(rawData);
        const targetArea = e.target.closest('.sticker-area');

        if (data && targetArea && !e.target.closest('.PlacedSticker')) {
            const x = e.pageX;
            const y = e.pageY;

            if (data.type === 'image') {
                placeSticker(data.src, x, y, targetArea);
            } else if (data.type === 'text') {
                placeSticker(data.content, x, y, targetArea, true, data.style);
            }
        }
    });

    function placeSticker(content, x, y, targetArea = document.body, isText = false, textStyle = 'box', loadedData = null) {
        const element = document.createElement('div');
        element.className = 'PlacedSticker slap';

        const splitText = (str) => {
            if (typeof Intl !== 'undefined' && Intl.Segmenter) {
                const segmenter = new Intl.Segmenter('th', { granularity: 'grapheme' });
                return Array.from(segmenter.segment(str), s => s.segment);
            }
            return str.split('');
        };

        if (isText) {
            if (textStyle === 'box') {
                element.classList.add('text-type');
                const chars = splitText(content.toUpperCase());

                // Layout logic: if > 5 chars, maybe 2 rows. Let's keep it simple grid.
                const cols = chars.length > 4 ? Math.ceil(chars.length / 2) : chars.length;
                element.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

                chars.forEach(char => {
                    const box = document.createElement('div');
                    box.className = 'text-char-box';
                    if (char === '^') box.classList.add('symbol-triangle');
                    else if (char === '*') box.classList.add('symbol-globe');
                    else box.textContent = char;
                    element.appendChild(box);
                });
            } else if (textStyle === '3d') {
                element.classList.add('text-type-3d');
                const chars = splitText(content.toUpperCase());
                chars.forEach(char => {
                    if (char === '^') {
                        const span = document.createElement('span');
                        span.className = 'symbol-triangle-3d';
                        element.appendChild(span);
                    } else {
                        const span = document.createElement('span');
                        span.textContent = char;
                        element.appendChild(span);
                    }
                });
            }
        } else {
            const img = document.createElement('img');
            img.src = content;
            element.appendChild(img);
        }

        const rotation = loadedData ? loadedData.rotation : (Math.random() - 0.5) * 60;
        const scale = loadedData ? loadedData.scale : currentScale;
        element.style.setProperty('--r', `${rotation}deg`);
        element.style.setProperty('--scale', scale);

        let percX, percY;
        if (loadedData) {
            percX = loadedData.left;
            percY = loadedData.top;
        } else {
            const rect = targetArea.getBoundingClientRect();
            const relX = x - (rect.left + window.scrollX);
            const relY = y - (rect.top + window.scrollY);
            percX = (relX / rect.width) * 100;
            percY = (relY / rect.height) * 100;
        }

        element.style.left = `${percX}%`;
        element.style.top = `${percY}%`;

        if (!isText) element.style.height = '90px';

        if (loadedData) {
            element.style.zIndex = loadedData.zIndex;
            highestZIndex = Math.max(highestZIndex, loadedData.zIndex);
        } else {
            element.style.zIndex = ++highestZIndex;
        }

        targetArea.appendChild(element);

        if (loadedData) {
            element.dataset.firebaseId = loadedData.id;
            element.classList.remove('slap');
            element.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`;
        } else {
            const slapTimeout = setTimeout(() => {
                if (!element.dataset.isDragging) {
                    element.classList.remove('slap');
                    element.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`;
                }
            }, 300);
            element.dataset.slapTimeout = slapTimeout;
            saveStickerToFirebase(element, targetArea.id, isText, content, textStyle, percX, percY, rotation, scale, highestZIndex);
        }

        makeDraggable(element);
    }

    function makeDraggable(element) {
        let isDragging = false;
        let startX, startY, initialLeft, initialTop;
        let currentRotation = parseFloat(element.style.getPropertyValue('--r')) || 0;
        let wheelSaveTimeout;

        const dragStart = (e) => {
            if (e.target.classList.contains('peel')) return;

            const clientX = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
            const clientY = e.type === "touchstart" ? e.touches[0].clientY : e.clientY;

            startX = clientX;
            startY = clientY;

            if (e.type !== "touchstart") e.preventDefault();

            isDragging = true;
            element.dataset.isDragging = "true";
            if (element.dataset.slapTimeout) clearTimeout(parseInt(element.dataset.slapTimeout));
            element.classList.remove('slap');

            element.style.zIndex = ++highestZIndex;

            initialLeft = element.offsetLeft;
            initialTop = element.offsetTop;

            showDroppableAreas();
            updateGuideVisibility();

            // Interaction: Grow when grabbed (relative to its base scale)
            const baseScale = parseFloat(element.style.getPropertyValue('--scale')) || 0.35;
            const grabScale = baseScale * 1.45;
            element.style.transform = `translate(-50%, -50%) rotate(${currentRotation}deg) scale(${grabScale})`;

            document.addEventListener('mousemove', dragMove);
            document.addEventListener('mouseup', dragEnd);
            document.addEventListener('touchmove', dragMove, { passive: false });
            document.addEventListener('touchend', dragEnd);
            document.addEventListener('wheel', handleWheel, { passive: false });
        };

        const handleWheel = (e) => {
            if (!isDragging) return;
            e.preventDefault();

            if (e.ctrlKey) {
                // Resize: adjust scale by 0.05 per notch
                let scale = parseFloat(element.style.getPropertyValue('--scale')) || 0.35;
                const delta = e.deltaY > 0 ? -0.05 : 0.05;
                scale = Math.max(0.1, Math.min(2.0, scale + delta));
                element.style.setProperty('--scale', scale.toFixed(2));
            } else {
                // Rotate: 5 degrees per wheel notch
                const delta = e.deltaY > 0 ? 5 : -5;
                currentRotation += delta;
                element.style.setProperty('--r', `${currentRotation}deg`);
            }

            // Update transform immediately
            const baseScale = parseFloat(element.style.getPropertyValue('--scale')) || 0.35;
            const grabScale = baseScale * 1.45;
            element.style.transform = `translate(-50%, -50%) rotate(${currentRotation}deg) scale(${grabScale})`;

            clearTimeout(wheelSaveTimeout);
            wheelSaveTimeout = setTimeout(() => {
                if (element.dataset.firebaseId && window._stickerDB) {
                    window._stickerDB.update(element.dataset.firebaseId, {
                        rotation: currentRotation,
                        scale: parseFloat(element.style.getPropertyValue('--scale')) || 0.35
                    }).catch(err => console.error('Firebase update error:', err));
                }
            }, 600);
        };

        const dragMove = (e) => {
            if (!isDragging) return;
            e.preventDefault();

            const clientX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
            const clientY = e.type === "touchmove" ? e.touches[0].clientY : e.clientY;

            const dx = clientX - startX;
            const dy = clientY - startY;

            element.style.left = `${initialLeft + dx}px`;
            element.style.top = `${initialTop + dy}px`;

            // Maintain rotation while dragging + keep scale
            const baseScale = parseFloat(element.style.getPropertyValue('--scale')) || 0.35;
            const grabScale = baseScale * 1.45;
            element.style.transform = `translate(-50%, -50%) rotate(${currentRotation}deg) scale(${grabScale})`;
        };

        const dragEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            delete element.dataset.isDragging;

            // Convert back to percentage for responsiveness
            const parent = element.parentElement;
            const pRect = parent.getBoundingClientRect();
            const pLeft = (element.offsetLeft / pRect.width) * 100;
            const pTop = (element.offsetTop / pRect.height) * 100;

            element.style.left = `${pLeft}%`;
            element.style.top = `${pTop}%`;

            element.style.setProperty('--r', `${currentRotation}deg`);
            const baseScale = element.style.getPropertyValue('--scale') || 0.35;
            element.style.transform = `translate(-50%, -50%) rotate(${currentRotation}deg) scale(${baseScale})`;

            if (element.dataset.firebaseId && window._stickerDB) {
                window._stickerDB.update(element.dataset.firebaseId, {
                    left: pLeft,
                    top: pTop,
                    rotation: currentRotation,
                    scale: parseFloat(baseScale) || 0.35
                }).catch(err => console.error('Firebase update error:', err));
            }

            hideDroppableAreas();

            document.removeEventListener('mousemove', dragMove);
            document.removeEventListener('mouseup', dragEnd);
            document.removeEventListener('touchmove', dragMove);
            document.removeEventListener('touchend', dragEnd);
            document.removeEventListener('wheel', handleWheel);
        };

        element.addEventListener('mousedown', dragStart);
        element.addEventListener('touchstart', dragStart, { passive: true });

        // Double click/tap to remove with "Peel" animation
        element.addEventListener('dblclick', () => {
            const fbId = element.dataset.firebaseId;
            element.classList.add('peel');
            setTimeout(() => {
                element.remove();
                if (fbId && window._stickerDB) {
                    window._stickerDB.delete(fbId).catch(err => console.error('Firebase delete error:', err));
                }
            }, 400);
        });
    }

    async function saveStickerToFirebase(element, areaId, isText, content, textStyle, left, top, rotation, scale, zIndex) {
        if (!window._stickerDB) return;
        try {
            const id = await window._stickerDB.save({
                type: isText ? 'text' : 'image',
                content: isText ? content : null,
                src: !isText ? content : null,
                style: isText ? textStyle : null,
                areaId, left, top, rotation, scale, zIndex
            });
            element.dataset.firebaseId = id;
        } catch (err) {
            console.error('Firebase save error:', err);
        }
    }

    async function loadStickers() {
        if (!window._stickerDB) return;
        try {
            const stickers = await window._stickerDB.loadAll();
            stickers.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
            stickers.forEach(data => {
                const area = document.getElementById(data.areaId);
                if (!area) return;
                placeSticker(
                    data.type === 'text' ? data.content : data.src,
                    0, 0, area,
                    data.type === 'text',
                    data.style || 'box',
                    data
                );
            });
        } catch (err) {
            console.error('Firebase load error:', err);
        }
    }

    window._onFirebaseReady = loadStickers;
    if (window._stickerDB) loadStickers();

}

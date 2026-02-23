/* =========================================
   Topographic Wallpaper — Interactive Canvas
   ========================================= */

(function () {
    'use strict';

    // === State ===
    const state = {
        mouse: { x: -9999, y: -9999 },
        mouseActive: false,
        density: 1,
        speed: 0,
        mouseRadius: 0,
        contours: 16,
        colorScheme: 'cyan',
        customColor: null,
        customBg: null,
        time: 0,
        titleHidden: false,
        mode: 'dark',
        showCoords: false,
        showWatermark: true,
        showCrosshair: false
    };

    // === LocalStorage Persistence ===
    const STORAGE_KEY = 'wallpaper_settings';

    function saveSettings() {
        const data = {
            density: state.density,
            speed: state.speed,
            mouseRadius: state.mouseRadius,
            contours: state.contours,
            colorScheme: state.colorScheme,
            customColor: state.customColor,
            customBg: state.customBg,
            mode: state.mode,
            showCoords: state.showCoords,
            showWatermark: state.showWatermark,
            showCrosshair: state.showCrosshair
        };
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) { /* ignore */ }
    }

    function loadSettings() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            const data = JSON.parse(raw);
            if (data.density !== undefined) state.density = data.density;
            if (data.speed !== undefined) state.speed = data.speed;
            if (data.mouseRadius !== undefined) state.mouseRadius = data.mouseRadius;
            if (data.contours !== undefined) state.contours = data.contours;
            if (data.colorScheme) state.colorScheme = data.colorScheme;
            if (data.customColor !== undefined) state.customColor = data.customColor;
            if (data.customBg !== undefined) state.customBg = data.customBg;
            if (data.mode) state.mode = data.mode;
            if (data.showCoords !== undefined) state.showCoords = data.showCoords;
            if (data.showWatermark !== undefined) state.showWatermark = data.showWatermark;
            if (data.showCrosshair !== undefined) state.showCrosshair = data.showCrosshair;
        } catch (e) { /* ignore */ }
    }

    loadSettings();

    // === Color Schemes ===
    const colorSchemes = {
        cyan: {
            lines: [
                { r: 6, g: 182, b: 212 },
                { r: 56, g: 189, b: 248 },
                { r: 139, g: 92, b: 246 },
                { r: 14, g: 165, b: 233 }
            ],
            glow: 'rgba(6, 182, 212, 0.15)',
            bg: '#030712',
            lightBg: '#ffffff'
        },
        emerald: {
            lines: [
                { r: 16, g: 185, b: 129 },
                { r: 52, g: 211, b: 153 },
                { r: 6, g: 182, b: 212 },
                { r: 20, g: 184, b: 166 }
            ],
            glow: 'rgba(16, 185, 129, 0.15)',
            bg: '#030712',
            lightBg: '#ffffff'
        },
        rose: {
            lines: [
                { r: 244, g: 63, b: 94 },
                { r: 236, g: 72, b: 153 },
                { r: 251, g: 113, b: 133 },
                { r: 249, g: 115, b: 22 }
            ],
            glow: 'rgba(244, 63, 94, 0.15)',
            bg: '#0a0510',
            lightBg: '#ffffff'
        },
        amber: {
            lines: [
                { r: 245, g: 158, b: 11 },
                { r: 251, g: 191, b: 36 },
                { r: 239, g: 68, b: 68 },
                { r: 249, g: 115, b: 22 }
            ],
            glow: 'rgba(245, 158, 11, 0.15)',
            bg: '#0a0708',
            lightBg: '#ffffff'
        },
        violet: {
            lines: [
                { r: 139, g: 92, b: 246 },
                { r: 167, g: 139, b: 250 },
                { r: 236, g: 72, b: 153 },
                { r: 192, g: 132, b: 252 }
            ],
            glow: 'rgba(139, 92, 246, 0.15)',
            bg: '#050510',
            lightBg: '#ffffff'
        },
        mono: {
            lines: [
                { r: 226, g: 232, b: 240 },
                { r: 148, g: 163, b: 184 },
                { r: 203, g: 213, b: 225 },
                { r: 100, g: 116, b: 139 }
            ],
            glow: 'rgba(148, 163, 184, 0.1)',
            bg: '#0f172a',
            lightBg: '#ffffff'
        }
    };

    // Single line-color presets (these only change line color, not background)
    const lineColorPresets = {
        black: { r: 20, g: 20, b: 35 },
        white: { r: 245, g: 245, b: 255 },
        gold: { r: 212, g: 160, b: 23 }
    };

    // === Canvas Setup ===
    const canvas = document.getElementById('topoCanvas');
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    // === Simplex-like Noise (simple 2D) ===
    // A compact Perlin-style noise for contour generation
    const PERM = new Uint8Array(512);
    const GRAD = [
        [1, 1], [-1, 1], [1, -1], [-1, -1],
        [1, 0], [-1, 0], [0, 1], [0, -1]
    ];

    function initNoise() {
        const p = new Uint8Array(256);
        for (let i = 0; i < 256; i++) p[i] = i;
        // Fisher-Yates shuffle
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [p[i], p[j]] = [p[j], p[i]];
        }
        for (let i = 0; i < 512; i++) PERM[i] = p[i & 255];
    }

    function fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    function lerp(a, b, t) {
        return a + t * (b - a);
    }

    function grad(hash, x, y) {
        const g = GRAD[hash & 7];
        return g[0] * x + g[1] * y;
    }

    function noise2D(x, y) {
        const xi = Math.floor(x) & 255;
        const yi = Math.floor(y) & 255;
        const xf = x - Math.floor(x);
        const yf = y - Math.floor(y);
        const u = fade(xf);
        const v = fade(yf);

        const aa = PERM[PERM[xi] + yi];
        const ab = PERM[PERM[xi] + yi + 1];
        const ba = PERM[PERM[xi + 1] + yi];
        const bb = PERM[PERM[xi + 1] + yi + 1];

        return lerp(
            lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u),
            lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u),
            v
        );
    }

    // Fractal Brownian Motion
    function fbm(x, y, octaves) {
        let val = 0;
        let amp = 1;
        let freq = 1;
        let maxVal = 0;
        for (let i = 0; i < octaves; i++) {
            val += amp * noise2D(x * freq, y * freq);
            maxVal += amp;
            amp *= 0.5;
            freq *= 2;
        }
        return val / maxVal;
    }

    initNoise();

    // === Draw Topographic Contours ===
    function drawTopography() {
        const w = canvas.width;
        const h = canvas.height;
        const scheme = colorSchemes[state.colorScheme];

        // Clear with background
        const isLight = state.mode === 'light';
        if (state.customBg) {
            ctx.fillStyle = state.customBg;
        } else {
            ctx.fillStyle = isLight ? scheme.lightBg : scheme.bg;
        }
        ctx.fillRect(0, 0, w, h);

        // Ensure spacing doesn't create too many cells (performance cap)
        const maxCells = 50000;
        let spacing = state.density;
        const minSpacing = Math.ceil(Math.sqrt((w * h) / maxCells));
        if (spacing < minSpacing) spacing = minSpacing;

        const cols = Math.ceil(w / spacing) + 2;
        const rows = Math.ceil(h / spacing) + 2;
        const timeOffset = state.time * 0.0003 * state.speed;

        // Build noise height field
        const field = new Float32Array(cols * rows);
        const scale = 0.004;

        for (let j = 0; j < rows; j++) {
            for (let i = 0; i < cols; i++) {
                const px = i * spacing;
                const py = j * spacing;
                let val = fbm(px * scale + timeOffset, py * scale + timeOffset * 0.7, 4);

                // Mouse distortion
                if (state.mouseActive) {
                    const dx = px - state.mouse.x;
                    const dy = py - state.mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const radius = state.mouseRadius;
                    if (dist < radius) {
                        const influence = 1 - (dist / radius);
                        const wave = Math.sin(dist * 0.03 - state.time * 0.005 * state.speed) * influence * influence;
                        val += wave * 0.6;
                    }
                }

                field[j * cols + i] = val;
            }
        }

        // Draw contour lines using marching squares
        const numContours = state.contours;
        const minVal = -0.8;
        const maxVal = 0.8;

        // Determine line colors
        const useCustom = state.customColor !== null;
        const useSingleColor = isLight || useCustom;
        const singleColor = useCustom ? state.customColor : scheme.lines[0];

        for (let c = 0; c < numContours; c++) {
            const threshold = minVal + (maxVal - minVal) * (c / numContours);
            let color;
            if (useSingleColor) {
                color = singleColor;
            } else {
                const colorIdx = c % scheme.lines.length;
                color = scheme.lines[colorIdx];
            }
            const alpha = isLight
                ? 0.25 + (c / numContours) * 0.55
                : 0.15 + (c / numContours) * 0.4;

            ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
            ctx.lineWidth = 1 + (c % 4 === 0 ? 0.5 : 0);

            // Glow effect on certain lines
            if (c % 4 === 0) {
                ctx.shadowColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.5})`;
                ctx.shadowBlur = 6;
            } else {
                ctx.shadowBlur = 0;
            }

            ctx.beginPath();
            let hasSegments = false;

            for (let j = 0; j < rows - 1; j++) {
                for (let i = 0; i < cols - 1; i++) {
                    const idx = j * cols + i;
                    const v0 = field[idx];
                    const v1 = field[idx + 1];
                    const v2 = field[idx + cols + 1];
                    const v3 = field[idx + cols];

                    // Marching squares case
                    let caseIndex = 0;
                    if (v0 >= threshold) caseIndex |= 1;
                    if (v1 >= threshold) caseIndex |= 2;
                    if (v2 >= threshold) caseIndex |= 4;
                    if (v3 >= threshold) caseIndex |= 8;

                    if (caseIndex === 0 || caseIndex === 15) continue;

                    const x0 = i * spacing;
                    const y0 = j * spacing;
                    const x1 = (i + 1) * spacing;
                    const y1 = (j + 1) * spacing;

                    // Interpolation helper
                    function interp(va, vb, pa, pb) {
                        if (Math.abs(vb - va) < 0.0001) return (pa + pb) * 0.5;
                        const t = (threshold - va) / (vb - va);
                        return pa + t * (pb - pa);
                    }

                    const edges = [];

                    // Top edge (v0—v1)
                    if ((caseIndex & 1) !== (caseIndex & 2) >> 1) {
                        edges.push([interp(v0, v1, x0, x1), y0]);
                    }
                    // Right edge (v1—v2)
                    if ((caseIndex & 2) >> 1 !== (caseIndex & 4) >> 2) {
                        edges.push([x1, interp(v1, v2, y0, y1)]);
                    }
                    // Bottom edge (v3—v2)
                    if ((caseIndex & 4) >> 2 !== (caseIndex & 8) >> 3) {
                        edges.push([interp(v3, v2, x0, x1), y1]);
                    }
                    // Left edge (v0—v3)
                    if ((caseIndex & 8) >> 3 !== (caseIndex & 1)) {
                        edges.push([x0, interp(v0, v3, y0, y1)]);
                    }

                    // Draw line segments
                    if (edges.length >= 2) {
                        ctx.moveTo(edges[0][0], edges[0][1]);
                        ctx.lineTo(edges[1][0], edges[1][1]);
                        hasSegments = true;

                        // Saddle cases
                        if (edges.length === 4) {
                            ctx.moveTo(edges[2][0], edges[2][1]);
                            ctx.lineTo(edges[3][0], edges[3][1]);
                        }
                    }
                }
            }

            if (hasSegments) ctx.stroke();
        }

        ctx.shadowBlur = 0;

        // Mouse glow effect
        if (state.mouseActive) {
            const gradient = ctx.createRadialGradient(
                state.mouse.x, state.mouse.y, 0,
                state.mouse.x, state.mouse.y, state.mouseRadius
            );
            gradient.addColorStop(0, scheme.glow);
            gradient.addColorStop(0.5, scheme.glow.replace(/[\d.]+\)$/, '0.05)'));
            gradient.addColorStop(1, 'transparent');

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, w, h);

            // Crosshair
            if (state.showCrosshair) {
                const chSize = 12;
                ctx.strokeStyle = isLight ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(state.mouse.x - chSize, state.mouse.y);
                ctx.lineTo(state.mouse.x + chSize, state.mouse.y);
                ctx.moveTo(state.mouse.x, state.mouse.y - chSize);
                ctx.lineTo(state.mouse.x, state.mouse.y + chSize);
                ctx.stroke();

                // Ring
                ctx.strokeStyle = isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.06)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(state.mouse.x, state.mouse.y, state.mouseRadius, 0, Math.PI * 2);
                ctx.stroke();
            }
        }

        // Subtle vignette
        const vignette = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.8);
        vignette.addColorStop(0, 'transparent');
        vignette.addColorStop(1, isLight ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.4)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, w, h);
    }

    // === Animation Loop (30 FPS limiter) ===
    let animationId;
    const targetFPS = 30;
    const frameInterval = 1000 / targetFPS;
    let lastFrameTime = 0;

    function animate(timestamp) {
        animationId = requestAnimationFrame(animate);

        const delta = timestamp - lastFrameTime;
        if (delta < frameInterval) return;

        lastFrameTime = timestamp - (delta % frameInterval);
        state.time += delta;
        drawTopography();
    }

    animationId = requestAnimationFrame(animate);

    // Pause when tab is hidden
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            cancelAnimationFrame(animationId);
        } else {
            animate();
        }
    });

    // === Mouse Events ===
    const coordX = document.getElementById('coordX');
    const coordY = document.getElementById('coordY');
    const titleOverlay = document.getElementById('titleOverlay');

    canvas.addEventListener('mousemove', function (e) {
        state.mouse.x = e.clientX;
        state.mouse.y = e.clientY;
        state.mouseActive = true;

        if (coordX) coordX.textContent = 'X: ' + e.clientX;
        if (coordY) coordY.textContent = 'Y: ' + e.clientY;

        // Hide title on first move
        if (!state.titleHidden && titleOverlay) {
            state.titleHidden = true;
            titleOverlay.classList.add('hidden');
        }
    });

    canvas.addEventListener('mouseleave', function () {
        state.mouseActive = false;
    });

    // Touch support
    canvas.addEventListener('touchmove', function (e) {
        e.preventDefault();
        const touch = e.touches[0];
        state.mouse.x = touch.clientX;
        state.mouse.y = touch.clientY;
        state.mouseActive = true;

        if (coordX) coordX.textContent = 'X: ' + Math.round(touch.clientX);
        if (coordY) coordY.textContent = 'Y: ' + Math.round(touch.clientY);

        if (!state.titleHidden && titleOverlay) {
            state.titleHidden = true;
            titleOverlay.classList.add('hidden');
        }
    }, { passive: false });

    canvas.addEventListener('touchend', function () {
        state.mouseActive = false;
    });

    // === Toolbar Controls ===
    const toolbarToggle = document.getElementById('toolbarToggle');
    const toolbarPanel = document.getElementById('toolbarPanel');

    if (toolbarToggle && toolbarPanel) {
        toolbarToggle.addEventListener('click', function () {
            this.classList.toggle('active');
            toolbarPanel.classList.toggle('active');
        });
    }

    // Mouse Coordinates toggle (checkbox)
    const mouseCoords = document.getElementById('mouseCoords');
    const coordsToggle = document.getElementById('coordsToggle');

    function updateCoordsVisibility() {
        if (mouseCoords) {
            mouseCoords.classList.toggle('hidden', !state.showCoords);
        }
        if (coordsToggle) {
            coordsToggle.checked = state.showCoords;
        }
    }

    if (coordsToggle) {
        coordsToggle.addEventListener('change', function () {
            state.showCoords = this.checked;
            updateCoordsVisibility();
            saveSettings();
        });
    }

    // Apply initial coords visibility
    updateCoordsVisibility();

    // Activate Windows watermark toggle (checkbox)
    const watermarkEl = document.querySelector('.activate-windows');
    const watermarkToggle = document.getElementById('watermarkToggle');

    function updateWatermarkVisibility() {
        if (watermarkEl) {
            watermarkEl.style.display = state.showWatermark ? '' : 'none';
        }
        if (watermarkToggle) {
            watermarkToggle.checked = state.showWatermark;
        }
    }

    if (watermarkToggle) {
        watermarkToggle.addEventListener('change', function () {
            state.showWatermark = this.checked;
            updateWatermarkVisibility();
            saveSettings();
        });
    }

    updateWatermarkVisibility();

    // Crosshair toggle (checkbox)
    const crosshairToggle = document.getElementById('crosshairToggle');

    if (crosshairToggle) {
        crosshairToggle.checked = state.showCrosshair;
        crosshairToggle.addEventListener('change', function () {
            state.showCrosshair = this.checked;
            saveSettings();
        });
    }

    // Custom background color picker (declare early for mode toggle access)
    const customBgInput = document.getElementById('customBgInput');
    const customBgApply = document.getElementById('customBgApply');
    if (customBgApply && customBgInput) {
        customBgApply.addEventListener('click', function () {
            state.customBg = customBgInput.value;
            saveSettings();
        });
    }

    // Mode toggle (dark/light)
    const modeBtns = document.querySelectorAll('.mode-btn');
    modeBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const mode = this.getAttribute('data-mode');
            state.mode = mode;
            state.customBg = null;
            modeBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            if (mode === 'light') {
                document.body.classList.add('light-mode');
            } else {
                document.body.classList.remove('light-mode');
            }
            // Sync bg picker to current scheme's background
            const scheme = colorSchemes[state.colorScheme];
            if (scheme && customBgInput) {
                customBgInput.value = mode === 'light' ? scheme.lightBg : scheme.bg;
            }
            saveSettings();
        });
    });

    // Color presets
    const colorPresets = document.querySelectorAll('.color-preset');
    colorPresets.forEach(btn => {
        btn.addEventListener('click', function () {
            const name = this.getAttribute('data-colors');
            colorPresets.forEach(p => p.classList.remove('active'));
            this.classList.add('active');

            if (lineColorPresets[name]) {
                state.customColor = lineColorPresets[name];
            } else {
                state.colorScheme = name;
                state.customColor = null;
            }
            saveSettings();
        });
    });

    // Custom color picker
    const customColorInput = document.getElementById('customColorInput');
    const customColorApply = document.getElementById('customColorApply');
    if (customColorApply && customColorInput) {
        customColorApply.addEventListener('click', function () {
            const hex = customColorInput.value;
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            state.customColor = { r, g, b };
            // Deselect presets
            colorPresets.forEach(p => p.classList.remove('active'));
            saveSettings();
        });
    }

    // Value display elements
    const densityValue = document.getElementById('densityValue');
    const contourValue = document.getElementById('contourValue');
    const speedValue = document.getElementById('speedValue');
    const radiusValue = document.getElementById('radiusValue');

    // Density slider
    const densityRange = document.getElementById('densityRange');
    if (densityRange) {
        densityRange.addEventListener('input', function () {
            state.density = parseInt(this.value);
            if (densityValue) densityValue.textContent = this.value;
            saveSettings();
        });
    }

    // Speed slider
    const speedRange = document.getElementById('speedRange');
    if (speedRange) {
        speedRange.addEventListener('input', function () {
            state.speed = parseFloat(this.value);
            if (speedValue) speedValue.textContent = this.value;
            saveSettings();
        });
    }

    // Radius slider
    const radiusRange = document.getElementById('radiusRange');
    if (radiusRange) {
        radiusRange.addEventListener('input', function () {
            state.mouseRadius = parseInt(this.value);
            if (radiusValue) radiusValue.textContent = this.value;
            saveSettings();
        });
    }

    // Contour slider
    const contourRange = document.getElementById('contourRange');
    if (contourRange) {
        contourRange.addEventListener('input', function () {
            state.contours = parseInt(this.value);
            if (contourValue) contourValue.textContent = this.value;
            saveSettings();
        });
    }

    // Download
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function () {
            const link = document.createElement('a');
            link.download = 'topographic-wallpaper.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    }

    // Fullscreen
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', function () {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => {
                    console.log('Fullscreen error:', err);
                });
            } else {
                document.exitFullscreen();
            }
        });
    }

    // Reset
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', function () {
            // Re-init noise
            initNoise();
            state.time = 0;
            state.density = 1;
            state.speed = 0;
            state.mouseRadius = 0;
            state.contours = 16;
            state.colorScheme = 'cyan';
            state.customColor = null;
            state.customBg = null;
            state.mouseActive = false;
            state.titleHidden = false;
            state.mode = 'dark';
            state.showCoords = false;
            state.showWatermark = true;
            state.showCrosshair = false;

            // Update UI
            if (densityRange) densityRange.value = 1;
            if (contourRange) contourRange.value = 16;
            if (speedRange) speedRange.value = 0;
            if (radiusRange) radiusRange.value = 0;
            if (densityValue) densityValue.textContent = '1';
            if (contourValue) contourValue.textContent = '16';
            if (speedValue) speedValue.textContent = '0';
            if (radiusValue) radiusValue.textContent = '0';
            if (customColorInput) customColorInput.value = '#06b6d4';
            if (customBgInput) customBgInput.value = '#030712';
            colorPresets.forEach(p => {
                p.classList.toggle('active', p.getAttribute('data-colors') === 'cyan');
            });
            modeBtns.forEach(b => {
                b.classList.toggle('active', b.getAttribute('data-mode') === 'dark');
            });
            document.body.classList.remove('light-mode');
            if (titleOverlay) titleOverlay.classList.remove('hidden');
            updateCoordsVisibility();
            updateWatermarkVisibility();
            if (crosshairToggle) crosshairToggle.checked = false;

            // Clear saved settings
            try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
        });
    }

    // === Apply Saved Settings to UI ===
    function applySettingsToUI() {
        const densityRange = document.getElementById('densityRange');
        const speedRange = document.getElementById('speedRange');
        const radiusRange = document.getElementById('radiusRange');
        const contourRange = document.getElementById('contourRange');
        const customColorInput = document.getElementById('customColorInput');

        if (densityRange) densityRange.value = state.density;
        if (speedRange) speedRange.value = state.speed;
        if (radiusRange) radiusRange.value = state.mouseRadius;
        if (contourRange) contourRange.value = state.contours;

        // Update value displays
        const densityValue = document.getElementById('densityValue');
        const contourValue = document.getElementById('contourValue');
        const speedValue = document.getElementById('speedValue');
        const radiusValue = document.getElementById('radiusValue');
        if (densityValue) densityValue.textContent = state.density;
        if (contourValue) contourValue.textContent = state.contours;
        if (speedValue) speedValue.textContent = state.speed;
        if (radiusValue) radiusValue.textContent = state.mouseRadius;

        // Mode
        if (state.mode === 'light') {
            document.body.classList.add('light-mode');
        }
        document.querySelectorAll('.mode-btn').forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-mode') === state.mode);
        });

        // Color preset or custom color
        if (state.customColor) {
            // Check if it matches a lineColorPreset
            let matched = false;
            document.querySelectorAll('.color-preset').forEach(p => {
                const name = p.getAttribute('data-colors');
                if (lineColorPresets[name] &&
                    lineColorPresets[name].r === state.customColor.r &&
                    lineColorPresets[name].g === state.customColor.g &&
                    lineColorPresets[name].b === state.customColor.b) {
                    p.classList.add('active');
                    matched = true;
                } else {
                    p.classList.remove('active');
                }
            });
            if (!matched && customColorInput) {
                const hex = '#' +
                    state.customColor.r.toString(16).padStart(2, '0') +
                    state.customColor.g.toString(16).padStart(2, '0') +
                    state.customColor.b.toString(16).padStart(2, '0');
                customColorInput.value = hex;
            }
        } else {
            document.querySelectorAll('.color-preset').forEach(p => {
                p.classList.toggle('active', p.getAttribute('data-colors') === state.colorScheme);
            });
        }

        // Custom background
        const bgInput = document.getElementById('customBgInput');
        if (bgInput) {
            if (state.customBg) {
                bgInput.value = state.customBg;
            } else {
                const scheme = colorSchemes[state.colorScheme];
                if (scheme) {
                    bgInput.value = state.mode === 'light' ? scheme.lightBg : scheme.bg;
                }
            }
        }
    }

    applySettingsToUI();

    console.log('🌍 Topographic Wallpaper loaded!');
})();

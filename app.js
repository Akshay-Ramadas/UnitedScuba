/* ==========================================
   ABYSS DIVE // ULTRA-HIGH FPS LIQUID SCROLL ENGINE (300 DENSE FRAMES)
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const canvas = document.getElementById('video-canvas');
    const ctx = canvas.getContext('2d');

    const loader = document.getElementById('loader');
    const loaderBar = document.getElementById('loader-bar');
    const loaderStatus = document.querySelector('.loader-status');

    const heroSection = document.getElementById('hero');
    const depthTint = document.getElementById('depth-tint');

    // HUD Elements
    const depthVal = document.getElementById('depth-value');
    const gaugeFill = document.getElementById('gauge-fill');
    const tempVal = document.getElementById('temp-val');
    const pressureVal = document.getElementById('pressure-val');
    const o2Bar = document.getElementById('o2-bar');
    const o2Val = document.getElementById('o2-val');
    const timelineFill = document.getElementById('timeline-fill');
    const sceneNodes = document.querySelectorAll('.scene-node');
    const sceneCards = document.querySelectorAll('.scene-card');
    const scrollPrompt = document.getElementById('scroll-prompt');

    // Controls & Audio
    const soundBtn = document.getElementById('sound-btn');
    const soundLabel = document.getElementById('sound-label');
    const modeBtn = document.getElementById('mode-btn');
    const modeLabel = document.getElementById('mode-label');

    // Frame Sequence Configuration (300 High-Density Frames)
    const TOTAL_FRAMES = 300;
    const TOTAL_SCENES = 5;
    const frameImages = [];
    let loadedFramesCount = 0;

    // Preload & Pre-decode 300 Frames into GPU VRAM
    for (let i = 0; i < TOTAL_FRAMES; i++) {
        const img = new Image();
        const frameNum = String(i).padStart(4, '0');
        img.src = `frames/frame_${frameNum}.jpg`;

        img.onload = () => {
            if (img.decode) {
                img.decode().then(onFrameLoaded).catch(onFrameLoaded);
            } else {
                onFrameLoaded();
            }
        };
        img.onerror = () => {
            onFrameLoaded();
        };

        frameImages.push(img);
    }

    function onFrameLoaded() {
        loadedFramesCount++;
        const pct = Math.min(100, Math.round((loadedFramesCount / TOTAL_FRAMES) * 100));
        if (loaderBar) loaderBar.style.width = `${pct}%`;
        if (loaderStatus) loaderStatus.textContent = `Preloading 300 underwater video frames (${loadedFramesCount}/${TOTAL_FRAMES})...`;

        if (loadedFramesCount >= TOTAL_FRAMES) {
            setTimeout(startApp, 150);
        }
    }

    // Safety fallback timer
    setTimeout(() => {
        if (loader && !loader.classList.contains('hidden')) {
            startApp();
        }
    }, 2500);

    // Engine Variables
    let isAppStarted = false;
    let targetProgress = 0;
    let currentProgress = 0;
    let isAutoPlay = false;
    let autoPlaySpeed = 0.0008;
    let lastScrollProgress = 0;
    let lastBubbleTime = 0;

    function startApp() {
        if (isAppStarted) return;
        isAppStarted = true;

        if (loader) {
            loader.classList.add('hidden');
        }

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('scroll', onScroll, { passive: true });

        // Initial render
        onScroll();
        requestAnimationFrame(renderLoop);
    }

    // High DPI Canvas Resize
    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
    }

    // Scroll Handler
    function onScroll() {
        if (isAutoPlay) return;

        const heroRect = heroSection.getBoundingClientRect();
        const heroHeight = heroSection.offsetHeight;
        const windowHeight = window.innerHeight;

        const scrollableDistance = heroHeight - windowHeight;
        if (scrollableDistance <= 0) return;

        const currentScroll = -heroRect.top;
        const rawProgress = currentScroll / scrollableDistance;

        targetProgress = Math.max(0, Math.min(1, rawProgress));

        if (targetProgress > 0.02) {
            scrollPrompt.style.opacity = '0';
        } else {
            scrollPrompt.style.opacity = '1';
        }

        // Trigger dynamic underwater scuba bubbles on scroll movement
        const now = Date.now();
        const scrollDelta = Math.abs(targetProgress - lastScrollProgress);
        if (scrollDelta > 0.015 && now - lastBubbleTime > 250) {
            playScrollBubbleSound();
            lastBubbleTime = now;
            lastScrollProgress = targetProgress;
        }
    }

    // Render Loop (60 FPS Liquid Motion)
    function renderLoop() {
        if (isAutoPlay) {
            targetProgress += autoPlaySpeed;
            if (targetProgress > 1) targetProgress = 0;
        }

        // Lerp interpolation (0.12)
        currentProgress += (targetProgress - currentProgress) * 0.12;

        // Calculate Frame Index (0 to 299)
        const frameIndex = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.floor(currentProgress * (TOTAL_FRAMES - 1))));

        // Draw active frame
        drawFrameToCanvas(frameImages[frameIndex]);

        // Calculate Active Scene Index (0 to 4)
        let activeSceneIndex = Math.min(TOTAL_SCENES - 1, Math.floor(currentProgress * TOTAL_SCENES));
        if (currentProgress >= 1) activeSceneIndex = TOTAL_SCENES - 1;

        // Update Scuba HUD Data & Audio Depth modulation
        updateHUD(currentProgress, activeSceneIndex);

        requestAnimationFrame(renderLoop);
    }

    // Draw frame on canvas with Cover Mode
    function drawFrameToCanvas(img) {
        if (!img || !img.complete || img.naturalWidth === 0) return;

        const cW = canvas.width;
        const cH = canvas.height;
        const iW = img.naturalWidth;
        const iH = img.naturalHeight;

        const iRatio = iW / iH;
        const cRatio = cW / cH;

        let drawW, drawH, x, y;
        if (cRatio > iRatio) {
            drawW = cW;
            drawH = cW / iRatio;
            x = 0;
            y = (cH - drawH) / 2;
        } else {
            drawH = cH;
            drawW = cH * iRatio;
            x = (cW - drawW) / 2;
            y = 0;
        }

        ctx.clearRect(0, 0, cW, cH);
        ctx.drawImage(img, x, y, drawW, drawH);
    }

    // Update HUD Metrics & Audio Depth Modulation
    function updateHUD(progress, activeSceneIndex) {
        // Depth (-0m to -120m)
        const depth = Math.round(progress * 120);
        if (depthVal) depthVal.textContent = `-${depth}`;

        // Circular Gauge fill (264 circumference)
        if (gaugeFill) {
            const offset = 264 * (1 - progress);
            gaugeFill.style.strokeDashoffset = offset;
        }

        // Temperature (28°C down to 14°C)
        const temp = (28 - progress * 14).toFixed(1);
        if (tempVal) tempVal.textContent = `${temp}°C`;

        // Atmospheric Pressure (1.0 ATA down to 13.0 ATA)
        const pressure = (1.0 + progress * 12.0).toFixed(1);
        if (pressureVal) pressureVal.textContent = `${pressure} ATA`;

        // Oxygen Bar (200 BAR down to 130 BAR)
        const o2 = Math.round(200 - progress * 70);
        if (o2Val) o2Val.textContent = `${o2} BAR`;
        if (o2Bar) o2Bar.style.width = `${((o2 - 100) / 100) * 100}%`;

        // Timeline fill width
        if (timelineFill) {
            timelineFill.style.width = `${progress * 100}%`;
        }

        // Timeline node highlights
        sceneNodes.forEach((node, idx) => {
            if (idx === activeSceneIndex) {
                node.classList.add('active');
            } else {
                node.classList.remove('active');
            }
        });

        // Narrative Card visibility
        sceneCards.forEach((card, idx) => {
            if (idx === activeSceneIndex) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });

        // Depth Tint Overlay
        if (depthTint) {
            depthTint.style.backgroundColor = `rgba(0, 15, 45, ${progress * 0.4})`;
        }

        // Dynamic Sub-bass filter swell based on depth
        if (audioFilter && isAudioPlaying) {
            const freq = 200 + progress * 250; // Filter opens up deeper in the ocean
            audioFilter.frequency.setTargetAtTime(freq, audioCtx.currentTime, 0.1);
        }
    }

    // Click Timeline Node to jump to exact depth
    sceneNodes.forEach(node => {
        node.addEventListener('click', () => {
            const sceneIdx = parseInt(node.getAttribute('data-jump'), 10);
            const targetProg = sceneIdx / (TOTAL_SCENES - 1);

            const heroHeight = heroSection.offsetHeight;
            const windowHeight = window.innerHeight;
            const scrollDistance = heroHeight - windowHeight;

            const targetScrollY = heroSection.offsetTop + (targetProg * scrollDistance);

            window.scrollTo({
                top: targetScrollY,
                behavior: 'smooth'
            });

            playClickBubbleSound();
        });
    });

    // Toggle Scroll Mode vs Autoplay Mode
    if (modeBtn) {
        modeBtn.addEventListener('click', () => {
            isAutoPlay = !isAutoPlay;
            if (isAutoPlay) {
                modeBtn.classList.add('active');
                modeLabel.textContent = 'AUTO PLAY';
            } else {
                modeBtn.classList.remove('active');
                modeLabel.textContent = 'SCROLL MODE';
                onScroll();
            }
            playClickBubbleSound();
        });
    }

    // Web Audio API Ambient Soundscape & Sub-Bass Synthesizer
    let audioCtx = null;
    let ambientGain = null;
    let audioFilter = null;
    let subOsc = null;
    let subGain = null;
    let isAudioPlaying = false;

    function initAudio() {
        if (audioCtx) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContext();

            // 1. Rich Ocean Ambient Pink/Brown Noise
            const bufferSize = audioCtx.sampleRate * 4;
            const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            const data = buffer.getChannelData(0);
            let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.0750759;
                b2 = 0.96900 * b2 + white * 0.1538520;
                b3 = 0.86650 * b3 + white * 0.3104856;
                b4 = 0.55000 * b4 + white * 0.5329522;
                b5 = -0.7616 * b5 - white * 0.0168980;
                data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
                data[i] *= 0.11; // Richer ocean gain boost
                b6 = white * 0.115926;
            }

            const noiseSource = audioCtx.createBufferSource();
            noiseSource.buffer = buffer;
            noiseSource.loop = true;

            // Muffled Deep Water Filter (250Hz cutoff)
            audioFilter = audioCtx.createBiquadFilter();
            audioFilter.type = 'lowpass';
            audioFilter.frequency.setValueAtTime(250, audioCtx.currentTime);

            ambientGain = audioCtx.createGain();
            ambientGain.gain.setValueAtTime(0.001, audioCtx.currentTime);

            noiseSource.connect(audioFilter);
            audioFilter.connect(ambientGain);
            ambientGain.connect(audioCtx.destination);

            noiseSource.start();

            // 2. Sub-Bass Hydro-Oscillator (45Hz abyssal drone)
            subOsc = audioCtx.createOscillator();
            subGain = audioCtx.createGain();
            subOsc.type = 'sine';
            subOsc.frequency.setValueAtTime(45, audioCtx.currentTime);

            subGain.gain.setValueAtTime(0.001, audioCtx.currentTime);

            subOsc.connect(subGain);
            subGain.connect(audioCtx.destination);

            subOsc.start();

        } catch (e) {
            console.warn('AudioContext failed:', e);
        }
    }

    if (soundBtn) {
        soundBtn.addEventListener('click', () => {
            if (!audioCtx) initAudio();
            if (audioCtx && audioCtx.state === 'suspended') {
                audioCtx.resume();
            }

            isAudioPlaying = !isAudioPlaying;
            if (isAudioPlaying) {
                // Higher ambient volume (0.50 gain) and rich sub-bass (0.25)
                if (ambientGain) ambientGain.gain.exponentialRampToValueAtTime(0.50, audioCtx.currentTime + 0.8);
                if (subGain) subGain.gain.exponentialRampToValueAtTime(0.25, audioCtx.currentTime + 1.2);
                soundLabel.textContent = 'SOUND ON';
                soundBtn.classList.add('active');
            } else {
                if (ambientGain) ambientGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
                if (subGain) subGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
                soundLabel.textContent = 'SOUND OFF';
                soundBtn.classList.remove('active');
            }

            playClickBubbleSound();
        });
    }

    // Scroll Bubble Burst Effect
    function playScrollBubbleSound() {
        if (!audioCtx || !isAudioPlaying) return;
        try {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sine';
            const baseFreq = 180 + Math.random() * 120;
            osc.frequency.setValueAtTime(baseFreq, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.8, audioCtx.currentTime + 0.15);

            gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.16);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + 0.17);
        } catch (e) {
            // ignore
        }
    }

    // Click Bubble Sound
    function playClickBubbleSound() {
        if (!audioCtx || !isAudioPlaying) return;
        try {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sine';
            const startFreq = 220 + Math.random() * 150;
            const endFreq = 700 + Math.random() * 250;

            osc.frequency.setValueAtTime(startFreq, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(endFreq, audioCtx.currentTime + 0.14);

            gain.gain.setValueAtTime(0.35, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + 0.16);
        } catch (e) {
            // ignore
        }
    }
});

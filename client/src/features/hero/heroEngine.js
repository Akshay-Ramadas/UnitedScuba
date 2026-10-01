const TOTAL_FRAMES = 300;
const TOTAL_SCENES = 5;
const FRAME_LOADS = 4;

function frameSrc(index) {
  return `/frames/frame_${String(index).padStart(4, '0')}.jpg`;
}

function heroPixelRatio() {
  return Math.min(window.devicePixelRatio || 1, 1.5);
}

function createFrameLoader() {
  const images = new Array(TOTAL_FRAMES);
  const state = new Uint8Array(TOTAL_FRAMES);
  let active = 0;
  let focus = 0;
  let onReady = () => {};

  function start(index) {
    if (state[index] !== 0) return;
    state[index] = 1;
    active += 1;
    const img = new Image();
    img.decoding = 'async';
    img.src = frameSrc(index);
    const done = () => {
      state[index] = 2;
      active -= 1;
      onReady(index);
      pump();
    };
    img.onload = () => {
      if (img.decode) img.decode().then(done).catch(done);
      else done();
    };
    img.onerror = done;
    images[index] = img;
  }

  function pump() {
    if (state[focus] === 0) start(focus);
    for (let step = 1; step < TOTAL_FRAMES && active < FRAME_LOADS; step += 1) {
      const ahead = focus + step;
      const behind = focus - step;
      if (ahead < TOTAL_FRAMES && state[ahead] === 0 && active < FRAME_LOADS) start(ahead);
      if (behind >= 0 && state[behind] === 0 && active < FRAME_LOADS) start(behind);
    }
  }

  return {
    images,
    setFocus(index) {
      focus = Math.max(0, Math.min(TOTAL_FRAMES - 1, index));
      pump();
    },
    setOnReady(fn) { onReady = fn; },
    ready(index) {
      const img = images[index];
      return state[index] === 2 && img && img.naturalWidth > 0;
    },
  };
}

function nearestReady(loader, index) {
  if (loader.ready(index)) return index;
  for (let step = 1; step < 24; step += 1) {
    if (loader.ready(index - step)) return index - step;
  }
  return loader.ready(0) ? 0 : -1;
}

export function isMobileHero() {
  if (typeof window === 'undefined') return true;
  // Only fallback to static hero on very small phones (portrait ≤ 480px)
  // or when the user has data-saver explicitly on.
  const tooNarrow = window.matchMedia('(max-width: 480px)').matches;
  const saveData  = Boolean(navigator.connection?.saveData);
  return tooNarrow || saveData;
}

/** Plays the dive frames on their own. Used on phones, where scroll-scrub is off. */
export function playFrameVideo(canvas) {
  if (!canvas) return () => {};
  const ctx = canvas.getContext('2d', { alpha: false });
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const frameMs = 50;
  const loader = createFrameLoader();
  let destroyed = false;
  let rafId = 0;
  let index = 0;
  let drawn = -1;
  let last = 0;
  loader.setFocus(0);

  function resize() {
    const dpr = heroPixelRatio();
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    drawn = -1;
  }

  function draw(img) {
    if (!img || !img.complete || img.naturalWidth === 0) return;
    const cW = canvas.width;
    const cH = canvas.height;
    const iRatio = img.naturalWidth / img.naturalHeight;
    const cRatio = cW / cH;
    let drawW;
    let drawH;
    let x;
    let y;
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
    ctx.drawImage(img, x, y, drawW, drawH);
  }

  function loop(now) {
    if (destroyed) return;
    if (!reduced) {
      if (!last) last = now;
      if (now - last >= frameMs) {
        const next = (index + 1) % TOTAL_FRAMES;
        if (loader.ready(next)) {
          last = now;
          index = next;
          loader.setFocus(index);
        }
      }
    }
    if (index !== drawn && loader.ready(index)) {
      draw(loader.images[index]);
      drawn = index;
    }
    rafId = requestAnimationFrame(loop);
  }

  resize();
  window.addEventListener('resize', resize);
  rafId = requestAnimationFrame(loop);

  return () => {
    destroyed = true;
    cancelAnimationFrame(rafId);
    window.removeEventListener('resize', resize);
  };
}

export function initHero(root) {
  const canvas = root.querySelector('#video-canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const heroSection = root.querySelector('#hero');
  const depthTint = root.querySelector('#depth-tint');
  const depthVal = root.querySelector('#depth-value');
  const gaugeFill = root.querySelector('#gauge-fill');
  const tempVal = root.querySelector('#temp-val');
  const pressureVal = root.querySelector('#pressure-val');
  const o2Bar = root.querySelector('#o2-bar');
  const o2Val = root.querySelector('#o2-val');
  const timelineFill = root.querySelector('#timeline-fill');
  const sceneNodes = root.querySelectorAll('.scene-node');
  const sceneCards = root.querySelectorAll('.scene-card');
  const scrollPrompt = root.querySelector('#scroll-prompt');
  const modeBtn = root.querySelector('#mode-btn');
  const modeLabel = root.querySelector('#mode-label');

  const frames = createFrameLoader();
  let isAppStarted = false;
  let destroyed = false;
  let rafId = 0;
  let targetProgress = 0;
  let currentProgress = 0;
  let isAutoPlay = false;
  let drawnFrame = -1;
  const autoPlaySpeed = 0.0008;
  let lastScrollProgress = 0;
  let lastBubbleTime = 0;
  let audioCtx = null;
  let ambientGain = null;
  let audioFilter = null;
  let subOsc = null;
  let subGain = null;
  let isAudioPlaying = false;

  frames.setOnReady(() => {
    if (!destroyed && !isAppStarted && frames.ready(0)) startApp();
  });
  frames.setFocus(0);

  function startApp() {
    if (isAppStarted || destroyed) return;
    isAppStarted = true;
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    rafId = requestAnimationFrame(renderLoop);
  }

  startApp();

  function resizeCanvas() {
    const dpr = heroPixelRatio();
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    drawnFrame = -1;
  }

  function onScroll() {
    if (isAutoPlay || destroyed) return;
    const heroRect = heroSection.getBoundingClientRect();
    const scrollableDistance = heroSection.offsetHeight - window.innerHeight;
    if (scrollableDistance <= 0) return;
    const rawProgress = -heroRect.top / scrollableDistance;
    targetProgress = Math.max(0, Math.min(1, rawProgress));
    if (scrollPrompt) scrollPrompt.style.opacity = targetProgress > 0.02 ? '0' : '1';

    const now = Date.now();
    const scrollDelta = Math.abs(targetProgress - lastScrollProgress);
    if (scrollDelta > 0.015 && now - lastBubbleTime > 250) {
      playScrollBubbleSound();
      lastBubbleTime = now;
      lastScrollProgress = targetProgress;
    }
  }

  function renderLoop() {
    if (destroyed) return;
    if (isAutoPlay) {
      targetProgress += autoPlaySpeed;
      if (targetProgress > 1) targetProgress = 0;
    }
    currentProgress += (targetProgress - currentProgress) * 0.12;
    const frameIndex = Math.min(
      TOTAL_FRAMES - 1,
      Math.max(0, Math.floor(currentProgress * (TOTAL_FRAMES - 1)))
    );
    frames.setFocus(frameIndex);
    const show = nearestReady(frames, frameIndex);
    if (show !== -1 && show !== drawnFrame) {
      drawFrameToCanvas(frames.images[show]);
      drawnFrame = show;
    }
    let activeSceneIndex = Math.min(TOTAL_SCENES - 1, Math.floor(currentProgress * TOTAL_SCENES));
    if (currentProgress >= 1) activeSceneIndex = TOTAL_SCENES - 1;
    updateHUD(currentProgress, activeSceneIndex);
    rafId = requestAnimationFrame(renderLoop);
  }

  function drawFrameToCanvas(img) {
    if (!img || !img.complete || img.naturalWidth === 0) return;
    const cW = canvas.width;
    const cH = canvas.height;
    const iRatio = img.naturalWidth / img.naturalHeight;
    const cRatio = cW / cH;
    let drawW;
    let drawH;
    let x;
    let y;
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

  function updateHUD(progress, activeSceneIndex) {
    const depth = Math.round(progress * 120);
    if (depthVal) depthVal.textContent = String(depth);
    if (gaugeFill) gaugeFill.style.strokeDashoffset = String(264 * (1 - progress));
    if (tempVal) tempVal.textContent = `${(28 - progress * 14).toFixed(1)}°C`;
    if (pressureVal) pressureVal.textContent = `${(1 + progress * 12).toFixed(1)} ATA`;
    const o2 = Math.round(200 - progress * 70);
    if (o2Val) o2Val.textContent = `${o2} BAR`;
    if (o2Bar) o2Bar.style.width = `${((o2 - 100) / 100) * 100}%`;
    if (timelineFill) timelineFill.style.width = `${progress * 100}%`;
    sceneNodes.forEach((node, idx) => node.classList.toggle('active', idx === activeSceneIndex));
    sceneCards.forEach((card, idx) => card.classList.toggle('active', idx === activeSceneIndex));
    if (depthTint) depthTint.style.backgroundColor = `rgba(0, 15, 45, ${progress * 0.4})`;
    if (audioFilter && isAudioPlaying) {
      audioFilter.frequency.setTargetAtTime(200 + progress * 250, audioCtx.currentTime, 0.1);
    }
  }

  sceneNodes.forEach((node) => {
    node.addEventListener('click', () => {
      const sceneIdx = Number(node.getAttribute('data-jump'));
      const targetProg = sceneIdx / (TOTAL_SCENES - 1);
      const scrollDistance = heroSection.offsetHeight - window.innerHeight;
      window.scrollTo({
        top: heroSection.offsetTop + targetProg * scrollDistance,
        behavior: 'smooth',
      });
      playClickBubbleSound();
    });
  });

  if (modeBtn) {
    modeBtn.addEventListener('click', () => {
      isAutoPlay = !isAutoPlay;
      modeBtn.classList.toggle('active', isAutoPlay);
      if (modeLabel) modeLabel.textContent = isAutoPlay ? 'AUTO PLAY' : 'SCROLL MODE';
      if (!isAutoPlay) onScroll();
      playClickBubbleSound();
    });
  }

  function initAudio() {
    if (audioCtx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
      const bufferSize = audioCtx.sampleRate * 4;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0;
      let b1 = 0;
      let b2 = 0;
      let b3 = 0;
      let b4 = 0;
      let b5 = 0;
      let b6 = 0;
      for (let i = 0; i < bufferSize; i += 1) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
      const noiseSource = audioCtx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;
      audioFilter = audioCtx.createBiquadFilter();
      audioFilter.type = 'lowpass';
      audioFilter.frequency.setValueAtTime(250, audioCtx.currentTime);
      ambientGain = audioCtx.createGain();
      ambientGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
      noiseSource.connect(audioFilter);
      audioFilter.connect(ambientGain);
      ambientGain.connect(audioCtx.destination);
      noiseSource.start();
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

  function setAmbient(on) {
    if (destroyed) return;
    if (on) {
      if (!audioCtx) initAudio();
      if (!audioCtx) return;
      if (audioCtx.state === 'suspended') audioCtx.resume();
      isAudioPlaying = true;
      ambientGain?.gain.exponentialRampToValueAtTime(0.28, audioCtx.currentTime + 0.6);
      subGain?.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 0.8);
    } else if (audioCtx) {
      isAudioPlaying = false;
      ambientGain?.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
      subGain?.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
    }
  }

  const onSoundEvent = (event) => setAmbient(Boolean(event.detail));
  window.addEventListener('us-sound', onSoundEvent);

  let unlockSound = null;
  if (localStorage.getItem('us_sound') === 'on') {
    unlockSound = () => {
      setAmbient(true);
      window.removeEventListener('pointerdown', unlockSound);
      unlockSound = null;
    };
    window.addEventListener('pointerdown', unlockSound);
  }

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
    } catch {
      /* ignore */
    }
  }

  function playClickBubbleSound() {
    if (!audioCtx || !isAudioPlaying) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      const startFreq = 220 + Math.random() * 150;
      osc.frequency.setValueAtTime(startFreq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(700 + Math.random() * 250, audioCtx.currentTime + 0.14);
      gain.gain.setValueAtTime(0.35, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.16);
    } catch {
      /* ignore */
    }
  }

  return () => {
    destroyed = true;
    cancelAnimationFrame(rafId);
    window.removeEventListener('resize', resizeCanvas);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('us-sound', onSoundEvent);
    if (unlockSound) window.removeEventListener('pointerdown', unlockSound);
    if (audioCtx) audioCtx.close().catch(() => {});
  };
}

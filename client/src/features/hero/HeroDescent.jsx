import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { initHero, isMobileHero, playFrameVideo } from './heroEngine.js';
import { useScrollReveal, useCounter } from '../../hooks/useScrollReveal.jsx';
import { useContent } from '../../hooks/useContent.jsx';
import { pageFields } from '../../content/pageCopy.js';
import './hero.css';

const HERO_STATS = [
  { num: 30, suffix: 'K', label: 'Happy Divers' },
  { num: 10, suffix: '+', label: 'Years Experience' },
  { num: 8, suffix: '', label: 'PADI Courses' },
];

function StatItem({ num, suffix, label }) {
  const [ref, visible] = useScrollReveal();
  const count = useCounter(num, visible);
  return (
    <div ref={ref} className="hero-stat">
      <div className="hero-stat-num">{count}{suffix}</div>
      <div className="hero-stat-label">{label}</div>
    </div>
  );
}

function HeroStats() {
  return (
    <div className="hero-stats" aria-label="United Scuba in numbers">
      {HERO_STATS.map((item) => <StatItem key={item.label} {...item} />)}
    </div>
  );
}

const CHAPTERS = [
  { id: 'beginners', label: 'Beginners' },
  { id: 'certified', label: 'Certified' },
  { id: 'advanced', label: 'Advanced' },
];

function heroScenes(copy) {
  return CHAPTERS.map((chapter) => ({
    id: chapter.id,
    kicker: copy[`${chapter.id}Kicker`],
    title: copy[`${chapter.id}Title`],
    lead: copy[`${chapter.id}Lead`],
  }));
}

function HeroActions() {
  return (
    <div className="hero-actions">
      <Link className="hero-book" to="/book-now">Book a dive</Link>
      <Link className="hero-textlink" to="/courses">PADI courses</Link>
    </div>
  );
}

function MobileHero({ scene }) {
  const canvasRef = useRef(null);

  useEffect(() => playFrameVideo(canvasRef.current), []);

  return (
    <section className="hero-mobile" id="hero">
      <canvas ref={canvasRef} className="hero-mobile-canvas" aria-hidden />
      <div className="hero-mobile-inner">
        <p className="hero-kicker">{scene.kicker}</p>
        <h1>{scene.title}</h1>
        <p className="hero-lead">{scene.lead}</p>
        <HeroActions />
      </div>
    </section>
  );
}

export default function HeroDescent() {
  const { settings } = useContent();
  const copy = pageFields(settings, 'hero');
  const scenes = heroScenes(copy);
  const mobileScene = {
    kicker: copy.phoneKicker,
    title: copy.phoneTitle,
    lead: copy.phoneLead,
  };
  const rootRef = useRef(null);
  const [active, setActive] = useState(0);
  const [mobile, setMobile] = useState(() => (typeof window !== 'undefined' ? isMobileHero() : true));

  useEffect(() => {
    const onResize = () => setMobile(isMobileHero());
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (mobile || !rootRef.current) return undefined;
    return initHero(rootRef.current, setActive);
  }, [mobile]);

  if (mobile) return <MobileHero scene={mobileScene} />;

  return (
    <div className="hero-root" ref={rootRef}>
      <section id="hero" className="hero-scroll-container">
        <div className="hero-sticky-viewport">
          <canvas id="video-canvas" />
          <div className="vignette-overlay" />
          <div className="depth-tint-overlay" id="depth-tint" />

          <div className="hero-panel">
            <div className="hero-scenes">
              {scenes.map((scene, idx) => (
                <article className={`scene-card${idx === active ? ' active' : ''}`} data-scene={idx} key={scene.id}>
                  <p className="hero-kicker">{scene.kicker}</p>
                  <h1 className="scene-title">{scene.title}</h1>
                  <p className="hero-lead">{scene.lead}</p>
                </article>
              ))}
            </div>
            <HeroActions />
          </div>

          <nav className="hero-chapters" aria-label="Descent">
            {CHAPTERS.map((chapter, n) => (
              <button className={`scene-node${n === active ? ' active' : ''}`} data-jump={n} type="button" key={chapter.id}>
                <span className="node-index">{String(n + 1).padStart(2, '0')}</span>
                <span className="node-label">{chapter.label}</span>
              </button>
            ))}
          </nav>

          <div className="hero-depth">
            <span id="depth-value">0</span>
            <span className="hero-depth-unit">metres</span>
          </div>

          <div className="scroll-prompt" id="scroll-prompt">
            <span>Scroll</span>
            <span className="scroll-line" />
          </div>

          <HeroStats />
        </div>
      </section>
    </div>
  );
}

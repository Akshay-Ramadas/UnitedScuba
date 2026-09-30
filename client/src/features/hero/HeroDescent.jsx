import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { initHero, isMobileHero, playFrameVideo } from './heroEngine.js';
import { useScrollReveal, useCounter } from '../../hooks/useScrollReveal.jsx';
import './hero.css';

function statsFor(activityCount) {
  return [
    { num: activityCount, suffix: '', label: 'Activities' },
    { num: 3000, suffix: '+', label: 'Happy Divers' },
    { num: 8, suffix: '+', label: 'Years Experience' },
    { num: 8, suffix: '', label: 'PADI Courses' },
  ];
}

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

function HeroStats({ activityCount }) {
  return (
    <div className="hero-stats" aria-label="United Scuba in numbers">
      {statsFor(activityCount).map((item) => <StatItem key={item.label} {...item} />)}
    </div>
  );
}

const SCENES = [
  {
    kicker: 'Swaraj Dweep',
    title: 'Scuba diving in Havelock, made clear.',
    lead: 'A first dive, a snorkel, or a PADI course from Beach No. 02. We explain everything first, stay with you, and pick a calm site for the day.',
  },
  {
    kicker: 'First time',
    title: 'Shallow water, with a guide beside you.',
    lead: 'No experience needed. You learn how to breathe underwater, then dive on a reef where we can stay close the whole way.',
  },
  {
    kicker: 'Certified divers',
    title: 'Fun dives that match your certificate.',
    lead: 'For Open Water and above. We check the sea and your group, then take you to a reef that fits the level you already hold.',
  },
  {
    kicker: 'Experienced divers',
    title: 'Deeper reefs, planned for your level.',
    lead: 'For advanced divers. We brief you on the boat and choose a dive that matches the qualification on your card.',
  },
  {
    kicker: 'United Scuba',
    title: 'Tell us your dates. We plan the dive.',
    lead: 'We are at Sands Marina Resort, Beach No. 02, Swaraj Dweep. Message us for a first dive, a course, or a day on the boat.',
  },
];

const CHAPTERS = ['Start', 'Beginners', 'Certified', 'Advanced', 'Book'];

function HeroActions() {
  return (
    <div className="hero-actions">
      <Link className="hero-book" to="/book-now">Book a dive</Link>
      <Link className="hero-textlink" to="/courses">PADI courses</Link>
    </div>
  );
}

const MOBILE_SCENE = {
  kicker: 'UNITED SCUBA',
  title: 'See Havelock from underwater.',
  lead: 'Try scuba, snorkel a reef, or begin a PADI course from Beach No. 02. We explain it first, stay with you, and choose calm water for the day.',
};

function MobileHero() {
  const canvasRef = useRef(null);
  const scene = MOBILE_SCENE;

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

export default function HeroDescent({ activityCount = 0 }) {
  const rootRef = useRef(null);
  const [mobile, setMobile] = useState(() => (typeof window !== 'undefined' ? isMobileHero() : true));

  useEffect(() => {
    const onResize = () => setMobile(isMobileHero());
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (mobile || !rootRef.current) return undefined;
    return initHero(rootRef.current);
  }, [mobile]);

  if (mobile) return <MobileHero />;

  return (
    <div className="hero-root" ref={rootRef}>
      <section id="hero" className="hero-scroll-container">
        <div className="hero-sticky-viewport">
          <canvas id="video-canvas" />
          <div className="vignette-overlay" />
          <div className="depth-tint-overlay" id="depth-tint" />

          <div className="hero-panel">
            <div className="hero-scenes">
              {SCENES.map((scene, idx) => (
                <article className={`scene-card${idx === 0 ? ' active' : ''}`} data-scene={idx} key={scene.title}>
                  <p className="hero-kicker">{scene.kicker}</p>
                  <h1 className="scene-title">{scene.title}</h1>
                  <p className="hero-lead">{scene.lead}</p>
                </article>
              ))}
            </div>
            <HeroActions />
          </div>

          <nav className="hero-chapters" aria-label="Descent">
            {CHAPTERS.map((label, n) => (
              <button className={`scene-node${n === 0 ? ' active' : ''}`} data-jump={n} type="button" key={label}>
                <span className="node-index">{String(n + 1).padStart(2, '0')}</span>
                <span className="node-label">{label}</span>
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

          <HeroStats activityCount={activityCount} />
        </div>
      </section>
    </div>
  );
}

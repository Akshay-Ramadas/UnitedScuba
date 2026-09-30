import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import HeroDescent from '../features/hero/HeroDescent.jsx';
import CtaBanner from '../components/CtaBanner.jsx';
import FaqList from '../components/FaqList.jsx';
import { Seo } from '../lib/seo.jsx';
import { useContent } from '../hooks/useContent.jsx';
import { lines, pageFields } from '../content/pageCopy.js';
import { useScrollReveal, useCounter } from '../hooks/useScrollReveal.jsx';

/* ── Section wrapper with reveal ── */
function mobileStats(activityCount) {
  return [
    { num: activityCount, suffix: '', label: 'Activities' },
    { num: 3000, suffix: '+', label: 'Happy Divers' },
    { num: 8, suffix: '+', label: 'Years Experience' },
    { num: 8, suffix: '', label: 'PADI Courses' },
  ];
}

function MobileStat({ num, suffix, label }) {
  const [ref, visible] = useScrollReveal();
  const count = useCounter(num, visible);
  return (
    <div ref={ref} className="stat-item">
      <div className="stat-num">{count}{suffix}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function Reveal({ children, className = '', delay = 0 }) {
  const [ref, visible] = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`reveal${visible ? ' visible' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}

function GuestReel({ src, label }) {
  const frameRef = useRef(null);
  const videoRef = useRef(null);
  const [near, setNear] = useState(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const node = frameRef.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setNear(entry.isIntersecting),
      { rootMargin: '240px 0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !near) return undefined;
    video.play().catch(() => {});
    return () => video.pause();
  }, [near, src]);

  return (
    <div className="reel-frame" ref={frameRef}>
      <video
        ref={videoRef}
        src={near ? src : undefined}
        muted={muted}
        loop
        playsInline
        autoPlay
        preload="none"
        aria-label={label}
      />
      <button
        type="button"
        className="reel-sound"
        aria-pressed={!muted}
        onClick={() => setMuted((value) => !value)}
      >
        {muted ? 'Unmute' : 'Mute'}
      </button>
    </div>
  );
}

function UnderwaterDrift() {
  const layer = useRef(null);
  useEffect(() => {
    const onScroll = () => {
      if (!layer.current) return;
      const y = window.scrollY;
      layer.current.querySelectorAll('img').forEach((img, i) => {
        const speed = 0.08 + i * 0.05;
        img.style.translate = `0 ${y * speed * -0.25}px`;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div className="sea-layer" ref={layer} aria-hidden="true">
      <img className="d1" src="/decor/turtle.svg" alt="" />
      <img className="d2" src="/decor/fish.svg" alt="" />
      <img className="d3" src="/decor/coral.svg" alt="" />
      <img className="d4" src="/decor/bubbles.svg" alt="" />
    </div>
  );
}

export default function Home() {
  const { settings, courses, activities, faqs, reviews, gallery } = useContent();
  const home = pageFields(settings, 'home');
  const featuredCourses = courses.slice(0, 3);
  const scuba   = activities.filter((a) => a.type === 'scuba').slice(0, 4);
  const snorkel = activities.filter((a) => a.type === 'snorkelling').slice(0, 1);
  const preview = [...gallery]
    .sort((a, b) => {
      const order = (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0);
      if (order) return order;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    })
    .slice(0, 6);

  return (
    <>
      <Seo
        title={settings.seoTitle || 'United Scuba | Scuba Diving in the Andaman Islands'}
        description={settings.seoDescription}
        path="/"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: 'United Scuba',
          description: settings.seoDescription,
          telephone: settings.phone,
          email: settings.email,
          address: settings.location,
        }}
      />

      {/* ── Hero (300-frame scroll animation — untouched) ── */}
      <HeroDescent activityCount={activities.length} />

      <div className="stat-strip stat-strip-mobile">
        <div className="stat-strip-grid">
          {mobileStats(activities.length).map((item) => <MobileStat key={item.label} {...item} />)}
        </div>
      </div>

      <div className="home-flow">
      <UnderwaterDrift />
      <section className="section section-dark">
        <div className="glow-orb glow-orb-1" />
        <div className="container">
          <Reveal>
            <div className="section-head">
              <span className="kicker">{home.centreKicker}</span>
              <h2 className="section-title">{home.centreTitle}</h2>
              <p className="section-lead">{home.centreText}</p>
            </div>
          </Reveal>
          <div className="why-grid">
            {lines(home.highlights).map((item, i) => (
              <Reveal key={item} delay={i * 0.06}>
                <div className="why-card">
                  <span className="why-num">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{item}</h3>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="glow-orb glow-orb-2" />
        <div className="container">
          <div className="activity-split">
            <Reveal>
              <div className="activity-col activity-col-scuba">
                <span className="kicker">{home.scubaKicker}</span>
                <h2>{home.scubaTitle}</h2>
                <p>{home.scubaText}</p>
                <Link className="explore-link" to="/scuba-diving">See scuba diving</Link>
                <div className="activity-cards">
                  {scuba.map((a, i) => (
                    <Link to={`/scuba-diving/${a.slug}`} className="act-card" key={a.slug}>
                      <span className="act-index">{String(i + 1).padStart(2, '0')}</span>
                      <div>
                        <h4>{a.title}</h4>
                        <p>{a.excerpt}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </Reveal>
            <Reveal>
              <div className="activity-col activity-col-snorkel">
                <span className="kicker">{home.snorkelKicker}</span>
                <h2>{home.snorkelTitle}</h2>
                <p>{home.snorkelText}</p>
                <Link className="explore-link" to="/snorkelling">See snorkelling</Link>
                <div className="activity-cards">
                  {snorkel.map((a) => (
                    <Link to={`/snorkelling/${a.slug}`} className="act-card" key={a.slug}>
                      <div>
                        <h4>{a.title}</h4>
                        <p>{a.excerpt}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section section-dark">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <span className="kicker">{home.coursesKicker}</span>
              <h2 className="section-title">{home.coursesTitle}</h2>
              <p className="section-lead">{home.coursesLead}</p>
            </div>
          </Reveal>
          <div className="course-grid">
            {featuredCourses.map((c, i) => (
              <Reveal key={c.slug} delay={i * 0.08}>
                <Link className="course-card" to={`/courses/${c.slug}`}>
                  <div className="course-img-wrap">
                    <img src={c.heroImage || '/frames/frame_0060.jpg'} alt={c.title} loading="lazy" />
                    <div className="course-overlay" />
                    <span className="course-badge">PADI</span>
                  </div>
                  <div className="course-body">
                    <h3>{c.title}</h3>
                    <p>{c.excerpt}</p>
                    <span className="course-cta">Course details</span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
          <p className="section-more">
            <Link className="text-link" to="/courses">All courses</Link>
          </p>
        </div>
      </section>

      {home.reelVideo.trim() && (
        <section className="section section-reel">
          <div className="container reel-layout">
            <GuestReel src={home.reelVideo.trim()} label={home.reelTitle} />
            <Reveal>
              <div>
                <span className="kicker">{home.reelKicker}</span>
                <h2 className="section-title">{home.reelTitle}</h2>
                <p className="reel-caption">{home.reelText}</p>
                <p className="reel-desc">{home.reelDesc}</p>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      <section className="section section-alt">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <span className="kicker">{home.galleryKicker}</span>
              <h2 className="section-title">{home.galleryTitle}</h2>
              <p className="section-lead">{home.galleryLead}</p>
            </div>
          </Reveal>
          <div className="gallery-masonry">
            {preview.map((g) => (
              <div key={g.url} className="gallery-item">
                <img src={g.url} alt={g.alt || 'Underwater photo'} loading="lazy" />
              </div>
            ))}
          </div>
          <p className="section-more">
            <Link className="text-link" to="/gallery">Full gallery</Link>
          </p>
        </div>
      </section>

      <section className="section section-dark">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <span className="kicker">{home.reviewsKicker}</span>
              <h2 className="section-title">{home.reviewsTitle}</h2>
            </div>
          </Reveal>
          <div className="reviews-grid">
            {reviews.map((r, i) => (
              <Reveal key={r.name} delay={i * 0.08}>
                <article className="review-card">
                  <div className="review-stars">{'★'.repeat(r.rating || 5)}{'☆'.repeat(Math.max(0, 5 - (r.rating || 5)))}</div>
                  <p className="review-quote">{r.quote}</p>
                  <div className="review-name">{r.name}</div>
                  <div className="review-source">{r.source || 'Guest'}</div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <span className="kicker">{home.faqKicker}</span>
              <h2 className="section-title">{home.faqTitle}</h2>
            </div>
          </Reveal>
          <div style={{ maxWidth: '46rem' }}>
            <Reveal>
              <FaqList items={faqs.filter((f) => f.page === 'home')} />
            </Reveal>
          </div>
          <Reveal>
            <CtaBanner
              title={home.ctaTitle}
              text={home.ctaText}
            />
          </Reveal>
        </div>
      </section>
      </div>
    </>
  );
}

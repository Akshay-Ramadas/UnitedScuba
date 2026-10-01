import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero.jsx';
import CtaBanner from '../components/CtaBanner.jsx';
import FaqList from '../components/FaqList.jsx';
import { Seo } from '../lib/seo.jsx';
import { faqJsonLd, graphJsonLd } from '../lib/siteSchema.js';
import { useContent } from '../hooks/useContent.jsx';
import { pageFields } from '../content/pageCopy.js';
import { useScrollReveal } from '../hooks/useScrollReveal.jsx';

function Reveal({ children, delay = 0 }) {
  const [ref, visible] = useScrollReveal();
  return (
    <div ref={ref} className={`reveal${visible ? ' visible' : ''}`} style={delay ? { transitionDelay: `${delay}s` } : undefined}>
      {children}
    </div>
  );
}

function CourseGroup({ title, items }) {
  if (!items.length) return null;
  return (
    <div style={{ marginBottom: '3.5rem' }}>
      <Reveal>
        <h2 style={{ fontSize: '1.7rem', fontWeight: 500, letterSpacing: '-0.03em', marginBottom: '1.5rem', color: 'var(--text)' }}>{title}</h2>
      </Reveal>
      <div className="course-grid">
        {items.map((c, i) => (
          <Reveal key={c.slug} delay={i * 0.08}>
            <Link className="course-card" to={`/courses/${c.slug}`}>
              <div className="course-img-wrap">
                <img src={c.heroImage || '/frames/frame_0120.jpg'} alt={c.title} loading="lazy" />
                <div className="course-overlay" />
                <span className="course-badge">PADI</span>
              </div>
              <div className="course-body">
                <h3>{c.title}</h3>
                <p>{c.excerpt}</p>
                {c.price && <span className="course-price">{c.price}</span>}
                <span className="course-cta">Course details →</span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

export default function Courses() {
  const { courses, faqs, settings } = useContent();
  const copy = pageFields(settings, 'courses');
  return (
    <>
      <Seo
        title="PADI Scuba Diving Courses | United Scuba"
        description="Recreational and professional PADI courses with United Scuba in the Andaman Islands."
        path="/courses"
        jsonLd={graphJsonLd(faqJsonLd(faqs.filter((item) => item.page === 'courses')))}
      />
      <PageHero
        kicker={copy.kicker}
        title={copy.title}
        intro={copy.intro}
      />
      <section className="section section-dark">
        <div className="container">
          <CourseGroup title={copy.recreationalTitle} items={courses.filter((c) => c.category === 'recreational')} />
          <CourseGroup title={copy.professionalTitle} items={courses.filter((c) => c.category === 'professional')} />
          <Reveal>
            <h2 style={{ fontSize: '1.7rem', fontWeight: 500, letterSpacing: '-0.03em', marginBottom: '1.25rem', color: 'var(--text)' }}>{copy.faqTitle}</h2>
            <FaqList items={faqs.filter((f) => f.page === 'courses')} />
          </Reveal>
          <Reveal>
            <div style={{ marginTop: '3rem' }}>
              <CtaBanner />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

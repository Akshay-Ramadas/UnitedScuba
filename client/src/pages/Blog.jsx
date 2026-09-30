import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero.jsx';
import { Seo } from '../lib/seo.jsx';
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

export default function Blog() {
  const { posts, settings } = useContent();
  const copy = pageFields(settings, 'blog');
  return (
    <>
      <Seo title="Scuba & Snorkelling Guides | United Scuba Blog" description="Beginner guides, PADI course explainers and Andaman diving tips." path="/blog" />
      <PageHero kicker={copy.kicker} title={copy.title} intro={copy.intro} />
      <section className="section section-dark">
        <div className="container">
          <div className="course-grid">
            {posts.map((p, i) => (
              <Reveal key={p.slug} delay={i * 0.08}>
                <Link className="course-card" to={`/blog/${p.slug}`}>
                  <div className="course-img-wrap">
                    <img src={p.coverImage || '/frames/frame_0240.jpg'} alt={p.title} loading="lazy" />
                    <div className="course-overlay" />
                    {p.category && <span className="course-badge">{p.category}</span>}
                  </div>
                  <div className="course-body">
                    <h3>{p.title}</h3>
                    <p>{p.excerpt}</p>
                    <span className="course-cta">Read article →</span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero.jsx';
import { Seo } from '../lib/seo.jsx';
import { useContent } from '../hooks/useContent.jsx';
import { pageFields } from '../content/pageCopy.js';

export default function DiveSites() {
  const { diveSites = [], settings } = useContent();
  const copy = pageFields(settings, 'dive-sites');
  return (
    <>
      <Seo
        title="Dive sites | United Scuba"
        description="Reefs and boat dives around Swaraj Dweep with United Scuba."
        path="/dive-sites"
      />
      <PageHero
        kicker={copy.kicker}
        title={copy.title}
        intro={copy.intro}
      />
      <section className="section section-dark">
        <div className="container">
          <div className="course-grid">
            {diveSites.map((site) => (
              <Link className="course-card" to={`/dive-sites/${site.slug}`} key={site.slug}>
                <div className="course-img-wrap">
                  <img src={site.heroImage || '/frames/frame_0120.jpg'} alt={site.title} loading="lazy" />
                </div>
                <div className="course-body">
                  <h3>{site.title}</h3>
                  <p>{site.excerpt}</p>
                  {site.level && <span className="course-price">{site.level}</span>}
                  <span className="course-cta">{copy.cardCta}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

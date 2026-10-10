import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero.jsx';
import { Seo } from '../lib/seo.jsx';
import { useContent } from '../hooks/useContent.jsx';

export default function DiveSites() {
  const { diveSites = [] } = useContent();
  return (
    <>
      <Seo
        title="Dive sites | United Scuba"
        description="Reefs and boat dives around Swaraj Dweep with United Scuba."
        path="/dive-sites"
      />
      <PageHero
        kicker="Swaraj Dweep"
        title="Dive sites"
        intro="The reefs we use from Beach No. 02. The site for the day depends on the sea and who is diving."
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
                  <span className="course-cta">Site details →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

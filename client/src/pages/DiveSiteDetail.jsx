import { Link, useParams } from 'react-router-dom';
import { useContent } from '../hooks/useContent.jsx';
import PageHero from '../components/PageHero.jsx';
import CtaBanner from '../components/CtaBanner.jsx';
import { Seo } from '../lib/seo.jsx';

export default function DiveSiteDetail() {
  const { slug } = useParams();
  const { diveSites = [] } = useContent();
  const site = diveSites.find((item) => item.slug === slug);
  if (!site) {
    return (
      <section className="section container">
        <h1>Dive site not found</h1>
        <Link className="text-link" to="/dive-sites">All dive sites</Link>
      </section>
    );
  }
  return (
    <>
      <Seo
        title={site.seoTitle || `${site.title} | United Scuba`}
        description={site.seoDescription || site.excerpt}
        path={`/dive-sites/${site.slug}`}
        image={site.heroImage}
      />
      <PageHero kicker="Dive site" title={site.title} intro={site.excerpt} image={site.heroImage} />
      <section className="section">
        <div className="container prose">
          {site.description && <p>{site.description}</p>}
          {site.depth && <><h2>Depth</h2><p>{site.depth}</p></>}
          {site.level && <><h2>Who it suits</h2><p>{site.level}</p></>}
          <div style={{ marginTop: 24 }}>
            <CtaBanner title={`Book a dive at ${site.title}`} text="Tell us your dates. We confirm the site once we see the sea." />
          </div>
        </div>
      </section>
    </>
  );
}

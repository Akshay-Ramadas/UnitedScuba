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
  const text = (value) => (typeof value === 'string' ? value.trim() : '');
  const paragraphs = (value) => String(value || '').split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const included = Array.isArray(site.included) ? site.included.map((item) => String(item).trim()).filter(Boolean) : [];
  const facts = [
    ['Max depth', site.depth],
    ['Photos & videos', site.photos],
    ['Duration', site.duration],
    ['Min age', site.minAge],
    ['Price', site.price],
  ].filter(([, value]) => text(value));
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
          {facts.length > 0 && (
            <div className="fact-bar" aria-label="Dive site details">
              {facts.map(([label, value]) => (
                <div key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          )}
          {site.description && <p>{site.description}</p>}
          {paragraphs(site.overview).length > 0 && (
            <>
              <h2>Overview</h2>
              {paragraphs(site.overview).map((line) => <p key={line}>{line}</p>)}
            </>
          )}
          {included.length > 0 && (
            <>
              <h2>What's included</h2>
              <ul className="list">{included.map((item) => <li key={item}>{item}</li>)}</ul>
            </>
          )}
          {site.level && <><h2>Who it suits</h2><p>{site.level}</p></>}
          <div style={{ marginTop: 24 }}>
            <CtaBanner
              compact
              title={`Book a dive at ${site.title}`}
              text="Tell us your dates. We confirm the site once we see the sea."
              to={`/book-now?site=${encodeURIComponent(site.slug)}`}
            />
          </div>
        </div>
      </section>
    </>
  );
}

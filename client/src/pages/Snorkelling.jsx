import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero.jsx';
import CtaBanner from '../components/CtaBanner.jsx';
import FaqList from '../components/FaqList.jsx';
import { Seo } from '../lib/seo.jsx';
import { faqJsonLd, graphJsonLd } from '../lib/siteSchema.js';
import { useContent } from '../hooks/useContent.jsx';
import { pageFields } from '../content/pageCopy.js';

export default function Snorkelling() {
  const { activities, faqs, settings } = useContent();
  const copy = pageFields(settings, 'snorkelling');
  const items = activities.filter((a) => a.type === 'snorkelling');
  return (
    <>
      <Seo
        title="Snorkelling in Andaman | United Scuba"
        description="Shore, boat and deep-sea snorkelling with United Scuba."
        path="/snorkelling"
        jsonLd={graphJsonLd(faqJsonLd(faqs.filter((item) => item.page === 'snorkelling')))}
      />
      <PageHero kicker={copy.kicker} title={copy.title} intro={copy.intro} />
      <section className="section section-dark">
        <div className="container">
          <div className="grid-3">
            {items.map((a) => (
              <Link className="card" to={`/snorkelling/${a.slug}`} key={a.slug}>
                <img src={a.heroImage || '/frames/frame_0030.jpg'} alt="" loading="lazy" />
                <div className="card-body"><h3>{a.title}</h3><p>{a.excerpt}</p></div>
              </Link>
            ))}
          </div>
          <div className="prose" style={{ marginTop: 40 }}>
            <h2>{copy.whoTitle}</h2>
            <p>{copy.whoText}</p>
            <h2>{copy.expectTitle}</h2>
            <p>{copy.expectText}</p>
            <h2>Snorkelling FAQ</h2>
            <FaqList items={faqs.filter((f) => f.page === 'snorkelling')} />
          </div>
          <div style={{ marginTop: 32 }}><CtaBanner /></div>
        </div>
      </section>
    </>
  );
}

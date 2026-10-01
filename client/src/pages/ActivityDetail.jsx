import { Link, useParams } from 'react-router-dom';
import { useContent } from '../hooks/useContent.jsx';
import PageHero from '../components/PageHero.jsx';
import CtaBanner from '../components/CtaBanner.jsx';
import FaqList from '../components/FaqList.jsx';
import { Seo } from '../lib/seo.jsx';
import { faqJsonLd, graphJsonLd } from '../lib/siteSchema.js';

export default function ActivityDetail() {
  const { slug } = useParams();
  const { activities, gallery } = useContent();
  const item = activities.find((a) => a.slug === slug);
  if (!item) {
    return <section className="section container"><h1>Activity not found</h1><Link to="/">Home</Link></section>;
  }
  const base = item.type === 'snorkelling' ? '/snorkelling' : '/scuba-diving';
  const kicker = item.type === 'scuba' ? 'Scuba diving' : item.type === 'snorkelling' ? 'Snorkelling' : item.type;
  const shots = gallery.filter((g) => g.category === item.type).slice(0, 6);
  const text = (value) => (typeof value === 'string' ? value.trim() : '');
  const list = (value) => (Array.isArray(value) ? value.filter(Boolean) : []);

  return (
    <>
      <Seo
        title={item.seoTitle || `${item.title} | United Scuba`}
        description={item.seoDescription || item.excerpt}
        path={`${base}/${item.slug}`}
        image={item.heroImage}
        jsonLd={graphJsonLd(faqJsonLd(item.faqs))}
      />
      <PageHero kicker={kicker} title={item.title} intro={item.overview || item.excerpt} />
      <section className="section">
        <div className="container prose">
          {text(item.whoCanParticipate) && <><h2>Who can participate</h2><p>{item.whoCanParticipate}</p></>}
          {text(item.details) && <><h2>Experience details</h2><p>{item.details}</p></>}
          {text(item.duration) && <><h2>Duration</h2><p>{item.duration}</p></>}
          {text(item.price) && <><h2>Price</h2><p>{item.price}</p></>}
          {list(item.included).length > 0 && <><h2>What is included</h2><ul className="list">{list(item.included).map((i) => <li key={i}>{i}</li>)}</ul></>}
          {list(item.notIncluded).length > 0 && <><h2>What is not included</h2><ul className="list">{list(item.notIncluded).map((i) => <li key={i}>{i}</li>)}</ul></>}
          {text(item.equipment) && <><h2>Equipment</h2><p>{item.equipment}</p></>}
          {text(item.requirements) && <><h2>Requirements</h2><p>{item.requirements}</p></>}
          {text(item.safety) && <><h2>Safety</h2><p>{item.safety}</p></>}
          {list(item.whatToBring).length > 0 && <><h2>What to bring</h2><ul className="list">{list(item.whatToBring).map((i) => <li key={i}>{i}</li>)}</ul></>}
          {text(item.meetingPoint) && <><h2>Meeting / pickup</h2><p>{item.meetingPoint}</p></>}
          {list(item.faqs).length > 0 && <><h2>FAQ</h2><FaqList items={item.faqs} /></>}
          {shots.length > 0 && (
            <>
              <h2>Gallery</h2>
              <div className="gallery-grid">{shots.map((g) => <img key={g.url} src={g.url} alt={g.alt} loading="lazy" />)}</div>
            </>
          )}
          <div style={{ marginTop: 24 }}><CtaBanner title={`Book ${item.title}`} /></div>
        </div>
      </section>
    </>
  );
}

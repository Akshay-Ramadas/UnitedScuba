import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero.jsx';
import FaqList from '../components/FaqList.jsx';
import { Seo } from '../lib/seo.jsx';
import { faqJsonLd, graphJsonLd } from '../lib/siteSchema.js';
import { useContent } from '../hooks/useContent.jsx';
import { pageFields } from '../content/pageCopy.js';

const GROUPS = [
  {
    id: 'beginner',
    title: 'Beginners & Non-Swimmers',
    lead: "No experience needed. Can't swim? You can still dive.",
  },
  {
    id: 'certified',
    title: 'Certified Divers',
    lead: 'Already have a certificate? Get back in the water.',
    note: 'Please carry your certification card.',
  },
  {
    id: 'snorkelling',
    title: 'Snorkelling',
    lead: 'No diving needed.',
  },
];

function cardPrice(item) {
  if (item.price && item.price !== 'On request') return item.price;
  const plan = (item.plans || []).find((entry) => entry.price);
  return plan?.price || item.price || 'On request';
}

function activityPath(item) {
  const base = item.type === 'snorkelling' ? '/snorkelling' : '/scuba-diving';
  return `${base}/${item.slug}`;
}

function DiveCard({ item }) {
  const image = item.heroImage || (item.audience === 'snorkelling' ? '/frames/frame_0030.jpg' : '/frames/frame_0180.jpg');
  return (
    <article className="dive-offer">
      <Link className="dive-offer-link" to={activityPath(item)}>
        <img src={image} alt="" loading="lazy" />
        <div className="dive-offer-body">
          {item.noSwimming && <span className="dive-tag">No swimming needed</span>}
          <h3>{item.title}</h3>
          <p>{item.excerpt}</p>
          <strong>{cardPrice(item)}</strong>
        </div>
      </Link>
      <Link className="btn btn-primary" to={`/book-now?item=${encodeURIComponent(item.slug)}`}>Book now</Link>
    </article>
  );
}

export default function ScubaDiving() {
  const { activities = [], faqs, settings } = useContent();
  const copy = pageFields(settings, 'scuba');
  const grouped = GROUPS.map((group) => ({
    ...group,
    items: activities
      .filter((item) => item.audience === group.id)
      .sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0)),
  })).filter((group) => group.items.length);

  return (
    <>
      <Seo
        title="Scuba Diving in Andaman | United Scuba"
        description="Scuba diving and snorkelling with United Scuba in the Andaman Islands."
        path="/scuba-diving"
        jsonLd={graphJsonLd(faqJsonLd(faqs.filter((item) => item.page === 'scuba')))}
      />
      <PageHero kicker={copy.kicker} title={copy.title} intro={copy.intro} />
      <section className="section section-dark">
        <div className="container">
          {grouped.map((group) => (
            <div className="dive-group" key={group.id}>
              <h2>{group.title}</h2>
              <p className="dive-group-lead">{group.lead}</p>
              {group.note && <p className="dive-group-note">{group.note}</p>}
              <div className="dive-offer-grid">
                {group.items.map((item) => <DiveCard item={item} key={item.slug} />)}
              </div>
            </div>
          ))}
          <div className="prose" style={{ marginTop: 48 }}>
            <h2>Scuba diving FAQ</h2>
            <FaqList items={faqs.filter((f) => f.page === 'scuba')} />
          </div>
        </div>
      </section>
    </>
  );
}

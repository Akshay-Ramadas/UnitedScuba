import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero.jsx';
import CtaBanner from '../components/CtaBanner.jsx';
import FaqList from '../components/FaqList.jsx';
import { Seo } from '../lib/seo.jsx';
import { faqJsonLd, graphJsonLd } from '../lib/siteSchema.js';
import { useContent } from '../hooks/useContent.jsx';
import { pageFields } from '../content/pageCopy.js';

function groupTitle(type) {
  if (type === 'scuba') return 'Diving';
  if (type === 'snorkelling') return 'Snorkelling';
  return type;
}

function activityGroups(activities) {
  const order = ['scuba', 'snorkelling'];
  const types = [];
  for (const type of [...order, ...activities.map((item) => item.type)]) {
    if (!type || types.includes(type)) continue;
    types.push(type);
  }
  return types
    .map((type) => ({
      type,
      title: groupTitle(type),
      items: activities.filter((item) => item.type === type),
    }))
    .filter((group) => group.items.length);
}

function ActivityGroup({ title, items, base, image }) {
  if (!items.length) return null;
  return (
    <div style={{ marginBottom: '2.75rem' }}>
      <h2 style={{ fontSize: '1.7rem', fontWeight: 500, letterSpacing: '-0.03em', marginBottom: '1.25rem' }}>{title}</h2>
      <div className="grid-3">
        {items.map((item) => (
          <Link className="card" to={`${base}/${item.slug}`} key={item.slug}>
            <img src={item.heroImage || image} alt="" loading="lazy" />
            <div className="card-body"><h3>{item.title}</h3><p>{item.excerpt}</p></div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function ScubaDiving() {
  const { activities = [], faqs, settings } = useContent();
  const copy = pageFields(settings, 'scuba');
  const groups = activityGroups(activities);
  return (
    <>
      <Seo
        title="Scuba Diving in Andaman | United Scuba"
        description="Scuba diving and snorkelling with United Scuba in Swaraj Dweep."
        path="/scuba-diving"
        jsonLd={graphJsonLd(faqJsonLd(faqs.filter((item) => item.page === 'scuba')))}
      />
      <PageHero kicker={copy.kicker} title={copy.title} intro={copy.intro} />
      <section className="section section-dark">
        <div className="container">
          {groups.map((group) => (
            <ActivityGroup
              key={group.type}
              title={group.title}
              items={group.items}
              base={group.type === 'snorkelling' ? '/snorkelling' : '/scuba-diving'}
              image={group.type === 'snorkelling' ? '/frames/frame_0030.jpg' : '/frames/frame_0180.jpg'}
            />
          ))}
          <div className="prose" style={{ marginTop: 40 }}>
            <h2>{copy.expectTitle}</h2>
            <p>{copy.expectText}</p>
            <h2>{copy.safetyTitle}</h2>
            <p>{copy.safetyText}</p>
            <h2>{copy.equipmentTitle}</h2>
            <p>{copy.equipmentText}</p>
            <h2>{copy.whoTitle}</h2>
            <p>{copy.whoText}</p>
            <h2>{copy.bookTitle}</h2>
            <p>{copy.bookText}</p>
            <h2>Scuba diving FAQ</h2>
            <FaqList items={faqs.filter((f) => f.page === 'scuba')} />
          </div>
          <div style={{ marginTop: 32 }}><CtaBanner /></div>
        </div>
      </section>
    </>
  );
}

import { useState } from 'react';
import PageHero from '../components/PageHero.jsx';
import { Seo } from '../lib/seo.jsx';
import { useContent } from '../hooks/useContent.jsx';
import { pageFields } from '../content/pageCopy.js';

const CATS = [
  ['all', 'All'],
  ['scuba', 'Scuba diving'],
  ['snorkelling', 'Snorkelling'],
  ['marine', 'Marine life'],
  ['courses', 'Courses'],
  ['customers', 'Customers'],
  ['boat', 'Boat / equipment'],
  ['video', 'Videos'],
];

export default function Gallery() {
  const { gallery, settings } = useContent();
  const copy = pageFields(settings, 'gallery');
  const [cat, setCat] = useState('all');
  const items = gallery.filter((g) => cat === 'all' || g.category === cat);
  return (
    <>
      <Seo
        title="Gallery | United Scuba"
        description="Scuba, snorkelling and training photos from United Scuba."
        path="/gallery"
      />
      <PageHero
        kicker={copy.kicker}
        title={copy.title}
        intro={copy.intro}
        image="/assets/sd5.jpg"
      />
      <section className="section section-dark gallery-page">
        <div className="container">
          <div className="gallery-filters">
            {CATS.map(([id, label]) => (
              <button key={id} className={cat === id ? 'on' : ''} type="button" onClick={() => setCat(id)}>
                {label}
              </button>
            ))}
          </div>
          <div className="gallery-grid">
            {items.map((g) =>
              g.category === 'video' ? (
                <video key={g.url} src={g.url} controls preload="metadata" style={{ width: '100%', borderRadius: 12 }} />
              ) : (
                <div key={g.url + g.alt} className="gallery-item">
                  <img src={g.url} alt={g.alt} loading="lazy" />
                  <div className="gallery-item-overlay" />
                </div>
              )
            )}
          </div>
        </div>
      </section>
    </>
  );
}

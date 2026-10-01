import { useEffect, useState } from 'react';
import PageHero from '../components/PageHero.jsx';
import { Seo } from '../lib/seo.jsx';
import { useContent } from '../hooks/useContent.jsx';
import { pageFields } from '../content/pageCopy.js';

const CATS = [
  ['all', 'All'],
];

export default function Gallery() {
  const { gallery, settings } = useContent();
  const copy = pageFields(settings, 'gallery');
  const [cat, setCat] = useState('all');
  const [open, setOpen] = useState(null);
  const items = gallery.filter((g) => cat === 'all' || g.category === cat);
  const photos = items.filter((g) => g.category !== 'video');
  const current = open == null ? null : photos[open];

  useEffect(() => {
    if (open == null) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(null);
      if (event.key === 'ArrowRight') setOpen((index) => (index + 1) % photos.length);
      if (event.key === 'ArrowLeft') setOpen((index) => (index - 1 + photos.length) % photos.length);
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, photos.length]);

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
                <button
                  key={g.url + g.alt}
                  type="button"
                  className="gallery-item"
                  onClick={() => setOpen(photos.findIndex((photo) => photo.url === g.url && photo.alt === g.alt))}
                >
                  <img src={g.url} alt={g.alt} loading="lazy" />
                  <div className="gallery-item-overlay" />
                </button>
              )
            )}
          </div>
        </div>
      </section>
      {current && (
        <div className="gallery-lightbox" role="dialog" aria-modal="true" aria-label={current.alt || 'Photo'} onClick={() => setOpen(null)}>
          <button type="button" className="gallery-lightbox-close" aria-label="Close" onClick={() => setOpen(null)}>
            ×
          </button>
          {photos.length > 1 && (
            <button
              type="button"
              className="gallery-lightbox-nav prev"
              aria-label="Previous photo"
              onClick={(event) => {
                event.stopPropagation();
                setOpen((index) => (index - 1 + photos.length) % photos.length);
              }}
            >
              ‹
            </button>
          )}
          <img src={current.url} alt={current.alt || ''} onClick={(event) => event.stopPropagation()} />
          {photos.length > 1 && (
            <button
              type="button"
              className="gallery-lightbox-nav next"
              aria-label="Next photo"
              onClick={(event) => {
                event.stopPropagation();
                setOpen((index) => (index + 1) % photos.length);
              }}
            >
              ›
            </button>
          )}
        </div>
      )}
    </>
  );
}

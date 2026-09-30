import { useEffect, useState } from 'react';

/* Google multicolor "G" SVG */
const GoogleG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="30" height="30" aria-hidden>
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    <path fill="none" d="M0 0h48v48H0z"/>
  </svg>
);

/* Partial star fill via SVG clip */
function Stars({ rating }) {
  const full    = Math.floor(rating);
  const partial = rating - full;
  const empty   = 5 - full - (partial > 0 ? 1 : 0);

  return (
    <div style={{ display: 'flex', gap: 0, alignItems: 'center' }}>
      {Array.from({ length: full   }).map((_, i) => <FullStar   key={`f${i}`} />)}
      {partial > 0                                 && <PartialStar pct={partial} />}
      {Array.from({ length: empty  }).map((_, i) => <EmptyStar   key={`e${i}`} />)}
    </div>
  );
}

const STAR_SIZE = 9;
const STAR_COLOR = '#FBBC05';

const starPath = 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z';

function FullStar()  {
  return (
    <svg width={STAR_SIZE} height={STAR_SIZE} viewBox="0 0 24 24" fill={STAR_COLOR}>
      <path d={starPath}/>
    </svg>
  );
}
function EmptyStar() {
  return (
    <svg width={STAR_SIZE} height={STAR_SIZE} viewBox="0 0 24 24" fill="#e0e0e0">
      <path d={starPath}/>
    </svg>
  );
}
function PartialStar({ pct }) {
  const id = `ps-${Math.round(pct * 100)}`;
  return (
    <svg width={STAR_SIZE} height={STAR_SIZE} viewBox="0 0 24 24">
      <defs>
        <linearGradient id={id}>
          <stop offset={`${pct * 100}%`} stopColor={STAR_COLOR} />
          <stop offset={`${pct * 100}%`} stopColor="#e0e0e0" />
        </linearGradient>
      </defs>
      <path d={starPath} fill={`url(#${id})`} />
    </svg>
  );
}

function formatCount(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default function GoogleReviewBadge() {
  const [data, setData]     = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetch('/api/google-rating')
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        /* Slight delay so it animates in after page load */
        setTimeout(() => setVisible(true), 800);
      })
      .catch(() => {});
  }, []);

  if (!data) return null;

  const { rating, count, mapsUrl } = data;

  return (
    <>
      <style>{`
        .g-badge {
          position: fixed;
          right: 18px;
          bottom: 92px;
          transform: translateX(${visible ? '0' : '120%'});
          z-index: 9000;
          text-decoration: none;
          display: block;
          transition: transform 0.55s cubic-bezier(0.16,1,0.3,1);
        }
        .g-badge-inner {
          background: #fff;
          border-radius: 999px;
          padding: 14px 8px 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          width: 66px;
          box-shadow: 0 6px 24px rgba(0,0,0,0.16), 0 1px 4px rgba(0,0,0,0.08);
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .g-badge:hover .g-badge-inner {
          transform: translateY(-3px);
          box-shadow: 0 10px 32px rgba(0,0,0,0.2), 0 2px 6px rgba(0,0,0,0.08);
        }
        .g-badge-rating {
          font-size: 1.55rem;
          font-weight: 800;
          color: #202124;
          letter-spacing: -0.04em;
          line-height: 1;
          margin-top: 2px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .g-badge-stars { margin: 1px 0 2px; }
        .g-badge-count {
          font-size: 0.82rem;
          color: #202124;
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: -0.02em;
        }
        .g-badge-label {
          font-size: 0.60rem;
          color: #5f6368;
          font-weight: 500;
          line-height: 1.1;
        }
        @media (max-width: 760px) {
          .g-badge { right: 11px; bottom: 76px; }
          .g-badge-inner { width: 58px; padding: 12px 6px 10px; }
          .g-badge-rating { font-size: 1.3rem; }
        }
      `}</style>

      <a
        className="g-badge"
        href={mapsUrl || '#'}
        target="_blank"
        rel="noreferrer"
        aria-label={`United Scuba — ${rating} stars on Google (${count} reviews)`}
        title="See our Google reviews"
      >
        <div className="g-badge-inner">
          <GoogleG />
          <div className="g-badge-rating">{rating}</div>
          <div className="g-badge-stars"><Stars rating={rating} /></div>
          <div className="g-badge-count">{formatCount(count)}</div>
          <div className="g-badge-label">Opinions</div>
        </div>
      </a>
    </>
  );
}

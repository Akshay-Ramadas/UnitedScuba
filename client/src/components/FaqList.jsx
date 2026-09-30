import { useState } from 'react';

export default function FaqList({ items = [] }) {
  const [open, setOpen] = useState(null);
  if (!items.length) return null;
  return (
    <div className="faq-list">
      {items.map((item, i) => {
        const q = item.question || item.q;
        const a = item.answer || item.a;
        const isOpen = open === i;
        return (
          <div className={`faq-item${isOpen ? ' open' : ''}`} key={q}>
            <button className="faq-q" type="button" onClick={() => setOpen(isOpen ? null : i)}>
              <span>{q}</span>
              <span className="faq-icon">{isOpen ? '−' : '+'}</span>
            </button>
            <div className={`faq-a${isOpen ? ' open' : ''}`}>{a}</div>
          </div>
        );
      })}
    </div>
  );
}

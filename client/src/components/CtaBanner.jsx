import { Link } from 'react-router-dom';
import { useContent } from '../hooks/useContent.jsx';
import { waLink } from '../lib/api.js';

export default function CtaBanner({
  title = 'Tell us the dates. We will tell you the dive.',
  text = 'Courses, a first scuba dive, or a boat day from Beach No. 02.',
}) {
  const { settings } = useContent();
  const wa = settings.whatsapp || import.meta.env.VITE_WHATSAPP_NUMBER;
  return (
    <div className="cta-banner">
      <div>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
      <div className="cta-actions">
        <Link className="btn btn-primary btn-lg" to="/book-now">Book a dive</Link>
        {wa && (
          <a className="btn btn-ghost btn-lg" href={waLink(wa)} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}

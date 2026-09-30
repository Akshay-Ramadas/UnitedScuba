import { Link } from 'react-router-dom';
import { useContent } from '../hooks/useContent.jsx';
import { LOGO, waLink } from '../lib/api.js';

function SocialLink({ href, label, children }) {
  if (!href) return null;
  return (
    <a className="footer-social-btn" href={href} target="_blank" rel="noreferrer" aria-label={label}>
      {children}
    </a>
  );
}

export default function Footer() {
  const { settings } = useContent();
  const wa = settings.whatsapp || import.meta.env.VITE_WHATSAPP_NUMBER;

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-band">
          <div className="footer-socials">
            <SocialLink href={settings.socials?.instagram} label="Instagram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
              </svg>
            </SocialLink>
            <SocialLink href={settings.socials?.youtube} label="YouTube">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M23 12.2s0-3.2-.4-4.6c-.2-.9-.9-1.6-1.8-1.8C19.2 5.4 12 5.4 12 5.4s-7.2 0-8.8.4c-.9.2-1.6.9-1.8 1.8C1 9 1 12.2 1 12.2s0 3.2.4 4.6c.2.9.9 1.6 1.8 1.8 1.6.4 8.8.4 8.8.4s7.2 0 8.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.4.4-4.6.4-4.6zM9.8 15.5v-6.6l6.2 3.3-6.2 3.3z" />
              </svg>
            </SocialLink>
            <SocialLink href={settings.socials?.twitter} label="Twitter">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </SocialLink>
            <SocialLink href={wa ? waLink(wa) : ''} label="WhatsApp">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </SocialLink>
          </div>
          <Link className="btn btn-primary" to="/book-now">Book a dive</Link>
        </div>
      </div>
      <div className="container footer-grid">
        <div className="footer-brand">
          <img src={LOGO} alt="United Scuba" />
          <p>{settings.tagline || 'Scuba diving in the Andaman Islands'}</p>
          <p style={{ marginTop: '0.5rem' }}>{settings.location}</p>
        </div>
        <div className="footer-col">
          <h4>Explore</h4>
          <Link to="/courses">Courses</Link>
          <Link to="/scuba-diving">Scuba diving</Link>
          <Link to="/gallery">Gallery</Link>
          <Link to="/blog">Blog</Link>
          <Link to="/about">About us</Link>
        </div>
        <div className="footer-col">
          <h4>Visit</h4>
          <p style={{ color: 'var(--text-2)', fontSize: '0.92rem', marginBottom: '0.7rem' }}>
            Sands Marina Resort, Govind Nagar, Beach No. 02, Swaraj Dweep (Havelock Island)
          </p>
          {settings.phone && <a href={`tel:${settings.phone}`}>{settings.phone}</a>}
          {settings.email && <a href={`mailto:${settings.email}`}>{settings.email}</a>}
          {settings.hours && <p style={{ color: 'var(--text-3)', fontSize: '0.85rem', marginTop: '0.4rem' }}>{settings.hours}</p>}
        </div>
        <div className="footer-col">
          <h4>Plan your trip</h4>
          <Link to="/book-now">Book now</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/privacy">Privacy policy</Link>
          <Link to="/terms">Terms & conditions</Link>
          <Link to="/cancellation">Cancellation / refund</Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} United Scuba. All rights reserved.</span>
        <span>{settings.phone && <a href={`tel:${settings.phone}`}>{settings.phone}</a>}</span>
      </div>
    </footer>
  );
}

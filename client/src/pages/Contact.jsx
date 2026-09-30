import { Seo } from '../lib/seo.jsx';
import { useContent } from '../hooks/useContent.jsx';
import { pageFields } from '../content/pageCopy.js';
import { waLink } from '../lib/api.js';
import EnquiryForm from '../components/EnquiryForm.jsx';
import '../styles/contact.css';

const MAPS_FALLBACK = 'https://maps.google.com/maps?q=Sands+Marina+Resort+Havelock+Island+Andaman';

function Fact({ tone, href, label, children }) {
  const inner = (
    <>
      <span className={`contact-fact-icon ${tone}`} aria-hidden>
        {tone === 'pin' && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11z" />
            <circle cx="12" cy="10" r="2.4" />
          </svg>
        )}
        {tone === 'clock' && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        )}
        {tone === 'phone' && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.33 1.9.6 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.27 1.85.47 2.81.6A2 2 0 0 1 22 16.92z" />
          </svg>
        )}
        {tone === 'wa' && (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        )}
        {tone === 'email' && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3 7 9 6 9-6" />
          </svg>
        )}
      </span>
      <span className="contact-fact-copy">
        <span className="contact-fact-label">{label}</span>
        <span className="contact-fact-value">{children}</span>
      </span>
    </>
  );
  if (!href) return <div className="contact-fact">{inner}</div>;
  const external = href.startsWith('http');
  return (
    <a className="contact-fact" href={href} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
      {inner}
    </a>
  );
}

export default function Contact() {
  const { settings } = useContent();
  const copy = pageFields(settings, 'contact');

  const phone    = settings.phone    || '';
  const whatsapp = settings.whatsapp || '';
  const email    = settings.email    || '';
  const hours    = settings.hours    || 'Open daily 7 AM – 6 PM';
  const mapsUrl  = settings.mapsUrl  || MAPS_FALLBACK;

  return (
    <>
      <Seo
        title="Contact United Scuba | Havelock Island Dive Centre"
        description="Reach United Scuba at Sands Marina Resort, Havelock Island. Call, WhatsApp, email or send an enquiry to plan your Andaman diving trip."
        path="/contact"
      />

      {/* ── Hero ── */}
      <section className="page-hero">
        <div className="container">
          <p className="kicker">{copy.kicker}</p>
          <h1>{copy.title}</h1>
          <p>{copy.intro}</p>
        </div>
      </section>

      {/* ── Quick contact strip ── */}
      <div className="contact-strip">
        {phone && (
          <a href={`tel:${phone}`} className="contact-strip-item">
            <span className="contact-strip-icon phone" aria-hidden>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.33 1.9.6 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.27 1.85.47 2.81.6A2 2 0 0 1 22 16.92z" />
              </svg>
            </span>
            <div>
              <div className="contact-strip-label">Call us</div>
              <div className="contact-strip-value">{phone}</div>
            </div>
          </a>
        )}
        {whatsapp && (
          <a href={waLink(whatsapp)} target="_blank" rel="noreferrer" className="contact-strip-item">
            <span className="contact-strip-icon wa" aria-hidden>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </span>
            <div>
              <div className="contact-strip-label">WhatsApp</div>
              <div className="contact-strip-value">Message now</div>
            </div>
          </a>
        )}
        {email && (
          <a href={`mailto:${email}`} className="contact-strip-item">
            <span className="contact-strip-icon email" aria-hidden>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
            </span>
            <div>
              <div className="contact-strip-label">Email</div>
              <div className="contact-strip-value">{email}</div>
            </div>
          </a>
        )}
        <a href={mapsUrl} target="_blank" rel="noreferrer" className="contact-strip-item">
          <span className="contact-strip-icon pin" aria-hidden>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11z" />
              <circle cx="12" cy="10" r="2.4" />
            </svg>
          </span>
          <div>
            <div className="contact-strip-label">Location</div>
            <div className="contact-strip-value">{copy.locationShort}</div>
          </div>
        </a>
      </div>

      {/* ── Main section ── */}
      <section className="section section-dark" style={{ paddingTop:'3.5rem' }}>
        <div className="container contact-main">

          <div className="contact-aside">
            <div className="contact-map">
              {settings.mapsEmbed
                ? <div className="contact-map-embed" dangerouslySetInnerHTML={{ __html: settings.mapsEmbed }} />
                : (
                  <iframe
                    title="United Scuba on Google Maps"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent([copy.addressName, copy.addressLine1, copy.addressLine2, copy.addressLine3].filter(Boolean).join(', '))}&z=16&output=embed`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                )}
              <a className="contact-map-open" href={mapsUrl} target="_blank" rel="noreferrer">Open in Maps</a>
            </div>
          <div className="contact-facts">
            <Fact tone="pin" href={mapsUrl} label="Location">
              {copy.addressName}
              <span>
                {copy.addressLine1}<br />
                {copy.addressLine2}<br />
                {copy.addressLine3}
              </span>
            </Fact>
            <Fact tone="clock" label="Hours">
              {hours}
              <span>{copy.hoursNote}</span>
            </Fact>
            {phone && (
              <Fact tone="phone" href={`tel:${phone}`} label="Call">{phone}</Fact>
            )}
            {whatsapp && (
              <Fact tone="wa" href={waLink(whatsapp)} label="WhatsApp">Message the centre</Fact>
            )}
            {email && (
              <Fact tone="email" href={`mailto:${email}`} label="Email">{email}</Fact>
            )}
          </div>
          </div>

          {/* ── RIGHT: Enquiry form ── */}
          <div className="contact-right">
            <EnquiryForm source="contact" />
          </div>

        </div>
      </section>
    </>
  );
}

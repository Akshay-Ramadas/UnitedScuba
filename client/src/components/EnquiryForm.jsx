import { useMemo, useState } from 'react';
import { useContent } from '../hooks/useContent.jsx';
import { api, waLink } from '../lib/api.js';
import '../styles/contact.css';

const EMPTY = {
  name: '', phone: '', email: '',
  preferredDate: '', numberOfPeople: 1,
  activityType: 'scuba', diverLevel: 'beginner',
  preferredItem: '', message: '',
  website: '', whatsappOptIn: true,
};

const MSG_MAX = 600;
const ACTIVITIES = [
  ['scuba', 'Scuba diving'],
  ['snorkelling', 'Snorkelling'],
  ['course', 'PADI course'],
  ['general', 'Not sure yet'],
];
const LEVELS = [
  ['beginner', 'First time'],
  ['certified', 'Certified'],
  ['not-sure', 'Not sure'],
];

export default function EnquiryForm({ source = 'book-now' }) {
  const { settings, courses, activities } = useContent();
  const [form,   setForm]   = useState(EMPTY);
  const [status, setStatus] = useState('idle'); // idle | saving | done
  const [error,  setError]  = useState('');

  const isContact = source === 'contact';

  const options = useMemo(() => [
    ...courses.map((c) => ({ value: c.title, group: 'Courses' })),
    ...activities.map((a) => ({
      value: a.title,
      group: a.type === 'snorkelling' ? 'Snorkelling' : a.type === 'scuba' ? 'Scuba Diving' : a.type,
    })),
  ], [courses, activities]);

  function set(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }

  function pick(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(''); setStatus('saving');
    try {
      await api('/api/enquiries', {
        method: 'POST',
        body: { ...form, source, numberOfPeople: Number(form.numberOfPeople) },
      });
      setStatus('done');
      setForm(EMPTY);
    } catch (err) {
      setStatus('idle');
      setError(err.message || 'Could not send. Please try WhatsApp or phone.');
    }
  }

  /* ── Success state ── */
  if (status === 'done') {
    return (
      <div className="enq-card">
        <div className="enq-success">
          <p className="kicker">Sent</p>
          <h3>Enquiry received!</h3>
          <p>
            Thank you for reaching out to United Scuba. We'll review your enquiry and
            get back to you within a few hours with availability and trip details.
          </p>
          {settings.whatsapp && (
            <>
              <p style={{ fontSize:'0.8rem', marginBottom:'0.875rem' }}>
                Need a faster response? Chat directly with us on WhatsApp:
              </p>
              <a
                href={waLink(settings.whatsapp, `Hi, I just submitted an enquiry on your website (${form.name || 'guest'}).`)}
                target="_blank" rel="noreferrer"
                className="enq-success-wa"
              >
                Open WhatsApp
              </a>
            </>
          )}
        </div>
      </div>
    );
  }

  /* ── Form ── */
  return (
    <div className="enq-card">
      <div className="enq-card-header">
        <p className="kicker">{isContact ? 'Message' : 'Booking'}</p>
        <h2>{isContact ? 'Write to the centre' : 'Tell us the dive you want'}</h2>
        <p>
          {isContact
            ? 'Name, a way to reach you, and what you need. We reply within a few hours.'
            : 'Three short parts. We reply with the date, the price, and where to meet.'}
        </p>
      </div>

      <div className="enq-card-body">
        <form onSubmit={onSubmit} autoComplete="on">

          {/* ── Section 1: Your details ── */}
          <div className="enq-section">
            <div className="enq-section-title"><span>1</span> How we reach you</div>

            <div className="enq-field">
              <label className="enq-label" htmlFor="enq-name">Full name <span>*</span></label>
              <input id="enq-name" className="enq-input" name="name"
                value={form.name} onChange={set} required
                placeholder="Your name" autoComplete="name" />
            </div>

            <div className="enq-row">
              <div className="enq-field">
                <label className="enq-label" htmlFor="enq-phone">Phone or WhatsApp <span>*</span></label>
                <input id="enq-phone" className="enq-input" name="phone"
                  value={form.phone} onChange={set} required
                  placeholder="10-digit mobile" autoComplete="tel" type="tel" />
              </div>
              <div className="enq-field">
                <label className="enq-label" htmlFor="enq-email">Email <span>*</span></label>
                <input id="enq-email" className="enq-input" name="email"
                  value={form.email} onChange={set} required
                  placeholder="you@email.com" autoComplete="email" type="email" />
              </div>
            </div>
          </div>

          {/* ── Section 2: Trip details (book-now only) ── */}
          {!isContact && (
            <div className="enq-section">
              <div className="enq-section-title"><span>2</span> The dive</div>

              <div className="enq-field">
                <span className="enq-label">What do you want?</span>
                <div className="enq-choices" role="group" aria-label="Activity type">
                  {ACTIVITIES.map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      className={form.activityType === value ? 'on' : ''}
                      onClick={() => pick('activityType', value)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="enq-field">
                <span className="enq-label">Have you dived before?</span>
                <div className="enq-choices" role="group" aria-label="Diver level">
                  {LEVELS.map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      className={form.diverLevel === value ? 'on' : ''}
                      onClick={() => pick('diverLevel', value)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="enq-row">
                <div className="enq-field">
                  <label className="enq-label" htmlFor="enq-date">Preferred date</label>
                  <input id="enq-date" className="enq-input" name="preferredDate" type="date"
                    value={form.preferredDate} onChange={set} min={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="enq-field">
                  <label className="enq-label" htmlFor="enq-pax">How many people</label>
                  <input id="enq-pax" className="enq-input" name="numberOfPeople" type="number"
                    value={form.numberOfPeople} onChange={set} min="1" max="40" />
                </div>
              </div>

              {options.length > 0 && (
                <div className="enq-field" style={{ marginBottom:'0.875rem' }}>
                  <label className="enq-label" htmlFor="enq-item">Specific course / trip (optional)</label>
                  <select id="enq-item" className="enq-select" name="preferredItem" value={form.preferredItem} onChange={set}>
                    <option value="">Select a course or trip…</option>
                    {options.map((o) => (
                      <option key={o.value} value={o.value}>{o.group}: {o.value}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* ── Section 3: Message ── */}
          <div className="enq-section">
            <div className="enq-section-title"><span>{isContact ? '2' : '3'}</span> Anything we should know</div>
            <div className="enq-field">
              <label className="enq-label" htmlFor="enq-msg">
                {isContact ? 'How can we help?' : 'Any special requirements or questions?'}
              </label>
              <textarea id="enq-msg" className="enq-textarea" name="message"
                value={form.message} onChange={set}
                maxLength={MSG_MAX}
                placeholder={isContact
                  ? "Tell us what you're looking for — we'll reply with options, availability and pricing."
                  : 'Medical conditions, equipment size, specific requests, questions about the course\u2026'}
              />
              <div className="enq-counter">{form.message.length}/{MSG_MAX}</div>
            </div>
          </div>

          {/* Honeypot */}
          <div className="enq-honeypot" aria-hidden="true">
            <input name="website" value={form.website} onChange={set} tabIndex={-1} autoComplete="off" />
          </div>

          {/* WhatsApp opt-in */}
          <label className="enq-check-row" style={{ marginBottom:'1rem' }}>
            <input type="checkbox" name="whatsappOptIn" checked={form.whatsappOptIn} onChange={set} />
            You may follow up with me via WhatsApp
          </label>

          {/* Error */}
          {error && (
            <div className="enq-error" style={{ marginBottom:'0.875rem' }}>
              {error}
            </div>
          )}

          <button type="submit" className="enq-submit" disabled={status === 'saving'}>
            {status === 'saving' ? 'Sending…' : isContact ? 'Send enquiry' : 'Send booking enquiry'}
          </button>

          <p style={{ fontSize:'0.72rem', color:'var(--text-3)', textAlign:'center', marginTop:'0.875rem', lineHeight:1.6 }}>
            We respond within a few hours. Your details are only used to reply to your enquiry.
          </p>
        </form>
      </div>
    </div>
  );
}

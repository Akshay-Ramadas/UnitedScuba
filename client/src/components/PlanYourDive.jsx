import { useState } from 'react';
import { api, waLink } from '../lib/api.js';

const WHO = [
  ['beginner', 'Beginner', 'First time, or you are not a swimmer'],
  ['certified', 'Certified', 'You already have a dive card'],
  ['snorkelling', 'Snorkelling', 'Stay on the surface'],
];

const DIVE_TYPES = {
  beginner: [
    ['shore', 'Shore', 'Walk in from the beach'],
    ['boat', 'Boat', 'A short ride to the reef'],
  ],
  certified: [
    ['fun-dive', 'Fun Dive', 'A guided reef dive'],
    ['refresher', 'Refresher', 'If it has been a while'],
    ['shore', 'Shore', 'Walk in from the beach'],
    ['boat', 'Boat', 'A short ride to the reef'],
  ],
  snorkelling: [
    ['snorkel-shore', 'Shore', 'Float over the beach reef'],
    ['snorkel-boat', 'Boat', 'A boat to a reef further out'],
  ],
};

const STEPS = ['You', 'Dive', 'Site', 'When'];

const EMPTY = {
  name: '',
  phone: '',
  who: '',
  diveType: '',
  sites: [],
  numberOfPeople: 2,
  preferredDate: '',
  website: '',
};

function labelOf(list, value) {
  return list.find((item) => item[0] === value)?.[1] || '';
}

export default function PlanYourDive({ settings, diveSites }) {
  const [form, setForm] = useState(EMPTY);
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const typeOptions = DIVE_TYPES[form.who] || [];
  const whoLabel = labelOf(WHO, form.who);
  const typeLabel = labelOf(typeOptions, form.diveType);

  function pickWho(value) {
    setForm((current) => ({
      ...current,
      who: value,
      diveType: DIVE_TYPES[value].some((item) => item[0] === current.diveType) ? current.diveType : '',
      sites: value === 'certified' ? current.sites : current.sites.filter((title) => {
        const site = diveSites.find((entry) => entry.title === title);
        return !site?.certifiedOnly;
      }),
    }));
  }

  function toggleSite(site) {
    if (site.certifiedOnly && form.who !== 'certified') return;
    setForm((current) => ({
      ...current,
      sites: current.sites.includes(site.title)
        ? current.sites.filter((title) => title !== site.title)
        : [...current.sites, site.title],
    }));
  }

  function canContinue() {
    if (step === 0) return Boolean(form.who);
    if (step === 1) return Boolean(form.diveType);
    if (step === 3) return form.name.trim().length > 1 && form.phone.trim().length >= 6;
    return true;
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (step < STEPS.length - 1) {
      if (canContinue()) setStep((current) => current + 1);
      return;
    }
    setError('');
    setStatus('saving');
    const siteLine = form.sites.join(', ');
    const message = [
      `I am: ${whoLabel}`,
      `Dive type: ${typeLabel}`,
      siteLine ? `Dive sites: ${siteLine}` : 'Dive sites: you choose',
      `People: ${form.numberOfPeople}`,
      form.preferredDate ? `Date: ${form.preferredDate}` : '',
    ].filter(Boolean).join('\n');

    try {
      await api('/api/enquiries', {
        method: 'POST',
        body: {
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: '',
          preferredDate: form.preferredDate,
          numberOfPeople: Number(form.numberOfPeople) || 1,
          activityType: form.who === 'snorkelling' ? 'snorkelling' : 'scuba',
          diverLevel: form.who,
          preferredItem: typeLabel,
          diveSites: siteLine,
          message,
          source: 'plan-dive',
          whatsappOptIn: true,
          website: form.website,
        },
      });
      const link = waLink(settings.whatsapp, `Hello United Scuba, I would like to plan a dive.\n${message}\nName: ${form.name.trim()}`);
      if (link !== '#') window.open(link, '_blank', 'noopener,noreferrer');
      setStatus('done');
      setForm(EMPTY);
      setStep(0);
    } catch (err) {
      setStatus('idle');
      setError(err.message || 'Could not send. Please try WhatsApp or phone.');
    }
  }

  if (status === 'done') {
    return (
      <div className="plan-dive">
        <p className="kicker">Sent</p>
        <h2>We have your dive plan</h2>
        <p>Your request is in our enquiries. If WhatsApp opened, send that message so we can confirm the site and the date.</p>
        <button className="btn btn-ghost" type="button" onClick={() => setStatus('idle')}>Plan another dive</button>
      </div>
    );
  }

  return (
    <form className="plan-dive" onSubmit={onSubmit}>
      <p className="kicker">Plan your own dive</p>
      <h2>Tell us the dive you want</h2>
      <ol className="plan-steps" aria-label="Form progress">
        {STEPS.map((label, index) => (
          <li key={label} className={index === step ? 'on' : index < step ? 'done' : ''}>
            <span>{index + 1}</span>
            {label}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <fieldset>
          <legend>I am</legend>
          <div className="plan-picks">
            {WHO.map(([value, title, hint]) => (
              <button key={value} type="button" className={form.who === value ? 'on' : ''} onClick={() => pickWho(value)}>
                <strong>{title}</strong>
                <span>{hint}</span>
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {step === 1 && (
        <fieldset>
          <legend>Dive type</legend>
          <div className="plan-picks">
            {typeOptions.map(([value, title, hint]) => (
              <button key={value} type="button" className={form.diveType === value ? 'on' : ''} onClick={() => setForm((current) => ({ ...current, diveType: value }))}>
                <strong>{title}</strong>
                <span>{hint}</span>
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {step === 2 && (
        <fieldset>
          <legend>Dive site</legend>
          <p className="plan-dive-lead">Tick the places you want. You can leave this open and we will match the sea.</p>
          <div className="plan-sites">
            {diveSites.map((site) => {
              const locked = site.certifiedOnly && form.who !== 'certified';
              const on = form.sites.includes(site.title);
              return (
                <button
                  key={site.slug || site.title}
                  type="button"
                  className={`plan-site${on ? ' on' : ''}${locked ? ' locked' : ''}`}
                  disabled={locked}
                  onClick={() => toggleSite(site)}
                >
                  <strong>{site.title}</strong>
                  {site.certifiedOnly && <em>Certified divers only.</em>}
                  {!site.certifiedOnly && site.excerpt && <em>{site.excerpt}</em>}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {step === 3 && (
        <fieldset>
          <legend>People, date, and how we reply</legend>
          <div className="plan-recap">
            <span>{whoLabel}</span>
            <span>{typeLabel}</span>
            <span>{form.sites.length ? form.sites.join(', ') : 'Site open'}</span>
          </div>
          <div className="plan-people">
            <span>People</span>
            <button type="button" onClick={() => setForm((current) => ({ ...current, numberOfPeople: Math.max(1, Number(current.numberOfPeople) - 1) }))} aria-label="Fewer people">−</button>
            <strong>{form.numberOfPeople}</strong>
            <button type="button" onClick={() => setForm((current) => ({ ...current, numberOfPeople: Math.min(40, Number(current.numberOfPeople) + 1) }))} aria-label="More people">+</button>
          </div>
          <div className="plan-dive-row">
            <label>
              Your name
              <input required value={form.name} autoComplete="name" placeholder="Your name" onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} />
            </label>
            <label>
              WhatsApp number
              <input required type="tel" value={form.phone} autoComplete="tel" placeholder="10-digit mobile" onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))} />
            </label>
            <label>
              Preferred date
              <input type="date" value={form.preferredDate} min={new Date().toISOString().split('T')[0]} onChange={(e) => setForm((current) => ({ ...current, preferredDate: e.target.value }))} />
            </label>
          </div>
        </fieldset>
      )}

      <div className="enq-honeypot" aria-hidden="true">
        <input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setForm((current) => ({ ...current, website: e.target.value }))} />
      </div>

      {error && <p className="plan-dive-error">{error}</p>}
      <div className="plan-nav">
        {step > 0 && (
          <button className="btn btn-ghost" type="button" onClick={() => setStep((current) => current - 1)}>Back</button>
        )}
        <button className="btn btn-primary" type="submit" disabled={!canContinue() || status === 'saving'}>
          {step < STEPS.length - 1 ? 'Continue' : status === 'saving' ? 'Sending…' : 'Send on WhatsApp'}
        </button>
      </div>
    </form>
  );
}

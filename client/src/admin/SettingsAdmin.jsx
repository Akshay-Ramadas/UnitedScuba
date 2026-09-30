import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { useAdminAuth } from './auth.jsx';
import { Button } from '../components/ui/button.jsx';
import { Input, Textarea } from '../components/ui/input.jsx';
import { Label } from '../components/ui/label.jsx';
import { Card, CardContent } from '../components/ui/card.jsx';
import { AlertCircle, CheckCircle2, ChevronRight, Settings } from '../components/ui/icons.jsx';
import { PAGE_CONTENT, fieldValue, lines } from '../content/pageCopy.js';

function Field({ label, hint, children }) {
  return (
    <div className="sh-field">
      <Label>
        {label}
        {hint && <span className="sh-label-hint"> — {hint}</span>}
      </Label>
      {children}
    </div>
  );
}

const SECTIONS = [
  {
    id: 'general',
    title: 'General',
    hint: 'Name, phone, WhatsApp, email, address and hours',
    fields: [
      { name: 'companyName', label: 'Company name' },
      { name: 'tagline', label: 'Tagline' },
      { name: 'phone', label: 'Phone', hint: 'displayed on site' },
      { name: 'whatsapp', label: 'WhatsApp number', hint: 'digits only, with country code' },
      { name: 'email', label: 'Contact email' },
      { name: 'location', label: 'Location / address' },
      { name: 'hours', label: 'Opening hours' },
    ],
  },
  {
    id: 'maps',
    title: 'Maps',
    hint: 'Google Maps link and embed',
    fields: [
      { name: 'mapsUrl', label: 'Google Maps URL' },
      { name: 'mapsEmbed', label: 'Maps embed HTML', type: 'textarea' },
    ],
  },
  {
    id: 'seo',
    title: 'SEO',
    hint: 'Title and description for search engines',
    fields: [
      { name: 'seoTitle', label: 'SEO title' },
      { name: 'seoDescription', label: 'SEO description', type: 'textarea' },
    ],
  },
  {
    id: 'social',
    title: 'Social & analytics',
    hint: 'Footer icons and Google Analytics. WhatsApp uses the General number.',
    fields: [
      { name: 'ga4Id', label: 'GA4 Measurement ID', hint: 'e.g. G-XXXXXXXXXX' },
      { name: 'socials.instagram', label: 'Instagram URL' },
      { name: 'socials.youtube', label: 'YouTube URL' },
      { name: 'socials.twitter', label: 'Twitter / X URL' },
    ],
  },
  {
    id: 'reviews',
    title: 'Google reviews',
    hint: 'Rating, review count and the Maps link for the badge',
    fields: [
      { name: 'googleRating', label: 'Rating (e.g. 4.7)' },
      { name: 'googleReviewCount', label: 'Review count (e.g. 349)' },
      { name: 'googleMapsReviewUrl', label: 'Google Maps review URL', hint: 'opened when the badge is clicked' },
    ],
  },
];

export default function SettingsAdmin() {
  const { token } = useAdminAuth();
  const [form, setForm] = useState(null);
  const [sectionId, setSectionId] = useState('');
  const [pageId, setPageId] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [saving, setSaving] = useState(false);
  const section = SECTIONS.find((entry) => entry.id === sectionId);
  const page = PAGE_CONTENT.find((entry) => entry.id === pageId);

  useEffect(() => {
    api('/api/admin/settings', { token })
      .then((data) => setForm({ ...data, whyChooseText: (data.whyChoose || []).join('\n') }))
      .catch((err) => setStatus({ type: 'error', msg: err.message }));
  }, [token]);

  function set(name, value) {
    if (name.startsWith('socials.')) {
      const key = name.split('.')[1];
      setForm((current) => ({ ...current, socials: { ...current.socials, [key]: value } }));
      return;
    }
    setForm((current) => ({ ...current, [name]: value }));
  }

  function getVal(name) {
    if (name.startsWith('socials.')) return form.socials?.[name.split('.')[1]] || '';
    return form[name] ?? '';
  }

  function openPage(id) {
    const spec = PAGE_CONTENT.find((entry) => entry.id === id);
    const values = {};
    for (const field of spec.fields) values[field.name] = fieldValue(form, id, field);
    setForm((current) => ({ ...current, pages: { ...(current.pages || {}), [id]: values } }));
    setPageId(id);
    setStatus({ type: '', msg: '' });
  }

  function setPageField(name, value) {
    setForm((current) => ({
      ...current,
      pages: {
        ...(current.pages || {}),
        [pageId]: { ...(current.pages?.[pageId] || {}), [name]: value },
      },
    }));
  }

  async function save(event) {
    event.preventDefault();
    if (!section && !page) return;
    setSaving(true);
    setStatus({ type: '', msg: '' });
    try {
      const body = {};
      if (page) {
        const values = form.pages?.[page.id] || {};
        body.pages = { ...(form.pages || {}), [page.id]: values };
        if (page.id === 'home') {
          body.about = values.centreText || '';
          body.whyChoose = lines(values.highlights);
        }
        if (page.id === 'about') {
          body.about = values.intro || '';
          body.story = values.story || '';
          body.certifications = values.certifications || '';
          body.safety = values.safety || '';
          body.equipment = values.equipment || '';
          body.whyChoose = lines(values.highlights);
        }
        if (page.id === 'scuba') {
          body.safety = values.safetyText || '';
          body.equipment = values.equipmentText || '';
        }
        if (page.id === 'privacy' || page.id === 'terms' || page.id === 'cancellation') {
          body[page.id] = values.body || '';
        }
      } else {
        for (const field of section.fields) {
          if (field.name.startsWith('socials.')) body.socials = { ...(form.socials || {}) };
          else if (field.name === 'googleRating' || field.name === 'googleReviewCount') body[field.name] = Number(form[field.name]) || 0;
          else body[field.name] = form[field.name] ?? '';
        }
      }
      const saved = await api('/api/admin/settings', { method: 'PUT', token, body });
      setForm({ ...saved, whyChooseText: (saved.whyChoose || []).join('\n') });
      setStatus({ type: 'ok', msg: `${page ? page.title : section.title} saved.` });
    } catch (err) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setSaving(false);
      setTimeout(() => setStatus((current) => (current.type === 'ok' ? { type: '', msg: '' } : current)), 4000);
    }
  }

  if (!form) {
    return (
      <>
        <div className="sh-page-header">
          <div><h1 className="sh-page-title">Settings</h1></div>
        </div>
        {status.type === 'error'
          ? <div className="sh-alert sh-alert-error"><AlertCircle size={16} /><span>{status.msg}</span></div>
          : <p style={{ color: 'hsl(215.4 16.3% 46.9%)', padding: '2rem 0' }}>Loading settings…</p>}
      </>
    );
  }

  return (
    <>
      <div className="sh-page-header">
        <div>
          <h1 className="sh-page-title">Settings</h1>
          <p className="sh-page-desc">
            {page ? page.hint : sectionId === 'content' ? 'Choose a page, then edit the words shown there.' : section ? section.hint : 'Choose a section, then edit only that part of the site.'}
          </p>
        </div>
        {(section || sectionId === 'content') && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button type="button" variant="outline" onClick={() => { if (pageId) setPageId(''); else setSectionId(''); setStatus({ type: '', msg: '' }); }}>
              ← Back
            </Button>
            {(section || page) && (
              <Button type="submit" form="settings-form" disabled={saving}>
                <Settings size={15} /> {saving ? 'Saving…' : 'Save'}
              </Button>
            )}
          </div>
        )}
      </div>

      {status.msg && (
        <div className={`sh-alert ${status.type === 'ok' ? 'sh-alert-ok' : 'sh-alert-error'}`} style={{ marginBottom: '1.25rem' }}>
          {status.type === 'ok' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{status.msg}</span>
        </div>
      )}

      {!section && sectionId !== 'content' && (
        <div className="sh-card-grid">
          <button
            type="button"
            className="sh-item-card"
            onClick={() => { setSectionId('content'); setPageId(''); setStatus({ type: '', msg: '' }); }}
            style={{ textAlign: 'left', cursor: 'pointer', width: '100%', font: 'inherit', color: 'inherit', padding: 0 }}
          >
            <div className="sh-item-card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem' }}>Page content</h3>
                  <p style={{ margin: '0.35rem 0 0', color: 'hsl(var(--muted-foreground))', fontSize: '0.85rem' }}>
                    Headings and text for each page on the site
                  </p>
                </div>
                <ChevronRight size={18} />
              </div>
            </div>
          </button>
          {SECTIONS.map((entry) => (
            <button
              key={entry.id}
              type="button"
              className="sh-item-card"
              onClick={() => { setSectionId(entry.id); setStatus({ type: '', msg: '' }); }}
              style={{ textAlign: 'left', cursor: 'pointer', width: '100%', font: 'inherit', color: 'inherit', padding: 0 }}
            >
              <div className="sh-item-card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{entry.title}</h3>
                    <p style={{ margin: '0.35rem 0 0', color: 'hsl(var(--muted-foreground))', fontSize: '0.85rem' }}>
                      {entry.hint}
                    </p>
                  </div>
                  <ChevronRight size={18} />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {sectionId === 'content' && !page && (
        <div className="sh-card-grid">
          {PAGE_CONTENT.filter((entry) => !entry.parent).map((entry) => {
            const children = PAGE_CONTENT.filter((child) => child.parent === entry.id);
            return (
              <div key={entry.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="sh-item-card"
                  onClick={() => openPage(entry.id)}
                  style={{ textAlign: 'left', cursor: 'pointer', width: '100%', font: 'inherit', color: 'inherit', padding: 0 }}
                >
                  <div className="sh-item-card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{entry.title}</h3>
                        <p style={{ margin: '0.35rem 0 0', color: 'hsl(var(--muted-foreground))', fontSize: '0.85rem' }}>
                          {entry.hint}
                        </p>
                      </div>
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </button>
                {children.map((child) => (
                  <button
                    key={child.id}
                    type="button"
                    className="sh-item-card"
                    onClick={() => openPage(child.id)}
                    style={{ textAlign: 'left', cursor: 'pointer', width: 'calc(100% - 1rem)', marginLeft: '1rem', font: 'inherit', color: 'inherit', padding: 0 }}
                  >
                    <div className="sh-item-card-body">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1rem' }}>{child.title}</h3>
                          <p style={{ margin: '0.35rem 0 0', color: 'hsl(var(--muted-foreground))', fontSize: '0.85rem' }}>
                            {child.hint}
                          </p>
                        </div>
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {page && (
        <Card>
          <CardContent style={{ paddingTop: '1.25rem' }}>
            <form id="settings-form" onSubmit={save} className="sh-form" style={{ gap: '1rem' }}>
              {page.fields.map((field) => (
                <Field key={field.name} label={field.label}>
                  {field.type === 'textarea'
                    ? <Textarea rows={6} value={form.pages?.[page.id]?.[field.name] ?? ''} onChange={(event) => setPageField(field.name, event.target.value)} />
                    : <Input value={form.pages?.[page.id]?.[field.name] ?? ''} onChange={(event) => setPageField(field.name, event.target.value)} />}
                </Field>
              ))}
            </form>
          </CardContent>
        </Card>
      )}

      {section && (
          <Card>
            <CardContent style={{ paddingTop: '1.25rem' }}>
              <form id="settings-form" onSubmit={save} className="sh-form" style={{ gap: '1rem' }}>
                {section.fields.map((field) => (
                  <Field key={field.name} label={field.label} hint={field.hint}>
                    {field.type === 'textarea'
                      ? <Textarea rows={field.name === 'whyChooseText' ? 8 : 5} value={getVal(field.name)} onChange={(event) => set(field.name, event.target.value)} />
                      : <Input value={getVal(field.name)} onChange={(event) => set(field.name, event.target.value)} />}
                  </Field>
                ))}
              </form>
            </CardContent>
          </Card>
      )}
    </>
  );
}

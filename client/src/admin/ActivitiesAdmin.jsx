import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { useAdminAuth } from './auth.jsx';
import { removeItem, replaceItem } from './listState.js';
import ImageField from './ImageField.jsx';
import { Button } from '../components/ui/button.jsx';
import { Badge } from '../components/ui/badge.jsx';
import { Input, Textarea } from '../components/ui/input.jsx';
import { Label } from '../components/ui/label.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card.jsx';
import { ConfirmDialog } from '../components/ui/dialog.jsx';
import { Plus, Pencil, Trash2, AlertCircle } from '../components/ui/icons.jsx';
import { Spinner } from '../components/ui/spinner.jsx';
import SortableGrid, { saveSortOrder } from './SortableGrid.jsx';

/* ── helpers ── */
function toSlug(t) {
  return String(t || '').toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 80);
}
function lv(v) { return Array.isArray(v) ? v.join('\n') : (v || ''); }
function tl(v) { return String(v || '').split('\n').map(s => s.trim()).filter(Boolean); }
function faqStr(faqs) { return (faqs || []).map(f => `${f.q}|${f.a}`).join('\n'); }
function faqArr(str) {
  return String(str || '').split('\n').map(r => r.split('|')).filter(p => p[0]?.trim())
    .map(([q, a]) => ({ q: q.trim(), a: (a || '').trim() }));
}

const CUSTOM = '__custom__';

function cleanType(value) {
  const name = String(value || '').trim().replace(/\s+/g, ' ').slice(0, 40);
  const key = name.toLowerCase();
  if (key === 'scuba' || key === 'scuba diving' || key === 'diving') return 'scuba';
  if (key === 'snorkelling' || key === 'snorkeling' || key === 'snorkel') return 'snorkelling';
  return name;
}

function typeLabel(type) {
  if (type === 'scuba') return 'Scuba diving';
  if (type === 'snorkelling') return 'Snorkelling';
  return type || 'Activity';
}

function extraTypes(activities) {
  const names = [];
  for (const item of activities) {
    if (!item.type || item.type === 'scuba' || item.type === 'snorkelling') continue;
    if (!names.some((name) => name.toLowerCase() === item.type.toLowerCase())) names.push(item.type);
  }
  return names.sort((a, b) => a.localeCompare(b));
}

const EMPTY = {
  title: '', type: 'scuba', excerpt: '', heroImage: '',
  overview: '', whoCanParticipate: '',
  duration: '', price: 'On request', meetingPoint: '',
  requirements: '', whatToBring: '',
  included: '', notIncluded: '', faqs: '',
  featured: false, published: true, sortOrder: 0,
  slug: '', seoTitle: '', seoDescription: '',
};

function fromItem(item) {
  return { ...item, whatToBring: lv(item.whatToBring), included: lv(item.included), notIncluded: lv(item.notIncluded), faqs: faqStr(item.faqs) };
}
function toBody(form) {
  return { ...form, whatToBring: tl(form.whatToBring), included: tl(form.included), notIncluded: tl(form.notIncluded), faqs: faqArr(form.faqs), sortOrder: Number(form.sortOrder) || 0 };
}

function Section({ title, desc, children }) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle>{desc && <CardDescription>{desc}</CardDescription>}</CardHeader>
      <CardContent><div className="sh-form">{children}</div></CardContent>
    </Card>
  );
}
function Field({ label, hint, children }) {
  return (
    <div className="sh-field">
      <Label>{label}{hint && <span className="sh-label-hint"> — {hint}</span>}</Label>
      {children}
    </div>
  );
}

function ActivityCard({ activity, onEdit, onDelete }) {
  const typeColor = activity.type === 'scuba'
    ? { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' }
    : activity.type === 'snorkelling'
      ? { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' }
      : { bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' };
  return (
    <div className="sh-item-card">
      {activity.heroImage
        ? <img src={activity.heroImage} alt={activity.title} className="sh-item-card-img" loading="lazy" onError={e => { e.target.style.display = 'none'; }} />
        : <div className="sh-item-card-no-img">No image</div>}
      <div className="sh-item-card-body">
        <div className="sh-item-card-title">{activity.title}</div>
        <div className="sh-item-card-badges">
          <span className="sh-badge" style={{ background: typeColor.bg, color: typeColor.color, borderColor: typeColor.border, textTransform: 'capitalize' }}>
            {typeLabel(activity.type)}
          </span>
          {activity.published === false && <Badge variant="destructive">Draft</Badge>}
          {activity.featured && <Badge style={{ background: 'hsl(38 92% 50%)', color: '#fff' }}>★ Featured</Badge>}
        </div>
        {activity.excerpt && <p className="sh-item-card-excerpt">{activity.excerpt.slice(0, 100)}{activity.excerpt.length > 100 ? '…' : ''}</p>}
        {activity.price && <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'hsl(221 83% 53%)', marginTop: '0.35rem' }}>{activity.price}</p>}
      </div>
      <div className="sh-item-card-footer">
        <Button variant="outline" size="sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => onEdit(activity)}><Pencil size={13} /> Edit</Button>
        <Button variant="destructive" size="sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => onDelete(activity._id)}><Trash2 size={13} /> Delete</Button>
      </div>
    </div>
  );
}

export default function ActivitiesAdmin() {
  const { token } = useAdminAuth();
  const [activities, setActivities] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [form,       setForm]       = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState('');
  const [deleteId,   setDeleteId]   = useState(null);
  const [useCustom,  setUseCustom]  = useState(false);
  const [customName, setCustomName] = useState('');

  useEffect(() => {
    let active = true;
    api('/api/admin/activities', { token })
      .then((data) => { if (active) setActivities(data); })
      .catch((e) => { if (active) setError(e.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token]);

  const reorder = useCallback(async (ordered) => {
    const next = ordered.map((item, index) => ({ ...item, sortOrder: index + 1 }));
    setActivities(next);
    try { await saveSortOrder('activities', token, next); }
    catch (err) { setError(err.message); }
  }, [token]);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function openForm(item) {
    const next = item ? fromItem(item) : { ...EMPTY };
    const known = !item || next.type === 'scuba' || next.type === 'snorkelling' || extraTypes(activities).some((name) => name.toLowerCase() === String(next.type).toLowerCase());
    setUseCustom(!known);
    setCustomName(known ? '' : next.type);
    setForm(next);
    setError('');
  }

  async function save(e) {
    e.preventDefault();
    const type = cleanType(useCustom ? customName : form.type);
    if (!type) {
      setError('Enter a name for the custom activity type.');
      return;
    }
    setSaving(true); setError('');
    try {
      const body = toBody({ ...form, type });
      const saved = form._id
        ? await api(`/api/admin/activities/${form._id}`, { method: 'PUT',  token, body })
        : await api('/api/admin/activities',              { method: 'POST', token, body });
      setActivities((list) => replaceItem(list, saved));
      setForm(null);
      setUseCustom(false);
      setCustomName('');
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  async function doDelete() {
    try {
      await api(`/api/admin/activities/${deleteId}`, { method: 'DELETE', token });
      setActivities((list) => removeItem(list, deleteId));
    }
    catch (e) { setError(e.message); }
    finally { setDeleteId(null); }
  }

  const pendingAct = activities.find(a => a._id === deleteId);

  /* ── FORM VIEW ── */
  if (form !== null) {
    const previewSlug = form.slug || toSlug(form.title);
    return (
      <>
        <div className="sh-page-header">
          <div>
            <p style={{ fontSize: '0.78rem', color: 'hsl(215.4 16.3% 46.9%)', marginBottom: '0.25rem', cursor: 'pointer' }}
              onClick={() => { setForm(null); setUseCustom(false); setCustomName(''); }}>← Back to activities</p>
            <h1 className="sh-page-title">{form._id ? `Edit: ${form.title || 'Activity'}` : 'Add new activity'}</h1>
            {previewSlug && (
              <p style={{ fontSize: '0.78rem', color: 'hsl(215.4 16.3% 46.9%)', marginTop: '0.2rem' }}>
                🔗 URL: <code style={{ background: 'hsl(210 40% 96%)', padding: '1px 6px', borderRadius: 4 }}>/{form.type || 'scuba'}/{previewSlug}</code>
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="outline" onClick={() => { setForm(null); setUseCustom(false); setCustomName(''); }}>Cancel</Button>
            <Button type="submit" form="act-form" disabled={saving}>{saving ? 'Saving…' : form._id ? 'Save changes' : 'Create activity'}</Button>
          </div>
        </div>

        {error && <div className="sh-alert sh-alert-error" style={{ marginBottom: '1rem' }}><AlertCircle size={16} /><span>{error}</span></div>}

        <form id="act-form" onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          <Section title="Basics">
            <Field label="Activity title" hint="required">
              <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Discover Scuba Diving" required />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Field label="Activity type">
                <select
                  className="sh-select"
                  value={useCustom ? CUSTOM : form.type}
                  onChange={(e) => {
                    if (e.target.value === CUSTOM) {
                      setUseCustom(true);
                      return;
                    }
                    setUseCustom(false);
                    setCustomName('');
                    set('type', e.target.value);
                  }}
                >
                  <option value="scuba">Scuba diving</option>
                  <option value="snorkelling">Snorkelling</option>
                  {extraTypes(activities).map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                  <option value={CUSTOM}>Custom type</option>
                </select>
                {useCustom && (
                  <Input
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="New type name, e.g. Kayaking"
                    style={{ marginTop: '0.5rem' }}
                    required
                  />
                )}
              </Field>
              <Field label="Price">
                <Input value={form.price} onChange={e => set('price', e.target.value)} placeholder="e.g. ₹3,500 / On request" />
              </Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="sh-field sh-field-row">
                <input type="checkbox" id="afeatured" checked={form.featured} style={{ width: 16, height: 16, accentColor: 'hsl(221 83% 53%)', cursor: 'pointer' }}
                  onChange={e => set('featured', e.target.checked)} />
                <Label htmlFor="afeatured" style={{ marginBottom: 0, cursor: 'pointer' }}>Featured on home page</Label>
              </div>
              <div className="sh-field sh-field-row">
                <input type="checkbox" id="apublished" checked={form.published} style={{ width: 16, height: 16, accentColor: 'hsl(221 83% 53%)', cursor: 'pointer' }}
                  onChange={e => set('published', e.target.checked)} />
                <Label htmlFor="apublished" style={{ marginBottom: 0, cursor: 'pointer' }}>Published (visible on site)</Label>
              </div>
            </div>
          </Section>

          <Section title="Hero image" desc="Main photo for this activity.">
            <ImageField value={form.heroImage} onChange={v => set('heroImage', v)} label="Hero image" />
          </Section>

          <Section title="Description" desc="Describe this activity to guests.">
            <Field label="Short description" hint={`${(form.excerpt || '').length}/160 chars`}>
              <Textarea value={form.excerpt} onChange={e => set('excerpt', e.target.value)} placeholder="Short summary shown in cards and Google results." style={{ minHeight: 80 }} />
              <p style={{ fontSize: '0.72rem', color: (form.excerpt || '').length > 160 ? 'hsl(0 72% 50%)' : 'hsl(215.4 16.3% 55%)', marginTop: 4 }}>
                {(form.excerpt || '').length} / 160 characters
              </p>
            </Field>
            <Field label="Full overview">
              <Textarea value={form.overview} onChange={e => set('overview', e.target.value)} placeholder="Detailed description of the activity…" style={{ minHeight: 120 }} />
            </Field>
            <Field label="Who can participate?">
              <Textarea value={form.whoCanParticipate} onChange={e => set('whoCanParticipate', e.target.value)} style={{ minHeight: 80 }}
                placeholder="Age, swimming ability, health requirements…" />
            </Field>
          </Section>

          <Section title="Schedule & logistics">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Field label="Duration">
                <Input value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="e.g. Half day (4 hrs)" />
              </Field>
              <Field label="Meeting point">
                <Input value={form.meetingPoint} onChange={e => set('meetingPoint', e.target.value)} placeholder="e.g. Corbyn's Cove Beach, 7 AM" />
              </Field>
            </div>
            <Field label="Requirements" hint="health, fitness, swimming">
              <Textarea value={form.requirements} onChange={e => set('requirements', e.target.value)} style={{ minHeight: 80 }} />
            </Field>
            <Field label="What to bring" hint="one item per line">
              <Textarea value={form.whatToBring} onChange={e => set('whatToBring', e.target.value)}
                placeholder={"Swimsuit\nSunscreen\nTowel\nWater bottle"} />
            </Field>
          </Section>

          <Section title="What's included / not included" desc="One item per line.">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Field label="✅ Included">
                <Textarea value={form.included} onChange={e => set('included', e.target.value)}
                  placeholder={"Equipment rental\nInstructor\nUnderwater photos"} />
              </Field>
              <Field label="❌ Not included">
                <Textarea value={form.notIncluded} onChange={e => set('notIncluded', e.target.value)}
                  placeholder={"Meals\nTransport\nAccommodation"} />
              </Field>
            </div>
          </Section>

          <Section title="FAQs" desc="Optional — Question|Answer, one per line.">
            <Field label="FAQs" hint="Question|Answer — one per line">
              <Textarea value={form.faqs} onChange={e => set('faqs', e.target.value)}
                placeholder={"Can non-swimmers participate?|No, basic swimming is required.\nWhat is the minimum age?|10 years old with parental consent."} style={{ minHeight: 120 }} />
            </Field>
          </Section>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.5rem' }}>
            <Button variant="outline" type="button" onClick={() => setForm(null)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : form._id ? 'Save changes' : 'Create activity'}</Button>
          </div>
        </form>
      </>
    );
  }

  /* ── LIST VIEW ── */
  return (
    <>
      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete this activity?"
        description={pendingAct ? `"${pendingAct.title}" will be permanently deleted.` : 'This activity will be permanently deleted.'}
        confirmLabel="Yes, delete"
        onConfirm={doDelete}
        onCancel={() => setDeleteId(null)}
      />

      <div className="sh-page-header">
        <div>
          <h1 className="sh-page-title">Activities</h1>
          <p className="sh-page-desc">Diving and snorkelling trips. They appear under Scuba diving in the menu and footer. Drag a card to change that order.</p>
        </div>
        <Button onClick={() => openForm(null)}><Plus size={15} /> Add activity</Button>
      </div>

      {error && <div className="sh-alert sh-alert-error" style={{ marginBottom: '1rem' }}><AlertCircle size={16} /><span>{error}</span></div>}

      {loading ? <Spinner label="Loading activities…" /> : activities.length === 0 ? (
        <Card><CardContent>
          <div className="sh-empty">
            <div className="sh-empty-icon">🌊</div>
            <p className="sh-empty-title">No activities yet</p>
            <p className="sh-empty-desc">Add your first dive or snorkelling trip.</p>
            <Button size="sm" onClick={() => openForm(null)}><Plus size={14} /> Add activity</Button>
          </div>
        </CardContent></Card>
      ) : (
        <Card><CardContent style={{ padding: '1rem' }}>
          <SortableGrid
            className="sh-card-grid"
            items={activities}
            onReorder={reorder}
            renderItem={(activity) => (
              <ActivityCard activity={activity} onEdit={openForm} onDelete={(id) => setDeleteId(id)} />
            )}
          />
        </CardContent></Card>
      )}
    </>
  );
}

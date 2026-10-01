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
import { Plus, Pencil, Trash2, AlertCircle, ChevronRight } from '../components/ui/icons.jsx';
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

const EMPTY = {
  title: '', category: 'recreational', excerpt: '',
  heroImage: '', overview: '', whoFor: '',
  prerequisites: '', whatYouLearn: '',
  duration: '', price: 'On request', certification: '',
  availableDates: 'Enquire for upcoming dates',
  included: '', notIncluded: '', faqs: '',
  featured: false, published: true, sortOrder: 0,
  /* preserved but hidden */
  slug: '', seoTitle: '', seoDescription: '',
};

function fromItem(item) {
  return {
    ...item,
    prerequisites:  lv(item.prerequisites),
    whatYouLearn:   lv(item.whatYouLearn),
    included:       lv(item.included),
    notIncluded:    lv(item.notIncluded),
    faqs:           faqStr(item.faqs),
  };
}

function toBody(form) {
  return {
    ...form,
    prerequisites: tl(form.prerequisites),
    whatYouLearn:  tl(form.whatYouLearn),
    included:      tl(form.included),
    notIncluded:   tl(form.notIncluded),
    faqs:          faqArr(form.faqs),
    sortOrder:     Number(form.sortOrder) || 0,
    /* Let server auto-generate if not present */
    seoTitle:      form.seoTitle || '',
    seoDescription:form.seoDescription || '',
    slug:          form.slug || '',
  };
}

/* ── Section wrapper ── */
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

/* ── Course card (list view) ── */
function CourseCard({ course, onEdit, onDelete }) {
  return (
    <div className="sh-item-card">
      {course.heroImage
        ? <img src={course.heroImage} alt={course.title} className="sh-item-card-img" loading="lazy" onError={e => { e.target.style.display='none'; }} />
        : <div className="sh-item-card-no-img">No image</div>}
      <div className="sh-item-card-body">
        <div className="sh-item-card-title">{course.title}</div>
        <div className="sh-item-card-badges">
          <Badge variant="secondary" style={{ textTransform: 'capitalize' }}>{course.category}</Badge>
          {course.published === false && <Badge variant="destructive">Draft</Badge>}
          {course.published === true  && <Badge variant="outline" style={{ color:'hsl(142 71% 35%)', borderColor:'hsl(142 71% 75%)' }}>Published</Badge>}
          {course.featured && <Badge style={{ background:'hsl(38 92% 50%)', color:'#fff' }}>★ Featured</Badge>}
        </div>
        {course.excerpt && <p className="sh-item-card-excerpt">{course.excerpt.slice(0, 100)}{course.excerpt.length > 100 ? '…' : ''}</p>}
        {course.price && <p style={{ fontSize:'0.78rem', fontWeight:600, color:'hsl(221 83% 53%)', marginTop:'0.35rem' }}>{course.price}</p>}
      </div>
      <div className="sh-item-card-footer">
        <Button variant="outline" size="sm" style={{ flex:1, justifyContent:'center' }} onClick={() => onEdit(course)}><Pencil size={13}/> Edit</Button>
        <Button variant="destructive" size="sm" style={{ flex:1, justifyContent:'center' }} onClick={() => onDelete(course._id)}><Trash2 size={13}/> Delete</Button>
      </div>
    </div>
  );
}

/* ══════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════ */
export default function CoursesAdmin() {
  const { token } = useAdminAuth();
  const [courses,  setCourses]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [form,     setForm]     = useState(null);  // null = list view
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    let active = true;
    api('/api/admin/courses', { token })
      .then((data) => { if (active) setCourses(data); })
      .catch((e) => { if (active) setError(e.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token]);

  const reorder = useCallback(async (ordered) => {
    const next = ordered.map((item, index) => ({ ...item, sortOrder: index + 1 }));
    setCourses(next);
    try { await saveSortOrder('courses', token, next); }
    catch (err) { setError(err.message); }
  }, [token]);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function save(e) {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const body = toBody(form);
      const saved = form._id
        ? await api(`/api/admin/courses/${form._id}`, { method: 'PUT',  token, body })
        : await api('/api/admin/courses',              { method: 'POST', token, body });
      setCourses((list) => replaceItem(list, saved));
      setForm(null);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  async function doDelete() {
    try {
      await api(`/api/admin/courses/${deleteId}`, { method: 'DELETE', token });
      setCourses((list) => removeItem(list, deleteId));
    }
    catch (e) { setError(e.message); }
    finally { setDeleteId(null); }
  }

  const pendingCourse = courses.find(c => c._id === deleteId);

  /* ── FORM VIEW ── */
  if (form !== null) {
    const previewSlug = form.slug || toSlug(form.title);

    return (
      <>
        <div className="sh-page-header">
          <div>
            <p style={{ fontSize:'0.78rem', color:'hsl(215.4 16.3% 46.9%)', marginBottom:'0.25rem', display:'flex', alignItems:'center', gap:4, cursor:'pointer' }}
              onClick={() => setForm(null)}>
              ← Back to courses
            </p>
            <h1 className="sh-page-title">{form._id ? `Edit: ${form.title || 'Course'}` : 'Add new course'}</h1>
            {previewSlug && (
              <p style={{ fontSize:'0.78rem', color:'hsl(215.4 16.3% 46.9%)', marginTop:'0.2rem' }}>
                🔗 URL will be: <code style={{ background:'hsl(210 40% 96%)', padding:'1px 6px', borderRadius:4 }}>/courses/{previewSlug}</code>
              </p>
            )}
          </div>
          <div style={{ display:'flex', gap:'0.5rem' }}>
            <Button variant="outline" onClick={() => setForm(null)}>Cancel</Button>
            <Button type="submit" form="course-form" disabled={saving}>{saving ? 'Saving…' : form._id ? 'Save changes' : 'Create course'}</Button>
          </div>
        </div>

        {error && <div className="sh-alert sh-alert-error" style={{ marginBottom:'1rem' }}><AlertCircle size={16}/><span>{error}</span></div>}

        <form id="course-form" onSubmit={save} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>

          {/* 1. Basics */}
          <Section title="Basics" desc="Core information visible to guests.">
            <Field label="Course title" hint="required">
              <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Open Water Diver" required />
            </Field>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
              <Field label="Category">
                <select className="sh-select" value={form.category} onChange={e => set('category', e.target.value)}>
                  <option value="recreational">Recreational</option>
                  <option value="professional">Professional</option>
                </select>
              </Field>
              <Field label="Price">
                <Input value={form.price} onChange={e => set('price', e.target.value)} placeholder="e.g. ₹8,500 / On request" />
              </Field>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
              <div className="sh-field sh-field-row">
                <input type="checkbox" id="featured" checked={form.featured} style={{ width:16, height:16, accentColor:'hsl(221 83% 53%)', cursor:'pointer' }}
                  onChange={e => set('featured', e.target.checked)} />
                <Label htmlFor="featured" style={{ marginBottom:0, cursor:'pointer' }}>Featured on home page</Label>
              </div>
              <div className="sh-field sh-field-row">
                <input type="checkbox" id="published" checked={form.published} style={{ width:16, height:16, accentColor:'hsl(221 83% 53%)', cursor:'pointer' }}
                  onChange={e => set('published', e.target.checked)} />
                <Label htmlFor="published" style={{ marginBottom:0, cursor:'pointer' }}>Published (visible on site)</Label>
              </div>
            </div>
          </Section>

          {/* 2. Hero image */}
          <Section title="Hero image" desc="Main photo displayed at the top of the course page.">
            <ImageField value={form.heroImage} onChange={v => set('heroImage', v)} label="Hero image" />
          </Section>

          {/* 3. Description */}
          <Section title="Description" desc="Tell guests what this course is about. The short description also appears in search results.">
            <Field label="Short description" hint={`${(form.excerpt||'').length}/160 chars — used as meta description for Google`}>
              <Textarea value={form.excerpt} onChange={e => set('excerpt', e.target.value)} placeholder="A short summary shown in course cards and search results." style={{ minHeight:80 }} />
              <p style={{ fontSize:'0.72rem', color: (form.excerpt||'').length > 160 ? 'hsl(0 72% 50%)' : 'hsl(215.4 16.3% 55%)', marginTop:4 }}>
                {(form.excerpt||'').length} / 160 characters
              </p>
            </Field>
            <Field label="Overview" hint="Full description shown on the course page">
              <Textarea value={form.overview} onChange={e => set('overview', e.target.value)} placeholder="Detailed overview of what the course covers…" style={{ minHeight:120 }} />
            </Field>
            <Field label="Who is this for?" hint="Age, fitness, swimming ability requirements, etc.">
              <Textarea value={form.whoFor} onChange={e => set('whoFor', e.target.value)} style={{ minHeight:80 }} />
            </Field>
          </Section>

          {/* 4. What you'll learn */}
          <Section title="What you'll learn" desc="Enter each point on a new line.">
            <Field label="Prerequisites" hint="one per line">
              <Textarea value={form.prerequisites} onChange={e => set('prerequisites', e.target.value)}
                placeholder={"Must be 12+ years old\nCan swim 200m\nNo prior experience needed"} />
            </Field>
            <Field label="Skills & knowledge covered" hint="one per line">
              <Textarea value={form.whatYouLearn} onChange={e => set('whatYouLearn', e.target.value)}
                placeholder={"Buoyancy control\nUnderwater navigation\nSafety procedures"} />
            </Field>
          </Section>

          {/* 5. Schedule & certification */}
          <Section title="Schedule & certification">
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
              <Field label="Duration">
                <Input value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="e.g. 3 days" />
              </Field>
              <Field label="Certification awarded">
                <Input value={form.certification} onChange={e => set('certification', e.target.value)} placeholder="e.g. PADI Open Water Diver" />
              </Field>
            </div>
            <Field label="Available dates">
              <Input value={form.availableDates} onChange={e => set('availableDates', e.target.value)} placeholder="e.g. Year-round / Enquire for upcoming dates" />
            </Field>
          </Section>

          {/* 6. What's included */}
          <Section title="What's included / not included" desc="Enter each item on a new line.">
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
              <Field label="✅ Included" hint="one per line">
                <Textarea value={form.included} onChange={e => set('included', e.target.value)}
                  placeholder={"PADI manual & materials\nEquipment rental\nCertification fees"} />
              </Field>
              <Field label="❌ Not included" hint="one per line">
                <Textarea value={form.notIncluded} onChange={e => set('notIncluded', e.target.value)}
                  placeholder={"Meals\nHotel accommodation\nTransport to site"} />
              </Field>
            </div>
          </Section>

          {/* 7. FAQs */}
          <Section title="FAQs" desc="Optional — one FAQ per line in format: Question|Answer">
            <Field label="FAQs" hint="Question|Answer — one pair per line">
              <Textarea value={form.faqs} onChange={e => set('faqs', e.target.value)}
                placeholder={"Do I need to know how to swim?|Yes, basic swimming ability is required.\nWhat should I bring?|Just a swimsuit and sunscreen!"} style={{ minHeight:120 }} />
            </Field>
          </Section>

          {/* Sticky save bar */}
          <div style={{ display:'flex', justifyContent:'flex-end', gap:'0.5rem', paddingTop:'0.5rem' }}>
            <Button variant="outline" type="button" onClick={() => setForm(null)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : form._id ? 'Save changes' : 'Create course'}</Button>
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
        title="Delete this course?"
        description={pendingCourse ? `"${pendingCourse.title}" will be permanently deleted.` : 'This course will be permanently deleted.'}
        confirmLabel="Yes, delete"
        onConfirm={doDelete}
        onCancel={() => setDeleteId(null)}
      />

      <div className="sh-page-header">
        <div>
          <h1 className="sh-page-title">Courses</h1>
          <p className="sh-page-desc">PADI courses offered at United Scuba. Drag a card to change the order on the site.</p>
        </div>
        <Button onClick={() => setForm({ ...EMPTY })}><Plus size={15}/> Add course</Button>
      </div>

      {error && <div className="sh-alert sh-alert-error" style={{ marginBottom:'1rem' }}><AlertCircle size={16}/><span>{error}</span></div>}

      {loading ? <Spinner label="Loading courses…" /> : courses.length === 0 ? (
        <Card><CardContent>
          <div className="sh-empty">
            <div className="sh-empty-icon">🎓</div>
            <p className="sh-empty-title">No courses yet</p>
            <p className="sh-empty-desc">Add your first PADI course to get started.</p>
            <Button size="sm" onClick={() => setForm({ ...EMPTY })}><Plus size={14}/> Add course</Button>
          </div>
        </CardContent></Card>
      ) : (
        <Card><CardContent style={{ padding:'1rem' }}>
          <SortableGrid
            className="sh-card-grid"
            items={courses}
            onReorder={reorder}
            renderItem={(course) => (
              <CourseCard course={course} onEdit={(item) => setForm(fromItem(item))} onDelete={(id) => setDeleteId(id)} />
            )}
          />
        </CardContent></Card>
      )}
    </>
  );
}

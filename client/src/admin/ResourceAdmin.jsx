import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { useAdminAuth } from './auth.jsx';
import ImageField from './ImageField.jsx';
import { Button } from '../components/ui/button.jsx';
import { Input, Textarea } from '../components/ui/input.jsx';
import { Label } from '../components/ui/label.jsx';
import { Badge } from '../components/ui/badge.jsx';
import { Card, CardContent } from '../components/ui/card.jsx';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableWrapper } from '../components/ui/table.jsx';
import { ConfirmDialog } from '../components/ui/dialog.jsx';
import { Plus, Pencil, Trash2, X, AlertCircle } from '../components/ui/icons.jsx';
import SortableGrid, { saveSortOrder } from './SortableGrid.jsx';

function lines(v)   { return Array.isArray(v) ? v.join('\n') : v || ''; }
function toLines(v) { return String(v||'').split('\n').map((s)=>s.trim()).filter(Boolean); }

/** Derive a display label for a list item */
function itemLabel(item) {
  return item.title || item.question || item.name || item.alt || item.slug || item._id;
}

/** Get the first image URL from an item given a field key */
function imgUrl(item, field) {
  return field ? (item[field] || '') : '';
}

/* ── Grid view (Gallery) ── */
function GridView({ items, imageField, onEdit, onDelete, onReorder, crossDelete = false }) {
  if (items.length === 0) return null;
  return (
    <SortableGrid className="sh-img-grid" items={items} onReorder={onReorder} renderItem={(item) => {
        const src = imgUrl(item, imageField);
        return (
          <div className="sh-img-card">
            <div className="sh-img-thumb-wrap">
              {src
                ? <img src={src} alt={item.alt || ''} className="sh-img-thumb" loading="lazy" onError={(e)=>{ e.target.style.opacity='0'; }} />
                : <div className="sh-img-placeholder">No image</div>}
              {!crossDelete && item.featured && <span className="sh-img-badge">★ Featured</span>}
              {crossDelete && (
                <button type="button" className="sh-img-remove" aria-label="Delete image" onClick={() => onDelete(item._id)}>
                  <X size={14} />
                </button>
              )}
            </div>
            {!crossDelete && (
              <div className="sh-img-meta">
                <p className="sh-img-name">{item.alt || item.title || '—'}</p>
                {item.category && <p className="sh-img-cat">{item.category}</p>}
              </div>
            )}
            {!crossDelete && (
              <div className="sh-img-actions">
                <Button variant="outline" size="sm" style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => onEdit(item)}>
                  <Pencil size={13} /> Edit
                </Button>
                <Button variant="destructive" size="sm" style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => onDelete(item._id)}>
                  <Trash2 size={13} /> Del
                </Button>
              </div>
            )}
          </div>
        );
    }} />
  );
}

/* ── Card list view (Courses / Activities / Blog / Reviews) ── */
function CardListView({ items, imageField, onEdit, onDelete, onReorder }) {
  return (
    <SortableGrid className="sh-card-grid" items={items} onReorder={onReorder} renderItem={(item) => {
        const src       = imageField ? (item[imageField] || '') : '';
        const title     = item.title || item.name || item.question || item.slug || '—';
        const excerpt   = item.excerpt || item.quote || item.answer || '';
        const isReview  = 'rating' in item;
        const stars     = Number(item.rating) || 0;

        return (
          <div className="sh-item-card">
            {/* Review layout: avatar + info */}
            {isReview ? (
              <div className="sh-item-card-body">
                <div className="sh-review-header">
                  <div className="sh-review-avatar">{title[0]?.toUpperCase()}</div>
                  <div style={{ minWidth: 0 }}>
                    <div className="sh-item-card-title" style={{ marginBottom: 2 }}>{title}</div>
                    {item.source && <p style={{ fontSize: '0.72rem', color: 'hsl(215.4 16.3% 55%)', margin: 0 }}>{item.source}</p>}
                    {stars > 0 && (
                      <div className="sh-stars">
                        {'★'.repeat(stars)}{'☆'.repeat(Math.max(0, 5 - stars))}
                      </div>
                    )}
                    <div className="sh-item-card-badges" style={{ marginTop: 4 }}>
                      {item.featured && <Badge variant="default">★ Featured</Badge>}
                    </div>
                  </div>
                </div>
                {excerpt && (
                  <div className="sh-review-quote">
                    "{excerpt.slice(0, 160)}{excerpt.length > 160 ? '…' : ''}"
                  </div>
                )}
              </div>
            ) : (
              /* Standard card: image + content */
              <>
                {src
                  ? <img src={src} alt={title} className="sh-item-card-img" loading="lazy"
                      onError={(e) => { e.target.style.display = 'none'; }} />
                  : <div className="sh-item-card-no-img">No image set</div>}

                <div className="sh-item-card-body">
                  <div className="sh-item-card-title">{title}</div>
                  <div className="sh-item-card-badges">
                    {(item.category || item.type) && (
                      <Badge variant="secondary" style={{ textTransform: 'capitalize' }}>
                        {item.category || item.type}
                      </Badge>
                    )}
                    {item.published === false && <Badge variant="destructive">Draft</Badge>}
                    {item.published === true  && <Badge variant="outline" style={{ color: 'hsl(142 71% 35%)', borderColor: 'hsl(142 71% 75%)' }}>Published</Badge>}
                    {item.featured && <Badge style={{ background: 'hsl(38 92% 50%)', color: '#fff' }}>★ Featured</Badge>}
                  </div>
                  {excerpt && (
                    <p className="sh-item-card-excerpt">
                      {excerpt.slice(0, 110)}{excerpt.length > 110 ? '…' : ''}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Actions */}
            <div className="sh-item-card-footer">
              <Button variant="outline" size="sm" style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => onEdit(item)}>
                <Pencil size={13} /> Edit
              </Button>
              <Button variant="destructive" size="sm" style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => onDelete(item._id)}>
                <Trash2 size={13} /> Delete
              </Button>
            </div>
          </div>
        );
  }} />
  );
}

/* ── Table view (default) ── */
function TableView({ items, imageField, onEdit, onDelete }) {
  const hasImg = Boolean(imageField);
  if (items.length === 0) return null;
  return (
    <TableWrapper>
      <Table>
        <TableHeader>
          <TableRow>
            {hasImg && <TableHead style={{ width: 72 }}>Image</TableHead>}
            <TableHead style={{ width: '99%' }}>Item</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const src = imgUrl(item, imageField);
            return (
              <TableRow key={item._id}>
                {hasImg && (
                  <TableCell style={{ padding: '0.5rem 0.75rem' }}>
                    {src
                      ? <img src={src} alt="" style={{ width: 56, height: 42, objectFit: 'cover', borderRadius: 6, border: '1px solid hsl(214.3 31.8% 91.4%)', display: 'block' }} loading="lazy" />
                      : <div style={{ width: 56, height: 42, borderRadius: 6, background: 'hsl(210 40% 96%)', border: '1px dashed hsl(214.3 31.8% 82%)', display: 'grid', placeItems: 'center', fontSize: '0.65rem', color: 'hsl(215.4 16.3% 60%)' }}>none</div>}
                  </TableCell>
                )}
                <TableCell>
                  <span style={{ fontWeight: 600 }}>{itemLabel(item)}</span>
                  {item.excerpt && (
                    <p className="sh-td-muted" style={{ maxWidth: 500 }}>
                      {item.excerpt.slice(0, 90)}{item.excerpt.length > 90 ? '…' : ''}
                    </p>
                  )}
                  {item.category && (
                    <span style={{ fontSize: '0.72rem', background: 'hsl(210 40% 96%)', border: '1px solid hsl(214 31% 91%)', borderRadius: 4, padding: '1px 6px', marginTop: 4, display: 'inline-block', color: 'hsl(215 20% 45%)' }}>
                      {item.category}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
                      <Pencil size={13} /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => onDelete(item._id)}>
                      <Trash2 size={13} /> Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableWrapper>
  );
}

/* ══════════════════════════════════════════
   Main ResourceAdmin component
   Props:
     title        – heading e.g. "Courses"
     description  – subtitle text
     path         – API path segment e.g. "courses"
     fields       – array of field descriptors:
                    { name, label, type?, hint?, options? }
                    types: 'text'(default) | 'textarea' | 'lines' | 'faqs' | 'checkbox' | 'select' | 'image'
     createTemplate – default values for a new item
     imageField   – (optional) field name that holds the primary image URL
     gridView     – (optional) bool; use image grid instead of table for list
   ══════════════════════════════════════════ */
export default function ResourceAdmin({ title, description = '', path, fields, createTemplate, imageField, gridView = false, cardView = false, crossDelete = false }) {
  const { token } = useAdminAuth();
  const [items,     setItems]     = useState([]);
  const [editing,   setEditing]   = useState(null);
  const [error,     setError]     = useState('');
  const [saving,    setSaving]    = useState(false);
  const [deleteId,  setDeleteId]  = useState(null);  // id pending confirmation
  const pendingItem = items.find((i) => i._id === deleteId);

  async function load() {
    try { setItems(await api(`/api/admin/${path}`, { token })); }
    catch (e) { setError(e.message); }
  }
  useEffect(() => { load(); }, [token, path]);

  const reorder = useCallback(async (ordered) => {
    const next = ordered.map((item, index) => ({ ...item, sortOrder: index + 1 }));
    setItems(next);
    try {
      await saveSortOrder(path, token, next);
    } catch (err) {
      setError(err.message);
      try { setItems(await api(`/api/admin/${path}`, { token })); } catch { /* keep the error */ }
    }
  }, [path, token]);

  function startNew() { setEditing({ ...createTemplate }); window.scrollTo({ top: 0, behavior: 'smooth' }); }

  function update(name, val) { setEditing((c) => ({ ...c, [name]: val })); }

  async function save(e) {
    e.preventDefault();
    setSaving(true); setError('');
    const body = { ...editing };
    for (const f of fields) {
      if (f.type === 'lines') body[f.name] = toLines(body[f.name]);
      if (f.type === 'faqs') {
        body.faqs = String(body.faqsText || '').split('\n').map((r) => r.split('|'))
          .filter((p) => p[0]).map(([q, a]) => ({ q: q.trim(), a: (a||'').trim() }));
        delete body.faqsText;
      }
    }
    delete body._id; delete body.__v; delete body.createdAt; delete body.updatedAt;
    try {
      if (editing._id) await api(`/api/admin/${path}/${editing._id}`, { method: 'PUT',  token, body });
      else             await api(`/api/admin/${path}`,                 { method: 'POST', token, body });
      setEditing(null); load();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  function remove(id) { setDeleteId(id); }   // open confirm dialog

  async function doDelete() {
    try {
      await api(`/api/admin/${path}/${deleteId}`, { method: 'DELETE', token });
      load();
      if (editing?._id === deleteId) setEditing(null);
    } catch (e) { setError(e.message); }
    finally { setDeleteId(null); }
  }

  function onEdit(item) { setEditing(item); window.scrollTo({ top: 0, behavior: 'smooth' }); }

  return (
    <>
      {/* ── Confirm delete dialog ── */}
      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete this item?"
        description={
          pendingItem
            ? crossDelete
              ? 'This photo will be removed from the gallery and deleted from Cloudinary.'
              : `"${pendingItem.title || pendingItem.name || pendingItem.question || pendingItem.alt || 'this item'}" will be permanently deleted and cannot be recovered.`
            : crossDelete
              ? 'This photo will be removed from the gallery and deleted from Cloudinary.'
              : 'This item will be permanently deleted and cannot be recovered.'
        }
        confirmLabel="Yes, delete"
        onConfirm={doDelete}
        onCancel={() => setDeleteId(null)}
      />

      <div className="sh-page-header">
        <div>
          <h1 className="sh-page-title">{title}</h1>
          {description && <p className="sh-page-desc">{description}</p>}
        </div>
        {!editing && !crossDelete && (
          <Button onClick={startNew}>
            <Plus size={15} /> Add {title.replace(/s$/, '')}
          </Button>
        )}
      </div>

      {error && (
        <div className="sh-alert sh-alert-error" style={{ marginBottom: '1rem' }}>
          <AlertCircle size={16} /><span>{error}</span>
        </div>
      )}

      {/* ── Inline editor ── */}
      {editing && (
        <div className="sh-form-panel">
          <div className="sh-form-panel-header">
            <span className="sh-form-panel-title">
              {editing._id ? <><Pencil size={15} /> Edit item</> : <><Plus size={15} /> New item</>}
            </span>
            <Button variant="ghost" size="sm" onClick={() => setEditing(null)}>
              <X size={15} /> Cancel
            </Button>
          </div>

          <form className="sh-form" onSubmit={save}>
            {fields.map((field) => {
              const raw = field.type === 'lines' ? lines(editing[field.name])
                : field.type === 'faqs'
                  ? editing.faqsText ?? (editing.faqs||[]).map((f) => `${f.q}|${f.a}`).join('\n')
                  : field.type === 'checkbox' ? Boolean(editing[field.name])
                  : field.type === 'image'    ? (editing[field.name] || '')
                  : editing[field.name] ?? '';

              /* Image upload field */
              if (field.type === 'image') return (
                <div key={field.name} className="sh-field">
                  <Label htmlFor={field.name}>
                    {field.label}
                    {field.hint && <span className="sh-label-hint"> — {field.hint}</span>}
                  </Label>
                  <ImageField value={raw} onChange={(v) => update(field.name, v)} label={field.label} />
                </div>
              );

              /* Checkbox */
              if (field.type === 'checkbox') return (
                <div key={field.name} className="sh-field">
                  <div className="sh-field-row">
                    <input type="checkbox" id={field.name} checked={raw}
                      style={{ width: 16, height: 16, accentColor: 'hsl(221 83% 53%)', cursor: 'pointer' }}
                      onChange={(e) => update(field.name, e.target.checked)} />
                    <Label htmlFor={field.name} style={{ marginBottom: 0, cursor: 'pointer' }}>{field.label}</Label>
                  </div>
                </div>
              );

              /* Select */
              if (field.type === 'select') return (
                <div key={field.name} className="sh-field">
                  <Label htmlFor={field.name}>{field.label}</Label>
                  <select id={field.name} className="sh-select" value={raw} onChange={(e) => update(field.name, e.target.value)}>
                    {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              );

              /* Textarea / lines / faqs */
              if (field.type === 'textarea' || field.type === 'lines' || field.type === 'faqs') return (
                <div key={field.name} className="sh-field">
                  <Label htmlFor={field.name}>
                    {field.label}
                    {field.hint && <span className="sh-label-hint"> — {field.hint}</span>}
                  </Label>
                  <Textarea id={field.name} value={raw}
                    onChange={(e) => update(field.type === 'faqs' ? 'faqsText' : field.name, e.target.value)} />
                </div>
              );

              /* Default text input */
              return (
                <div key={field.name} className="sh-field">
                  <Label htmlFor={field.name}>
                    {field.label}
                    {field.hint && <span className="sh-label-hint"> — {field.hint}</span>}
                  </Label>
                  <Input id={field.name} value={raw} onChange={(e) => update(field.name, e.target.value)} />
                </div>
              );
            })}

            <div className="sh-form-actions">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving…' : editing._id ? 'Save changes' : 'Create'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {/* ── Items list ── */}
      <Card>
        <CardContent style={{ padding: (gridView || cardView) && items.length > 0 ? '1rem' : 0 }}>
          {items.length === 0 ? (
            <div className="sh-empty">
              <div className="sh-empty-icon">📄</div>
              <p className="sh-empty-title">No {title.toLowerCase()} yet</p>
              <p className="sh-empty-desc">{crossDelete ? 'Upload a photo above to add it here.' : 'Click Add to create your first item.'}</p>
              {!crossDelete && <Button size="sm" onClick={startNew}><Plus size={14} /> Add first item</Button>}
            </div>
          ) : gridView ? (
            <GridView    items={items} imageField={imageField} onEdit={onEdit} onDelete={remove} onReorder={reorder} crossDelete={crossDelete} />
          ) : cardView ? (
            <CardListView items={items} imageField={imageField} onEdit={onEdit} onDelete={remove} onReorder={reorder} />
          ) : (
            <TableView   items={items} imageField={imageField} onEdit={onEdit} onDelete={remove} />
          )}
        </CardContent>
      </Card>
    </>
  );
}

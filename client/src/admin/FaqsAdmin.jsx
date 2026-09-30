import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { api } from '../lib/api.js';
import { useAdminAuth } from './auth.jsx';
import { Button } from '../components/ui/button.jsx';
import { Input, Textarea } from '../components/ui/input.jsx';
import { Label } from '../components/ui/label.jsx';
import { ConfirmDialog } from '../components/ui/dialog.jsx';
import { Plus, Pencil, Trash2, ChevronRight, AlertCircle } from '../components/ui/icons.jsx';

const PAGES = [
  { id: 'home', label: 'Home', hint: 'Shown on the home page' },
  { id: 'scuba', label: 'Scuba diving', hint: 'Shown on the scuba diving page' },
  { id: 'snorkelling', label: 'Snorkelling', parent: 'scuba', hint: 'Under Scuba diving — shown on the snorkelling page' },
  { id: 'courses', label: 'Courses', hint: 'Shown on the courses page' },
  { id: 'about', label: 'About us', hint: 'Shown on the about page' },
];

const EMPTY = { question: '', answer: '' };

function Grip() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="9" cy="6" r="1.4" /><circle cx="15" cy="6" r="1.4" />
      <circle cx="9" cy="12" r="1.4" /><circle cx="15" cy="12" r="1.4" />
      <circle cx="9" cy="18" r="1.4" /><circle cx="15" cy="18" r="1.4" />
    </svg>
  );
}

function FaqRowBody({ item, index, onGripDown }) {
  if (!item) return null;
  return (
    <div className="sh-item-card-body" style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
      <span
        className="faq-drag-grip"
        onPointerDown={onGripDown}
        title="Drag to reorder"
        aria-hidden
      >
        <Grip />
      </span>
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>{index + 1}</p>
        <h3 style={{ margin: '0.2rem 0 0.35rem', fontSize: '1rem' }}>{item.question}</h3>
        <p style={{ margin: 0, color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem', lineHeight: 1.5 }}>{item.answer}</p>
      </div>
    </div>
  );
}

function FaqRow({ item, index, onGripDown, onEdit, onDelete, className = '', style, rowRef }) {
  return (
    <div ref={rowRef} className={`sh-item-card faq-drag-item ${className}`} data-faq-id={item._id} data-faq-card style={style}>
      <FaqRowBody item={item} index={index} onGripDown={onGripDown} />
      <div className="sh-item-card-footer">
        <Button variant="outline" size="sm" onClick={onEdit}><Pencil size={13} /> Edit</Button>
        <Button variant="destructive" size="sm" onClick={onDelete}><Trash2 size={13} /> Delete</Button>
      </div>
    </div>
  );
}

export default function FaqsAdmin() {
  const { token } = useAdminAuth();
  const [items, setItems] = useState([]);
  const [pageId, setPageId] = useState('');
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [floatCard, setFloatCard] = useState(null);
  const [slot, setSlot] = useState(0);
  const listRef = useRef(null);
  const floatRef = useRef(null);
  const slotRef = useRef(0);
  const beforeRef = useRef(null);
  const itemsRef = useRef(items);
  const pageIdRef = useRef(pageId);
  itemsRef.current = items;
  pageIdRef.current = pageId;

  async function load() {
    const data = await api('/api/admin/faqs', { token });
    setItems(data);
  }

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [token]);

  const page = PAGES.find((p) => p.id === pageId);
  const pageItems = items
    .filter((item) => item.page === pageId)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  function openNew() {
    setError('');
    setForm({ ...EMPTY });
  }

  function openEdit(item) {
    setError('');
    setForm({ _id: item._id, question: item.question, answer: item.answer, sortOrder: item.sortOrder || 0 });
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const sortOrder = form._id
        ? Number(form.sortOrder) || 0
        : pageItems.reduce((max, item) => Math.max(max, item.sortOrder || 0), 0) + 1;
      const body = {
        question: form.question.trim(),
        answer: form.answer.trim(),
        page: pageId,
        sortOrder,
      };
      if (form._id) {
        await api(`/api/admin/faqs/${form._id}`, { method: 'PUT', token, body });
      } else {
        await api('/api/admin/faqs', { method: 'POST', token, body });
      }
      setForm(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function pageList() {
    return itemsRef.current
      .filter((item) => item.page === pageIdRef.current)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  function beginDrag(event, item, index) {
    if (event.button != null && event.button !== 0) return;
    const card = event.currentTarget.closest('[data-faq-card]');
    const rect = card.getBoundingClientRect();
    slotRef.current = index;
    setSlot(index);
    setFloatCard({
      id: item._id,
      y: event.clientY,
      offsetY: event.clientY - rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
  }

  useEffect(() => {
    if (!floatCard) return undefined;
    const move = (event) => {
      const card = floatCard;
      if (floatRef.current && card) {
        floatRef.current.style.top = `${event.clientY - card.offsetY}px`;
      }
      const list = listRef.current;
      if (!list) return;
      const cards = [...list.querySelectorAll('[data-faq-card]')];
      const gap = list.querySelector('.faq-drag-gap');
      if (!gap || cards.length === 0) return;
      let insert = cards.length;
      for (let i = 0; i < cards.length; i += 1) {
        const box = cards[i].getBoundingClientRect();
        if (event.clientY < box.top + box.height * 0.5) {
          insert = i;
          break;
        }
      }
      const from = [...list.children].indexOf(gap);
      if (insert === from) return;
      const before = new Map();
      list.querySelectorAll('[data-faq-id]').forEach((node) => {
        before.set(node.dataset.faqId, node.getBoundingClientRect());
      });
      if (insert >= cards.length) list.appendChild(gap);
      else list.insertBefore(gap, cards[insert]);
      slotRef.current = [...list.children].indexOf(gap);
      list.querySelectorAll('[data-faq-id]').forEach((node) => {
        if (node === gap) return;
        const prev = before.get(node.dataset.faqId);
        if (!prev) return;
        const dy = prev.top - node.getBoundingClientRect().top;
        if (Math.abs(dy) < 1) return;
        node.getAnimations().forEach((anim) => anim.cancel());
        node.animate(
          [{ transform: `translateY(${dy}px)` }, { transform: 'translateY(0)' }],
          { duration: 120, easing: 'cubic-bezier(0.2, 0, 0, 1)' },
        );
      });
    };
    const up = async () => {
      const id = floatCard.id;
      const insertAt = slotRef.current;
      setFloatCard(null);
      const current = pageList();
      const moving = current.find((item) => item._id === id);
      if (!moving) return;
      const rest = current.filter((item) => item._id !== id);
      rest.splice(Math.max(0, Math.min(insertAt, rest.length)), 0, moving);
      const ordered = rest.map((item, index) => ({ ...item, sortOrder: index + 1 }));
      const unchanged = ordered.every((item, index) => item._id === current[index]?._id);
      setItems((all) => [...all.filter((item) => item.page !== pageIdRef.current), ...ordered]);
      if (unchanged) return;
      try {
        await Promise.all(ordered.map((item) => api(`/api/admin/faqs/${item._id}`, {
          method: 'PUT',
          token,
          body: { question: item.question, answer: item.answer, page: pageIdRef.current, sortOrder: item.sortOrder },
        })));
      } catch (err) {
        setError(err.message);
        load().catch(() => {});
      }
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grabbing';
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [floatCard?.id, token]);

  useLayoutEffect(() => {
    const before = beforeRef.current;
    const list = listRef.current;
    if (!before || !list) return;
    beforeRef.current = null;
    list.querySelectorAll('[data-faq-id]').forEach((node) => {
      const prev = before.get(node.dataset.faqId);
      if (!prev) return;
      const dy = prev.top - node.getBoundingClientRect().top;
      if (Math.abs(dy) < 1) return;
      node.getAnimations().forEach((anim) => anim.cancel());
      node.animate(
        [{ transform: `translateY(${dy}px)` }, { transform: 'translateY(0)' }],
        { duration: 120, easing: 'cubic-bezier(0.2, 0, 0, 1)' },
      );
    });
  }, [slot, floatCard?.id]);

  async function remove() {
    if (!pendingDelete) return;
    try {
      await api(`/api/admin/faqs/${pendingDelete._id}`, { method: 'DELETE', token });
      setPendingDelete(null);
      await load();
    } catch (err) {
      setError(err.message);
      setPendingDelete(null);
    }
  }

  return (
    <>
      <div className="sh-page-header">
        <div>
          <h1 className="sh-page-title">FAQs</h1>
          <p className="sh-page-desc">
            {page ? page.hint : 'Choose a page, then add or edit the questions shown there.'}
          </p>
        </div>
        {page && (
          <Button onClick={openNew}><Plus size={16} /> Add question</Button>
        )}
      </div>

      {error && (
        <div className="sh-alert sh-alert-error" style={{ marginBottom: '1rem' }}>
          <AlertCircle size={16} /><span>{error}</span>
        </div>
      )}

      {!page && (
        <div className="sh-card-grid">
          {PAGES.filter((entry) => !entry.parent).map((entry) => {
            const children = PAGES.filter((child) => child.parent === entry.id);
            const count = items.filter((item) => item.page === entry.id).length;
            return (
              <div key={entry.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="sh-item-card"
                  onClick={() => { setPageId(entry.id); setForm(null); setError(''); }}
                  style={{ textAlign: 'left', cursor: 'pointer', width: '100%', font: 'inherit', color: 'inherit', padding: 0 }}
                >
                  <div className="sh-item-card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{entry.label}</h3>
                        <p style={{ margin: '0.35rem 0 0', color: 'hsl(var(--muted-foreground))', fontSize: '0.85rem' }}>
                          {count} {count === 1 ? 'question' : 'questions'}
                        </p>
                      </div>
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </button>
                {children.map((child) => {
                  const childCount = items.filter((item) => item.page === child.id).length;
                  return (
                    <button
                      key={child.id}
                      type="button"
                      className="sh-item-card"
                      onClick={() => { setPageId(child.id); setForm(null); setError(''); }}
                      style={{ textAlign: 'left', cursor: 'pointer', width: 'calc(100% - 1rem)', marginLeft: '1rem', font: 'inherit', color: 'inherit', padding: 0 }}
                    >
                      <div className="sh-item-card-body">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                          <div>
                            <h3 style={{ margin: 0, fontSize: '1rem' }}>{child.label}</h3>
                            <p style={{ margin: '0.35rem 0 0', color: 'hsl(var(--muted-foreground))', fontSize: '0.85rem' }}>
                              {child.hint} · {childCount} {childCount === 1 ? 'question' : 'questions'}
                            </p>
                          </div>
                          <ChevronRight size={18} />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {page && (
        <>
          <Button variant="ghost" size="sm" style={{ marginBottom: '1rem' }} onClick={() => { setPageId(''); setForm(null); }}>
            All pages
          </Button>

          {form && (
            <form className="sh-card" style={{ padding: '1.25rem', marginBottom: '1rem' }} onSubmit={save}>
              <h2 style={{ margin: '0 0 1rem', fontSize: '1rem' }}>{form._id ? 'Edit question' : 'New question'}</h2>
              <div className="sh-field" style={{ marginBottom: '0.85rem' }}>
                <Label>Question</Label>
                <Input value={form.question} onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))} required />
              </div>
              <div className="sh-field" style={{ marginBottom: '1rem' }}>
                <Label>Answer</Label>
                <Textarea rows={4} value={form.answer} onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))} required />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
                <Button type="button" variant="outline" onClick={() => setForm(null)}>Cancel</Button>
              </div>
            </form>
          )}

          {pageItems.length === 0 ? (
            <div className="sh-card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
              <p style={{ fontWeight: 600, margin: 0 }}>No questions on {page.label} yet</p>
              <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem' }}>Add the first question for this page.</p>
            </div>
          ) : (
            <>
            <p style={{ margin: '0 0 0.65rem', fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>Drag a question to change the order on the page.</p>
            <div className="faq-drag-list" ref={listRef}>
              {(floatCard ? (() => {
                const rest = pageItems.filter((item) => item._id !== floatCard.id);
                const at = Math.max(0, Math.min(slot, rest.length));
                return [
                  ...rest.slice(0, at).map((item) => ({ item })),
                  { gap: true, height: floatCard.height },
                  ...rest.slice(at).map((item) => ({ item })),
                ];
              })() : pageItems.map((item) => ({ item }))).map((row, index) => (
                row.gap ? (
                  <div className="faq-drag-gap" data-faq-id="__gap__" key="__gap__" style={{ height: row.height }} />
                ) : (
                  <FaqRow
                    key={row.item._id}
                    item={row.item}
                    index={index}
                    onGripDown={(event) => beginDrag(event, row.item, pageItems.findIndex((entry) => entry._id === row.item._id))}
                    onEdit={() => openEdit(row.item)}
                    onDelete={() => setPendingDelete(row.item)}
                  />
                )
              ))}
            </div>
            {floatCard && (
              <FaqRow
                className="faq-drag-float"
                item={pageItems.find((entry) => entry._id === floatCard.id)}
                index={slot}
                rowRef={floatRef}
                style={{
                  top: floatCard.y - floatCard.offsetY,
                  left: floatCard.left,
                  width: floatCard.width,
                }}
                onGripDown={() => {}}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            )}
            </>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this question?"
        description={pendingDelete ? `"${pendingDelete.question}" will be removed from ${page?.label || 'this page'}.` : ''}
        confirmLabel="Yes, delete"
        onConfirm={remove}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}

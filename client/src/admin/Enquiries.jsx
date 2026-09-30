import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { useAdminAuth } from './auth.jsx';
import { Badge } from '../components/ui/badge.jsx';
import { Button } from '../components/ui/button.jsx';
import { AlertCircle } from '../components/ui/icons.jsx';

/* ─── Icons ─── */
const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.38 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.9a16 16 0 0 0 6 6l1.27-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);
const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);
const WaIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
  </svg>
);
const MsgIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const STATUSES = ['new', 'contacted', 'in-progress', 'completed', 'closed'];

function latestFirst(list) {
  return [...(list || [])].sort((a, b) => {
    const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (diff) return diff;
    return String(b._id) > String(a._id) ? 1 : -1;
  });
}

function fmt(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    + '  ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

/* ─── Detail panel ─── */
function DetailPanel({ item, onStatusChange }) {
  const waNum = String(item.phone || '').replace(/\D/g, '');

  return (
    <div className="sh-detail-card">
      {/* Header */}
      <div className="sh-detail-header">
        <div>
          <div className="sh-detail-name">{item.name}</div>
          <div className="sh-detail-time">{fmt(item.createdAt)}</div>
        </div>
        {/* Status selector */}
        <div className="sh-status-row">
          <Badge variant={item.status || 'new'}>{item.status || 'new'}</Badge>
          <select
            className="sh-select"
            style={{ width: 'auto', fontSize: '0.8rem', padding: '0.3rem 1.75rem 0.3rem 0.6rem' }}
            value={item.status || 'new'}
            onChange={(e) => onStatusChange(item._id, e.target.value)}
          >
            {STATUSES.map((s, i) => (
              <option key={s} value={s} disabled={i < STATUSES.indexOf(item.status || 'new')}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="sh-detail-body">
        {/* Message */}
        {item.message && (
          <div>
            <div className="sh-detail-sec-title">
              <MsgIcon style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
              Message
            </div>
            <div className="sh-detail-message">{item.message}</div>
          </div>
        )}

        {/* Contact info + quick actions */}
        <div>
          <div className="sh-detail-sec-title">Contact</div>
          {item.phone && (
            <div className="sh-detail-contact-row">
              <PhoneIcon />
              <a href={`tel:${item.phone}`}>{item.phone}</a>
            </div>
          )}
          {item.email && (
            <div className="sh-detail-contact-row">
              <MailIcon />
              <a href={`mailto:${item.email}`}>{item.email}</a>
            </div>
          )}

          <div className="sh-detail-actions" style={{ marginTop: '0.75rem' }}>
            {item.phone && (
              <Button variant="outline" size="sm" asChild>
                <a href={`tel:${item.phone}`}><PhoneIcon /> Call</a>
              </Button>
            )}
            {waNum && (
              <Button size="sm" style={{ background: '#25D366', color: '#fff', border: 'none', gap: 6 }} asChild>
                <a href={`https://wa.me/${waNum}`} target="_blank" rel="noreferrer">
                  <WaIcon /> WhatsApp
                </a>
              </Button>
            )}
            {item.email && (
              <Button variant="outline" size="sm" asChild>
                <a href={`mailto:${item.email}?subject=Re: Your diving enquiry`}><MailIcon /> Email</a>
              </Button>
            )}
          </div>
        </div>

        {/* Trip details */}
        <div>
          <div className="sh-detail-sec-title">Trip details</div>
          <div className="sh-detail-grid">
            {item.activityType && (
              <div className="sh-detail-kv">
                <div className="sh-detail-k">Activity type</div>
                <div className="sh-detail-v" style={{ textTransform: 'capitalize' }}>{item.activityType}</div>
              </div>
            )}
            {item.preferredItem && (
              <div className="sh-detail-kv">
                <div className="sh-detail-k">Preferred course / trip</div>
                <div className="sh-detail-v">{item.preferredItem}</div>
              </div>
            )}
            {item.diverLevel && (
              <div className="sh-detail-kv">
                <div className="sh-detail-k">Diver level</div>
                <div className="sh-detail-v">{item.diverLevel}</div>
              </div>
            )}
            {item.preferredDate && (
              <div className="sh-detail-kv">
                <div className="sh-detail-k">Preferred date</div>
                <div className="sh-detail-v">{item.preferredDate}</div>
              </div>
            )}
            {item.numberOfPeople != null && (
              <div className="sh-detail-kv">
                <div className="sh-detail-k">Group size</div>
                <div className="sh-detail-v">{item.numberOfPeople} {item.numberOfPeople === 1 ? 'person' : 'people'}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main page ─── */
export default function Enquiries() {
  const { token } = useAdminAuth();
  const [items,    setItems]    = useState([]);
  const [filter,   setFilter]   = useState('all');
  const [selected, setSelected] = useState(null);
  const [error,    setError]    = useState('');

  async function load() {
    try {
      const data = latestFirst(await api('/api/admin/enquiries', { token }));
      setItems(data);
      // keep selected in sync after reload
      if (selected) {
        const refreshed = data.find((d) => d._id === selected._id);
        if (refreshed) setSelected(refreshed);
      }
    } catch (e) { setError(e.message); }
  }
  useEffect(() => { load(); }, [token]);

  async function updateStatus(id, status) {
    const current = items.find((item) => item._id === id);
    const from = STATUSES.indexOf(current?.status || 'new');
    const to = STATUSES.indexOf(status);
    if (to < from) {
      setError('Status can only move forward.');
      return;
    }
    try {
      await api(`/api/admin/enquiries/${id}`, { method: 'PATCH', token, body: { status } });
      setError('');
      load();
    } catch (e) { setError(e.message); }
  }

  const counts    = STATUSES.reduce((a, s) => ({ ...a, [s]: items.filter((i) => i.status === s).length }), {});
  const displayed = latestFirst(filter === 'all' ? items : items.filter((i) => i.status === filter));

  return (
    <>
      <div className="sh-page-header">
        <div>
          <h1 className="sh-page-title">Enquiries</h1>
          <p className="sh-page-desc">
            {items.length} total · {counts.new || 0} new · click any enquiry to read the full message
          </p>
        </div>
      </div>

      {error && (
        <div className="sh-alert sh-alert-error" style={{ marginBottom: '1rem' }}>
          <AlertCircle size={16} /><span>{error}</span>
        </div>
      )}

      {/* Status tabs */}
      <div className="sh-tabs" style={{ marginBottom: '1rem' }}>
        {['all', ...STATUSES].map((s) => (
          <button
            key={s} type="button"
            className={`sh-tab${filter === s ? ' active' : ''}`}
            onClick={() => { setFilter(s); setSelected(null); }}
          >
            {s === 'all' ? 'All' : s}
            <span className="sh-tab-count">({s === 'all' ? items.length : (counts[s] || 0)})</span>
          </button>
        ))}
      </div>

      {/* Split panel */}
      {displayed.length === 0 ? (
        <div className="sh-card" style={{ textAlign: 'center', padding: '3.5rem 2rem', color: 'hsl(215.4 16.3% 46.9%)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem', opacity: 0.35 }}>✉</div>
          <p style={{ fontWeight: 600, color: 'hsl(222.2 84% 4.9%)' }}>
            {filter === 'all' ? 'No enquiries yet' : `No "${filter}" enquiries`}
          </p>
          <p style={{ fontSize: '0.825rem', marginTop: '0.25rem' }}>
            Booking form submissions appear here automatically.
          </p>
        </div>
      ) : (
        <div className="sh-enq-wrap">
          {/* Left: enquiry list */}
          <div className="sh-enq-list">
            {displayed.map((item) => {
              const isActive = selected?._id === item._id;
              const preview  = item.message || item.activityType || '';
              return (
                <div
                  key={item._id}
                  className={`sh-enq-item${isActive ? ' active' : ''}`}
                  onClick={() => setSelected(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setSelected(item)}
                >
                  <div className="sh-enq-item-top">
                    <span className="sh-enq-item-name">{item.name}</span>
                    <span className="sh-enq-item-date">
                      {new Date(item.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="sh-enq-item-mid">
                    <Badge variant={item.status || 'new'} style={{ fontSize: '0.65rem' }}>{item.status || 'new'}</Badge>
                    {item.activityType && (
                      <span style={{ fontSize: '0.7rem', color: 'hsl(215.4 16.3% 55%)', textTransform: 'capitalize' }}>
                        {item.activityType}
                      </span>
                    )}
                    {item.numberOfPeople > 0 && (
                      <span style={{ fontSize: '0.7rem', color: 'hsl(215.4 16.3% 55%)' }}>
                        · {item.numberOfPeople} pax
                      </span>
                    )}
                  </div>
                  {preview && (
                    <p className="sh-enq-item-prev">{preview}</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right: detail panel */}
          <div className="sh-enq-detail">
            {selected ? (
              <DetailPanel item={selected} onStatusChange={updateStatus} />
            ) : (
              <div className="sh-enq-empty">
                <div className="sh-enq-empty-icon">👆</div>
                <p style={{ fontWeight: 600 }}>Select an enquiry</p>
                <p style={{ fontSize: '0.825rem' }}>Click any item on the left to read the full message and take action.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

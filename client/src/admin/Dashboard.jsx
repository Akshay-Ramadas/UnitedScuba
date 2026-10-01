import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useAdminAuth } from './auth.jsx';
import { Button } from '../components/ui/button.jsx';
import { Badge } from '../components/ui/badge.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card.jsx';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableWrapper } from '../components/ui/table.jsx';
import { Mail, GraduationCap, ImageIcon, Settings, AlertCircle, Inbox, Bell, Clock, CheckCircle2, ChevronRight } from '../components/ui/icons.jsx';
import { Spinner } from '../components/ui/spinner.jsx';

function latestFirst(list) {
  return [...(list || [])].sort((a, b) => {
    const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (diff) return diff;
    return String(b._id) > String(a._id) ? 1 : -1;
  });
}

export default function Dashboard() {
  const { token } = useAdminAuth();
  const navigate = useNavigate();
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/api/admin/enquiries', { token })
      .then((data) => setEnquiries(latestFirst(data)))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  const total  = enquiries.length;
  const fresh  = enquiries.filter((e) => e.status === 'new').length;
  const active = enquiries.filter((e) => e.status === 'in-progress').length;
  const done   = enquiries.filter((e) => e.status === 'completed').length;
  const recent = enquiries.slice(0, 6);

  const QUICK = [
    { to: '/admin/enquiries',  Icon: Mail,        label: 'Manage Enquiries', desc: 'View and reply to bookings' },
    { to: '/admin/gallery',    Icon: ImageIcon,   label: 'Manage Gallery',   desc: 'Upload or remove photos' },
    { to: '/admin/settings',   Icon: Settings,    label: 'Site Settings',    desc: 'Phone, hours, tagline' },
    { to: '/admin/courses',    Icon: GraduationCap, label: 'Courses',        desc: 'Add or edit PADI courses' },
  ];

  return (
    <>
      <div className="sh-page-header">
        <div>
          <h1 className="sh-page-title">Overview</h1>
          <p className="sh-page-desc">Welcome back — here's what's happening at United Scuba.</p>
        </div>
        <Button asChild>
          <Link to="/admin/enquiries">View enquiries</Link>
        </Button>
      </div>

      {error && (
        <div className="sh-alert sh-alert-error" style={{ marginBottom: '1.25rem' }}>
          <AlertCircle size={16} /><span>{error}</span>
        </div>
      )}

      {loading ? <Spinner label="Loading overview…" /> : (
      <>
      {/* Stat cards */}
      <div className="sh-stats">
        {[
          { label: 'Total Enquiries', value: total,  sub: 'all time',       Icon: Inbox, tone: 'slate' },
          { label: 'New',             value: fresh,  sub: 'awaiting reply', Icon: Bell, tone: 'blue' },
          { label: 'In Progress',     value: active, sub: 'being handled',  Icon: Clock, tone: 'amber' },
          { label: 'Completed',       value: done,   sub: 'bookings closed', Icon: CheckCircle2, tone: 'green' },
        ].map(({ label, value, sub, Icon, tone }) => (
          <div className="sh-stat" key={label}>
            <div className={`sh-stat-icon sh-stat-icon-${tone}`}><Icon size={16} /></div>
            <div className="sh-stat-value">{value}</div>
            <div className="sh-stat-label">{label}</div>
            <div className="sh-stat-sub">{sub}</div>
          </div>
        ))}
      </div>

      {/* Recent enquiries */}
      <Card style={{ marginBottom: '1.25rem' }}>
        <CardHeader style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.75rem' }}>
          <div>
            <CardTitle>Recent Enquiries</CardTitle>
            <CardDescription>Latest 6 submissions from guests</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/enquiries">View all →</Link>
          </Button>
        </CardHeader>
        <CardContent style={{ padding: 0 }}>
          {recent.length === 0 ? (
            <div className="sh-empty">
              <div className="sh-empty-icon"><Mail size={22} /></div>
              <p className="sh-empty-title">No enquiries yet</p>
              <p className="sh-empty-desc">They'll appear here once guests submit the booking form.</p>
            </div>
          ) : (
            <TableWrapper>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Trip date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recent.map((item) => (
                    <TableRow
                      key={item._id}
                      className="sh-row-click"
                      tabIndex={0}
                      onClick={() => navigate(`/admin/enquiries?id=${item._id}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          navigate(`/admin/enquiries?id=${item._id}`);
                        }
                      }}
                    >
                      <TableCell>
                        <span style={{ fontWeight: 600 }}>{item.name}</span>
                        {item.message && <p className="sh-td-muted">{item.message.slice(0, 55)}{item.message.length > 55 ? '…' : ''}</p>}
                      </TableCell>
                      <TableCell>
                        {item.phone && <div>{item.phone}</div>}
                        {item.email && <p className="sh-td-muted">{item.email}</p>}
                      </TableCell>
                      <TableCell style={{ textTransform: 'capitalize' }}>{item.activityType || '—'}</TableCell>
                      <TableCell>{item.preferredDate || '—'}<p className="sh-td-muted">{item.numberOfPeople} pax</p></TableCell>
                      <TableCell><Badge variant={item.status || 'new'}>{item.status || 'new'}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableWrapper>
          )}
        </CardContent>
      </Card>

      {/* Quick links */}
      <div className="sh-quick-grid">
        {QUICK.map(({ to, Icon, label, desc }) => (
          <Link key={to} to={to} className="sh-card sh-quick-card">
            <span className="sh-quick-icon"><Icon size={16} /></span>
            <div>
              <div className="sh-quick-title">{label}</div>
              <div className="sh-quick-desc">{desc}</div>
            </div>
            <ChevronRight size={16} className="sh-quick-go" />
          </Link>
        ))}
      </div>
      </>
      )}
    </>
  );
}

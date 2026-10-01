import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from './auth.jsx';
import { LOGO } from '../lib/api.js';
import { Button } from '../components/ui/button.jsx';
import {
  LayoutDashboard, Mail, GraduationCap, Waves, ImageIcon,
  HelpCircle, Star, PenLine, Settings, LogOut, ExternalLink, Menu, X,
} from '../components/ui/icons.jsx';
import './shadcn.css';

const NAV = [
  { to: '/admin',            label: 'Overview',         Icon: LayoutDashboard, end: true },
  { to: '/admin/enquiries',  label: 'Enquiries',         Icon: Mail },
  { to: '/admin/courses',    label: 'Courses',           Icon: GraduationCap },
  { to: '/admin/activities', label: 'Activities',        Icon: Waves },
  { to: '/admin/gallery',    label: 'Gallery',           Icon: ImageIcon },
  { to: '/admin/faqs',       label: 'FAQs',              Icon: HelpCircle },
  { to: '/admin/reviews',    label: 'Reviews',           Icon: Star },
  { to: '/admin/blog',       label: 'Blog',              Icon: PenLine },
  { to: '/admin/settings',   label: 'Settings',          Icon: Settings },
];

function pageTitle(pathname) {
  const match = NAV.find((n) => (n.end ? pathname === n.to : pathname.startsWith(n.to)));
  return match?.label ?? 'Admin';
}

export default function AdminLayout() {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  async function onLogout() { await logout(); navigate('/admin/login'); }

  const initials = (user?.email || 'A')[0].toUpperCase();

  const SidebarContent = () => (
    <>
      <div className="sh-sidebar-header">
        <div className="sh-sidebar-brand">
          <img src={LOGO} alt="" />
          <span className="sh-sidebar-brand-badge">Admin</span>
        </div>
      </div>

      <nav className="sh-sidebar-nav">
        <p className="sh-sidebar-group-label">Menu</p>
        {NAV.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to} to={to} end={Boolean(end)} onClick={() => setOpen(false)}
            className={({ isActive }) => `sh-sidebar-link${isActive ? ' active' : ''}`}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sh-sidebar-footer">
        <div className="sh-user-row">
          <div className="sh-avatar">{initials}</div>
          <div className="sh-user-info">
            <div className="sh-user-email">{user?.email}</div>
            <div className="sh-user-role">Administrator</div>
          </div>
        </div>
        <button className="sh-logout-btn" type="button" onClick={onLogout}>
          <LogOut size={15} /> Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="admin-shell">
      {/* Sidebar */}
      <aside className={`sh-sidebar${open ? ' open' : ''}`}>
        <SidebarContent />
      </aside>
      {open && <div className="sh-overlay" role="button" tabIndex={-1} onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="sh-main">
        <header className="sh-topbar">
          <div className="sh-topbar-left">
            <button className="sh-menu-btn" type="button" onClick={() => setOpen((v) => !v)}>
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
            <nav className="sh-breadcrumb" aria-label="Breadcrumb">
              <span>United Scuba</span>
              <span className="sh-breadcrumb-sep">/</span>
              <span className="sh-breadcrumb-page">{pageTitle(pathname)}</span>
            </nav>
          </div>
          <div className="sh-topbar-right">
            <Button variant="outline" size="sm" asChild>
              <a href="/" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <ExternalLink size={14} /> View site
              </a>
            </Button>
          </div>
        </header>

        <main className="sh-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

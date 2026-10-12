import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { LOGO, PADI_LOGO } from '../lib/api.js';
import { useContent } from '../hooks/useContent.jsx';
import PlanYourDive from './PlanYourDive.jsx';

const LINKS = [
  ['/', 'Home'],
  ['/about', 'About Us'],
  ['/courses', 'Courses'],
  ['/gallery', 'Gallery'],
  ['/blog', 'Blog'],
  ['/contact', 'Contact'],
];

const DIVE_GROUPS = [
  ['beginner', 'Beginners & Non-Swimmers'],
  ['certified', 'Certified Divers'],
  ['snorkelling', 'Snorkelling'],
];

function activityPath(item) {
  const base = item.type === 'snorkelling' ? '/snorkelling' : '/scuba-diving';
  return `${base}/${item.slug}`;
}

function diveGroups(activities) {
  const groups = DIVE_GROUPS.map(([id, title]) => ({
    id,
    title,
    items: activities.filter((item) => item.audience === id),
  })).filter((group) => group.items.length);
  return groups;
}

function socialHref(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}

function SocialIcon({ href, label, children }) {
  if (!href) return null;
  return (
    <a className="icon-btn" href={href} target="_blank" rel="noreferrer" aria-label={label}>
      {children}
    </a>
  );
}

function ScubaMenu({ groups, pathname, onNavigate, onPlan }) {
  const [open, setOpen] = useState(false);
  const active = pathname.startsWith('/scuba-diving') || pathname.startsWith('/snorkelling');
  const close = () => { setOpen(false); onNavigate?.(); };
  return (
    <div
      className={`nav-drop nav-mega${open ? ' open' : ''}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link className={active ? 'active' : ''} to="/scuba-diving" onClick={close}>
        Scuba Diving
      </Link>
      <button type="button" aria-label="Show scuba diving" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        ▾
      </button>
      <div className="nav-mega-panel">
        {groups.map((group) => (
          <div className="nav-mega-col" key={group.id}>
            <p>{group.title}</p>
            {group.items.map((item) => (
              <Link key={item.slug} to={activityPath(item)} onClick={close}>
                {item.title}
              </Link>
            ))}
          </div>
        ))}
        <div className="nav-mega-col nav-mega-plan">
          <p>Plan your dive</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => { setOpen(false); onPlan(); }}
          >
            Plan your dive
          </button>
        </div>
      </div>
    </div>
  );
}

function DiveMenu({ sites, pathname, onNavigate }) {
  const [open, setOpen] = useState(false);
  const active = pathname.startsWith('/dive-sites');
  return (
    <div
      className={`nav-drop${open ? ' open' : ''}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link className={active ? 'active' : ''} to="/dive-sites" onClick={() => { setOpen(false); onNavigate?.(); }}>
        Dive sites
      </Link>
      {sites.length > 0 && (
        <button type="button" aria-label="Show dive sites" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          ▾
        </button>
      )}
      {sites.length > 0 && (
        <div className="nav-drop-panel">
          {sites.map((site) => (
            <Link key={site.slug} to={`/dive-sites/${site.slug}`} onClick={() => { setOpen(false); onNavigate?.(); }}>
              {site.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const { pathname } = useLocation();
  const { settings, diveSites = [], activities = [] } = useContent();
  const [open, setOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const facebook = socialHref(settings.socials?.facebook);
  const instagram = socialHref(settings.socials?.instagram);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!planOpen) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setPlanOpen(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [planOpen]);

  const classes = ['site-header'];
  if (pathname === '/') classes.push('is-home');
  if (scrolled) classes.push('scrolled');

  const before = LINKS.slice(0, 3);
  const after = LINKS.slice(3);
  const groups = diveGroups(activities);

  return (
    <header className={classes.join(' ')}>
      <div className="header-inner">
        <Link className="brand" to="/" onClick={() => setOpen(false)}>
          <img className="brand-mark" src={LOGO} alt="United Scuba" />
          <img className="brand-padi" src={PADI_LOGO} alt="PADI" />
        </Link>
        <nav className="nav-links">
          {before.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'}>
              {label}
            </NavLink>
          ))}
          <ScubaMenu groups={groups} pathname={pathname} onPlan={() => setPlanOpen(true)} />
          <DiveMenu sites={diveSites} pathname={pathname} />
          {after.map(([to, label]) => (
            <NavLink key={to} to={to}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="header-end">
          <SocialIcon href={facebook} label="Facebook">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H8v3h3v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1z" />
            </svg>
          </SocialIcon>
          <SocialIcon href={instagram} label="Instagram">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
            </svg>
          </SocialIcon>
          <Link className="btn btn-primary header-cta" to="/book-now">Book a dive</Link>
          <button
            className="menu-toggle"
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>
      <div className={`mobile-panel${open ? ' open' : ''}`}>
        {before.map(([to, label]) => (
          <NavLink key={to} to={to} onClick={() => setOpen(false)} end={to === '/'}>
            {label}
          </NavLink>
        ))}
        <NavLink to="/scuba-diving" onClick={() => setOpen(false)}>Scuba Diving</NavLink>
        {groups.map((group) => (
          <div key={group.id}>
            <p className="mobile-label">{group.title}</p>
            {group.items.map((item) => (
              <NavLink className="mobile-sub" key={item.slug} to={activityPath(item)} onClick={() => setOpen(false)}>
                {item.title}
              </NavLink>
            ))}
          </div>
        ))}
        <button
          className="btn btn-primary mobile-plan"
          type="button"
          onClick={() => { setOpen(false); setPlanOpen(true); }}
        >
          Plan your dive
        </button>
        <NavLink to="/dive-sites" onClick={() => setOpen(false)}>Dive sites</NavLink>
        {diveSites.map((site) => (
          <NavLink className="mobile-sub" key={site.slug} to={`/dive-sites/${site.slug}`} onClick={() => setOpen(false)}>
            {site.title}
          </NavLink>
        ))}
        {after.map(([to, label]) => (
          <NavLink key={to} to={to} onClick={() => setOpen(false)}>
            {label}
          </NavLink>
        ))}
        <Link className="btn btn-primary" to="/book-now" onClick={() => setOpen(false)}>Book a dive</Link>
      </div>
      {planOpen && createPortal(
        <div className="plan-modal" role="presentation" onClick={() => setPlanOpen(false)}>
          <div
            className="plan-modal-card"
            role="dialog"
            aria-modal="true"
            aria-label="Plan your dive"
            onClick={(event) => event.stopPropagation()}
          >
            <button className="plan-modal-close" type="button" aria-label="Close" onClick={() => setPlanOpen(false)}>✕</button>
            <PlanYourDive key={planOpen ? 'open' : 'closed'} settings={settings} diveSites={diveSites} />
          </div>
        </div>,
        document.body,
      )}
    </header>
  );
}

import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { LOGO, PADI_LOGO } from '../lib/api.js';
import { useContent } from '../hooks/useContent.jsx';

const LINKS = [
  ['/', 'Home'],
  ['/about', 'About Us'],
  ['/courses', 'Courses'],
  ['/scuba-diving', 'Scuba Diving'],
  ['/gallery', 'Gallery'],
  ['/blog', 'Blog'],
  ['/contact', 'Contact'],
];

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
  const { settings, diveSites = [] } = useContent();
  const [open, setOpen] = useState(false);
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

  const classes = ['site-header'];
  if (pathname === '/') classes.push('is-home');
  if (scrolled) classes.push('scrolled');

  const before = LINKS.slice(0, 4);
  const after = LINKS.slice(4);

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
    </header>
  );
}

import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { LOGO } from '../lib/api.js';

const LINKS = [
  ['/', 'Home'],
  ['/about', 'About Us'],
  ['/courses', 'Courses'],
  ['/scuba-diving', 'Scuba Diving'],
  ['/gallery', 'Gallery'],
  ['/blog', 'Blog'],
  ['/contact', 'Contact'],
];

function SoundButton({ on, onToggle }) {
  return (
    <button className={`icon-btn${on ? ' on' : ''}`} type="button" onClick={onToggle} aria-label={on ? 'Turn sound off' : 'Turn sound on'} title={on ? 'Sound on' : 'Sound off'}>
      {on ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M11 5 6 9H2v6h4l5 4V5z" />
          <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M11 5 6 9H2v6h4l5 4V5z" />
          <path d="m22 9-6 6M16 9l6 6" />
        </svg>
      )}
    </button>
  );
}

export default function Header() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [soundOn, setSoundOn] = useState(() => localStorage.getItem('us_sound') === 'on');

  function toggleSound() {
    const next = !soundOn;
    localStorage.setItem('us_sound', next ? 'on' : 'off');
    setSoundOn(next);
    window.dispatchEvent(new CustomEvent('us-sound', { detail: next }));
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const classes = ['site-header'];
  if (pathname === '/') classes.push('is-home');
  if (scrolled) classes.push('scrolled');

  return (
    <header className={classes.join(' ')}>
      <div className="header-inner">
        <Link className="brand" to="/" onClick={() => setOpen(false)}>
          <img src={LOGO} alt="United Scuba" />
        </Link>
        <nav className="nav-links">
          {LINKS.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="header-end">
          <SoundButton on={soundOn} onToggle={toggleSound} />
          <Link className="btn btn-primary header-cta" to="/book-now">Book a dive</Link>
          <button
          className="menu-toggle"
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? '✕' : '☰'}
        </button>
        </div>
      </div>
      <div className={`mobile-panel${open ? ' open' : ''}`}>
        {LINKS.map(([to, label]) => (
          <NavLink key={to} to={to} onClick={() => setOpen(false)} end={to === '/'}>
            {label}
          </NavLink>
        ))}
        <Link className="btn btn-primary" to="/book-now" onClick={() => setOpen(false)}>Book a dive</Link>
      </div>
    </header>
  );
}

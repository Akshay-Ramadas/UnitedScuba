export function Spinner({ label = 'Loading…', size = 'md' }) {
  return (
    <span className={`sh-loading${size === 'sm' ? ' sh-loading-sm' : ''}`} role="status">
      <span className={`sh-spinner${size === 'sm' ? ' sh-spinner-sm' : ''}`} aria-hidden="true" />
      {label ? <span>{label}</span> : null}
    </span>
  );
}

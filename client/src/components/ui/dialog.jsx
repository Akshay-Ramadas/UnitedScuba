import { useEffect } from 'react';
import { Button } from './button.jsx';

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"/>
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
    <line x1="10" y1="11" x2="10" y2="17"/>
    <line x1="14" y1="11" x2="14" y2="17"/>
  </svg>
);

const WarnIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

/**
 * ConfirmDialog — shadcn/ui-style confirmation modal.
 *
 * Props:
 *   open        boolean        – controls visibility
 *   title       string         – dialog heading
 *   description string         – body text / warning
 *   confirmLabel string        – destructive button label (default "Delete")
 *   variant     'delete'|'warn' – icon style
 *   onConfirm   () => void     – called on confirm
 *   onCancel    () => void     – called on cancel / backdrop / Escape
 */
export function ConfirmDialog({
  open,
  title       = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  variant      = 'delete',
  onConfirm,
  onCancel,
}) {
  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    function onKey(e) { if (e.key === 'Escape') onCancel?.(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="sh-dialog-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel?.(); }}
    >
      <div className="sh-dialog" role="alertdialog" aria-modal="true" aria-labelledby="dlg-title">
        <div className="sh-dialog-header">
          <div className="sh-dialog-icon">
            {variant === 'delete' ? <TrashIcon /> : <WarnIcon />}
          </div>
          <div className="sh-dialog-text">
            <div className="sh-dialog-title" id="dlg-title">{title}</div>
            <div className="sh-dialog-desc">{description}</div>
          </div>
        </div>
        <div className="sh-dialog-footer">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}

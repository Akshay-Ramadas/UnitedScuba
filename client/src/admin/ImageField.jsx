import { useRef, useState } from 'react';
import { api } from '../lib/api.js';
import { useAdminAuth } from './auth.jsx';
import { Input } from '../components/ui/input.jsx';
import { Button } from '../components/ui/button.jsx';
import { AlertCircle } from '../components/ui/icons.jsx';
import { Spinner } from '../components/ui/spinner.jsx';

const UpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

export default function ImageField({ value, onChange, label }) {
  const { token }                     = useAdminAuth();
  const [uploading, setUploading]     = useState(false);
  const [error, setError]             = useState('');
  const [dragOver, setDragOver]       = useState(false);
  const fileRef                       = useRef(null);

  async function uploadFile(file) {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const sign = await api('/api/admin/uploads/sign', { method: 'POST', token, body: {} });
      const data = new FormData();
      data.append('file',      file);
      data.append('api_key',   sign.apiKey);
      data.append('timestamp', sign.timestamp);
      data.append('signature', sign.signature);
      data.append('folder',    sign.folder);
      const res  = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`, { method: 'POST', body: data });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Upload failed');
      onChange(json.secure_url);
    } catch (err) {
      setError(err.message || 'Upload error');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  function onFileInput(e) { uploadFile(e.target.files?.[0]); }

  function onDrop(e) {
    e.preventDefault(); setDragOver(false);
    uploadFile(e.dataTransfer.files?.[0]);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      {/* Preview */}
      {value ? (
        <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
          <img
            src={value} alt={label || 'Preview'}
            style={{
              width: '100%', maxHeight: 200, objectFit: 'cover',
              borderRadius: 8, border: '1px solid hsl(214.3 31.8% 91.4%)',
              display: 'block',
            }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <button
            type="button"
            onClick={() => onChange('')}
            title="Remove image"
            style={{
              position: 'absolute', top: 6, right: 6,
              background: 'rgba(0,0,0,0.65)', color: '#fff', border: 'none',
              borderRadius: 6, padding: '3px 8px', cursor: 'pointer',
              fontSize: '0.75rem', fontWeight: 700, lineHeight: 1.5,
            }}
          >✕ Remove</button>
        </div>
      ) : (
        /* Drag-drop zone */
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: '0.5rem', padding: '1.75rem 1rem',
            border: `2px dashed ${dragOver ? 'hsl(221.2 83.2% 53.3%)' : 'hsl(214.3 31.8% 82%)'}`,
            borderRadius: 8, cursor: 'pointer', background: dragOver ? 'hsl(213 100% 97%)' : 'hsl(210 40% 98%)',
            transition: 'all 0.15s', textAlign: 'center',
          }}
        >
          <UpIcon />
          <p style={{ fontSize: '0.825rem', color: 'hsl(215.4 16.3% 46.9%)', margin: 0 }}>
            {uploading ? <Spinner size="sm" label="Uploading…" /> : 'Drag & drop or click to upload'}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'hsl(215.4 16.3% 65%)', margin: 0 }}>PNG, JPG, WEBP, GIF</p>
        </div>
      )}

      {/* URL input + Upload button */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://… paste URL or click Upload"
          style={{ flex: 1, fontSize: '0.8rem' }}
        />
        <Button
          type="button" variant="outline" size="sm"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          style={{ flexShrink: 0, gap: 6 }}
        >
          {uploading ? <Spinner size="sm" label="Uploading…" /> : <><UpIcon /> Upload</>}
        </Button>
        <input ref={fileRef} type="file" accept="image/*" onChange={onFileInput} style={{ display: 'none' }} />
      </div>

      {error && (
        <div className="sh-alert sh-alert-error" style={{ padding: '0.5rem 0.75rem' }}>
          <AlertCircle size={14} /><span style={{ fontSize: '0.8rem' }}>{error}</span>
        </div>
      )}
    </div>
  );
}

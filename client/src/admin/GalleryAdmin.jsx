import { useEffect, useRef, useState } from 'react';
import ResourceAdmin from './ResourceAdmin.jsx';
import { api } from '../lib/api.js';
import { useAdminAuth } from './auth.jsx';
import { Card, CardContent } from '../components/ui/card.jsx';
import { AlertCircle, ImageIcon } from '../components/ui/icons.jsx';

export default function GalleryAdmin() {
  const { token } = useAdminAuth();
  const [sign, setSign]       = useState(null);
  const [note, setNote]       = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    api('/api/admin/uploads/sign', { method: 'POST', token, body: {} })
      .then(setSign)
      .catch((err) => setNote(err.message));
  }, [token]);

  async function onFile(e) {
    const file = e.target.files?.[0];
    if (!file || !sign) return;
    setUploading(true);
    setNote('');
    try {
      const data = new FormData();
      data.append('file', file);
      data.append('api_key',   sign.apiKey);
      data.append('timestamp', sign.timestamp);
      data.append('signature', sign.signature);
      data.append('folder',    sign.folder);
      const res  = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`, { method: 'POST', body: data });
      const json = await res.json();
      if (!res.ok) { setNote(json.error?.message || 'Upload failed'); return; }
      await api('/api/admin/gallery', {
        method: 'POST', token,
        body: { url: json.secure_url, publicId: json.public_id, alt: file.name, category: 'scuba' },
      });
      setNote('✅ Uploaded successfully — the item now appears in the list below.');
      if (fileRef.current) fileRef.current.value = '';
      window.location.reload();
    } catch (err) {
      setNote(err.message || 'Upload error');
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      {/* Cloudinary upload card */}
      <Card style={{ marginBottom: '1.25rem' }}>
        <CardContent style={{ paddingTop: '1.25rem' }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: 'hsl(222.2 84% 4.9%)' }}>
            <ImageIcon size={15} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
            Quick upload via Cloudinary
          </p>

          {note && (
            <div className={`sh-alert ${note.startsWith('✅') ? 'sh-alert-ok' : 'sh-alert-error'}`} style={{ marginBottom: '0.75rem' }}>
              <AlertCircle size={15} />
              <span>{note}</span>
            </div>
          )}

          {sign ? (
            <label style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap',
              padding: '0.875rem 1rem', border: '2px dashed hsl(214.3 31.8% 91.4%)', borderRadius: 8,
              cursor: 'pointer', background: 'hsl(210 40% 98%)', fontSize: '0.875rem',
              color: 'hsl(215.4 16.3% 46.9%)', transition: 'border-color 0.15s',
            }}>
              <ImageIcon size={20} />
              {uploading ? 'Uploading…' : 'Click or drag an image to upload'}
              <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: 'none' }} disabled={uploading} />
            </label>
          ) : (
            <p style={{ fontSize: '0.825rem', color: 'hsl(215.4 16.3% 46.9%)' }}>
              {note || 'Cloudinary not configured — add CLOUDINARY_* keys to your .env to enable uploads.'}
            </p>
          )}

        </CardContent>
      </Card>

      <ResourceAdmin
        title="Gallery"
        description="Drag a photo to change the order. The home page shows only the first six in this list. Every other photo stays on the Gallery page."
        crossDelete
        path="gallery"
        imageField="url"
        gridView={true}
        createTemplate={{ url: '', alt: '', category: 'scuba', featured: false }}
        fields={[
          { name: 'url',       label: 'Image', type: 'image' },
          { name: 'alt',       label: 'Alt text',       hint: 'short description for accessibility & SEO' },
          { name: 'publicId',  label: 'Cloudinary public ID', hint: 'filled automatically on upload' },
          { name: 'category',  label: 'Category', type: 'select', options: ['scuba', 'snorkelling', 'marine', 'courses', 'customers', 'boat', 'video'] },
          { name: 'sortOrder', label: 'Sort order', hint: 'Lower numbers come first. Only the first six appear on the home page.' },
          { name: 'featured',  label: 'Featured', type: 'checkbox' },
        ]}
      />
    </>
  );
}

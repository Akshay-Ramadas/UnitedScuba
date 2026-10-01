import { useEffect } from 'react';
import { useContent } from '../hooks/useContent.jsx';
import { absoluteUrl, siteOrigin } from './siteSchema.js';

export function Seo({ title, description, path = '', image, jsonLd, noindex = false }) {
  const { settings } = useContent();
  const site = siteOrigin();
  const url = `${site}${path}`;
  const share = absoluteUrl(site, image || settings.seoImage || '/assets/sd5.jpg');
  const siteName = settings.companyName || 'United Scuba';
  const serialized = jsonLd ? JSON.stringify(jsonLd) : '';

  useEffect(() => {
    document.title = title || siteName;
    setMeta('description', description);
    setMeta('robots', noindex ? 'noindex, nofollow' : 'index, follow');
    setMeta('google-site-verification', settings.googleSiteVerification || '');
    setLink('canonical', url);
    setMeta('og:title', title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:url', url, 'property');
    setMeta('og:type', 'website', 'property');
    setMeta('og:site_name', siteName, 'property');
    setMeta('og:image', share, 'property');
    setMeta('twitter:card', share ? 'summary_large_image' : 'summary');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', share);
  }, [title, description, url, share, siteName, noindex, settings.googleSiteVerification]);

  useEffect(() => {
    const id = 'jsonld-page';
    document.getElementById(id)?.remove();
    if (!serialized) return undefined;
    const script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.text = serialized;
    document.head.appendChild(script);
    return () => script.remove();
  }, [serialized]);

  return null;
}

function setMeta(name, content, attr = 'name') {
  let el = document.head.querySelector(`meta[${attr}="${name}"]`);
  if (!content) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

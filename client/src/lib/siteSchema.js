const FALLBACK_LAT = 12.027;
const FALLBACK_LNG = 92.99;

export function siteOrigin() {
  const configured = import.meta.env.VITE_SITE_URL || '';
  const origin = configured || (typeof window !== 'undefined' ? window.location.origin : '');
  return String(origin).replace(/\/$/, '');
}

export function absoluteUrl(site, value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  const base = String(site || '').replace(/\/$/, '');
  return `${base}${raw.startsWith('/') ? raw : `/${raw}`}`;
}

function sameAs(settings) {
  const socials = settings?.socials || {};
  return [socials.instagram, socials.youtube, socials.twitter, socials.facebook, settings?.googleMapsReviewUrl, settings?.mapsUrl]
    .map((value) => String(value || '').trim())
    .filter(Boolean);
}

export function businessJsonLd(settings = {}) {
  const site = siteOrigin();
  const lat = Number(settings.geoLat);
  const lng = Number(settings.geoLng);
  const image = absoluteUrl(site, settings.seoImage || '/assets/sd5.jpg');
  const node = {
    '@type': ['LocalBusiness', 'SportsActivityLocation'],
    '@id': `${site}/#business`,
    name: settings.companyName || 'United Scuba',
    description: settings.seoDescription || settings.about || '',
    url: site || undefined,
    image: image || undefined,
    telephone: settings.phone || undefined,
    email: settings.email || undefined,
    address: settings.location
      ? {
        '@type': 'PostalAddress',
        streetAddress: settings.location,
        addressLocality: 'Swaraj Dweep',
        addressRegion: 'Andaman and Nicobar Islands',
        postalCode: '744211',
        addressCountry: 'IN',
      }
      : undefined,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: Number.isFinite(lat) && lat !== 0 ? lat : FALLBACK_LAT,
      longitude: Number.isFinite(lng) && lng !== 0 ? lng : FALLBACK_LNG,
    },
    openingHours: settings.hours || undefined,
    hasMap: settings.mapsUrl || undefined,
    areaServed: settings.areaServed || 'Swaraj Dweep (Havelock Island), Andaman and Nicobar Islands, India',
    sameAs: sameAs(settings),
  };
  const rating = Number(settings.googleRating);
  const count = Number(settings.googleReviewCount);
  if (rating > 0 && count > 0) {
    node.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: rating,
      reviewCount: count,
      bestRating: 5,
    };
  }
  return node;
}

export function faqJsonLd(items) {
  const mainEntity = (items || [])
    .map((item) => ({ q: item.question || item.q, a: item.answer || item.a }))
    .filter((item) => item.q && item.a)
    .map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    }));
  if (!mainEntity.length) return null;
  return { '@type': 'FAQPage', mainEntity };
}

export function courseJsonLd(course, settings = {}) {
  if (!course) return null;
  const site = siteOrigin();
  return {
    '@type': 'Course',
    name: course.title,
    description: course.seoDescription || course.excerpt || course.overview || '',
    url: `${site}/courses/${course.slug}`,
    provider: {
      '@type': 'Organization',
      name: settings.companyName || 'United Scuba',
      url: site || undefined,
    },
  };
}

export function articleJsonLd(post, settings = {}) {
  if (!post) return null;
  const site = siteOrigin();
  const image = absoluteUrl(site, post.coverImage || settings.seoImage || '/assets/sd5.jpg');
  return {
    '@type': 'Article',
    headline: post.title,
    description: post.seoDescription || post.excerpt || '',
    image: image || undefined,
    datePublished: post.publishedAt || undefined,
    author: { '@type': 'Organization', name: settings.companyName || 'United Scuba' },
    publisher: { '@type': 'Organization', name: settings.companyName || 'United Scuba' },
    mainEntityOfPage: `${site}/blog/${post.slug}`,
  };
}

export function graphJsonLd(...nodes) {
  const graph = nodes.filter(Boolean);
  if (!graph.length) return null;
  return { '@context': 'https://schema.org', '@graph': graph };
}

import { Course } from './models/Course.js';
import { Activity } from './models/Activity.js';
import { Post } from './models/Post.js';
import { mongoReady, fallbackContent } from './db.js';

function siteUrl() {
  return (process.env.SITE_URL || 'http://localhost:5173').replace(/\/$/, '');
}

export function sitemapXml(urls) {
  const body = urls
    .map(
      (u) => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq || 'weekly'}</changefreq>
    <priority>${u.priority || '0.6'}</priority>
  </url>`
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>`;
}

export async function buildSitemapUrls() {
  const base = siteUrl();
  const staticPaths = [
    ['/', '1.0'],
    ['/about', '0.8'],
    ['/courses', '0.9'],
    ['/scuba-diving', '0.9'],
    ['/snorkelling', '0.9'],
    ['/gallery', '0.6'],
    ['/blog', '0.7'],
    ['/contact', '0.8'],
    ['/book-now', '0.9'],
    ['/privacy', '0.3'],
    ['/terms', '0.3'],
    ['/cancellation', '0.3'],
  ].map(([path, priority]) => ({ loc: `${base}${path}`, priority, changefreq: 'weekly' }));

  let courses = [];
  let activities = [];
  let posts = [];
  if (mongoReady) {
    courses = await Course.find({ published: true }).select('slug').lean();
    activities = await Activity.find({ published: true }).select('slug type').lean();
    posts = await Post.find({ published: true }).select('slug').lean();
  } else {
    const fb = fallbackContent();
    courses = fb.courses;
    activities = fb.activities;
    posts = fb.posts.filter((p) => p.published);
  }

  return [
    ...staticPaths,
    ...courses.map((c) => ({ loc: `${base}/courses/${c.slug}`, priority: '0.8' })),
    ...activities.map((a) => ({
      loc: `${base}/${a.type === 'snorkelling' ? 'snorkelling' : 'scuba-diving'}/${a.slug}`,
      priority: '0.8',
    })),
    ...posts.map((p) => ({ loc: `${base}/blog/${p.slug}`, priority: '0.6' })),
  ];
}

export function robotsTxt() {
  const base = siteUrl();
  return `User-agent: *
Allow: /
Disallow: /admin

Sitemap: ${base}/sitemap.xml
`;
}

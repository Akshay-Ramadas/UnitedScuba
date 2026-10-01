import { Course } from './models/Course.js';
import { Activity } from './models/Activity.js';
import { Post } from './models/Post.js';
import { Faq } from './models/Faq.js';
import { Settings } from './models/Settings.js';
import { defaultSettings } from './data/defaults.js';
import { mongoReady, fallbackContent } from './db.js';

function siteUrl() {
  return (process.env.SITE_URL || 'http://localhost:5173').replace(/\/$/, '');
}

function xml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function day(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

async function loadSettings() {
  if (!mongoReady) return fallbackContent().settings;
  const doc = await Settings.findOne({ key: 'site' }).lean();
  return { ...defaultSettings, ...(doc || {}) };
}

export function sitemapXml(urls) {
  const body = urls
    .map(
      (u) => `  <url>
    <loc>${xml(u.loc)}</loc>${u.lastmod ? `\n    <lastmod>${xml(u.lastmod)}</lastmod>` : ''}
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
  const settings = await loadSettings();
  const stamp = day(settings.updatedAt);
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
  ].map(([path, priority]) => ({ loc: `${base}${path}`, priority, changefreq: 'weekly', lastmod: stamp }));

  let courses = [];
  let activities = [];
  let posts = [];
  if (mongoReady) {
    courses = await Course.find({ published: true }).select('slug updatedAt').lean();
    activities = await Activity.find({ published: true }).select('slug type updatedAt').lean();
    posts = await Post.find({ published: true }).select('slug updatedAt').lean();
  } else {
    const fb = fallbackContent();
    courses = fb.courses;
    activities = fb.activities;
    posts = fb.posts.filter((p) => p.published);
  }

  return [
    ...staticPaths,
    ...courses.map((c) => ({ loc: `${base}/courses/${c.slug}`, priority: '0.8', lastmod: day(c.updatedAt) || stamp })),
    ...activities.map((a) => ({
      loc: `${base}/${a.type === 'snorkelling' ? 'snorkelling' : 'scuba-diving'}/${a.slug}`,
      priority: '0.8',
      lastmod: day(a.updatedAt) || stamp,
    })),
    ...posts.map((p) => ({ loc: `${base}/blog/${p.slug}`, priority: '0.6', lastmod: day(p.updatedAt) || stamp })),
  ];
}

export function robotsTxt() {
  const base = siteUrl();
  return `User-agent: *
Allow: /
Disallow: /admin

User-agent: GPTBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

Sitemap: ${base}/sitemap.xml
`;
}

export async function llmsTxt() {
  const base = siteUrl();
  const settings = await loadSettings();
  let courses = [];
  let activities = [];
  let posts = [];
  let faqs = [];
  if (mongoReady) {
    [courses, activities, posts, faqs] = await Promise.all([
      Course.find({ published: true }).select('slug title excerpt').sort({ sortOrder: 1 }).lean(),
      Activity.find({ published: true }).select('slug type title excerpt').sort({ sortOrder: 1 }).lean(),
      Post.find({ published: true }).select('slug title excerpt').sort({ publishedAt: -1 }).lean(),
      Faq.find().select('question answer page').sort({ page: 1, sortOrder: 1 }).lean(),
    ]);
  } else {
    const fb = fallbackContent();
    courses = fb.courses;
    activities = fb.activities;
    posts = (fb.posts || []).filter((post) => post.published);
    faqs = fb.faqs || [];
  }

  const lines = [
    `# ${settings.companyName || 'United Scuba'}`,
    '',
    `> ${settings.seoDescription || settings.tagline || ''}`,
    '',
    settings.about || '',
    '',
    '## Business',
    `- Name: ${settings.companyName || 'United Scuba'}`,
    `- Location: ${settings.location || ''}`,
    `- Area served: ${settings.areaServed || ''}`,
    `- Hours: ${settings.hours || ''}`,
    `- Phone: ${settings.phone || ''}`,
    `- Email: ${settings.email || ''}`,
    `- Map: ${settings.mapsUrl || ''}`,
    `- Coordinates: ${settings.geoLat || ''}, ${settings.geoLng || ''}`,
    '',
    '## Pages',
    `- [Home](${base}/): ${settings.seoTitle || ''}`,
    `- [Courses](${base}/courses): PADI recreational and professional courses`,
    `- [Scuba diving](${base}/scuba-diving): Fun dives and dive trips`,
    `- [Snorkelling](${base}/snorkelling): Shore and boat snorkelling`,
    `- [Gallery](${base}/gallery): Photos and video`,
    `- [Blog](${base}/blog): Dive guides`,
    `- [Contact](${base}/contact): Enquire or visit the centre`,
    `- [Book](${base}/book-now): Booking enquiry`,
  ];

  if (courses.length) {
    lines.push('', '## Courses');
    for (const course of courses) {
      lines.push(`- [${course.title}](${base}/courses/${course.slug}): ${course.excerpt || ''}`.trim());
    }
  }
  if (activities.length) {
    lines.push('', '## Activities');
    for (const activity of activities) {
      const path = activity.type === 'snorkelling' ? 'snorkelling' : 'scuba-diving';
      lines.push(`- [${activity.title}](${base}/${path}/${activity.slug}): ${activity.excerpt || ''}`.trim());
    }
  }
  if (posts.length) {
    lines.push('', '## Guides');
    for (const post of posts) {
      lines.push(`- [${post.title}](${base}/blog/${post.slug}): ${post.excerpt || ''}`.trim());
    }
  }
  const answers = faqs.filter((item) => (item.question || item.q) && (item.answer || item.a)).slice(0, 40);
  if (answers.length) {
    lines.push('', '## Answers');
    for (const item of answers) {
      lines.push(`### ${item.question || item.q}`, '', item.answer || item.a, '');
    }
  }
  return `${lines.filter((line, index, all) => line !== '' || all[index - 1] !== '').join('\n').trim()}\n`;
}

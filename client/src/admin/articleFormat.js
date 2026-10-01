function decode(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function inline(value) {
  return escapeHtml(value).replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    (_, label, url) => `<a href="${url.replace(/"/g, '')}">${label}</a>`,
  );
}

export function looksLikeHtml(value) {
  return /<\/?[a-z][\s\S]*>/i.test(String(value || ''));
}

export function htmlToArticle(html) {
  const source = String(html || '').trim();
  if (!source || !looksLikeHtml(source)) return source;
  const withLinks = source.replace(
    /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
    (_, href, label) => `[${decode(label)}](${href})`,
  );
  const withHeadings = withLinks
    .replace(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi, (_, inner) => `\n\n# ${decode(inner)}\n\n`)
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, inner) => `\n- ${decode(inner)}`)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '');
  return decodeBlocks(withHeadings);
}

function decodeBlocks(value) {
  return value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function articleToHtml(article) {
  const source = String(article || '').trim();
  if (!source) return '';
  if (looksLikeHtml(source)) return source;
  return source.split(/\n\s*\n/).map((block) => {
    const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
    if (!lines.length) return '';
    if (lines.length === 1 && lines[0].startsWith('# ')) return `<h2>${inline(lines[0].slice(2))}</h2>`;
    if (lines.every((line) => line.startsWith('- '))) {
      return `<ul>${lines.map((line) => `<li>${inline(line.slice(2))}</li>`).join('')}</ul>`;
    }
    return `<p>${lines.map(inline).join('<br>')}</p>`;
  }).filter(Boolean).join('');
}

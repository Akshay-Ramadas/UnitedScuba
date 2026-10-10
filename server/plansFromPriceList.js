function highlightsFrom(detail) {
  let text = String(detail || '').trim().replace(/\.$/, '');
  if (!text) return [];
  text = text.replace(/^includes\s+/i, '');
  return text
    .split(/\s*,\s*(?:and\s+|plus\s+)?|\s+plus\s+/i)
    .map((part) => part.trim().replace(/^(and|with|plus)\s+/i, '').replace(/\.$/, ''))
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1));
}

export function plansFromPaymentInfo(paymentInfo) {
  const notes = [];
  const plans = [];
  for (const raw of String(paymentInfo || '').split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    const match = line.match(/^(.+?)\s+[—–-]\s+(INR\s+[\d,]+)\.?\s*(.*)$/);
    if (!match) {
      notes.push(line);
      continue;
    }
    plans.push({
      name: match[1].trim(),
      price: match[2].trim(),
      logo: '',
      highlights: highlightsFrom(match[3]),
      featured: false,
    });
  }
  return { plans, planNote: notes.join(' ') };
}

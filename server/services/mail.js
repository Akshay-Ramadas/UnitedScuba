import Mailjet from 'node-mailjet';

function client() {
  const key = process.env.MAILJET_API_KEY;
  const secret = process.env.MAILJET_SECRET_KEY;
  if (!key || !secret) return null;
  return Mailjet.apiConnect(key, secret);
}

async function send({ to, toName, subject, html, text, replyTo }) {
  const mj = client();
  const fromEmail = process.env.MAILJET_FROM_EMAIL;
  if (!mj || !fromEmail || !to) {
    const reason = !mj
      ? 'Mailjet keys are missing'
      : !fromEmail
        ? 'MAILJET_FROM_EMAIL is missing'
        : 'recipient is missing';
    console.warn('[mail] Skipped:', subject, '—', reason);
    return { skipped: true, reason };
  }

  const message = {
    From: {
      Email: fromEmail,
      Name: process.env.MAILJET_FROM_NAME || 'United Scuba',
    },
    To: [{ Email: to, Name: toName || to }],
    Subject: subject,
    HTMLPart: html,
    TextPart: text,
  };
  if (replyTo) message.ReplyTo = { Email: replyTo.email, Name: replyTo.name || replyTo.email };

  let result;
  try {
    result = await mj.post('send', { version: 'v3.1' }).request({ Messages: [message] });
  } catch (err) {
    const detail = err?.response?.body || err?.message || err;
    console.error('[mail] Mailjet rejected', subject, 'to', to, detail);
    throw new Error(`Mailjet rejected mail to ${to}`);
  }

  const sent = result.body?.Messages?.[0];
  if (sent?.Status && sent.Status !== 'success') {
    console.error('[mail] Mailjet status', sent.Status, 'to', to, sent.Errors || '');
    throw new Error(`Mailjet did not accept mail to ${to}`);
  }
  console.log('[mail] Accepted by Mailjet:', subject, '→', to);
  return { skipped: false, to };
}

function enquirySummary(enquiry) {
  return `
    <p><strong>Name:</strong> ${escapeHtml(enquiry.name)}</p>
    <p><strong>Phone / WhatsApp:</strong> ${escapeHtml(enquiry.phone)}</p>
    <p><strong>Email:</strong> ${escapeHtml(enquiry.email)}</p>
    <p><strong>Preferred date:</strong> ${escapeHtml(enquiry.preferredDate || '—')}</p>
    <p><strong>People:</strong> ${enquiry.numberOfPeople || 1}</p>
    <p><strong>Activity:</strong> ${escapeHtml(enquiry.activityType)}</p>
    <p><strong>Diver level:</strong> ${escapeHtml(enquiry.diverLevel || '—')}</p>
    <p><strong>Preferred course / activity:</strong> ${escapeHtml(enquiry.preferredItem || '—')}</p>
    <p><strong>Message:</strong><br>${escapeHtml(enquiry.message || '—')}</p>
    <p><strong>Source:</strong> ${escapeHtml(enquiry.source)}</p>
  `;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export async function sendBusinessNotification(enquiry) {
  const to = process.env.BUSINESS_EMAIL;
  return send({
    to,
    subject: `New United Scuba enquiry — ${enquiry.name}`,
    text: `New enquiry from ${enquiry.name} (${enquiry.email}, ${enquiry.phone})`,
    html: `<h2>New website enquiry</h2>${enquirySummary(enquiry)}`,
    replyTo: enquiry.email ? { email: enquiry.email, name: enquiry.name } : undefined,
  });
}

export async function sendCustomerAcknowledgement(enquiry) {
  const html = `
    <p>Hello ${escapeHtml(enquiry.name)},</p>
    <p>Thank you for contacting United Scuba. We have received your enquiry and a team member will get back to you shortly with availability and next steps.</p>
    <p>If your dates are close, you can also message us on WhatsApp.</p>
    <p>United Scuba</p>
  `;
  return send({
    to: enquiry.email,
    toName: enquiry.name,
    subject: 'We received your United Scuba enquiry',
    text: `Hello ${enquiry.name}, thank you for contacting United Scuba. We have received your enquiry and will reply shortly.`,
    html,
  });
}

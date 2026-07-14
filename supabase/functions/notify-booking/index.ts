import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const ADMIN_EMAIL    = Deno.env.get('ADMIN_EMAIL')    ?? '';

serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const body = await req.json().catch(() => null);
  if (!body?.record) return new Response('Bad payload', { status: 400 });

  const b = body.record;

  const html = `
    <h2 style="color:#D4AF37">New Booking — The Golden Stay</h2>
    <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
      <tr><td style="padding:6px 12px;font-weight:bold;color:#555">Property</td><td style="padding:6px 12px">${b.property_title ?? '—'}</td></tr>
      <tr><td style="padding:6px 12px;font-weight:bold;color:#555">Guest</td><td style="padding:6px 12px">${b.guest_name ?? '—'}</td></tr>
      <tr><td style="padding:6px 12px;font-weight:bold;color:#555">Email</td><td style="padding:6px 12px">${b.guest_email ?? '—'}</td></tr>
      <tr><td style="padding:6px 12px;font-weight:bold;color:#555">Dates</td><td style="padding:6px 12px">${b.checkin_date} → ${b.checkout_date}</td></tr>
      <tr><td style="padding:6px 12px;font-weight:bold;color:#555">Guests</td><td style="padding:6px 12px">${b.guests}</td></tr>
      <tr><td style="padding:6px 12px;font-weight:bold;color:#555">Total</td><td style="padding:6px 12px;font-weight:bold">₹${Number(b.total ?? 0).toLocaleString('en-IN')}</td></tr>
      <tr><td style="padding:6px 12px;font-weight:bold;color:#555">Status</td><td style="padding:6px 12px">${b.status}</td></tr>
    </table>
  `;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'The Golden Stay <bookings@thegoldenstay.com>',
      to: [ADMIN_EMAIL],
      subject: `New Booking: ${b.property_title ?? 'Property'} — ₹${Number(b.total ?? 0).toLocaleString('en-IN')}`,
      html,
    }),
  });

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status: res.ok ? 200 : 500,
    headers: { 'Content-Type': 'application/json' },
  });
});

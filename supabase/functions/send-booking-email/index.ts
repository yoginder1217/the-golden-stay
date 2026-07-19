import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const FROM_EMAIL     = 'The Golden Stay <bookings@thegoldenstay.com>';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

const fmtINR = (n: number) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  try {
    const {
      guest_email, guest_name, booking_ref,
      property_title, property_location,
      checkin_date, checkout_date, guests = 1, nights = 1,
      total = 0,
      loyalty_discount = 0,
      promo_discount = 0,
      promo_code = null,
      addons_total = 0,
    } = await req.json();

    if (!guest_email || !booking_ref) {
      return new Response(JSON.stringify({ error: 'guest_email and booking_ref are required' }), {
        status: 400, headers: { 'Content-Type': 'application/json', ...CORS },
      });
    }

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), {
        status: 500, headers: { 'Content-Type': 'application/json', ...CORS },
      });
    }

    const discountRows = [
      loyalty_discount > 0
        ? `<tr><td style="padding:7px 0;color:#16a34a;font-size:13px;">Loyalty Points</td><td style="padding:7px 0;color:#16a34a;font-size:13px;text-align:right;">− ${fmtINR(loyalty_discount)}</td></tr>`
        : '',
      promo_discount > 0
        ? `<tr><td style="padding:7px 0;color:#16a34a;font-size:13px;">Promo${promo_code ? ` (${promo_code})` : ''}</td><td style="padding:7px 0;color:#16a34a;font-size:13px;text-align:right;">− ${fmtINR(promo_discount)}</td></tr>`
        : '',
      addons_total > 0
        ? `<tr><td style="padding:7px 0;color:#555;font-size:13px;">Add-ons</td><td style="padding:7px 0;font-size:13px;text-align:right;">${fmtINR(addons_total)}</td></tr>`
        : '',
    ].join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;font-family:Georgia,serif;background:#f4f4f4;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

      <!-- Header -->
      <tr>
        <td style="background:#1a1a1a;padding:36px 40px 28px;border-radius:16px 16px 0 0;">
          <p style="color:#D4AF37;font-size:22px;font-weight:bold;margin:0;">The Golden Stay</p>
          <p style="color:#e5e7eb;font-size:20px;font-weight:bold;margin:12px 0 4px;">Your booking is confirmed ✓</p>
          <p style="color:#9ca3af;font-size:13px;margin:0;">We're looking forward to hosting you.</p>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="background:#fff;padding:40px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 16px 16px;">

          <p style="font-size:17px;font-weight:bold;margin:0 0 8px;">Hello, ${guest_name}!</p>
          <p style="color:#555;font-size:14px;line-height:1.7;margin:0 0 24px;">
            Great news — your stay at <strong>${property_title}</strong> is confirmed.
            Here's a summary of your booking:
          </p>

          <!-- Booking details -->
          <div style="background:#fafafa;border-radius:12px;border:1px solid #e5e7eb;padding:24px;margin-bottom:24px;">
            <p style="font-size:11px;font-weight:bold;color:#D4AF37;text-transform:uppercase;letter-spacing:1px;margin:0 0 16px;">Booking Summary</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:7px 0;color:#888;font-size:13px;width:45%;">Booking Reference</td>
                <td style="padding:7px 0;font-weight:bold;font-size:13px;text-align:right;font-family:monospace;">${booking_ref}</td>
              </tr>
              <tr>
                <td style="padding:7px 0;color:#888;font-size:13px;">Property</td>
                <td style="padding:7px 0;font-weight:bold;font-size:13px;text-align:right;">${property_title}</td>
              </tr>
              <tr>
                <td style="padding:7px 0;color:#888;font-size:13px;">Location</td>
                <td style="padding:7px 0;font-size:13px;text-align:right;">${property_location ?? '—'}</td>
              </tr>
              <tr>
                <td style="padding:7px 0;color:#888;font-size:13px;">Check-in</td>
                <td style="padding:7px 0;font-weight:bold;font-size:13px;text-align:right;color:#16a34a;">${formatDate(checkin_date)}</td>
              </tr>
              <tr>
                <td style="padding:7px 0;color:#888;font-size:13px;">Check-out</td>
                <td style="padding:7px 0;font-size:13px;text-align:right;">${formatDate(checkout_date)}</td>
              </tr>
              <tr>
                <td style="padding:7px 0;color:#888;font-size:13px;">Duration</td>
                <td style="padding:7px 0;font-size:13px;text-align:right;">${nights} night${nights !== 1 ? 's' : ''} · ${guests} guest${guests !== 1 ? 's' : ''}</td>
              </tr>
              ${discountRows}
              <tr style="border-top:2px solid #e5e7eb;">
                <td style="padding:14px 0 0;font-weight:bold;font-size:15px;">Total Paid</td>
                <td style="padding:14px 0 0;font-weight:bold;font-size:17px;text-align:right;color:#D4AF37;">${fmtINR(total)}</td>
              </tr>
            </table>
          </div>

          <!-- What to expect -->
          <div style="background:#fef9c3;border:1px solid #fde047;border-radius:12px;padding:20px;margin-bottom:24px;">
            <p style="font-size:13px;font-weight:bold;color:#854d0e;margin:0 0 10px;">What happens next?</p>
            <ul style="color:#713f12;font-size:13px;line-height:1.8;margin:0;padding-left:20px;">
              <li>Our team will WhatsApp you within <strong>2 hours</strong> to confirm details</li>
              <li>Property address &amp; access instructions are shared <strong>24 hours before check-in</strong></li>
              <li>Standard check-in is <strong>2:00 PM</strong> · Check-out by <strong>11:00 AM</strong></li>
            </ul>
          </div>

          <!-- CTA -->
          <div style="text-align:center;margin:28px 0;">
            <a href="https://the-golden-stay.vercel.app/dashboard"
               style="display:inline-block;background:#1a1a1a;color:#fff;font-weight:bold;font-size:14px;
                      padding:14px 32px;border-radius:50px;text-decoration:none;">
              View My Booking
            </a>
          </div>

          <!-- Footer -->
          <div style="border-top:1px solid #e5e7eb;padding-top:20px;margin-top:8px;text-align:center;color:#9ca3af;font-size:12px;">
            <p style="margin:0;">The Golden Stay · Khair, Aligarh, Uttar Pradesh</p>
            <p style="margin:6px 0 0;">
              <a href="mailto:concierge@goldenstay.com" style="color:#D4AF37;text-decoration:none;">concierge@goldenstay.com</a>
              &nbsp;·&nbsp;
              <a href="https://wa.me/917983914058" style="color:#D4AF37;text-decoration:none;">WhatsApp +91 79839 14058</a>
            </p>
          </div>

        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: guest_email,
        subject: `Booking Confirmed — ${property_title} · ${booking_ref}`,
        html,
      }),
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: res.ok ? 200 : 400,
      headers: { 'Content-Type': 'application/json', ...CORS },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS },
    });
  }
});

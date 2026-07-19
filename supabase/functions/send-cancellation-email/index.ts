import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const FROM_EMAIL = 'The Golden Stay <bookings@thegoldenstay.com>';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

const emailHtml = (p: {
  guest_name: string;
  booking_ref: string;
  property_title: string;
  property_location: string;
  checkin_date: string;
  checkout_date: string;
  nights: number;
  guests: number;
  total: number;
}) => `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;font-family:Georgia,serif;background:#f4f4f4;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

      <!-- Header -->
      <tr>
        <td style="background:#1a1a1a;padding:32px 40px;border-radius:16px 16px 0 0;">
          <p style="color:#D4AF37;font-size:22px;font-weight:bold;margin:0;">The Golden Stay</p>
          <p style="color:#9ca3af;font-size:13px;margin:6px 0 0;">Booking Cancellation Confirmation</p>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="background:#fff;padding:40px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 16px 16px;">

          <p style="font-size:17px;font-weight:bold;margin:0 0 8px;">Hi ${p.guest_name},</p>
          <p style="color:#555;font-size:14px;line-height:1.7;margin:0 0 24px;">
            We've received your cancellation request and your booking has been successfully cancelled.
            We're sorry to see you go — we hope to host you at <strong>The Golden Stay</strong> in the future.
          </p>

          <!-- Booking details -->
          <div style="background:#fafafa;border-radius:12px;border:1px solid #e5e7eb;padding:24px;margin-bottom:24px;">
            <p style="font-size:11px;font-weight:bold;color:#D4AF37;text-transform:uppercase;letter-spacing:1px;margin:0 0 16px;">Cancelled Booking</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:7px 0;color:#888;font-size:13px;width:45%;">Booking Reference</td>
                <td style="padding:7px 0;font-weight:bold;font-size:13px;text-align:right;font-family:monospace;">${p.booking_ref}</td>
              </tr>
              <tr>
                <td style="padding:7px 0;color:#888;font-size:13px;">Property</td>
                <td style="padding:7px 0;font-weight:bold;font-size:13px;text-align:right;">${p.property_title}</td>
              </tr>
              <tr>
                <td style="padding:7px 0;color:#888;font-size:13px;">Location</td>
                <td style="padding:7px 0;font-size:13px;text-align:right;">${p.property_location ?? '—'}</td>
              </tr>
              <tr>
                <td style="padding:7px 0;color:#888;font-size:13px;">Check-in</td>
                <td style="padding:7px 0;font-size:13px;text-align:right;">${formatDate(p.checkin_date)}</td>
              </tr>
              <tr>
                <td style="padding:7px 0;color:#888;font-size:13px;">Check-out</td>
                <td style="padding:7px 0;font-size:13px;text-align:right;">${formatDate(p.checkout_date)}</td>
              </tr>
              <tr>
                <td style="padding:7px 0;color:#888;font-size:13px;">Duration</td>
                <td style="padding:7px 0;font-size:13px;text-align:right;">${p.nights} night${p.nights !== 1 ? 's' : ''} · ${p.guests} guest${p.guests !== 1 ? 's' : ''}</td>
              </tr>
              <tr style="border-top:1px solid #e5e7eb;">
                <td style="padding:14px 0 0;font-size:13px;color:#555;">Amount Paid</td>
                <td style="padding:14px 0 0;font-weight:bold;font-size:15px;text-align:right;">₹${Number(p.total).toLocaleString('en-IN')}</td>
              </tr>
            </table>
          </div>

          <!-- Refund info -->
          <div style="background:#fef9c3;border:1px solid #fde047;border-radius:12px;padding:20px;margin-bottom:24px;">
            <p style="font-size:13px;font-weight:bold;color:#854d0e;margin:0 0 8px;">Refund Information</p>
            <p style="font-size:13px;color:#713f12;line-height:1.6;margin:0;">
              If your cancellation is within the eligible window as per our
              <a href="https://the-golden-stay.vercel.app/refund-policy" style="color:#92400e;">refund policy</a>,
              the amount will be credited to your original payment method within <strong>5–7 working days</strong>.
              For any queries, please contact us on WhatsApp or email.
            </p>
          </div>

          <!-- CTA -->
          <div style="text-align:center;margin:28px 0;">
            <a href="https://the-golden-stay.vercel.app/properties"
               style="display:inline-block;background:#D4AF37;color:#fff;font-weight:bold;font-size:14px;
                      padding:14px 32px;border-radius:50px;text-decoration:none;">
              Browse Other Properties
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

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  try {
    const payload = await req.json();
    const { guest_email, guest_name, booking_ref, property_title, property_location,
            checkin_date, checkout_date, nights = 0, guests = 1, total = 0 } = payload;

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

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: guest_email,
        subject: `Booking Cancelled — ${booking_ref} | The Golden Stay`,
        html: emailHtml({ guest_name, booking_ref, property_title, property_location,
                          checkin_date, checkout_date, nights, guests, total }),
      }),
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: res.ok ? 200 : 400,
      headers: { 'Content-Type': 'application/json', ...CORS },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { 'Content-Type': 'application/json', ...CORS },
    });
  }
});

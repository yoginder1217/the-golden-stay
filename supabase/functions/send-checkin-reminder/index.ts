/**
 * send-checkin-reminder
 *
 * Queries confirmed bookings checking in TOMORROW and sends a pre-stay
 * reminder email to each guest.
 *
 * Called daily via pg_cron (see supabase/checkin_reminder_cron.sql).
 * Can also be POST-triggered manually from the admin dashboard.
 *
 * Required secrets (set in Supabase Dashboard → Settings → Edge Functions):
 *   RESEND_API_KEY            — Resend API key
 *   SUPABASE_URL              — auto-injected by Supabase
 *   SUPABASE_SERVICE_ROLE_KEY — auto-injected by Supabase (bypasses RLS)
 */
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY         = Deno.env.get('RESEND_API_KEY')            ?? '';
const SUPABASE_URL           = Deno.env.get('SUPABASE_URL')              ?? '';
const SUPABASE_SERVICE_ROLE  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const FROM_EMAIL             = 'The Golden Stay <bookings@thegoldenstay.com>';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

// Returns ISO date string for N days from now (UTC)
const dateAfterDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
};

const reminderHtml = (b: {
  guest_name: string;
  booking_ref: string;
  property_title: string;
  property_location: string;
  checkin_date: string;
  checkout_date: string;
  nights: number;
  guests: number;
}) => `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;font-family:Georgia,serif;background:#f4f4f4;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

      <!-- Golden header -->
      <tr>
        <td style="background:linear-gradient(135deg,#1a1a1a 0%,#2d2d2d 100%);padding:40px;border-radius:16px 16px 0 0;text-align:center;">
          <p style="color:#D4AF37;font-size:24px;font-weight:bold;margin:0 0 4px;">The Golden Stay</p>
          <p style="color:#e5e7eb;font-size:26px;font-weight:bold;margin:12px 0 0;">Your stay is tomorrow! 🎉</p>
          <p style="color:#9ca3af;font-size:14px;margin:8px 0 0;">We can't wait to welcome you.</p>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="background:#fff;padding:40px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 16px 16px;">

          <p style="font-size:17px;font-weight:bold;margin:0 0 8px;">Hi ${b.guest_name}!</p>
          <p style="color:#555;font-size:14px;line-height:1.7;margin:0 0 24px;">
            Just a friendly reminder — your stay at <strong>${b.property_title}</strong> begins tomorrow.
            Here's everything you need to know before you arrive.
          </p>

          <!-- Stay summary -->
          <div style="background:#fafafa;border-radius:12px;border:1px solid #e5e7eb;padding:24px;margin-bottom:24px;">
            <p style="font-size:11px;font-weight:bold;color:#D4AF37;text-transform:uppercase;letter-spacing:1px;margin:0 0 16px;">Your Stay Details</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:7px 0;color:#888;font-size:13px;width:45%;">Booking Ref</td>
                <td style="padding:7px 0;font-weight:bold;font-size:13px;text-align:right;font-family:monospace;">${b.booking_ref}</td>
              </tr>
              <tr>
                <td style="padding:7px 0;color:#888;font-size:13px;">Property</td>
                <td style="padding:7px 0;font-weight:bold;font-size:13px;text-align:right;">${b.property_title}</td>
              </tr>
              <tr>
                <td style="padding:7px 0;color:#888;font-size:13px;">Check-in</td>
                <td style="padding:7px 0;font-weight:bold;font-size:13px;text-align:right;color:#16a34a;">${formatDate(b.checkin_date)}</td>
              </tr>
              <tr>
                <td style="padding:7px 0;color:#888;font-size:13px;">Check-out</td>
                <td style="padding:7px 0;font-size:13px;text-align:right;">${formatDate(b.checkout_date)}</td>
              </tr>
              <tr>
                <td style="padding:7px 0;color:#888;font-size:13px;">Duration</td>
                <td style="padding:7px 0;font-size:13px;text-align:right;">${b.nights} night${b.nights !== 1 ? 's' : ''} · ${b.guests} guest${b.guests !== 1 ? 's' : ''}</td>
              </tr>
            </table>
          </div>

          <!-- Check-in info -->
          <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:20px;margin-bottom:24px;">
            <p style="font-size:13px;font-weight:bold;color:#166534;margin:0 0 12px;">📍 Check-in Instructions</p>
            <ul style="color:#15803d;font-size:13px;line-height:1.8;margin:0;padding-left:20px;">
              <li>Standard check-in time is <strong>2:00 PM</strong> (early check-in on request)</li>
              <li>The property address and access details will be shared on <strong>WhatsApp</strong> this morning</li>
              <li>Check-out is by <strong>11:00 AM</strong> on your last day</li>
            </ul>
          </div>

          <!-- WhatsApp contact -->
          <div style="text-align:center;margin:28px 0;">
            <p style="color:#555;font-size:14px;margin:0 0 16px;">Have questions before you arrive? We're available on WhatsApp.</p>
            <a href="https://wa.me/917983914058?text=Hi%2C%20I%20have%20a%20question%20about%20my%20booking%20${encodeURIComponent(b.booking_ref)}"
               style="display:inline-block;background:#25D366;color:#fff;font-weight:bold;font-size:14px;
                      padding:14px 28px;border-radius:50px;text-decoration:none;">
              📱 Message Us on WhatsApp
            </a>
          </div>

          <!-- What to bring -->
          <div style="background:#fafafa;border-radius:12px;border:1px solid #e5e7eb;padding:20px;margin-bottom:24px;">
            <p style="font-size:13px;font-weight:bold;color:#1a1a1a;margin:0 0 12px;">What to bring</p>
            <ul style="color:#555;font-size:13px;line-height:1.8;margin:0;padding-left:20px;">
              <li>A valid government photo ID (Aadhaar / Passport / Driving Licence)</li>
              <li>Printed or digital copy of this booking confirmation</li>
              <li>Any special items you requested (mention to concierge if needed)</li>
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
              <a href="https://wa.me/917983914058" style="color:#D4AF37;text-decoration:none;">+91 79839 14058</a>
            </p>
            <p style="margin:8px 0 0;font-size:11px;color:#d1d5db;">
              You're receiving this because you have a confirmed booking with us.
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

  // Auth check: only allow calls with a valid Bearer token (anon key or service role)
  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { 'Content-Type': 'application/json', ...CORS },
    });
  }

  try {
    if (!RESEND_API_KEY)  throw new Error('RESEND_API_KEY is not configured');
    if (!SUPABASE_URL)    throw new Error('SUPABASE_URL is not configured');
    if (!SUPABASE_SERVICE_ROLE) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

    // Find bookings checking in tomorrow (UTC date)
    const tomorrow = dateAfterDays(1);

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('id, booking_ref, guest_name, guest_email, property_title, property_location, checkin_date, checkout_date, nights, guests, total')
      .eq('status', 'confirmed')
      .eq('checkin_date', tomorrow);

    if (error) throw error;
    if (!bookings || bookings.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: `No check-ins found for ${tomorrow}` }), {
        status: 200, headers: { 'Content-Type': 'application/json', ...CORS },
      });
    }

    // Send reminder to each guest in parallel
    const results = await Promise.allSettled(
      bookings.map(async (b) => {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: b.guest_email,
            subject: `Your stay at ${b.property_title} is tomorrow! 🏡`,
            html: reminderHtml({
              guest_name: b.guest_name,
              booking_ref: b.booking_ref,
              property_title: b.property_title,
              property_location: b.property_location,
              checkin_date: b.checkin_date,
              checkout_date: b.checkout_date,
              nights: b.nights,
              guests: b.guests,
            }),
          }),
        });
        return { booking_ref: b.booking_ref, guest_email: b.guest_email, ok: res.ok };
      })
    );

    const sent    = results.filter(r => r.status === 'fulfilled' && (r.value as {ok:boolean}).ok).length;
    const failed  = results.length - sent;

    console.log(`[send-checkin-reminder] ${tomorrow}: ${sent} sent, ${failed} failed`);

    return new Response(JSON.stringify({ sent, failed, date: tomorrow, total: bookings.length }), {
      status: 200, headers: { 'Content-Type': 'application/json', ...CORS },
    });
  } catch (err) {
    console.error('[send-checkin-reminder] Error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { 'Content-Type': 'application/json', ...CORS },
    });
  }
});

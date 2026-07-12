import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const FROM_EMAIL = 'bookings@goldenstay.com'; // Must be a verified Resend domain

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const {
      guest_email, guest_name, booking_ref,
      property_title, property_location,
      checkin_date, checkout_date, guests, nights,
      total, loyalty_discount,
    } = await req.json();

    const formatDate = (d: string) =>
      new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    const html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
        <div style="background: #1a1a1a; padding: 32px 40px; border-radius: 16px 16px 0 0;">
          <h1 style="color: #D4AF37; font-size: 28px; margin: 0;">The Golden Stay</h1>
          <p style="color: #aaa; margin: 8px 0 0;">Your booking is confirmed ✓</p>
        </div>

        <div style="background: #fff; border: 1px solid #e5e7eb; padding: 40px; border-radius: 0 0 16px 16px;">
          <p style="font-size: 18px; font-weight: bold;">Hello, ${guest_name}!</p>
          <p style="color: #555;">Great news — your stay at <strong>${property_title}</strong> has been confirmed. Here are your booking details:</p>

          <div style="background: #fafafa; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #888; font-size: 13px;">Booking Ref</td>
                <td style="padding: 8px 0; font-weight: bold; font-size: 13px; text-align: right; font-family: monospace;">${booking_ref}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #888; font-size: 13px;">Property</td>
                <td style="padding: 8px 0; font-weight: bold; font-size: 13px; text-align: right;">${property_title}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #888; font-size: 13px;">Location</td>
                <td style="padding: 8px 0; font-size: 13px; text-align: right;">${property_location}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #888; font-size: 13px;">Check-in</td>
                <td style="padding: 8px 0; font-weight: bold; font-size: 13px; text-align: right;">${formatDate(checkin_date)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #888; font-size: 13px;">Check-out</td>
                <td style="padding: 8px 0; font-weight: bold; font-size: 13px; text-align: right;">${formatDate(checkout_date)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #888; font-size: 13px;">Guests · Nights</td>
                <td style="padding: 8px 0; font-size: 13px; text-align: right;">${guests} guests · ${nights} nights</td>
              </tr>
              ${loyalty_discount > 0 ? `
              <tr>
                <td style="padding: 8px 0; color: #16a34a; font-size: 13px;">Loyalty Discount</td>
                <td style="padding: 8px 0; color: #16a34a; font-size: 13px; text-align: right;">- ₹${loyalty_discount.toLocaleString('en-IN')}</td>
              </tr>` : ''}
              <tr style="border-top: 2px solid #e5e7eb;">
                <td style="padding: 16px 0 8px; font-weight: bold; font-size: 15px;">Total Paid</td>
                <td style="padding: 16px 0 8px; font-weight: bold; font-size: 15px; text-align: right; color: #D4AF37;">₹${total.toLocaleString('en-IN')}</td>
              </tr>
            </table>
          </div>

          <p style="color: #555; font-size: 14px;">The exact address and check-in instructions will be shared 24 hours before your arrival.</p>

          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center; color: #aaa; font-size: 12px;">
            <p>The Golden Stay · Khair, Aligarh, UP</p>
            <p>concierge@goldenstay.com · +91 98765 43210</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
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
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL      = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_KEY      = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') ?? '';
const VAPID_PUBLIC_KEY  = Deno.env.get('VAPID_PUBLIC_KEY') ?? '';
const VAPID_SUBJECT     = 'mailto:concierge@thegoldenstay.com';

serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const { user_id, title, body, url } = await req.json().catch(() => ({}));
  if (!title) return new Response('title required', { status: 400 });

  const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
  const query = sb.from('push_subscriptions').select('endpoint, p256dh, auth_key');
  if (user_id) query.eq('user_id', user_id);
  const { data: subs } = await query;

  if (!subs?.length) return new Response(JSON.stringify({ sent: 0 }), { status: 200 });

  const payload = JSON.stringify({ title, body, url: url ?? '/' });

  // Use web-push via the npm CDN available in Deno
  // Since Deno doesn't have native web-push, we use the WebPush REST spec manually
  // For simplicity, call each subscription's push endpoint with the payload
  let sent = 0;
  for (const sub of subs) {
    try {
      const res = await fetch(sub.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'TTL': '86400',
        },
        body: payload,
      });
      if (res.ok || res.status === 201) sent++;
      if (res.status === 410) {
        // Subscription expired — remove it
        await sb.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
      }
    } catch {}
  }

  return new Response(JSON.stringify({ sent }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});

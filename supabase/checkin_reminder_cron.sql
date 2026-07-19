-- ─────────────────────────────────────────────────────────────────────────────
-- Pre-stay Reminder Cron Job
-- Calls the send-checkin-reminder Edge Function daily at 09:00 AM IST (03:30 UTC)
--
-- Prerequisites:
--   1. pg_cron extension must be enabled in Supabase Dashboard →
--      Database → Extensions → pg_cron
--   2. pg_net extension must be enabled (usually already on by default in Supabase)
--   3. Replace YOUR_PROJECT_REF with your actual Supabase project ref
--      (find it in Dashboard → Settings → General)
--   4. Replace YOUR_ANON_KEY with your project's anon/public key
--      (find it in Dashboard → Settings → API)
--
-- Run this file once in the Supabase SQL editor.
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable required extensions (no-op if already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove existing job if re-running this script
SELECT cron.unschedule('send-daily-checkin-reminders')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'send-daily-checkin-reminders'
);

-- Schedule the daily reminder job
-- Cron expression: '30 3 * * *' = 03:30 UTC = 09:00 AM IST
SELECT cron.schedule(
  'send-daily-checkin-reminders',
  '30 3 * * *',
  $$
  SELECT net.http_post(
    url     := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-checkin-reminder',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer YOUR_ANON_KEY'
    ),
    body    := '{}'::jsonb
  ) AS request_id;
  $$
);

-- Verify the job was created
SELECT jobid, jobname, schedule, command
FROM   cron.job
WHERE  jobname = 'send-daily-checkin-reminders';

-- ─────────────────────────────────────────────────────────────────────────────
-- To unschedule the job later:
--   SELECT cron.unschedule('send-daily-checkin-reminders');
--
-- To view recent cron run history:
--   SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;
-- ─────────────────────────────────────────────────────────────────────────────

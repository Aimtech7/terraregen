-- Schedule the fetch-environmental-data function to run daily at 6 AM UTC
SELECT cron.schedule(
  'fetch-environmental-data-daily',
  '0 6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://izbvxoxhsmrqpgusxyoh.supabase.co/functions/v1/fetch-environmental-data',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6YnZ4b3hoc21ycXBndXN4eW9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2OTUzMTQsImV4cCI6MjA3NTI3MTMxNH0.0eLeGbNKoObQWVNs4y-6vMPkO8jZ_cfSaqBeXu4sPsQ'
    ),
    body := jsonb_build_object('time', now()::text)
  ) as request_id;
  $$
);
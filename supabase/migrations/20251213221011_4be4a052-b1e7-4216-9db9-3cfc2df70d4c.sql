-- Create slack_installations table for OAuth tokens
CREATE TABLE public.slack_installations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id text UNIQUE NOT NULL,
  team_name text,
  access_token text NOT NULL,
  bot_user_id text,
  app_id text,
  installed_by_user_id text,
  installed_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.slack_installations ENABLE ROW LEVEL SECURITY;

-- Only service role can access (edge functions use service role)
CREATE POLICY "Service role only" ON public.slack_installations
  FOR ALL USING (false);
-- Workspace settings for custom scales
CREATE TABLE public.workspaces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slack_team_id TEXT NOT NULL UNIQUE,
  slack_team_name TEXT,
  voting_scale JSONB NOT NULL DEFAULT '["1", "2", "3", "5", "8", "13", "21", "?", "☕"]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Voting sessions
CREATE TABLE public.voting_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  slack_channel_id TEXT NOT NULL,
  slack_message_ts TEXT,
  topic TEXT NOT NULL,
  created_by_slack_user_id TEXT NOT NULL,
  created_by_slack_username TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revealed', 'cancelled')),
  revealed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Individual votes
CREATE TABLE public.votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.voting_sessions(id) ON DELETE CASCADE NOT NULL,
  slack_user_id TEXT NOT NULL,
  slack_username TEXT,
  vote_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_id, slack_user_id)
);

-- Enable RLS but allow edge functions to access
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voting_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Public read/write policies for edge functions (using service role)
CREATE POLICY "Allow all operations for service role" ON public.workspaces FOR ALL USING (true);
CREATE POLICY "Allow all operations for service role" ON public.voting_sessions FOR ALL USING (true);
CREATE POLICY "Allow all operations for service role" ON public.votes FOR ALL USING (true);

-- Indexes for performance
CREATE INDEX idx_voting_sessions_workspace ON public.voting_sessions(workspace_id);
CREATE INDEX idx_voting_sessions_channel ON public.voting_sessions(slack_channel_id);
CREATE INDEX idx_votes_session ON public.votes(session_id);

-- Enable realtime for sessions
ALTER PUBLICATION supabase_realtime ADD TABLE public.voting_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.votes;
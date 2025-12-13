-- Drop existing permissive RLS policies
DROP POLICY IF EXISTS "Allow all operations for service role" ON public.votes;
DROP POLICY IF EXISTS "Allow all operations for service role" ON public.voting_sessions;
DROP POLICY IF EXISTS "Allow all operations for service role" ON public.workspaces;
DROP POLICY IF EXISTS "Service role only" ON public.slack_installations;

-- Create restrictive service-role-only policies for votes
CREATE POLICY "Service role only access" ON public.votes
FOR ALL
TO authenticated, anon
USING (false)
WITH CHECK (false);

-- Create restrictive service-role-only policies for voting_sessions
CREATE POLICY "Service role only access" ON public.voting_sessions
FOR ALL
TO authenticated, anon
USING (false)
WITH CHECK (false);

-- Create restrictive service-role-only policies for workspaces
CREATE POLICY "Service role only access" ON public.workspaces
FOR ALL
TO authenticated, anon
USING (false)
WITH CHECK (false);

-- Create restrictive service-role-only policies for slack_installations
CREATE POLICY "Service role only access" ON public.slack_installations
FOR ALL
TO authenticated, anon
USING (false)
WITH CHECK (false);
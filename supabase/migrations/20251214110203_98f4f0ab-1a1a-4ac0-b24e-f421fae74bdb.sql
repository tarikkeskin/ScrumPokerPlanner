-- Drop existing policies on slack_installations
DROP POLICY IF EXISTS "Deny all public access" ON public.slack_installations;
DROP POLICY IF EXISTS "Deny anon access" ON public.slack_installations;
DROP POLICY IF EXISTS "Deny authenticated access" ON public.slack_installations;

-- Create a PERMISSIVE policy that allows NO ONE (service_role bypasses RLS by default)
-- This ensures the table is only accessible via service_role key used in edge functions
CREATE POLICY "No public access - service role only"
ON public.slack_installations
FOR ALL
TO public
USING (false)
WITH CHECK (false);

-- Do the same for votes table
DROP POLICY IF EXISTS "Service role only access" ON public.votes;

CREATE POLICY "No public access - service role only"
ON public.votes
FOR ALL
TO public
USING (false)
WITH CHECK (false);

-- Do the same for voting_sessions table
DROP POLICY IF EXISTS "Service role only access" ON public.voting_sessions;

CREATE POLICY "No public access - service role only"
ON public.voting_sessions
FOR ALL
TO public
USING (false)
WITH CHECK (false);

-- Do the same for workspaces table
DROP POLICY IF EXISTS "Service role only access" ON public.workspaces;

CREATE POLICY "No public access - service role only"
ON public.workspaces
FOR ALL
TO public
USING (false)
WITH CHECK (false);
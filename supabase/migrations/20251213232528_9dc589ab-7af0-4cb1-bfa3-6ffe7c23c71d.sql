-- Drop existing permissive policy
DROP POLICY IF EXISTS "Service role only access" ON public.slack_installations;

-- Create a proper restrictive policy that explicitly denies all access
-- The service role bypasses RLS entirely, so it will still work
CREATE POLICY "Deny all public access" 
ON public.slack_installations 
AS RESTRICTIVE
FOR ALL 
TO public
USING (false)
WITH CHECK (false);

-- Also ensure the anon and authenticated roles cannot access
CREATE POLICY "Deny anon access" 
ON public.slack_installations 
AS RESTRICTIVE
FOR ALL 
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Deny authenticated access" 
ON public.slack_installations 
AS RESTRICTIVE
FOR ALL 
TO authenticated
USING (false)
WITH CHECK (false);
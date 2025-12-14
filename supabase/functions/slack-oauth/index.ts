import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.split('/').pop();

  console.log('OAuth request:', { path, search: url.search });

  const SLACK_CLIENT_ID = Deno.env.get('SLACK_CLIENT_ID');
  const SLACK_CLIENT_SECRET = Deno.env.get('SLACK_CLIENT_SECRET');
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!SLACK_CLIENT_ID || !SLACK_CLIENT_SECRET) {
    console.error('Missing Slack OAuth credentials');
    return new Response('Configuration error', { status: 500 });
  }

  try {
    // Handle OAuth callback from Slack
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    // If there's an error from Slack
    if (error) {
      console.error('Slack OAuth error:', error);
      return new Response(
        `<html><body><h1>Installation Cancelled</h1><p>You cancelled the installation or an error occurred.</p><p><a href="/">Return to home</a></p></body></html>`,
        { headers: { 'Content-Type': 'text/html' }, status: 400 }
      );
    }

    // If no code, redirect to Slack OAuth authorization
    if (!code) {
      const scopes = [
        'commands',
        'chat:write',
        'chat:write.public',
        'users:read'
      ].join(',');

      // Force HTTPS for redirect URI (edge functions behind proxy may report HTTP)
      const redirectUri = `https://${url.host}/functions/v1/slack-oauth`;
      const slackAuthUrl = `https://slack.com/oauth/v2/authorize?client_id=${SLACK_CLIENT_ID}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}`;

      console.log('Redirecting to Slack OAuth:', slackAuthUrl);

      return Response.redirect(slackAuthUrl, 302);
    }

    // Exchange code for access token
    console.log('Exchanging code for token...');

    const redirectUri = `https://${url.host}/functions/v1/slack-oauth`;
    const tokenResponse = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: SLACK_CLIENT_ID,
        client_secret: SLACK_CLIENT_SECRET,
        code: code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();
    console.log('Token response:', { ok: tokenData.ok, team: tokenData.team?.name });

    if (!tokenData.ok) {
      console.error('Token exchange failed:', tokenData.error);
      return new Response(
        `<html><body><h1>Installation Failed</h1><p>Unable to complete installation. Please try again or contact support.</p><p><a href="/">Try again</a></p></body></html>`,
        { headers: { 'Content-Type': 'text/html' }, status: 400 }
      );
    }

    // Store installation in database
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const installationData = {
      team_id: tokenData.team.id,
      team_name: tokenData.team.name,
      access_token: tokenData.access_token,
      bot_user_id: tokenData.bot_user_id,
      app_id: tokenData.app_id,
      installed_by_user_id: tokenData.authed_user?.id,
      updated_at: new Date().toISOString(),
    };

    const { error: dbError } = await supabase
      .from('slack_installations')
      .upsert(installationData, { onConflict: 'team_id' });

    if (dbError) {
      console.error('Database error:', dbError);
      // Still show success to user - the app is installed in Slack
    } else {
      console.log('Installation saved for team:', tokenData.team.name);
    }

    // Success - redirect to frontend success page
    // Use your deployed frontend URL
    const frontendUrl = Deno.env.get('FRONTEND_URL') || 'https://scrumpokerplanner.lovable.app';
    const successUrl = `${frontendUrl}/install-success?team=${encodeURIComponent(tokenData.team.name)}`;
    
    console.log('Redirecting to success page:', successUrl);
    
    return Response.redirect(successUrl, 302);

  } catch (error) {
    console.error('OAuth error:', error);
    return new Response(
      `<html><body><h1>Installation Error</h1><p>Something went wrong during installation. Please try again.</p></body></html>`,
      { headers: { 'Content-Type': 'text/html' }, status: 500 }
    );
  }
});
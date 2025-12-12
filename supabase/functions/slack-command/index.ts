import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-slack-signature, x-slack-request-timestamp',
};

const FIBONACCI_SCALE = ["1", "2", "3", "5", "8", "13", "21", "?", "☕"];

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const formData = await req.formData();
    
    const command = formData.get('command') as string;
    const text = formData.get('text') as string;
    const teamId = formData.get('team_id') as string;
    const teamDomain = formData.get('team_domain') as string;
    const channelId = formData.get('channel_id') as string;
    const userId = formData.get('user_id') as string;
    const userName = formData.get('user_name') as string;
    const responseUrl = formData.get('response_url') as string;

    console.log('Received slash command:', { command, text, teamId, channelId, userId });

    // Handle help command
    if (text?.toLowerCase() === 'help') {
      return new Response(JSON.stringify({
        response_type: 'ephemeral',
        text: '🃏 *Planning Poker Help*\n\n' +
          '• `/poker [topic]` - Start a new voting session\n' +
          '• `/poker help` - Show this help message\n\n' +
          '*How it works:*\n' +
          '1. Start a session with a topic\n' +
          '2. Team members vote by clicking buttons\n' +
          '3. Votes are hidden until revealed\n' +
          '4. Session creator reveals votes when ready\n\n' +
          '*Default Scale:* 1, 2, 3, 5, 8, 13, 21, ?, ☕'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!text || text.trim() === '') {
      return new Response(JSON.stringify({
        response_type: 'ephemeral',
        text: '❌ Please provide a topic for the voting session.\n\nUsage: `/poker [topic]`\nExample: `/poker Estimate user login feature`'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get or create workspace
    let { data: workspace } = await supabase
      .from('workspaces')
      .select('*')
      .eq('slack_team_id', teamId)
      .maybeSingle();

    if (!workspace) {
      const { data: newWorkspace, error: wsError } = await supabase
        .from('workspaces')
        .insert({
          slack_team_id: teamId,
          slack_team_name: teamDomain
        })
        .select()
        .single();
      
      if (wsError) {
        console.error('Error creating workspace:', wsError);
        throw wsError;
      }
      workspace = newWorkspace;
    }

    // Create voting session
    const { data: session, error: sessionError } = await supabase
      .from('voting_sessions')
      .insert({
        workspace_id: workspace.id,
        slack_channel_id: channelId,
        topic: text.trim(),
        created_by_slack_user_id: userId,
        created_by_slack_username: userName
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Error creating session:', sessionError);
      throw sessionError;
    }

    console.log('Created session:', session.id);

    // Get voting scale
    const scale = workspace.voting_scale || FIBONACCI_SCALE;

    // Build voting buttons
    const voteButtons = scale.map((value: string) => ({
      type: 'button',
      text: {
        type: 'plain_text',
        text: value,
        emoji: true
      },
      value: JSON.stringify({ session_id: session.id, vote: value }),
      action_id: `vote_${value}`
    }));

    // Split buttons into rows (max 5 per row)
    const buttonRows = [];
    for (let i = 0; i < voteButtons.length; i += 5) {
      buttonRows.push({
        type: 'actions',
        elements: voteButtons.slice(i, i + 5)
      });
    }

    const message = {
      response_type: 'in_channel',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `🃏 *Planning Poker Session*\n\n📋 *Topic:* ${text.trim()}\n👤 *Started by:* <@${userId}>`
          }
        },
        {
          type: 'divider'
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '🗳️ *Cast your vote:*'
          }
        },
        ...buttonRows,
        {
          type: 'divider'
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `📊 *Votes:* 0 | 🔒 Votes are hidden until revealed`
            }
          ]
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: '👁️ Reveal Votes',
                emoji: true
              },
              style: 'primary',
              value: JSON.stringify({ session_id: session.id, action: 'reveal' }),
              action_id: 'reveal_votes',
              confirm: {
                title: {
                  type: 'plain_text',
                  text: 'Reveal Votes?'
                },
                text: {
                  type: 'mrkdwn',
                  text: 'Are you sure you want to reveal all votes?'
                },
                confirm: {
                  type: 'plain_text',
                  text: 'Reveal'
                },
                deny: {
                  type: 'plain_text',
                  text: 'Cancel'
                }
              }
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: '❌ Cancel',
                emoji: true
              },
              style: 'danger',
              value: JSON.stringify({ session_id: session.id, action: 'cancel' }),
              action_id: 'cancel_session'
            }
          ]
        }
      ]
    };

    return new Response(JSON.stringify(message), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in slack-command:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({
      response_type: 'ephemeral',
      text: `❌ Something went wrong: ${errorMessage}`
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

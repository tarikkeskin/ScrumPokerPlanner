import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-slack-signature, x-slack-request-timestamp',
};

const FIBONACCI_SCALE = ["1", "2", "3", "5", "8", "13", "21", "?", "☕"];

// State structure embedded in button values
interface SessionState {
  t: string;  // topic
  c: string;  // creator user_id
  v: Record<string, { u: string; val: string }>;  // votes: { "U123": { u: "username", val: "5" } }
  s: string[];  // scale
}

function encodeState(state: SessionState): string {
  // Use TextEncoder for proper UTF-8 handling
  const encoder = new TextEncoder();
  const bytes = encoder.encode(JSON.stringify(state));
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    
    const text = formData.get('text') as string;
    const userId = formData.get('user_id') as string;

    console.log('Received slash command:', { text, userId });

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

    // Create initial state (no database needed!)
    const initialState: SessionState = {
      t: text.trim().substring(0, 200),  // Truncate topic to save space
      c: userId,
      v: {},  // Empty votes
      s: FIBONACCI_SCALE
    };

    const encodedState = encodeState(initialState);

    // Build voting buttons with embedded state
    const voteButtons = FIBONACCI_SCALE.map((value: string) => ({
      type: 'button',
      text: {
        type: 'plain_text',
        text: value,
        emoji: true
      },
      value: JSON.stringify({ state: encodedState, vote: value }),
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
              value: JSON.stringify({ state: encodedState, action: 'reveal' }),
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
              value: JSON.stringify({ state: encodedState, action: 'cancel' }),
              action_id: 'cancel_session'
            }
          ]
        }
      ]
    };

    console.log('Created session with embedded state');

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

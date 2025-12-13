import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-slack-signature, x-slack-request-timestamp',
};

const FIBONACCI_SCALE = ["1", "2", "3", "5", "8", "13", "21", "?", "☕"];
const VALID_VOTE_VALUES = new Set(FIBONACCI_SCALE);
const MAX_TOPIC_LENGTH = 200;
const SLACK_USER_ID_PATTERN = /^[UW][A-Z0-9]{8,}$/;

// Security: Verify Slack request signature
async function verifySlackRequest(
  req: Request,
  body: string
): Promise<boolean> {
  const signingSecret = Deno.env.get('SLACK_SIGNING_SECRET');
  if (!signingSecret) {
    console.error('SLACK_SIGNING_SECRET not configured');
    return false;
  }

  const timestamp = req.headers.get('x-slack-request-timestamp');
  const signature = req.headers.get('x-slack-signature');

  if (!timestamp || !signature) {
    console.error('Missing Slack signature headers');
    return false;
  }

  // Prevent replay attacks (5 minute window)
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp)) > 300) {
    console.error('Request timestamp too old');
    return false;
  }

  // Compute expected signature
  const sigBaseString = `v0:${timestamp}:${body}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(signingSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signatureBytes = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(sigBaseString)
  );
  const expectedSignature = 'v0=' + Array.from(new Uint8Array(signatureBytes))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return signature === expectedSignature;
}

// Input validation
function validateSlackUserId(userId: string): boolean {
  return SLACK_USER_ID_PATTERN.test(userId);
}

function sanitizeTopic(topic: string): string {
  // Remove potentially dangerous characters and limit length
  return topic
    .replace(/[<>&]/g, '') // Remove Slack special chars
    .trim()
    .substring(0, MAX_TOPIC_LENGTH);
}

// State structure embedded in button values
interface SessionState {
  t: string;  // topic
  c: string;  // creator user_id
  v: Record<string, { u: string; val: string }>;  // votes
  s: string[];  // scale
}

function encodeState(state: SessionState): string {
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
    // Clone request to read body for signature verification
    const bodyText = await req.text();
    
    // Security: Verify Slack signature
    const isValid = await verifySlackRequest(req, bodyText);
    if (!isValid) {
      console.error('Invalid Slack signature');
      return new Response('Unauthorized', { status: 401 });
    }

    // Parse form data from body text
    const params = new URLSearchParams(bodyText);
    const text = params.get('text') || '';
    const userId = params.get('user_id') || '';

    console.log('Received slash command:', { textLength: text.length, userId: userId.substring(0, 4) + '...' });

    // Input validation
    if (!validateSlackUserId(userId)) {
      console.error('Invalid user_id format');
      return new Response(JSON.stringify({
        response_type: 'ephemeral',
        text: '❌ Invalid request. Please try again.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

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

    // Sanitize topic
    const sanitizedTopic = sanitizeTopic(text);
    if (sanitizedTopic.length === 0) {
      return new Response(JSON.stringify({
        response_type: 'ephemeral',
        text: '❌ Please provide a valid topic for the voting session.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create initial state
    const initialState: SessionState = {
      t: sanitizedTopic,
      c: userId,
      v: {},
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
            text: `🃏 *Planning Poker Session*\n\n📋 *Topic:* ${sanitizedTopic}\n👤 *Started by:* <@${userId}>`
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

    console.log('Created session successfully');

    return new Response(JSON.stringify(message), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in slack-command:', error);
    // Sanitized error message - no internal details exposed
    return new Response(JSON.stringify({
      response_type: 'ephemeral',
      text: '❌ Something went wrong. Please try again.'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

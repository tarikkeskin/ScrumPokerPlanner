import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-slack-signature, x-slack-request-timestamp',
};

const FIBONACCI_SCALE = ["1", "2", "3", "5", "8", "13", "21", "?", "☕"];
const MIDDLE_VOTES = ["1-2", "2-3", "3-5", "5-8", "8-13", "13-21"];
const ALL_VOTE_VALUES = new Set([...FIBONACCI_SCALE, ...MIDDLE_VOTES]);
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

function validateVoteValue(value: string, scale: string[]): boolean {
  return scale.includes(value) || MIDDLE_VOTES.includes(value);
}

function isMiddleVote(value: string): boolean {
  return MIDDLE_VOTES.includes(value);
}

function parseMiddleVote(value: string): { low: string; high: string } | null {
  if (!isMiddleVote(value)) return null;
  const [low, high] = value.split('-');
  return { low, high };
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

function decodeState(encoded: string): SessionState {
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const decoder = new TextDecoder();
  return JSON.parse(decoder.decode(bytes));
}

function calculateStats(votes: { vote_value: string }[]) {
  // Exclude middle votes from numeric statistics
  const numericVotes = votes
    .filter(v => !isMiddleVote(v.vote_value))
    .map(v => parseFloat(v.vote_value))
    .filter(v => !isNaN(v))
    .sort((a, b) => a - b);

  const middleVoteCount = votes.filter(v => isMiddleVote(v.vote_value)).length;

  if (numericVotes.length === 0) {
    return { average: null, median: null, mode: null, consensus: false, spread: 0, middleVoteCount };
  }

  const average = numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length;

  const mid = Math.floor(numericVotes.length / 2);
  const median = numericVotes.length % 2 !== 0
    ? numericVotes[mid]
    : (numericVotes[mid - 1] + numericVotes[mid]) / 2;

  const frequency: Record<number, number> = {};
  let maxFreq = 0;
  let mode = numericVotes[0];
  
  numericVotes.forEach(v => {
    frequency[v] = (frequency[v] || 0) + 1;
    if (frequency[v] > maxFreq) {
      maxFreq = frequency[v];
      mode = v;
    }
  });

  const uniqueVotes = [...new Set(numericVotes)];
  // Consensus only when no undecided votes AND all numeric votes are exactly equal
  const consensus = middleVoteCount === 0 && uniqueVotes.length === 1;

  return { 
    average: Math.round(average * 10) / 10, 
    median, 
    mode, 
    consensus,
    spread: numericVotes.length > 0 ? numericVotes[numericVotes.length - 1] - numericVotes[0] : 0,
    middleVoteCount
  };
}

function buildVotingMessage(state: SessionState, showVoters: boolean = true) {
  const encodedState = encodeState(state);
  const scale = state.s || FIBONACCI_SCALE;
  const voteCount = Object.keys(state.v).length;
  const voters = Object.keys(state.v).map(uid => `<@${uid}>`).join(', ') || 'None yet';

  // Build buttons - main votes and middle votes separately
  const numericValues = scale.filter((v: string) => !isNaN(parseFloat(v)));
  const specialValues = scale.filter((v: string) => isNaN(parseFloat(v)));
  
  // Create main vote buttons
  const mainButtons: any[] = [];
  numericValues.forEach((value: string) => {
    mainButtons.push({
      type: 'button',
      text: { type: 'plain_text', text: value, emoji: true },
      value: JSON.stringify({ state: encodedState, vote: value }),
      action_id: `vote_${value}`
    });
  });
  
  // Add special values (?, ☕)
  specialValues.forEach((value: string) => {
    mainButtons.push({
      type: 'button',
      text: { type: 'plain_text', text: value, emoji: true },
      value: JSON.stringify({ state: encodedState, vote: value }),
      action_id: `vote_${value}`
    });
  });

  // Create middle vote buttons for separate row
  const middleButtons: any[] = [];
  for (let i = 0; i < numericValues.length - 1; i++) {
    const middleValue = `${numericValues[i]}-${numericValues[i + 1]}`;
    if (MIDDLE_VOTES.includes(middleValue)) {
      middleButtons.push({
        type: 'button',
        text: { type: 'plain_text', text: middleValue, emoji: true },
        value: JSON.stringify({ state: encodedState, vote: middleValue }),
        action_id: `vote_${middleValue}`
      });
    }
  }

  // Split main buttons into rows (max 5 per row)
  const buttonRows = [];
  for (let i = 0; i < mainButtons.length; i += 5) {
    buttonRows.push({
      type: 'actions',
      elements: mainButtons.slice(i, i + 5)
    });
  }
  
  // Add middle votes row with 🤔 emoji label
  if (middleButtons.length > 0) {
    buttonRows.push({
      type: 'context',
      elements: [{ type: 'mrkdwn', text: '🤔 *Undecided?*' }]
    });
    for (let i = 0; i < middleButtons.length; i += 5) {
      buttonRows.push({
        type: 'actions',
        elements: middleButtons.slice(i, i + 5)
      });
    }
  }

  return {
    replace_original: true,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `🃏 *Planning Poker Session*\n\n📋 *Topic:* ${state.t}\n👤 *Started by:* <@${state.c}>`
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
            text: showVoters 
              ? `📊 *Votes:* ${voteCount} | 👥 *Voted:* ${voters}\n🔒 Votes are hidden until revealed`
              : `📊 *Votes:* ${voteCount} | 🔒 Votes are hidden until revealed`
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
            action_id: 'reveal_votes'
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
    const payloadStr = params.get('payload');
    if (!payloadStr) {
      console.error('Missing payload');
      return new Response('Bad Request', { status: 400 });
    }

    const payload = JSON.parse(payloadStr);

    console.log('Received interaction:', payload.type, payload.actions?.[0]?.action_id);

    const userId = payload.user?.id;
    const userName = payload.user?.username || payload.user?.name;
    const responseUrl = payload.response_url;

    // Validate user ID
    if (!userId || !validateSlackUserId(userId)) {
      console.error('Invalid user_id in payload');
      return new Response(JSON.stringify({
        response_type: 'ephemeral',
        text: '❌ Invalid request. Please try again.'
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (payload.type === 'block_actions') {
      const action = payload.actions?.[0];
      if (!action) {
        return new Response('Bad Request', { status: 400 });
      }

      const actionId = action.action_id;
      
      let actionValue;
      try {
        actionValue = JSON.parse(action.value);
      } catch {
        console.error('Invalid action value');
        return new Response(JSON.stringify({
          response_type: 'ephemeral',
          text: '❌ Invalid request. Please try again.'
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Decode current state from button value
      let state: SessionState;
      try {
        state = decodeState(actionValue.state);
      } catch (e) {
        console.error('Failed to decode state');
        return new Response(JSON.stringify({
          response_type: 'ephemeral',
          text: '❌ Session expired. Please start a new session.'
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      if (actionId.startsWith('vote_')) {
        const voteValue = actionValue.vote;

        // Validate vote value
        if (!validateVoteValue(voteValue, state.s || FIBONACCI_SCALE)) {
          console.error('Invalid vote value:', voteValue);
          return new Response(JSON.stringify({
            response_type: 'ephemeral',
            text: '❌ Invalid vote. Please try again.'
          }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // Add/update vote in state
        state.v[userId] = { u: userName || 'Unknown', val: voteValue };

        console.log('Vote recorded:', { totalVotes: Object.keys(state.v).length });

        const updatedMessage = buildVotingMessage(state);

        await fetch(responseUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedMessage)
        });

        // Build confirmation message
        const middleParts = parseMiddleVote(voteValue);
        const confirmationBlocks = middleParts ? [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `🤔 *Undecided vote recorded!*`
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `You can't decide between *\`${middleParts.low}\`* or *\`${middleParts.high}\`*`
            }
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: '💡 This will be shown as "undecided" when votes are revealed. You can change your vote anytime.'
              }
            ]
          }
        ] : [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `✅ *Vote recorded!*`
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `Your selection: *\`  ${voteValue}  \`*`
            }
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: '💡 You can change your vote anytime before votes are revealed'
              }
            ]
          }
        ];

        return new Response(JSON.stringify({
          response_type: 'ephemeral',
          blocks: confirmationBlocks
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

      } else if (actionId === 'reveal_votes') {
        if (state.c !== userId) {
          return new Response(JSON.stringify({
            response_type: 'ephemeral',
            text: '❌ Only the session creator can reveal votes.'
          }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const votes = Object.entries(state.v);
        
        if (votes.length === 0) {
          return new Response(JSON.stringify({
            response_type: 'ephemeral',
            text: '❌ No votes have been cast yet.'
          }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const voteObjects = votes.map(([_, v]) => ({ vote_value: v.val }));
        const stats = calculateStats(voteObjects);

        // Format votes list with special annotation for middle votes
        const votesList = votes.map(([uid, v]) => {
          const middleParts = parseMiddleVote(v.val);
          if (middleParts) {
            return `• <@${uid}>: *${v.val}* 🤔 _couldn't decide between ${middleParts.low} or ${middleParts.high}_`;
          }
          return `• <@${uid}>: *${v.val}*`;
        }).join('\n');

        let statsText = '';
        if (stats.average !== null) {
          statsText = `\n📈 *Statistics:*\n• Average: ${stats.average}`;
          if (stats.middleVoteCount > 0) {
            statsText += `\n• ⚠️ ${stats.middleVoteCount} undecided vote(s) excluded from stats`;
          }
          if (stats.consensus) {
            statsText += '\n\n✅ *Great consensus!* The team is aligned.';
          } else if (stats.spread && stats.spread > 5) {
            statsText += '\n\n⚠️ *Wide spread detected.* Consider discussing differences.';
          }
        }

        const newRoundState: SessionState = {
          t: state.t,
          c: userId,
          v: {},
          s: state.s
        };

        const resultsMessage = {
          replace_original: true,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `🎉 *Voting Results*\n\n📋 *Topic:* ${state.t}\n👤 *Started by:* <@${state.c}>`
              }
            },
            {
              type: 'divider'
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `🗳️ *Votes (${votes.length} total):*\n${votesList}${statsText}`
              }
            },
            {
              type: 'divider'
            },
            {
              type: 'actions',
              elements: [
                {
                  type: 'button',
                  text: {
                    type: 'plain_text',
                    text: '🔄 New Round',
                    emoji: true
                  },
                  value: JSON.stringify({ state: encodeState(newRoundState), action: 'new_round' }),
                  action_id: 'new_round'
                },
                {
                  type: 'button',
                  text: {
                    type: 'plain_text',
                    text: '🗑️ Delete',
                    emoji: true
                  },
                  style: 'danger',
                  value: JSON.stringify({ state: encodeState(state), action: 'delete' }),
                  action_id: 'delete_round'
                }
              ]
            }
          ]
        };

        await fetch(responseUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(resultsMessage)
        });

        console.log('Votes revealed:', { totalVotes: votes.length });
        return new Response(null, { status: 200, headers: corsHeaders });

      } else if (actionId === 'cancel_session') {
        if (state.c !== userId) {
          return new Response(JSON.stringify({
            response_type: 'ephemeral',
            text: '❌ Only the session creator can cancel.'
          }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        await fetch(responseUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            replace_original: true,
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `❌ *Session Cancelled*\n\n📋 *Topic:* ${state.t}\n\nThis voting session was cancelled by <@${userId}>.`
                }
              }
            ]
          })
        });

        console.log('Session cancelled');
        return new Response(null, { status: 200, headers: corsHeaders });

      } else if (actionId === 'new_round') {
        const newRoundMessage = buildVotingMessage(state);
        newRoundMessage.replace_original = true;

        await fetch(responseUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newRoundMessage)
        });

        console.log('New round started');
        return new Response(null, { status: 200, headers: corsHeaders });

      } else if (actionId === 'delete_round') {
        if (state.c !== userId) {
          return new Response(JSON.stringify({
            response_type: 'ephemeral',
            text: '❌ Only the session creator can delete this round.'
          }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        await fetch(responseUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            delete_original: true
          })
        });

        console.log('Session deleted');
        return new Response(null, { status: 200, headers: corsHeaders });
      }
    }

    return new Response(null, { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error('Error in slack-interactions:', error);
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

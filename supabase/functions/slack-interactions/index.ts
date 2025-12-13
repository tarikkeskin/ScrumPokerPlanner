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

function decodeState(encoded: string): SessionState {
  // Use TextDecoder for proper UTF-8 handling
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const decoder = new TextDecoder();
  return JSON.parse(decoder.decode(bytes));
}

function calculateStats(votes: { vote_value: string }[]) {
  const numericVotes = votes
    .map(v => parseFloat(v.vote_value))
    .filter(v => !isNaN(v))
    .sort((a, b) => a - b);

  if (numericVotes.length === 0) {
    return { average: null, median: null, mode: null, consensus: false, spread: 0 };
  }

  // Average
  const average = numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length;

  // Median
  const mid = Math.floor(numericVotes.length / 2);
  const median = numericVotes.length % 2 !== 0
    ? numericVotes[mid]
    : (numericVotes[mid - 1] + numericVotes[mid]) / 2;

  // Mode
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

  // Consensus (all votes within 1 step of each other)
  const uniqueVotes = [...new Set(numericVotes)];
  const consensus = uniqueVotes.length === 1 || 
    (uniqueVotes.length === 2 && Math.abs(uniqueVotes[0] - uniqueVotes[1]) <= 2);

  return { 
    average: Math.round(average * 10) / 10, 
    median, 
    mode, 
    consensus,
    spread: numericVotes.length > 0 ? numericVotes[numericVotes.length - 1] - numericVotes[0] : 0
  };
}

function buildVotingMessage(state: SessionState, showVoters: boolean = true) {
  const encodedState = encodeState(state);
  const scale = state.s || FIBONACCI_SCALE;
  const voteCount = Object.keys(state.v).length;
  const voters = Object.keys(state.v).map(uid => `<@${uid}>`).join(', ') || 'None yet';

  const voteButtons = scale.map((value: string) => ({
    type: 'button',
    text: {
      type: 'plain_text',
      text: value,
      emoji: true
    },
    value: JSON.stringify({ state: encodedState, vote: value }),
    action_id: `vote_${value}`
  }));

  const buttonRows = [];
  for (let i = 0; i < voteButtons.length; i += 5) {
    buttonRows.push({
      type: 'actions',
      elements: voteButtons.slice(i, i + 5)
    });
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
    const formData = await req.formData();
    const payloadStr = formData.get('payload') as string;
    const payload = JSON.parse(payloadStr);

    console.log('Received interaction:', payload.type, payload.actions?.[0]?.action_id);

    const userId = payload.user.id;
    const userName = payload.user.username || payload.user.name;
    const responseUrl = payload.response_url;

    if (payload.type === 'block_actions') {
      const action = payload.actions[0];
      const actionId = action.action_id;
      const actionValue = JSON.parse(action.value);

      // Decode current state from button value
      let state: SessionState;
      try {
        state = decodeState(actionValue.state);
      } catch (e) {
        console.error('Failed to decode state:', e);
        return new Response(JSON.stringify({
          response_type: 'ephemeral',
          text: '❌ Session state is corrupted. Please start a new session.'
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      if (actionId.startsWith('vote_')) {
        // Handle vote
        const voteValue = actionValue.vote;

        // Add/update vote in state
        state.v[userId] = { u: userName, val: voteValue };

        console.log('Vote recorded:', { userId, voteValue, totalVotes: Object.keys(state.v).length });

        // Update the original message with new state
        const updatedMessage = buildVotingMessage(state);

        await fetch(responseUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedMessage)
        });

        // Send ephemeral confirmation to voter
        return new Response(JSON.stringify({
          response_type: 'ephemeral',
          blocks: [
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
          ]
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

      } else if (actionId === 'reveal_votes') {
        // Only creator can reveal
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

        // Calculate statistics
        const voteObjects = votes.map(([_, v]) => ({ vote_value: v.val }));
        const stats = calculateStats(voteObjects);

        // Build results
        const votesList = votes.map(([uid, v]) => `• <@${uid}>: *${v.val}*`).join('\n');

        let statsText = '';
        if (stats.average !== null) {
          statsText = `\n📈 *Statistics:*\n• Average: ${stats.average}`;
          if (stats.consensus) {
            statsText += '\n\n✅ *Great consensus!* The team is aligned.';
          } else if (stats.spread && stats.spread > 5) {
            statsText += '\n\n⚠️ *Wide spread detected.* Consider discussing differences.';
          }
        }

        // Create fresh state for new round button
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

        console.log('Votes revealed:', { totalVotes: votes.length, topic: state.t });
        return new Response(null, { status: 200, headers: corsHeaders });

      } else if (actionId === 'cancel_session') {
        // Only creator can cancel
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

        console.log('Session cancelled:', { topic: state.t, cancelledBy: userId });
        return new Response(null, { status: 200, headers: corsHeaders });

      } else if (actionId === 'new_round') {
        // Start new round with same topic
        const newRoundMessage = buildVotingMessage(state);
        newRoundMessage.replace_original = true;

        await fetch(responseUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newRoundMessage)
        });

        console.log('New round started:', { topic: state.t, startedBy: userId });
        return new Response(null, { status: 200, headers: corsHeaders });

      } else if (actionId === 'delete_round') {
        // Only creator can delete
        if (state.c !== userId) {
          return new Response(JSON.stringify({
            response_type: 'ephemeral',
            text: '❌ Only the session creator can delete this round.'
          }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // Delete the message
        await fetch(responseUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            delete_original: true
          })
        });

        console.log('Session deleted:', { topic: state.t });
        return new Response(null, { status: 200, headers: corsHeaders });
      }
    }

    return new Response(null, { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error('Error in slack-interactions:', error);
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

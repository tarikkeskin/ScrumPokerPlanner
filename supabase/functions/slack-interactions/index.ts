import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-slack-signature, x-slack-request-timestamp',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

function calculateStats(votes: { vote_value: string }[]) {
  const numericVotes = votes
    .map(v => parseFloat(v.vote_value))
    .filter(v => !isNaN(v))
    .sort((a, b) => a - b);

  if (numericVotes.length === 0) {
    return { average: null, median: null, mode: null, consensus: false };
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
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

      if (actionId.startsWith('vote_')) {
        // Handle vote
        const sessionId = actionValue.session_id;
        const voteValue = actionValue.vote;

        // Get session
        const { data: session, error: sessionError } = await supabase
          .from('voting_sessions')
          .select('*, workspace:workspaces(*)')
          .eq('id', sessionId)
          .single();

        if (sessionError || !session) {
          console.error('Session not found:', sessionError);
          return new Response(JSON.stringify({
            response_type: 'ephemeral',
            text: '❌ Session not found or has ended.'
          }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        if (session.status !== 'active') {
          return new Response(JSON.stringify({
            response_type: 'ephemeral',
            text: '❌ This voting session has already ended.'
          }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // Upsert vote
        const { error: voteError } = await supabase
          .from('votes')
          .upsert({
            session_id: sessionId,
            slack_user_id: userId,
            slack_username: userName,
            vote_value: voteValue,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'session_id,slack_user_id'
          });

        if (voteError) {
          console.error('Error saving vote:', voteError);
          throw voteError;
        }

        // Get all votes for this session
        const { data: allVotes } = await supabase
          .from('votes')
          .select('slack_user_id, slack_username')
          .eq('session_id', sessionId);

        const voteCount = allVotes?.length || 0;
        const voters = allVotes?.map(v => `<@${v.slack_user_id}>`).join(', ') || 'None yet';

        // Update the original message with new vote count
        const scale = session.workspace?.voting_scale || ["1", "2", "3", "5", "8", "13", "21", "?", "☕"];
        
        const voteButtons = scale.map((value: string) => ({
          type: 'button',
          text: {
            type: 'plain_text',
            text: value,
            emoji: true
          },
          value: JSON.stringify({ session_id: sessionId, vote: value }),
          action_id: `vote_${value}`
        }));

        const buttonRows = [];
        for (let i = 0; i < voteButtons.length; i += 5) {
          buttonRows.push({
            type: 'actions',
            elements: voteButtons.slice(i, i + 5)
          });
        }

        const updatedMessage = {
          replace_original: true,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `🃏 *Planning Poker Session*\n\n📋 *Topic:* ${session.topic}\n👤 *Started by:* <@${session.created_by_slack_user_id}>`
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
                  text: `📊 *Votes:* ${voteCount} | 👥 *Voted:* ${voters}\n🔒 Votes are hidden until revealed`
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
                  value: JSON.stringify({ session_id: sessionId, action: 'reveal' }),
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
                  value: JSON.stringify({ session_id: sessionId, action: 'cancel' }),
                  action_id: 'cancel_session'
                }
              ]
            }
          ]
        };

        // Update original message via response_url
        await fetch(responseUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedMessage)
        });

        // Send ephemeral confirmation to voter
        return new Response(JSON.stringify({
          response_type: 'ephemeral',
          text: `✅ Your vote: *${voteValue}* has been recorded! You can change it anytime before votes are revealed.`
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

      } else if (actionId === 'reveal_votes') {
        const sessionId = actionValue.session_id;

        // Get session
        const { data: session, error: sessionError } = await supabase
          .from('voting_sessions')
          .select('*')
          .eq('id', sessionId)
          .single();

        if (sessionError || !session) {
          return new Response(JSON.stringify({
            response_type: 'ephemeral',
            text: '❌ Session not found.'
          }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // Only creator can reveal
        if (session.created_by_slack_user_id !== userId) {
          return new Response(JSON.stringify({
            response_type: 'ephemeral',
            text: '❌ Only the session creator can reveal votes.'
          }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // Get all votes
        const { data: votes } = await supabase
          .from('votes')
          .select('*')
          .eq('session_id', sessionId);

        if (!votes || votes.length === 0) {
          return new Response(JSON.stringify({
            response_type: 'ephemeral',
            text: '❌ No votes have been cast yet.'
          }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // Update session status
        await supabase
          .from('voting_sessions')
          .update({ status: 'revealed', revealed_at: new Date().toISOString() })
          .eq('id', sessionId);

        // Calculate statistics
        const stats = calculateStats(votes);

        // Build results
        const votesList = votes.map(v => `• <@${v.slack_user_id}>: *${v.vote_value}*`).join('\n');

        let statsText = '';
        if (stats.average !== null) {
          statsText = `\n📈 *Statistics:*\n• Average: ${stats.average}\n• Median: ${stats.median}\n• Mode: ${stats.mode}`;
          if (stats.consensus) {
            statsText += '\n\n✅ *Great consensus!* The team is aligned.';
          } else if (stats.spread && stats.spread > 5) {
            statsText += '\n\n⚠️ *Wide spread detected.* Consider discussing differences.';
          }
        }

        const resultsMessage = {
          replace_original: true,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `🎉 *Voting Results*\n\n📋 *Topic:* ${session.topic}\n👤 *Started by:* <@${session.created_by_slack_user_id}>`
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
                  value: JSON.stringify({ topic: session.topic, action: 'new_round' }),
                  action_id: 'new_round'
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

        return new Response(null, { status: 200, headers: corsHeaders });

      } else if (actionId === 'cancel_session') {
        const sessionId = actionValue.session_id;

        const { data: session } = await supabase
          .from('voting_sessions')
          .select('*')
          .eq('id', sessionId)
          .single();

        if (session && session.created_by_slack_user_id !== userId) {
          return new Response(JSON.stringify({
            response_type: 'ephemeral',
            text: '❌ Only the session creator can cancel.'
          }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        await supabase
          .from('voting_sessions')
          .update({ status: 'cancelled' })
          .eq('id', sessionId);

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
                  text: `❌ *Session Cancelled*\n\n📋 *Topic:* ${session?.topic || 'Unknown'}\n\nThis voting session was cancelled by <@${userId}>.`
                }
              }
            ]
          })
        });

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

#!/usr/bin/env node
// Claude Code Stop hook: "Done" needs evidence.
//
// If the agent's final message claims the work is done/fixed/working,
// but the agent did not run a single tool in this turn, block the stop once
// and ask it to either verify or say plainly that the change is unverified.
//
// Limits: any tool call counts (even reading a file). This catches claims with
// nothing behind them; it does not judge whether the verification was good.
// Install: see README.md. Node 18+.

const fs = require('fs');

// Phrases that count as a "done" claim. Edit to match how your agent writes.
const CLAIMS = [
  /^\s*(done|fixed|all set)\b/im,
  /\b(it'?s|this is|everything is|all|that'?s) (now )?(done|fixed|working|complete)\b/i,
  /\bis (now )?(fixed|resolved|working)\b/i,
  /\b(i(?:'ve| have)?|now) (fixed|resolved|completed|implemented)\b/i,
  /\bworks now\b/i,
  /\b(all )?tests? (now )?pass(es|ed)?\b/i,
  /\bshould (now )?work\b/i,
];
// Phrases that show the agent is being honest about not verifying.
const HONEST = [/\bunverified\b/i, /\bnot (yet )?(verified|tested)\b/i, /\bdid(n'?t| not) (run|test|verify)\b/i];

let input = '';
process.stdin.on('data', (c) => (input += c));
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input || '{}');
    if (data.stop_hook_active) return; // never block twice in a row
    const turn = readLastTurn(data.transcript_path);
    // Prefer last_assistant_message: the transcript may not include the final message yet.
    const text = (typeof data.last_assistant_message === 'string' && data.last_assistant_message) || turn.text;
    if (!text || text.trim().length < 4) return;

    const body = text.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`]*`/g, ' ');
    const claims = CLAIMS.some((re) => re.test(body));
    const honest = HONEST.some((re) => re.test(body));
    if (!claims || honest || turn.toolCalls > 0) return;

    process.stdout.write(JSON.stringify({
      decision: 'block',
      reason:
        'You said the work is done, but you ran no tools in this turn, so nothing was verified. ' +
        'Either verify it now (run the test, build, or check the real output) and report what you saw, ' +
        'or tell the user plainly that the change is unverified.',
    }));
  } catch {
    // If anything goes wrong, never block the agent.
  }
});

// Read the transcript back to the last real user message.
// Returns the last assistant text and the number of tool calls after that user message.
function readLastTurn(transcriptPath) {
  const result = { text: '', toolCalls: 0 };
  if (!transcriptPath || !fs.existsSync(transcriptPath)) return result;
  const lines = fs.readFileSync(transcriptPath, 'utf8').trim().split(/\r?\n/);
  for (let i = lines.length - 1; i >= 0; i--) {
    let e;
    try { e = JSON.parse(lines[i]); } catch { continue; }
    if (e.isMeta) continue; // skill loads, hook feedback and other system-inserted lines
    const content = e.message && e.message.content;
    const parts = Array.isArray(content) ? content : [];
    if (e.type === 'user' && !parts.some((p) => p.type === 'tool_result')) break; // start of this turn
    if (e.type !== 'assistant') continue;
    result.toolCalls += parts.filter((p) => p.type === 'tool_use').length;
    if (!result.text) {
      const t = parts.filter((p) => p.type === 'text').map((p) => p.text).join('\n') || (typeof content === 'string' ? content : '');
      if (t.trim()) result.text = t;
    }
  }
  return result;
}

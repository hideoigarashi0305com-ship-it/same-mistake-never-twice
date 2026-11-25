#!/usr/bin/env node
// Claude Code Stop hook: keep the agent's replies in your language.
//
// Counts characters of your target script against Latin letters in the final message
// (code blocks, inline code, URLs and Markdown links are ignored). If the target script
// makes up less than MIN_SHARE of the letters, block once and ask for a rewrite.
// Node 18+.

// ---- Settings -------------------------------------------------------------
const LANGUAGE_NAME = 'Japanese';
// Japanese: hiragana, katakana, CJK ideographs, half-width katakana.
// Examples for other languages:
//   Korean:  /[\uAC00-\uD7AF\u1100-\u11FF]/g
//   Chinese: /[\u4E00-\u9FFF]/g
//   Russian: /[\u0400-\u04FF]/g
const TARGET = /[\u3040-\u30FF\u3400-\u9FFF\uFF66-\uFF9F]/g;
const MIN_SHARE = 0.2;   // at least 20% of letters must be in the target script
const MIN_LETTERS = 40;  // don't judge very short replies
// ---------------------------------------------------------------------------

const fs = require('fs');

let input = '';
process.stdin.on('data', (c) => (input += c));
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input || '{}');
    if (data.stop_hook_active) return; // never block twice in a row
    const text = typeof data.last_assistant_message === 'string' ? data.last_assistant_message : lastAssistantText(data.transcript_path);
    if (!text) return;

    const body = text
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/`[^`]*`/g, ' ')
      .replace(/https?:\/\/\S+/g, ' ')
      .replace(/\[[^\]]*\]\([^)]*\)/g, ' ');
    const target = (body.match(TARGET) || []).length;
    const latin = (body.match(/[A-Za-z]/g) || []).length;
    if (target + latin < MIN_LETTERS) return;
    if (target / (target + latin) >= MIN_SHARE) return;

    process.stdout.write(JSON.stringify({
      decision: 'block',
      reason: `Your last reply was not written in ${LANGUAGE_NAME}. Replies to this user must be in ${LANGUAGE_NAME} (English is fine only for names, code and URLs). Rewrite the same content in ${LANGUAGE_NAME}.`,
    }));
  } catch {
    // Never block on errors.
  }
});

function lastAssistantText(transcriptPath) {
  if (!transcriptPath || !fs.existsSync(transcriptPath)) return '';
  const lines = fs.readFileSync(transcriptPath, 'utf8').trim().split(/\r?\n/);
  for (let i = lines.length - 1; i >= 0; i--) {
    let e;
    try { e = JSON.parse(lines[i]); } catch { continue; }
    if (e.type !== 'assistant') continue;
    const c = e.message && e.message.content;
    const t = Array.isArray(c) ? c.filter((p) => p.type === 'text').map((p) => p.text).join('\n') : typeof c === 'string' ? c : '';
    if (t.trim()) return t;
  }
  return '';
}

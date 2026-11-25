#!/usr/bin/env node
// Test cases for the two Stop hooks. Run: node tests/run-tests.js
const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const HOOKS = path.join(__dirname, '..', 'hooks');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'hook-tests-'));

const user = (t) => ({ type: 'user', message: { content: [{ type: 'text', text: t }] } });
const meta = (t) => ({ type: 'user', isMeta: true, message: { content: [{ type: 'text', text: t }] } });
const toolResult = () => ({ type: 'user', message: { content: [{ type: 'tool_result', content: 'ok' }] } });
const asst = (parts) => ({ type: 'assistant', message: { content: parts } });
const tool = { type: 'tool_use', name: 'Bash', input: {} };
const txt = (t) => ({ type: 'text', text: t });

function run(hook, payload, events) {
  if (events) {
    const tp = path.join(tmp, 'transcript.jsonl');
    fs.writeFileSync(tp, events.map((e) => JSON.stringify(e)).join('\n'));
    payload = { ...payload, transcript_path: tp };
  }
  const r = spawnSync(process.execPath, [path.join(HOOKS, hook)], { input: JSON.stringify(payload), encoding: 'utf8' });
  return r.stdout.includes('"block"');
}

const cases = [
  // done-needs-evidence.cjs
  ['done: claim, no tools -> block', 'done-needs-evidence.cjs', {}, [user('fix it'), asst([txt('I fixed the login bug. It works now and everything is done.')])], true],
  ['done: short "Fixed." with no tools -> block', 'done-needs-evidence.cjs', { last_assistant_message: 'Fixed.' }, [user('fix it')], true],
  ['done: claim after a tool run -> pass', 'done-needs-evidence.cjs', {}, [user('fix it'), asst([tool]), toolResult(), asst([txt('The bug is fixed; the test run passed.')])], false],
  ['done: honest "unverified" -> pass', 'done-needs-evidence.cjs', {}, [user('fix it'), asst([txt('I fixed the code, but this is unverified: I did not run the tests.')])], false],
  ['done: no claim -> pass', 'done-needs-evidence.cjs', {}, [user('explain'), asst([txt('The function reads the config and returns a list of users.')])], false],
  ['done: tools only in an earlier turn -> block', 'done-needs-evidence.cjs', {}, [user('a'), asst([tool]), toolResult(), asst([txt('looked')]), user('now fix it'), asst([txt('Done. I have fixed it and it works now.')])], true],
  ['done: meta line inside the turn is skipped -> pass', 'done-needs-evidence.cjs', {}, [user('fix it'), asst([tool]), toolResult(), meta('skill loaded'), asst([txt('The bug is fixed and tests pass.')])], false],
  ['done: stop_hook_active -> never block', 'done-needs-evidence.cjs', { stop_hook_active: true, last_assistant_message: 'It works now, all done.' }, null, false],
  // reply-language-check.cjs (target: Japanese)
  ['lang: English reply -> block', 'reply-language-check.cjs', { last_assistant_message: 'I updated the configuration file and restarted the server. Everything looks good now.' }, null, true],
  ['lang: Japanese reply -> pass', 'reply-language-check.cjs', { last_assistant_message: '設定ファイルを更新し、サーバーを再起動しました。`npm run build` も成功しています。' }, null, false],
  ['lang: short reply -> pass', 'reply-language-check.cjs', { last_assistant_message: 'OK' }, null, false],
  ['lang: stop_hook_active -> never block', 'reply-language-check.cjs', { stop_hook_active: true, last_assistant_message: 'This is a long English reply that would normally be blocked by the hook.' }, null, false],
];

let failures = 0;
for (const [name, hook, payload, events, expectBlock] of cases) {
  const blocked = run(hook, payload, events);
  const ok = blocked === expectBlock;
  if (!ok) failures++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name} (blocked=${blocked})`);
}
fs.rmSync(tmp, { recursive: true, force: true });
console.log(failures ? `\n${failures} failure(s)` : `\nall ${cases.length} passed`);
process.exit(failures ? 1 : 0);

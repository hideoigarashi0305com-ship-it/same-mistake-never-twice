# Same Mistake, Never Twice — Claude Code kit (free)

A lessons file and two hooks that stop your AI coding agent from repeating the same mistake.

This is the setup I use to run Claude Code on real products as a CFO who doesn't code:
a `LEARNINGS.md` file loaded into every session, a global `CLAUDE.md` that enforces a simple routine,
and Stop hooks that turn promises into checks.

**Free guide (why it works, real examples, five rules):** [Same Mistake, Never Twice](https://hideoigarashi.gumroad.com/l/same-mistake-never-twice)

## What's in here

| File | What it does |
|---|---|
| `templates/CLAUDE.md` | Global instructions: the LEARNINGS routine, reporting rules, safety rules, multi-agent rules |
| `templates/LEARNINGS.md` | The lessons file: format, routine, size guidance, starter entries |
| `hooks/load-learnings.sh` | SessionStart hook: has the agent list the rules that apply to today's task |
| `hooks/done-needs-evidence.cjs` | Stop hook: if the agent says "done / fixed / works now" but ran no tools this turn, it is sent back to verify or to say "unverified" |
| `hooks/reply-language-check.cjs` | Stop hook: keeps replies in the language you set (Japanese by default; examples for others inside) |
| `tests/run-tests.js` | 12 test cases for the two Stop hooks |

## Install

About 10 minutes. (The guide takes about 20 more to read.)

1. Copy the files:

   ```sh
   mkdir -p ~/.claude/hooks
   cp templates/CLAUDE.md ~/.claude/CLAUDE.md          # or merge into your existing one
   cp templates/LEARNINGS.md ~/.claude/LEARNINGS.md
   cp hooks/* ~/.claude/hooks/
   ```

2. Register the hooks in `~/.claude/settings.json` (merge with what you already have).
   Skip `reply-language-check.cjs` if you're happy with English replies.

   ```json
   {
     "hooks": {
       "SessionStart": [
         { "hooks": [ { "type": "command", "command": "sh \"$HOME/.claude/hooks/load-learnings.sh\"", "timeout": 10 } ] }
       ],
       "Stop": [
         { "hooks": [
           { "type": "command", "command": "node \"$HOME/.claude/hooks/done-needs-evidence.cjs\"", "timeout": 10 },
           { "type": "command", "command": "node \"$HOME/.claude/hooks/reply-language-check.cjs\"", "timeout": 10 }
         ] }
       ]
     }
   }
   ```

3. Run the tests: `node tests/run-tests.js` (expect `all 12 passed`).

4. Start a new Claude Code session. The first reply should include `[LEARNINGS loaded]`.

**Requirements:** Claude Code, Node.js 18+. The SessionStart hook needs a POSIX shell; on Windows, install Git for Windows so Git Bash is available.

## How "done needs evidence" decides

- It looks at the agent's final message for "done" claims ("it's fixed", "the bug is fixed", "works now", "tests pass", "should work", a reply starting with "Done" or "Fixed").
- If the message also says "unverified" or "not tested", the agent may stop. An honest "unverified" passes.
- If the agent ran at least one tool in this turn, the agent may stop.
- Otherwise it blocks once and asks the agent to verify or say it's unverified. It never blocks twice in a row.

**Limits:** any tool call counts, even reading a file. It catches claims with nothing behind them, not weak verification. The phrase list won't catch every wording, so edit `CLAIMS` and `HONEST` at the top of the file.

## About the size of LEARNINGS.md

Anthropic's docs suggest keeping each `CLAUDE.md` under about 200 lines, and imported files count toward that. Start small. Let the file grow only when the weekly review shows every entry still earns its place.

## Feedback

Open an issue. Fixes go into the next version.

## License

MIT. Use it, change it, ship it.

# CLAUDE.md (global)

Instructions for every project. Project-specific rules go in each repository's own `CLAUDE.md`.

## The LEARNINGS cycle (required)

1. **Start of every session** (including resumed sessions): LEARNINGS.md is imported at the bottom of this file.
   If you can't see its contents, read `~/.claude/LEARNINGS.md`. List the rules that apply to the current task
   in 3–5 short bullets, and write `[LEARNINGS loaded]`.
2. **End of each piece of work:** look back. What worked, what failed, what will we need again?
   If there is a new lesson, add or update one entry in LEARNINGS.md (no duplicates).
   If there is nothing new, add nothing.
3. **Weekly review** (pick a fixed day): delete stale entries, merge duplicates,
   promote repeated root causes to "Principles", and log the result.

## Reporting

- Say "done" only after you have checked the real output (test run, build, the page in a browser, the file on disk).
  If you could not check, say "unverified" and why.
- Separate facts, guesses and assumptions. Give the command and output behind any claim that something is wrong.
- Keep reports short: result first, then what is not done, then the next step.

## Safety

- Never use `git add -A` or `git add .` when another agent or person may share this folder. Add files by name.
- Before deleting or overwriting anything, read it first.
- Never print or commit secrets (`.env`, key files, tokens). If you see one in a diff, stop and say so.
- Do not publish, post, send or pay without my explicit approval for that specific action.

## Working with other agents

- Treat another agent's "done" as a claim to check: read the diff, check for changes I didn't ask for,
  check that the build artifact is newer than the change, and check that it actually reached production.
- When instructions in CLAUDE.md, AGENTS.md, handoff notes or LEARNINGS.md disagree,
  say so, follow the most recent explicit instruction from me, and fix the files so they agree.

## Accumulated lessons

@LEARNINGS.md

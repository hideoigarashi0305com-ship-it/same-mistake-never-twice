# LEARNINGS.md

Rules this agent has learned from real mistakes on my projects.
This file is loaded into every session. Keep it short enough to be read in full.

## How this file works

- **One entry = one lesson.** Format: Rule → Why → Apply → Date.
  A rule without a "why" stops being followed after a few weeks.
- **Only general lessons go here.** Project-specific facts go in that project's `CLAUDE.md`.
- **Use absolute dates** (2026-11-25, not "yesterday"). Delete entries that turn out to be wrong.
- **The cycle:**
  1. Start of every session: read this file and list the rules that apply to today's task.
  2. End of each piece of work: did we learn something new? If yes, add or update one entry.
  3. Once a week: merge duplicates, delete stale entries, and promote any root cause
     that shows up in 3+ entries to "Principles".
- **Size:** Anthropic's docs suggest keeping each CLAUDE.md under ~200 lines, and this imported file counts.
  Start under 200 lines. If you are about to go over, run the weekly review before adding anything.
- **When a promise doesn't stop a repeat, make it a hook.** If the same correction appears
  3+ times, write a hook that checks it automatically.

### Entry template

```markdown
### <short imperative title>
- **Rule:** what to do / not do.
- **Why:** the actual failure that taught us this (what broke, what it cost).
- **Apply:** where exactly this kicks in.
- Date: YYYY-MM-DD
```

---

## Principles

(Promote a principle here only when 3+ entries below share the same root cause. Max 8.)

1. **Verify on the real thing before saying "done".** Base reports on the running output, not on the code or on someone's report.
2. **No error is not proof of success.** Read the result back and count.
3. **Fix the class, not the instance.** When one bug is reported, check every place with the same shape.

---

## Working style

### Count with two methods before saying a number is wrong
- **Rule:** Before reporting that a count is wrong, get the same number from a second method.
- **Why:** (example) The agent grepped `id:` to count quiz questions and reported 1,980 instead of the advertised 2,500. 500 questions used the quoted key `"id":`, so the grep never saw them. The advertised number was right.
- **Apply:** Any time you count, compare, or say "X is not Y".
- Date: 2026-09-06

### Verify before saying "done"
- **Rule:** Do not report a change as working unless a test, build or run has confirmed it. If it is unverified, say "unverified".
- **Why:** (replace with your own failure — what was reported as done, and what was actually broken)
- **Apply:** Every completion report.
- Date: YYYY-MM-DD

## Verification

### Read build results from the exit code, not from filtered output
- **Rule:** When a command is piped through `grep`, read the first command's exit code (`${PIPESTATUS[0]}` in bash) and require an explicit success line.
- **Why:** (example) A build piped through `grep` failed in a step whose error message didn't match the filter. The output was empty, which looked like success. Nothing new had been built.
- **Apply:** Builds, test runs, deploy scripts.
- Date: 2026-11-20

## Tools and services

(add entries as you learn them)

## Weekly review log

- YYYY-MM-DD: reviewed N entries, merged X, deleted Y, promoted Z.

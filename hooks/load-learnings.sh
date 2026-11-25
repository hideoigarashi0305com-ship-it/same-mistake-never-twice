#!/bin/sh
# Claude Code SessionStart hook: at the start of every session, have the agent list the
# LEARNINGS rules that apply to the current task. LEARNINGS.md is normally already loaded
# through the @LEARNINGS.md import in ~/.claude/CLAUDE.md; if the agent can't see it
# (for example after compaction), the reminder tells it to read the file.
# Plain text on stdout is added to the session context. Requires a POSIX shell
# (on Windows, install Git for Windows so Git Bash is available).
L="$HOME/.claude/LEARNINGS.md"
[ -f "$L" ] || exit 0
cat <<'EOF'
LEARNINGS reminder: ~/.claude/LEARNINGS.md is loaded through the @LEARNINGS.md import in CLAUDE.md. If you cannot see its contents, read the file now. Then list the 3-5 rules that apply to the current task and write [LEARNINGS loaded]. At the end of each piece of work, check whether there is a new lesson; if so, add or update one entry.
EOF

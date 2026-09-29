---
name: github-push-telegram-notification
description: Mandatory Telegram notification every time Faust pushes commits or branches to GitHub
metadata:
  node_type: memory
  type: feedback
  originSessionId: 154caac9-f15a-41f0-8740-025e2e463693
  modified: 2026-09-29T00:54:29.340Z
---

Whenever Faust or any sub-agent executes a `git push` command to GitHub, Faust must immediately send a Telegram milestone notification to the Manager's group chat using the 4-tier functional emoji protocol.

**Why:**
The Manager needs real-time mobile visibility whenever the remote repository is updated, verifying that commits are successfully published to GitHub rather than remaining solely on local branches.

**How to apply:**
Immediately following any successful `git push` operation, execute:
`python .claude/skills/telegram/scripts/notify.py "✅ Pushed <commit-hash / branch> to GitHub: <summary of changes>"`
Link with [[telegram-operational-protocol]] and [[telegram-directive-notification-rule]].

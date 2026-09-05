---
name: git-setup-pending
key: ref:history_git_setup
keys:
  - ref:history_git_setup
  - ref:*
  - core:hardware_workflow
description: "User just installed Git and linked to GitHub — needs terminal restart, then initial commit and push"
metadata: 
  node_type: memory
  type: project
  originSessionId: ffe2083a-0419-47af-bb5f-ab1992123631
  modified: 2026-09-03T08:08:13.337Z
---

As of Sept 3, 2026:
- User installed Git via `winget install --id Git.Git`
- User linked the folder to a GitHub repository (remote already configured)
- Git is NOT yet in the terminal PATH — user needs to **restart terminal or VS Code** first
- After restart, the next steps are:
  1. Verify `git --version` works
  2. Configure `git config --global user.name` and `user.email` if not done
  3. Ensure `.gitignore` exists (node_modules, dist, .venv, __pycache__, .env)
  4. `git add . && git commit -m "feat: initial commit"` 
  5. `git push -u origin main`

See [[user-profile]] — user is new to Git.

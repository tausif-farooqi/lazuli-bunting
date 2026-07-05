---
name: git-push-workflow
description: Staged, commits, and pushes current workspace code changes to GitHub. Use when the user asks to save, commit, push, or sync changes to a remote repository.
---

# Git Push Workflow

Use this skill to automate the staging, committing, and pushing of local code changes to GitHub.

## Steps to Execute

1. **Check Status**: Run `git status --short` to see what changes exist. If there are no changes, inform the user and stop.
2. **Stage Changes**: Run `git add .` to stage all modifications and new files.
3. **Commit**: 
   - Look at the changes staged or ask the user if they have a specific message in mind. 
   - Run `git commit -m "<message>"` (replace `<message>` with a clear, imperative commit message).
4. **Push**: Run `git push origin HEAD` to safely push the active branch to GitHub.

## Commands for Execution

```bash
# Stage everything
git add .

# Commit with a message
git commit -m "feat: automated sync via agent skill"

# Safely push the current branch upstream
git push origin HEAD

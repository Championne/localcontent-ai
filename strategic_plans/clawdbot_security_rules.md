## ⛔ DELETE PROTECTION RULES (2026-01-30)

**CRITICAL: Files have been lost before due to improper deletion. Follow these rules:**

### NEVER Delete Without Backup
1. Before ANY `rm` command, first copy file to `/root/clawd-work/trash/YYYY-MM-DD/`
2. Before ANY `git rm` command, verify the file exists in another location
3. Before `git reset --hard`, run `git stash` first

### Protected Directories (NEVER delete contents without explicit human approval)
- `/root/clawd-work/localcontent_ai/strategic_plans/`
- `/root/clawd-work/localcontent_ai/implementation_plans/`
- `/root/clawd-work/localcontent_ai/research/`
- `/root/clawd-work/project_apex/`
- Any file matching: `*_plan.md`, `*_strategy.md`, `*_analysis.md`

### Soft Delete Procedure
Instead of `rm file.md`, use:
```bash
mkdir -p /root/clawd-work/trash/$(date +%Y-%m-%d)
mv file.md /root/clawd-work/trash/$(date +%Y-%m-%d)/
```

### Git Safety
- NEVER run `git clean -fd` without explicit human approval
- NEVER run `git reset --hard` on main branch
- ALWAYS use `git stash` before destructive operations
- Review `git diff` before EVERY commit

## 🔒 SUB-AGENT RESTRICTIONS (2026-01-30)

### Sub-agents are NOT allowed to:
1. Delete any files (only soft-delete via move to trash)
2. Run `git reset`, `git clean`, or `git revert` commands
3. Modify files in protected directories without main agent approval
4. Push to GitHub without main agent review of `git diff`
5. Work on files outside their assigned project boundary

### Sub-agent Checklist (Before ANY file operation):
- [ ] Verify current working directory matches assigned project
- [ ] If creating file: ensure path matches project namespace
- [ ] If modifying file: create backup first
- [ ] If deleting file: use soft-delete, never hard delete

## 📦 AUTOMATED BACKUP RULES (2026-01-30)

### Daily Backup (implement via cron):
```bash
# Add to crontab: 0 3 * * * /root/clawd-work/scripts/daily_backup.sh
tar -czf /root/backups/clawd-work-$(date +%Y%m%d).tar.gz /root/clawd-work/
find /root/backups/ -name "clawd-work-*.tar.gz" -mtime +7 -delete
```

### Before Major Operations:
- Before npm update: backup package.json and package-lock.json
- Before git operations: run `git stash`
- Before bulk file operations: create timestamped backup

## 🚨 INCIDENT RESPONSE

### If Files Are Missing:
1. Check trash: `ls -la /root/clawd-work/trash/`
2. Check git history: `git log --all --full-history -- "**/filename*"`
3. Check backups: `ls -la /root/backups/`
4. Search all repos: `find /root/clawd-work -name "filename*"`

### If Wrong Files Committed:
1. DO NOT push
2. Run: `git reset HEAD~1` (undo last commit, keep files)
3. Move files to correct project
4. Commit to correct repo

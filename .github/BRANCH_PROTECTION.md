# Branch Protection Settings

To prevent force pushing and maintain code quality, configure these branch protection rules in GitHub.

## Setup Instructions

1. Go to your GitHub repository
2. Navigate to **Settings** → **Branches**
3. Click **Add branch protection rule**
4. Configure as follows:

---

## Branch Protection Rules for `main` / `master`

### Branch Name Pattern
```
main
```
or
```
master
```

### Protection Settings

#### ✅ Require a pull request before merging
- [x] **Require approvals:** 1
- [x] **Dismiss stale pull request approvals when new commits are pushed**
- [x] **Require review from Code Owners** (optional)

#### ✅ Require status checks to pass before merging
- [x] **Require branches to be up to date before merging**

Required status checks:
- ✅ `test` (Tests workflow)
- ✅ `lint` (Code Quality workflow)
- ✅ `deploy` (Deploy to Vercel workflow)

#### ✅ Require conversation resolution before merging
- [x] All conversations must be resolved before merging

#### ✅ Require signed commits (optional but recommended)
- [x] Commits must be signed

#### ✅ Require linear history
- [x] **Prevent merge commits** - enforces rebase or squash merge

#### ✅ Require deployments to succeed before merging (optional)
- [x] Wait for successful deployment before allowing merge

#### 🚫 Do not allow bypassing the above settings
- [x] **Include administrators** - even admins must follow these rules

#### ⚠️ CRITICAL: Restrict pushes that create matching branches
- [x] **Restrict pushes**
- Add allowed actors:
  - `github-actions[bot]` (for CI/CD)
  - Specific users if needed

#### 🚫 CRITICAL: Do not allow force pushes
- [x] **Disabled** - Force pushes are completely blocked

#### 🚫 Do not allow deletions
- [x] **Disabled** - Branch cannot be deleted

---

## Recommended Settings Summary

```yaml
Branch: main (or master)

Protection Rules:
  ✅ Pull requests required: Yes (1 approval)
  ✅ Status checks required: Yes
    - test
    - lint
    - deploy
  ✅ Conversations must be resolved: Yes
  ✅ Signed commits: Yes (optional)
  ✅ Linear history: Yes
  ✅ Include administrators: Yes
  🚫 Force pushes: Disabled
  🚫 Branch deletion: Disabled
```

---

## Additional Branch Patterns

### Development Branch (optional)
```
develop
```

Settings:
- Require pull requests: Yes
- Status checks: Yes
- Allow force push: No
- Allow deletion: No

### Feature Branches
```
feature/*
```

Settings:
- No restrictions
- Developers can force push to their own feature branches
- Can be deleted after merge

### Hotfix Branches
```
hotfix/*
```

Settings:
- Require pull requests: Yes
- Fast-track approval (1 reviewer)
- Same status checks as main
- Can be deleted after merge

---

## GitHub Actions Permissions

Configure workflow permissions:

1. Go to **Settings** → **Actions** → **General**
2. Under **Workflow permissions**:
   - Select: **Read and write permissions**
   - [x] Allow GitHub Actions to create and approve pull requests

This allows CI/CD workflows to:
- Comment on pull requests
- Update deployment status
- Create preview deployments

---

## Verification

After setting up branch protection:

### Test Force Push Prevention

```bash
# This should fail
git push --force origin main
```

Expected error:
```
remote: error: GH006: Protected branch update failed for refs/heads/main.
remote: error: Cannot force-push to this branch
```

### Test Direct Push Prevention

```bash
# This should fail
git push origin main
```

Expected error:
```
remote: error: GH006: Protected branch update failed for refs/heads/main.
remote: error: Required status checks must pass
```

### Test PR Workflow

```bash
# Create feature branch
git checkout -b feature/test-protection

# Make changes
echo "test" > test.txt
git add test.txt
git commit -m "test: Verify branch protection"

# Push to feature branch (should work)
git push origin feature/test-protection

# Create PR on GitHub (should trigger CI/CD)
# PR should show required checks
```

---

## Enforcement for All Users

To ensure **everyone** follows the rules (including admins):

1. ✅ Enable "Include administrators" in branch protection
2. ✅ Set "Required reviewers" to at least 1
3. ✅ Disable force pushes completely
4. ✅ Require status checks to pass
5. ✅ Require conversation resolution

This prevents:
- Accidental force pushes
- Bypassing CI/CD checks
- Merging broken code
- Losing git history

---

## Emergency Procedures

If you absolutely need to fix something on main:

### Option 1: Use a PR (Recommended)
```bash
git checkout -b hotfix/emergency-fix
# Make fix
git commit -m "fix: Emergency fix for X"
git push origin hotfix/emergency-fix
# Create PR, wait for checks, merge
```

### Option 2: Temporary Disable Protection (Last Resort)
1. Go to **Settings** → **Branches**
2. Click **Edit** on branch protection rule
3. Temporarily disable protection
4. Make necessary changes
5. **Immediately re-enable protection**

⚠️ **Only use Option 2 in true emergencies!**

---

## Benefits of Branch Protection

✅ **Prevents Data Loss**
- No accidental overwrites
- Git history preserved
- Easy rollback if needed

✅ **Maintains Quality**
- All code reviewed
- Tests must pass
- Linting enforced

✅ **Improves Collaboration**
- Clear review process
- Discussion required
- Changes documented

✅ **Enforces Best Practices**
- No shortcuts
- Consistent workflow
- Professional standards

---

## Monitoring

### Review Pushes and PRs

1. Go to **Insights** → **Network**
   - See branch and merge history
   - Verify no force pushes occurred

2. Go to **Settings** → **Branches**
   - Check rule status
   - Review recent rule changes

3. Set up notifications:
   - Watch repository for all activity
   - Enable email notifications for PRs
   - Set up Slack/Discord webhooks

---

## Resources

- [GitHub Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [Required Status Checks](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks)
- [Code Review](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/about-pull-request-reviews)

---

**Last Updated:** February 7, 2026
**Status:** Recommended configuration for production

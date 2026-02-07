# CI/CD Setup Guide

This project includes GitHub Actions workflows for continuous integration and deployment to Vercel.

## Workflows Overview

### 1. Deploy to Vercel (`deploy.yml`)

**Triggers:**
- Push to `main` or `master` branch
- Pull requests to `main` or `master` branch

**Actions:**
- Checks out code
- Sets up Node.js 18
- Installs dependencies
- Runs tests
- Deploys to Vercel (production for main/master, preview for PRs)
- Comments deployment URL on pull requests

**Required Secrets:**
- `VERCEL_TOKEN` - Vercel authentication token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID

### 2. Tests (`test.yml`)

**Triggers:**
- Push to any branch
- Pull requests to any branch

**Actions:**
- Checks out code
- Sets up Node.js (matrix: 18.x, 20.x)
- Installs dependencies
- Runs test suite
- Generates test summary

### 3. Code Quality (`lint.yml`)

**Triggers:**
- Push to any branch
- Pull requests to any branch

**Actions:**
- Checks out code
- Sets up Node.js 18
- Installs dependencies
- Checks JavaScript syntax
- Verifies project structure
- Validates package.json

---

## Setup Instructions

### Step 1: Get Vercel Credentials

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Link your project:**
   ```bash
   vercel link
   ```
   This creates `.vercel/project.json` with your project details.

4. **Get your credentials:**
   ```bash
   cat .vercel/project.json
   ```
   Note the `orgId` and `projectId`.

5. **Get Vercel token:**
   - Go to https://vercel.com/account/tokens
   - Create a new token
   - Give it a descriptive name (e.g., "GitHub Actions")
   - Copy the token (you won't see it again!)

### Step 2: Add GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secrets:

   **VERCEL_TOKEN**
   ```
   Your Vercel token from Step 1.5
   ```

   **VERCEL_ORG_ID**
   ```
   Your orgId from .vercel/project.json
   ```

   **VERCEL_PROJECT_ID**
   ```
   Your projectId from .vercel/project.json
   ```

### Step 3: Push to GitHub

1. **Initialize git (if not already done):**
   ```bash
   git init
   git add .
   git commit -m "Initial commit with CI/CD"
   ```

2. **Create GitHub repository** and push:
   ```bash
   git remote add origin https://github.com/tuyentv96/subtitle-pro-plugin.git
   git branch -M main
   git push -u origin main
   ```

3. **Verify workflows:**
   - Go to **Actions** tab in your GitHub repository
   - You should see the workflows running

---

## Workflow Details

### Deploy Workflow

The deployment workflow follows these steps:

1. **Checkout** - Gets the latest code
2. **Setup Node.js** - Installs Node.js 18 with npm cache
3. **Install Dependencies** - Runs `npm ci` for clean install
4. **Run Tests** - Executes `npm test` to verify everything works
5. **Install Vercel CLI** - Gets the latest Vercel CLI
6. **Pull Vercel Config** - Downloads project configuration
7. **Build** - Creates production build artifacts
8. **Deploy** - Deploys to Vercel
9. **Comment on PR** - Posts deployment URL on pull requests
10. **Summary** - Adds deployment info to GitHub Actions summary

### Test Workflow

Runs tests on multiple Node.js versions:
- Node.js 18.x (LTS)
- Node.js 20.x (Current)

This ensures compatibility across different Node.js versions.

### Lint Workflow

Performs code quality checks:
- **Syntax Check** - Validates all JavaScript files
- **Structure Check** - Verifies required directories exist
- **Package Check** - Validates package.json dependencies

---

## Deployment Behavior

### Main/Master Branch
- ✅ Automatic production deployment
- ✅ All tests must pass
- ✅ Creates production URL
- ✅ Updates deployment status

### Pull Requests
- ✅ Creates preview deployment
- ✅ All tests must pass
- ✅ Comments preview URL on PR
- ✅ Unique URL per PR

### Other Branches
- ✅ Runs tests
- ✅ Runs code quality checks
- ❌ No deployment (tests only)

---

## Required Secrets Summary

| Secret | Description | How to Get |
|--------|-------------|------------|
| `VERCEL_TOKEN` | Vercel authentication token | https://vercel.com/account/tokens |
| `VERCEL_ORG_ID` | Your Vercel organization ID | `.vercel/project.json` (orgId) |
| `VERCEL_PROJECT_ID` | Your Vercel project ID | `.vercel/project.json` (projectId) |
| `GITHUB_TOKEN` | GitHub API token | Automatically provided by GitHub Actions |

---

## Troubleshooting

### Deployment Fails with "Invalid token"

**Solution:** Regenerate your Vercel token and update the `VERCEL_TOKEN` secret.

### Tests Fail

**Solution:** Run tests locally first:
```bash
npm test
```
Fix any failing tests before pushing.

### Wrong Project Deployed

**Solution:** Verify `VERCEL_PROJECT_ID` matches your project:
```bash
vercel link
cat .vercel/project.json
```

### PR Comments Not Working

**Solution:** Ensure the workflow has write permissions:
1. Go to **Settings** → **Actions** → **General**
2. Under "Workflow permissions", select "Read and write permissions"
3. Save changes

---

## Manual Deployment

If you need to deploy manually (bypassing CI/CD):

```bash
# Production deployment
vercel --prod

# Preview deployment
vercel
```

---

## Monitoring Deployments

### GitHub Actions
- View all workflow runs: **Actions** tab
- Click on a run to see detailed logs
- Download logs for debugging

### Vercel Dashboard
- View deployments: https://vercel.com/dashboard
- Check function logs
- Monitor performance
- View analytics

---

## Best Practices

### Branch Protection
1. Go to **Settings** → **Branches**
2. Add rule for `main` branch
3. Enable:
   - ✅ Require status checks (tests, lint)
   - ✅ Require pull request reviews
   - ✅ Require branches to be up to date

### Commit Messages
Use conventional commit format:
- `feat: Add new provider`
- `fix: Handle rate limits correctly`
- `docs: Update deployment guide`
- `test: Add config parser tests`

### Testing
- Always run tests locally before pushing
- Add tests for new features
- Maintain high test coverage

---

## Security Considerations

### Secrets Management
- ❌ Never commit `.vercel/` directory
- ❌ Never hardcode API keys
- ✅ Use GitHub Secrets for sensitive data
- ✅ Rotate tokens periodically

### Dependency Updates
- Monitor Dependabot alerts
- Keep dependencies up to date
- Review security advisories

---

## Customization

### Changing Deployment Branches

Edit `.github/workflows/deploy.yml`:

```yaml
on:
  push:
    branches:
      - main        # Add or remove branches here
      - production
```

### Adding More Tests

Edit `.github/workflows/test.yml`:

```yaml
- name: Run additional tests
  run: npm run test:integration
```

### Custom Notifications

Add Slack/Discord notifications:

```yaml
- name: Notify on success
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## CI/CD Status Badges

Add to your README.md:

```markdown
![Deploy](https://github.com/tuyentv96/subtitle-pro-plugin/workflows/Deploy%20to%20Vercel/badge.svg)
![Tests](https://github.com/tuyentv96/subtitle-pro-plugin/workflows/Tests/badge.svg)
![Lint](https://github.com/tuyentv96/subtitle-pro-plugin/workflows/Code%20Quality/badge.svg)
```

---

## Support

For CI/CD issues:
- GitHub Actions docs: https://docs.github.com/actions
- Vercel CLI docs: https://vercel.com/docs/cli
- Project issues: https://github.com/tuyentv96/subtitle-pro-plugin/issues

---

**Last Updated:** February 7, 2026
**Status:** Production Ready

# Deployment Guide

This guide will help you deploy Subtitle Pro to Vercel.

## Prerequisites

1. GitHub account
2. Vercel account (sign up at https://vercel.com)
3. Git installed on your machine

## Method 1: Deploy with Vercel Button (Easiest)

1. Click the "Deploy with Vercel" button in the README
2. Authorize Vercel to access your GitHub account
3. Choose a repository name
4. Click "Deploy"
5. Wait for deployment to complete
6. Visit your deployment URL + `/configure` to set up the addon

## Method 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Clone and Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/subtitle-pro-plugin.git
cd subtitle-pro-plugin

# Install dependencies
npm install
```

### Step 3: Login to Vercel

```bash
vercel login
```

### Step 4: Deploy

For the first deployment:

```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Choose your account
- Link to existing project? **N**
- Project name? Press Enter for default
- Directory? Press Enter (current directory)
- Override settings? **N**

For production deployment:

```bash
vercel --prod
```

### Step 5: Note Your Deployment URL

Vercel will provide a URL like: `https://subtitle-pro-plugin.vercel.app`

## Method 3: Deploy via GitHub Integration

### Step 1: Push to GitHub

```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Create repository on GitHub and push
git remote add origin https://github.com/yourusername/subtitle-pro-plugin.git
git push -u origin main
```

### Step 2: Connect to Vercel

1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Import your GitHub repository
4. Configure project:
   - Framework Preset: **Other**
   - Root Directory: **./** (leave default)
   - Build Command: Leave empty
   - Output Directory: Leave empty
5. Click "Deploy"

### Step 3: Automatic Deployments

- Every push to `main` branch will trigger a production deployment
- Pull requests will create preview deployments

## Post-Deployment

### 1. Verify Deployment

Visit these URLs to verify everything works:

```
https://your-deployment.vercel.app/configure
```

You should see the configuration page.

### 2. Test Configuration

1. Get your OpenSubtitles API key from https://www.opensubtitles.com/en/consumers
2. Enter your API key in the configuration page
3. Select at least one language
4. Click "Generate Install Link"
5. You should see a manifest URL and install button

### 3. Test in Stremio

1. Install Stremio from https://www.stremio.com/
2. Click the "Install in Stremio" button from your configuration page
3. Open Stremio and play a movie (e.g., The Shawshank Redemption)
4. Check if subtitles appear in your selected language

## Configuration

### Environment Variables (Optional)

You can set default values in Vercel dashboard under "Settings" > "Environment Variables":

```
NODE_ENV=production
```

These are optional - users will provide their own API keys via the configuration UI.

### Custom Domain

1. Go to your project in Vercel dashboard
2. Click "Settings" > "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Troubleshooting

### Build Fails

- Ensure `vercel.json` is properly formatted
- Check that all dependencies are in `package.json`
- Verify Node.js version compatibility (18.x recommended)

### API Endpoints Not Working

- Check Vercel Function Logs in dashboard
- Verify routes in `vercel.json` match your endpoint structure
- Ensure CORS headers are set correctly

### Configuration Page Not Loading

- Verify static files are in `/web/` directory
- Check browser console for JavaScript errors
- Ensure `styles.css` and `app.js` are accessible

### Subtitles Not Appearing in Stremio

1. Check if API keys are valid
2. Test manifest URL directly in browser
3. Check provider API status pages
4. Verify rate limits aren't exceeded
5. Check Vercel Function Logs for errors

## Monitoring

### Vercel Dashboard

Monitor your deployment at https://vercel.com/dashboard:

- **Analytics**: View usage statistics
- **Logs**: Check function execution logs
- **Deployments**: View deployment history
- **Usage**: Monitor bandwidth and function invocations

### Function Logs

View real-time logs:

```bash
vercel logs [deployment-url]
```

Or check logs in Vercel dashboard under "Functions" tab.

## Updating

### Method 1: Git Push (if using GitHub integration)

```bash
git add .
git commit -m "Update description"
git push
```

Vercel will automatically deploy the changes.

### Method 2: Vercel CLI

```bash
vercel --prod
```

## Rollback

If a deployment has issues:

1. Go to Vercel dashboard
2. Click "Deployments"
3. Find a previous working deployment
4. Click "..." menu
5. Select "Promote to Production"

## Performance Tips

1. **Optimize Provider Calls**: Enable both providers with fallback for redundancy
2. **Rate Limiting**: Configured automatically via p-queue
3. **Cold Starts**: First request may be slower, subsequent requests are fast
4. **Region**: Vercel automatically deploys to edge locations

## Security

- Never commit API keys to the repository
- Use `.env.example` as template only
- Users provide their own API keys via configuration
- All API keys are Base64-encoded in URLs (not encrypted, so use HTTPS)

## Cost

Vercel Hobby plan (free) includes:
- 100 GB bandwidth per month
- Unlimited function invocations
- 100 GB-hours compute time

For higher usage, upgrade to Pro plan.

## Support

For deployment issues:
- Check Vercel documentation: https://vercel.com/docs
- Vercel support: https://vercel.com/support
- Project issues: https://github.com/yourusername/subtitle-pro-plugin/issues

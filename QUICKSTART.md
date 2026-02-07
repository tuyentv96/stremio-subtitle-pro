# Quick Start Guide

Get Subtitle Pro up and running in 5 minutes!

## For Users (Installing the Addon)

### Step 1: Get API Key

Visit [OpenSubtitles Consumers](https://www.opensubtitles.com/en/consumers) and get your free API key.

### Step 2: Configure

1. Visit the deployed addon: **https://[deployment-url]/configure**
2. Enter your OpenSubtitles API key
3. Select your preferred subtitle languages
4. Click "Generate Install Link"

### Step 3: Install in Stremio

Click the "Install in Stremio" button and enjoy subtitles!

---

## For Developers (Deploying Your Own)

### Option A: One-Click Deploy

1. Click the "Deploy with Vercel" button in README
2. Wait for deployment to complete
3. Visit your URL + `/configure`

### Option B: Manual Deploy

```bash
# Install Vercel CLI
npm install -g vercel

# Clone and setup
git clone https://github.com/yourusername/subtitle-pro-plugin.git
cd subtitle-pro-plugin
npm install

# Deploy
vercel --prod
```

### Test Locally

```bash
# Start dev server
npm run dev

# Visit http://localhost:3000/configure
```

---

## Testing the Addon

### Quick Test

1. Configure the addon with your API key
2. Click "Install in Stremio"
3. Open Stremio
4. Play "The Shawshank Redemption" (IMDB: tt0111161)
5. Check subtitle menu - you should see subtitles!

### Test Series

1. Play any TV series episode
2. Subtitles should appear with correct season/episode

---

## Troubleshooting

### No subtitles appearing

- ✓ Check if your API key is valid
- ✓ Verify selected languages match available subtitles
- ✓ Try a popular movie first (like The Shawshank Redemption)

### Configuration page not loading

- ✓ Check deployment URL is correct
- ✓ Add `/configure` to the end of URL
- ✓ Clear browser cache

### API key errors

- ✓ Regenerate API key from provider website
- ✓ Update configuration with new key
- ✓ Reinstall addon in Stremio

---

## What's Next?

- Read the full [README.md](README.md) for detailed documentation
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for deployment options
- See [CONTRIBUTING.md](CONTRIBUTING.md) to contribute

---

## Support

- 🐛 Report bugs: [GitHub Issues](https://github.com/yourusername/subtitle-pro-plugin/issues)
- 📖 Documentation: [README.md](README.md)
- 💬 Questions: Open an issue with "Question" label

---

Enjoy your subtitles! 🎬

# Development Guide

Quick guide for local development of Subtitle Pro.

## Development Options

### Option 1: Local Development Server (Recommended)

Use the built-in Node.js development server:

```bash
npm start
```

This starts a simple HTTP server on `http://localhost:3000` that:
- ✅ Works immediately (no Vercel CLI needed)
- ✅ Fast startup
- ✅ Good for quick testing
- ✅ Supports all API endpoints

**Access:**
- Configuration UI: http://localhost:3000/configure
- Test manifest: http://localhost:3000/[config]/manifest.json

### Option 2: Vercel Dev Environment

For testing with Vercel's exact environment:

```bash
# Install Vercel CLI globally (one-time setup)
npm install -g vercel

# Run Vercel dev server
vercel dev
```

This provides:
- ✅ Exact Vercel serverless environment
- ✅ Environment variables from Vercel
- ✅ Edge runtime testing
- ❌ Slower startup (cold starts)

**Note:** Don't use `npm run dev` as it causes recursive invocation. Run `vercel dev` directly.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm start
   ```

3. **Open browser:**
   ```
   http://localhost:3000/configure
   ```

4. **Test the addon:**
   - Enter API keys (or test keys)
   - Select languages
   - Generate install link
   - Test in Stremio

## Testing

Run the config encoding/decoding test:

```bash
npm test
```

## Project Structure

```
subtitle-pro-plugin/
├── api/                    # Serverless functions
│   ├── _lib/              # Utilities
│   ├── manifest.js        # Manifest endpoint
│   ├── configure.js       # Config UI
│   └── subtitles/         # Subtitle handlers
├── web/                    # Static files
│   ├── index.html
│   ├── styles.css
│   └── app.js
└── server.js              # Local dev server
```

## API Endpoints

Local development server supports all endpoints:

### Configuration UI
```
GET /
GET /configure
```

### Addon Manifest
```
GET /:config/manifest.json
```

### Movie Subtitles
```
GET /:config/subtitles/movie/:id.json
```

### Series Subtitles
```
GET /:config/subtitles/series/:id.json
```

## Example Requests

### Get Manifest
```bash
# Create test config
CONFIG=$(echo '{"languages":["eng"],"providers":{"opensubtitles":{"enabled":true,"apiKey":"test"}}}' | base64)

# Request manifest
curl http://localhost:3000/$CONFIG/manifest.json
```

### Get Movie Subtitles
```bash
# The Shawshank Redemption (tt0111161)
curl "http://localhost:3000/$CONFIG/subtitles/movie/tt0111161.json"
```

### Get Series Subtitles
```bash
# Game of Thrones S01E01 (tt0944947:1:1)
curl "http://localhost:3000/$CONFIG/subtitles/series/tt0944947:1:1.json"
```

## Common Tasks

### Add New Provider

1. Create provider in `api/_lib/providers/new-provider.js`
2. Extend `BaseProvider` class
3. Implement `search()` and `normalizeResponse()` methods
4. Add rate limiter in `api/_lib/utils/rate-limiter.js`
5. Update subtitle handlers to include new provider
6. Update configuration UI in `api/configure.js`
7. Test locally with `npm start`

### Update UI Styles

1. Edit `web/styles.css`
2. Refresh browser (no build step needed)
3. Test on mobile viewport

### Debug API Issues

1. Check server console for error logs
2. Use browser DevTools Network tab
3. Test API endpoints directly with `curl`
4. Check `api/_lib/utils/error-handler.js` for error codes

## Troubleshooting

### Port Already in Use

If port 3000 is busy:

```bash
# Use different port
PORT=3001 npm start
```

### Module Import Errors

Ensure `package.json` has `"type": "module"`:

```json
{
  "type": "module"
}
```

### API Keys Not Working

For local testing, you can use dummy API keys in the configuration UI. The local server will handle the requests, but actual subtitle searches require valid API keys.

### Vercel Dev Issues

If `vercel dev` has problems:

1. Remove `.vercel` directory:
   ```bash
   rm -rf .vercel
   ```

2. Run `vercel` first to link project:
   ```bash
   vercel
   ```

3. Then run dev:
   ```bash
   vercel dev
   ```

## Hot Reload

The local dev server (`npm start`) does NOT have hot reload. Restart the server after changes:

1. Press `Ctrl+C` to stop
2. Run `npm start` again

For automatic reload, consider using `nodemon`:

```bash
# Install nodemon
npm install -g nodemon

# Run with auto-reload
nodemon server.js
```

## Environment Variables

Create `.env` file for local development:

```env
# Optional: Default API keys for testing
OPENSUBTITLES_API_KEY=your_test_key
SUBSOURCE_API_KEY=your_test_key
PORT=3000
```

Load with:

```bash
# Install dotenv
npm install dotenv

# Use in server.js (already implemented)
```

## Deployment Testing

Before deploying:

1. ✅ Run tests: `npm test`
2. ✅ Test all endpoints locally
3. ✅ Check error handling
4. ✅ Verify mobile responsiveness
5. ✅ Test with real API keys

Then deploy:

```bash
vercel --prod
```

## Resources

- [Stremio Addon SDK](https://github.com/Stremio/stremio-addon-sdk)
- [Vercel Documentation](https://vercel.com/docs)
- [Node.js HTTP Module](https://nodejs.org/api/http.html)

## Need Help?

- Check `CLAUDE.md` for project rules
- See `CONTRIBUTING.md` for contribution guidelines
- Open an issue: https://github.com/tuyentv96/subtitle-pro-plugin/issues

---

**Happy Coding! 🚀**

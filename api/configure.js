/**
 * Configuration UI endpoint
 * Serves the HTML configuration page
 */
export default async function handler(req, res) {
  // Get the base URL for generating install links
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const baseUrl = `${protocol}://${host}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Subtitle Pro - Configuration</title>
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <div class="container">
    <header class="hero">
      <div class="logo">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="64" rx="12" fill="url(#gradient)"/>
          <path d="M16 24h32M16 32h32M16 40h24" stroke="white" stroke-width="4" stroke-linecap="round"/>
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="64" y2="64">
              <stop offset="0%" stop-color="#6366f1"/>
              <stop offset="100%" stop-color="#8b5cf6"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <h1>Subtitle Pro</h1>
      <p class="subtitle">Multi-provider subtitle search for Stremio</p>
    </header>

    <form id="configForm">
      <!-- OpenSubtitles Provider -->
      <div class="card">
        <div class="card-header">
          <h2>OpenSubtitles</h2>
        </div>
        <div class="card-body">
          <p class="help-text">The largest subtitle database with millions of subtitles</p>
          <div class="form-group">
            <label for="osApiKey">API Key (optional)</label>
            <input
              type="text"
              id="osApiKey"
              name="osApiKey"
              placeholder="Enter your OpenSubtitles API key"
            >
            <a href="https://www.opensubtitles.com/en/consumers" target="_blank" class="link">
              Get your API key →
            </a>
          </div>
        </div>
      </div>

      <!-- Subsource Provider -->
      <div class="card">
        <div class="card-header">
          <h2>Subsource</h2>
        </div>
        <div class="card-body">
          <p class="help-text">Alternative subtitle provider with quality subtitles</p>
          <div class="form-group">
            <label for="ssApiKey">API Key (optional)</label>
            <input
              type="text"
              id="ssApiKey"
              name="ssApiKey"
              placeholder="Enter your Subsource API key"
            >
            <a href="https://subsource.net/api" target="_blank" class="link">
              Get your API key →
            </a>
          </div>
        </div>
      </div>

      <!-- Language Selection -->
      <div class="card">
        <div class="card-header">
          <h2>Languages</h2>
        </div>
        <div class="card-body">
          <p class="help-text">Select subtitle languages (hold Ctrl/Cmd for multiple)</p>
          <div class="form-group">
            <select id="languages" name="languages" multiple size="8">
              <option value="eng" selected>English</option>
              <option value="spa">Spanish</option>
              <option value="fra">French</option>
              <option value="deu">German</option>
              <option value="ita">Italian</option>
              <option value="por">Portuguese</option>
              <option value="rus">Russian</option>
              <option value="ara">Arabic</option>
              <option value="jpn">Japanese</option>
              <option value="kor">Korean</option>
              <option value="zho">Chinese</option>
              <option value="hin">Hindi</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <button type="submit" class="btn-primary">Generate Install Link</button>
    </form>

    <!-- Result Section -->
    <div id="result" class="result hidden">
      <div class="card success">
        <div class="card-header">
          <h2>✓ Configuration Ready</h2>
        </div>
        <div class="card-body">
          <p class="help-text">Click the button below to install the addon in Stremio:</p>
          <a id="installLink" href="#" class="btn-install">Install in Stremio</a>
          <button id="copyLink" class="btn-secondary">Copy Install URL</button>
          <div class="manifest-url">
            <code id="manifestUrl"></code>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    window.BASE_URL = '${baseUrl}';
  </script>
  <script src="/app.js"></script>
</body>
</html>
  `;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}

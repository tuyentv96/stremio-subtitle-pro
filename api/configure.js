import { LANGUAGES, LANGUAGE_MAP } from './_lib/utils/languages.js';

/**
 * Configuration UI endpoint
 * Serves the HTML configuration page
 */
export default async function handler(req, res) {
  // Get the base URL for generating install links
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const baseUrl = `${protocol}://${host}`;

  // Generate language options HTML
  const languageOptions = LANGUAGES.map(lang =>
    `<option value="${lang.code}">${lang.name}</option>`
  ).join('\n        ');

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
      <!-- Subtitle Provider Configuration -->
      <div class="card">
        <div class="card-header">
          <h2>Subtitle Provider Configuration</h2>
        </div>
        <div class="card-body">
          <div class="provider-group">
            <h3 class="provider-title">OpenSubtitles</h3>
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
          <div class="provider-group">
            <h3 class="provider-title">Subsource</h3>
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
      </div>

      <!-- Subtitle Configuration -->
      <div class="card">
        <div class="card-header">
          <h2>Subtitle Configuration</h2>
        </div>
        <div class="card-body">
          <p class="help-text">Configure single or dual language subtitles. Select "None" for secondary to enable single language mode.</p>
          <div class="pair-labels">
            <span class="pair-label">Primary Language</span>
            <span class="pair-label">Secondary Language</span>
            <span class="pair-label-spacer"></span>
          </div>
          <div id="subtitlePairsContainer">
            <!-- Pairs will be added here dynamically -->
          </div>
          <button type="button" id="addSubtitlePair" class="btn-secondary">
            + Add Language
          </button>
        </div>
      </div>

      <!-- Template for subtitle pair -->
      <template id="subtitlePairTemplate">
        <div class="subtitle-pair">
          <select class="primary-lang-select" required>
            <option value="">Primary...</option>
            ${languageOptions}
          </select>
          <select class="secondary-lang-select">
            <option value="">None (single)</option>
            ${languageOptions}
          </select>
          <button type="button" class="btn-remove-pair">Remove</button>
        </div>
      </template>

      <!-- Install Section -->
      <div class="card install-card">
        <div class="card-header">
          <h2>Install Addon</h2>
        </div>
        <div class="card-body">
          <p class="help-text">Click the button below to install the addon in Stremio:</p>
          <a id="installLink" href="#" class="btn-install">Install in Stremio</a>
          <button id="copyLink" class="btn-copy">Copy Install URL</button>
          <div class="manifest-url">
            <code id="manifestUrl"></code>
          </div>
        </div>
      </div>
    </form>
  </div>

  <script>
    window.BASE_URL = '${baseUrl}';
    window.LANGUAGE_MAP = ${JSON.stringify(LANGUAGE_MAP)};
  </script>
  <script src="/app.js"></script>
  <script>
    window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  </script>
  <script defer src="/_vercel/insights/script.js"></script>
</body>
</html>
  `;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}

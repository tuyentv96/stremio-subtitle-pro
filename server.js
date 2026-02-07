#!/usr/bin/env node

/**
 * Simple local development server for testing the Stremio addon
 * Alternative to `vercel dev`
 *
 * Usage: npm start
 * Then visit: http://localhost:3000/configure
 */

import http from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 3000;

// Import API handlers
const handlers = {
  manifest: null,
  configure: null,
  movieSubtitles: null,
  seriesSubtitles: null,
  mergedSubtitles: null,
  debugManifest: null
};

// Load handlers dynamically
async function loadHandlers() {
  const manifestModule = await import('./api/manifest.js');
  const configureModule = await import('./api/configure.js');
  const movieModule = await import('./api/subtitles/movie/[id].js');
  const seriesModule = await import('./api/subtitles/series/[id].js');
  const mergedModule = await import('./api/subtitles/merged/[pairId].js');
  const debugModule = await import('./api/debug-manifest.js');

  handlers.manifest = manifestModule.default;
  handlers.configure = configureModule.default;
  handlers.movieSubtitles = movieModule.default;
  handlers.seriesSubtitles = seriesModule.default;
  handlers.mergedSubtitles = mergedModule.default;
  handlers.debugManifest = debugModule.default;
}

// Simple request/response wrapper to match Vercel's API
class Request {
  constructor(req, params = {}) {
    this.url = req.url;
    this.method = req.method;
    this.headers = req.headers;
    this.query = { ...params };
  }
}

class Response {
  constructor(res) {
    this.res = res;
    this.statusCode = 200;
    this.headers = {};
  }

  status(code) {
    this.statusCode = code;
    return this;
  }

  setHeader(key, value) {
    this.headers[key] = value;
    return this;
  }

  json(data) {
    this.headers['Content-Type'] = 'application/json';
    this.res.writeHead(this.statusCode, this.headers);
    this.res.end(JSON.stringify(data));
  }

  send(data) {
    if (!this.headers['Content-Type']) {
      this.headers['Content-Type'] = 'text/html';
    }
    this.res.writeHead(this.statusCode, this.headers);
    this.res.end(data);
  }

  end() {
    this.res.writeHead(this.statusCode, this.headers);
    this.res.end();
  }
}

// Route matching
function matchRoute(url) {
  // Root and /configure
  if (url === '/' || url === '/configure') {
    return { handler: 'configure', params: {} };
  }

  // Debug manifest: /debug/:config/manifest.json
  const debugManifestMatch = url.match(/^\/debug\/([^/]+)\/manifest\.json$/);
  if (debugManifestMatch) {
    return { handler: 'debugManifest', params: { config: debugManifestMatch[1] } };
  }

  // Manifest: /:config/manifest.json
  const manifestMatch = url.match(/^\/([^/]+)\/manifest\.json$/);
  if (manifestMatch) {
    return { handler: 'manifest', params: { config: manifestMatch[1] } };
  }

  // Movie subtitles: /:config/subtitles/movie/:id.json
  const movieMatch = url.match(/^\/([^/]+)\/subtitles\/movie\/([^/]+)\.json$/);
  if (movieMatch) {
    return {
      handler: 'movieSubtitles',
      params: { config: movieMatch[1], id: movieMatch[2] }
    };
  }

  // Series subtitles: /:config/subtitles/series/:id.json
  const seriesMatch = url.match(/^\/([^/]+)\/subtitles\/series\/([^/]+)\.json$/);
  if (seriesMatch) {
    return {
      handler: 'seriesSubtitles',
      params: { config: seriesMatch[1], id: seriesMatch[2] }
    };
  }

  // Merged subtitles: /:config/subtitles/merged/:pairId.srt
  const mergedMatch = url.match(/^\/([^/]+)\/subtitles\/merged\/([^/]+)\.srt(.*)$/);
  if (mergedMatch) {
    // Parse query string for primaryUrl and secondaryUrl
    const queryString = mergedMatch[3];
    const params = { config: mergedMatch[1], pairId: mergedMatch[2] };

    if (queryString) {
      const urlParams = new URLSearchParams(queryString.substring(1)); // Remove leading ?
      params.primaryUrl = urlParams.get('primaryUrl');
      params.secondaryUrl = urlParams.get('secondaryUrl');
    }

    return {
      handler: 'mergedSubtitles',
      params
    };
  }

  // Static files
  if (url.match(/\.(css|js|html|png|jpg|svg|ico)$/)) {
    return { handler: 'static', params: { file: url } };
  }

  return null;
}

// Serve static files
function serveStatic(filePath, res) {
  const fullPath = join(__dirname, 'public', filePath);

  fs.readFile(fullPath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = filePath.split('.').pop();
    const contentTypes = {
      'html': 'text/html',
      'css': 'text/css',
      'js': 'application/javascript',
      'json': 'application/json',
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'svg': 'image/svg+xml',
      'ico': 'image/x-icon'
    };

    res.writeHead(200, {
      'Content-Type': contentTypes[ext] || 'text/plain',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(data);
  });
}

// Create server
const server = http.createServer(async (req, res) => {
  const route = matchRoute(req.url);

  if (!route) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
    return;
  }

  try {
    if (route.handler === 'static') {
      serveStatic(route.params.file, res);
      return;
    }

    const request = new Request(req, route.params);
    const response = new Response(res);

    // Call the appropriate handler
    await handlers[route.handler](request, response);
  } catch (error) {
    console.error('Error handling request:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
});

// Start server
(async () => {
  try {
    console.log('Loading API handlers...');
    await loadHandlers();

    server.listen(PORT, () => {
      console.log('\n╔════════════════════════════════════════════════╗');
      console.log('║   Subtitle Pro Development Server Running     ║');
      console.log('╚════════════════════════════════════════════════╝\n');
      console.log(`🚀 Server:        http://localhost:${PORT}`);
      console.log(`⚙️  Configuration: http://localhost:${PORT}/configure`);
      console.log(`\n📝 Press Ctrl+C to stop\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();

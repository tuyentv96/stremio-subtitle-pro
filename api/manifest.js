import { parseConfig } from './_lib/utils/config-parser.js';
import { createErrorResponse } from './_lib/utils/error-handler.js';

/**
 * Stremio addon manifest endpoint
 * Returns addon metadata and capabilities
 */
export default async function handler(req, res) {
  try {
    // Extract config from query parameter
    const configParam = req.query.config;

    if (!configParam) {
      return res.status(400).json({
        error: 'Configuration parameter is required'
      });
    }

    // Parse and validate config
    const config = parseConfig(configParam);

    // Build provider list for description
    const enabledProviders = [];
    if (config.providers.opensubtitles?.enabled) {
      enabledProviders.push('OpenSubtitles');
    }
    if (config.providers.subsource?.enabled) {
      enabledProviders.push('Subsource');
    }

    // Create manifest
    const manifest = {
      id: 'com.subtitle.pro',
      version: '1.0.0',
      name: 'Subtitle Pro',
      description: `Multi-provider subtitle search (${enabledProviders.join(' + ')}) with support for ${config.languages.length} languages`,
      resources: ['subtitles'],
      types: ['movie', 'series'],
      idPrefixes: ['tt'],
      catalogs: [],
      behaviorHints: {
        configurable: true,
        configurationRequired: false
      },
      logo: 'https://via.placeholder.com/256x256/6366f1/ffffff?text=SP',
      background: 'https://via.placeholder.com/1920x1080/1e1b4b/6366f1?text=Subtitle+Pro'
    };

    // Return manifest with CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    return res.status(200).json(manifest);
  } catch (error) {
    console.error('Manifest error:', error);
    const errorResponse = createErrorResponse(error, 400);
    return res.status(errorResponse.statusCode).json(JSON.parse(errorResponse.body));
  }
}

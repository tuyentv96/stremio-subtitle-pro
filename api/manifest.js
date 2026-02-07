import { parseConfig } from './_lib/utils/config-parser.js';
import { createErrorResponse } from './_lib/utils/error-handler.js';

/**
 * Stremio addon manifest endpoint
 * Returns addon metadata and capabilities
 */
export default async function handler(req, res) {
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  try {
    // Extract config from query parameter
    const configParam = req.query.config;

    console.log('Manifest request:', {
      method: req.method,
      url: req.url,
      hasConfig: !!configParam,
      configLength: configParam?.length
    });

    if (!configParam) {
      console.error('Missing config parameter. Query:', req.query);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', 'application/json');
      return res.status(400).json({
        error: 'Configuration parameter is required'
      });
    }

    // Parse and validate config
    console.log('Parsing config...');
    const config = parseConfig(configParam);
    console.log('Config parsed successfully:', {
      pairsCount: config.subtitlePairs.length,
      providers: Object.keys(config.providers).filter(p => config.providers[p]?.enabled)
    });

    // Build provider list for description
    const enabledProviders = [];
    if (config.providers.opensubtitles?.enabled) {
      enabledProviders.push('OpenSubtitles');
    }
    if (config.providers.subsource?.enabled) {
      enabledProviders.push('Subsource');
    }

    // Count unique languages from subtitle pairs
    const uniqueLanguages = new Set();
    config.subtitlePairs.forEach(pair => {
      uniqueLanguages.add(pair.primary);
      if (pair.secondary) {
        uniqueLanguages.add(pair.secondary);
      }
    });

    // Create manifest
    const manifest = {
      id: 'com.subtitle.pro',
      version: '1.0.0',
      name: 'Subtitle Pro',
      description: `Multi-provider subtitle search (${enabledProviders.join(' + ')}) with support for ${uniqueLanguages.size} languages`,
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

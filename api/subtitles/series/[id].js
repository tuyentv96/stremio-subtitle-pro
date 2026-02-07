import { parseConfig } from '../../_lib/utils/config-parser.js';
import { handleError, SubtitleError } from '../../_lib/utils/error-handler.js';
import { rateLimiters } from '../../_lib/utils/rate-limiter.js';
import { OpenSubtitlesProvider } from '../../_lib/providers/opensubtitles.js';
import { SubsourceProvider } from '../../_lib/providers/subsource.js';

/**
 * Subtitle handler for TV series
 * Route: /[config]/subtitles/series/[id].json
 * ID format: tt1234567:1:5 (imdbId:season:episode)
 */
export default async function handler(req, res) {
  try {
    // Extract parameters
    const configParam = req.query.config;
    const { id } = req.query;

    // Validate parameters
    if (!configParam) {
      throw new SubtitleError('Configuration parameter is required', 'INVALID_CONFIG', 400);
    }

    if (!id) {
      throw new SubtitleError('Series ID is required', 'INVALID_PARAMS', 400);
    }

    // Parse series ID (format: tt1234567:1:5)
    const [imdbId, season, episode] = id.split(':');

    if (!imdbId || !season || !episode) {
      throw new SubtitleError(
        'Invalid series ID format. Expected: imdbId:season:episode',
        'INVALID_PARAMS',
        400
      );
    }

    // Parse config
    const config = parseConfig(configParam);

    // Build search parameters
    const searchParams = {
      imdbId,
      type: 'series',
      season: parseInt(season, 10),
      episode: parseInt(episode, 10),
      languages: config.languages
    };

    // Initialize providers
    const providers = [];
    const providerInstances = {};

    if (config.providers.opensubtitles?.enabled) {
      try {
        providerInstances.opensubtitles = new OpenSubtitlesProvider(
          config.providers.opensubtitles,
          rateLimiters.opensubtitles
        );
        providers.push('opensubtitles');
      } catch (error) {
        console.error('Failed to initialize OpenSubtitles:', error.message);
      }
    }

    if (config.providers.subsource?.enabled) {
      try {
        providerInstances.subsource = new SubsourceProvider(
          config.providers.subsource,
          rateLimiters.subsource
        );
        providers.push('subsource');
      } catch (error) {
        console.error('Failed to initialize Subsource:', error.message);
      }
    }

    // Check if any providers are available
    if (providers.length === 0) {
      return res.status(200).json({ subtitles: [] });
    }

    // Determine query order based on preferences
    const primaryProvider = config.preferences.priorityProvider;
    const fallbackEnabled = config.preferences.fallbackEnabled;

    let subtitles = [];
    let primarySuccess = false;

    // Try primary provider first
    if (providers.includes(primaryProvider) && providerInstances[primaryProvider]) {
      try {
        const results = await providerInstances[primaryProvider].search(searchParams);
        subtitles = subtitles.concat(results);
        primarySuccess = true;
      } catch (error) {
        console.error(`Primary provider (${primaryProvider}) failed:`, error.message);
      }
    }

    // Try fallback provider if enabled and primary failed or returned no results
    if (fallbackEnabled && (!primarySuccess || subtitles.length === 0)) {
      const fallbackProvider = providers.find(p => p !== primaryProvider);

      if (fallbackProvider && providerInstances[fallbackProvider]) {
        try {
          const results = await providerInstances[fallbackProvider].search(searchParams);
          subtitles = subtitles.concat(results);
        } catch (error) {
          console.error(`Fallback provider (${fallbackProvider}) failed:`, error.message);
        }
      }
    }

    // If both providers are enabled and fallback is enabled, query both
    if (fallbackEnabled && providers.length > 1 && primarySuccess) {
      const secondaryProvider = providers.find(p => p !== primaryProvider);

      if (secondaryProvider && providerInstances[secondaryProvider]) {
        try {
          const results = await providerInstances[secondaryProvider].search(searchParams);
          subtitles = subtitles.concat(results);
        } catch (error) {
          console.error(`Secondary provider (${secondaryProvider}) failed:`, error.message);
        }
      }
    }

    // Deduplicate subtitles by ID
    const uniqueSubtitles = Array.from(
      new Map(subtitles.map(sub => [sub.id, sub])).values()
    );

    // Return Stremio-compatible response
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({ subtitles: uniqueSubtitles });
  } catch (error) {
    console.error('Subtitle handler error:', error);
    const errorResponse = handleError(error, { type: 'series' });
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(errorResponse);
  }
}

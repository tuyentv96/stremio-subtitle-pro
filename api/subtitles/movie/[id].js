import { parseConfig } from '../../_lib/utils/config-parser.js';
import { handleError, SubtitleError } from '../../_lib/utils/error-handler.js';
import { rateLimiters } from '../../_lib/utils/rate-limiter.js';
import { OpenSubtitlesProvider } from '../../_lib/providers/opensubtitles.js';
import { SubsourceProvider } from '../../_lib/providers/subsource.js';

/**
 * Subtitle handler for movies
 * Route: /[config]/subtitles/movie/[id].json
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
      throw new SubtitleError('Movie ID is required', 'INVALID_PARAMS', 400);
    }

    // Parse config
    const config = parseConfig(configParam);

    // Build search parameters
    const searchParams = {
      imdbId: id,
      type: 'movie',
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

    // Query all enabled providers in parallel
    const searchPromises = providers.map(async (providerName) => {
      try {
        const results = await providerInstances[providerName].search(searchParams);
        return results;
      } catch (error) {
        console.error(`Provider ${providerName} failed:`, error.message);
        return [];
      }
    });

    // Wait for all providers to respond
    const allResults = await Promise.all(searchPromises);

    // Flatten and merge results from all providers
    const subtitles = allResults.flat();

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
    const errorResponse = handleError(error, { type: 'movie' });
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(errorResponse);
  }
}

import { parseConfig } from '../../_lib/utils/config-parser.js';
import { handleError, SubtitleError } from '../../_lib/utils/error-handler.js';
import { rateLimiters } from '../../_lib/utils/rate-limiter.js';
import { OpenSubtitlesProvider } from '../../_lib/providers/opensubtitles.js';
import { SubsourceProvider } from '../../_lib/providers/subsource.js';
import { getLanguageName } from '../../_lib/utils/languages.js';

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

    // Get all unique languages needed (collect from all pairs)
    const languagesNeeded = new Set();
    config.subtitlePairs.forEach(pair => {
      languagesNeeded.add(pair.primary);
      if (pair.secondary) {
        languagesNeeded.add(pair.secondary);
      }
    });

    // Build search parameters with all unique languages
    const searchParams = {
      imdbId,
      type: 'series',
      season: parseInt(season, 10),
      episode: parseInt(episode, 10),
      languages: Array.from(languagesNeeded)
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
    const availableSubtitles = Array.from(
      new Map(subtitles.map(sub => [sub.id, sub])).values()
    );

    // Build subtitle entries from configured pairs
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const baseUrl = `${protocol}://${host}`;

    const subtitleEntries = [];

    for (const pair of config.subtitlePairs) {
      if (!pair.enabled) continue;

      const primarySub = availableSubtitles.find(s => s.lang === pair.primary);

      if (!primarySub) continue; // Skip if primary language not available

      if (!pair.secondary) {
        // Single language mode: just add primary subtitle
        subtitleEntries.push(primarySub);
      } else {
        // Dual language mode: create merged subtitle
        const secondarySub = availableSubtitles.find(s => s.lang === pair.secondary);

        if (secondarySub) {
          const mergedId = `dual_${pair.primary}_${pair.secondary}_${id}`;

          subtitleEntries.push({
            id: mergedId,
            url: `${baseUrl}/${configParam}/subtitles/merged/${mergedId}.srt?primaryUrl=${encodeURIComponent(primarySub.url)}&secondaryUrl=${encodeURIComponent(secondarySub.url)}`,
            lang: `${getLanguageName(pair.primary)} + ${getLanguageName(pair.secondary)}`
          });
        }
      }
    }

    // Deduplicate final entries
    const uniqueSubtitles = Array.from(
      new Map(subtitleEntries.map(sub => [sub.id, sub])).values()
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

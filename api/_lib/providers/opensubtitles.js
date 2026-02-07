import OpenSubtitles from 'opensubtitles.com';
import { BaseProvider } from './base-provider.js';
import { SubtitleError, ErrorCodes } from '../utils/error-handler.js';

/**
 * OpenSubtitles provider implementation using official REST API
 */
export class OpenSubtitlesProvider extends BaseProvider {
  constructor(config, rateLimiter) {
    super(config, rateLimiter);
    this.name = 'opensubtitles';

    if (!this.isConfigured()) {
      throw new SubtitleError(
        'OpenSubtitles API key is required',
        ErrorCodes.INVALID_CONFIG,
        400,
        this.name
      );
    }

    this.client = new OpenSubtitles({
      apikey: config.apiKey,
      useragent: 'SubtitlePro v1.0'
    });
  }

  /**
   * Search for subtitles on OpenSubtitles
   */
  async search(params) {
    const { imdbId, type, season, episode, languages } = params;

    try {
      // Build search parameters
      const searchParams = {
        imdb_id: this.cleanImdbId(imdbId),
        languages: languages.join(',')
      };

      // Add season/episode for series
      if (type === 'series' && season && episode) {
        searchParams.season_number = season;
        searchParams.episode_number = episode;
      }

      // Execute search with rate limiting
      const response = await this.executeWithRateLimit(async () => {
        return this.client.subtitles(searchParams);
      });

      // Check for errors
      if (!response || !response.data) {
        return [];
      }

      // Normalize and return subtitles
      return response.data.map(subtitle => this.normalizeResponse(subtitle));
    } catch (error) {
      // Handle authentication errors
      if (error.status === 401 || error.statusCode === 401) {
        throw new SubtitleError(
          'Invalid OpenSubtitles API key',
          ErrorCodes.INVALID_API_KEY,
          401,
          this.name
        );
      }

      // Handle rate limit errors
      if (error.status === 429 || error.statusCode === 429) {
        throw new SubtitleError(
          'OpenSubtitles rate limit exceeded',
          ErrorCodes.RATE_LIMIT_EXCEEDED,
          429,
          this.name
        );
      }

      // Generic error
      throw new SubtitleError(
        `OpenSubtitles error: ${error.message}`,
        ErrorCodes.PROVIDER_ERROR,
        500,
        this.name
      );
    }
  }

  /**
   * Normalize OpenSubtitles response to Stremio format
   */
  normalizeResponse(subtitle) {
    const attributes = subtitle.attributes || {};

    return {
      id: `opensubtitles:${subtitle.id || attributes.files?.[0]?.file_id || 'unknown'}`,
      url: attributes.files?.[0]?.file_name
        ? `https://www.opensubtitles.com/download/${attributes.files[0].file_id}`
        : attributes.url || '',
      lang: attributes.language || 'eng',
      // Additional metadata (optional for Stremio)
      fps: attributes.fps,
      downloads: attributes.download_count,
      rating: attributes.ratings,
      hearing_impaired: attributes.hearing_impaired,
      movieReleaseName: attributes.release
    };
  }
}

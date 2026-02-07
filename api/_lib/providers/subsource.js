import fetch from 'node-fetch';
import { BaseProvider } from './base-provider.js';
import { SubtitleError, ErrorCodes } from '../utils/error-handler.js';

/**
 * Subsource provider implementation using custom fetch client
 */
export class SubsourceProvider extends BaseProvider {
  constructor(config, rateLimiter) {
    super(config, rateLimiter);
    this.name = 'subsource';
    this.baseUrl = 'https://api.subsource.net/api';

    if (!this.isConfigured()) {
      throw new SubtitleError(
        'Subsource API key is required',
        ErrorCodes.INVALID_CONFIG,
        400,
        this.name
      );
    }
  }

  /**
   * Make authenticated request to Subsource API
   */
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new SubtitleError(
          'Invalid Subsource API key',
          ErrorCodes.INVALID_API_KEY,
          401,
          this.name
        );
      }

      if (response.status === 429) {
        throw new SubtitleError(
          'Subsource rate limit exceeded',
          ErrorCodes.RATE_LIMIT_EXCEEDED,
          429,
          this.name
        );
      }

      throw new Error(`Subsource API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Search for subtitles on Subsource
   */
  async search(params) {
    const { imdbId, type, season, episode, languages } = params;

    try {
      // Build search query
      let query = `/subtitles/search?imdb=${this.cleanImdbId(imdbId)}`;

      // Add type-specific parameters
      if (type === 'series' && season && episode) {
        query += `&season=${season}&episode=${episode}`;
      }

      // Add languages
      if (languages && languages.length > 0) {
        query += `&language=${languages.join(',')}`;
      }

      // Execute search with rate limiting
      const response = await this.executeWithRateLimit(async () => {
        return this.makeRequest(query);
      });

      // Check response
      if (!response || !response.subtitles || !Array.isArray(response.subtitles)) {
        return [];
      }

      // Filter by language and normalize
      return response.subtitles
        .filter(subtitle => {
          if (!languages || languages.length === 0) return true;
          return languages.includes(subtitle.language);
        })
        .map(subtitle => this.normalizeResponse(subtitle));
    } catch (error) {
      // Re-throw SubtitleError instances
      if (error instanceof SubtitleError) {
        throw error;
      }

      // Wrap other errors
      throw new SubtitleError(
        `Subsource error: ${error.message}`,
        ErrorCodes.PROVIDER_ERROR,
        500,
        this.name
      );
    }
  }

  /**
   * Normalize Subsource response to Stremio format
   */
  normalizeResponse(subtitle) {
    return {
      id: `subsource:${subtitle.id || subtitle.subtitle_id || 'unknown'}`,
      url: subtitle.download_url || subtitle.url || '',
      lang: subtitle.language || 'eng',
      // Additional metadata (optional for Stremio)
      releaseName: subtitle.release_name || subtitle.release,
      downloads: subtitle.download_count,
      rating: subtitle.rating,
      hearing_impaired: subtitle.hearing_impaired || false
    };
  }
}

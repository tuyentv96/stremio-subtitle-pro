/**
 * Abstract base class for subtitle providers
 */

export class BaseProvider {
  constructor(config, rateLimiter) {
    if (new.target === BaseProvider) {
      throw new Error('Cannot instantiate abstract class BaseProvider');
    }
    this.config = config;
    this.rateLimiter = rateLimiter;
    this.name = 'base';
  }

  /**
   * Search for subtitles - must be implemented by subclasses
   * @param {Object} params - Search parameters
   * @param {string} params.imdbId - IMDB ID (e.g., 'tt0111161')
   * @param {string} params.type - Content type ('movie' or 'series')
   * @param {number} [params.season] - Season number (for series)
   * @param {number} [params.episode] - Episode number (for series)
   * @param {string[]} params.languages - Language codes (e.g., ['eng', 'spa'])
   * @returns {Promise<Array>} Array of subtitle objects
   */
  async search(params) {
    throw new Error('search() must be implemented by subclass');
  }

  /**
   * Normalize provider-specific response to Stremio format
   * @param {Object} subtitle - Provider-specific subtitle object
   * @returns {Object} Normalized subtitle: { id, url, lang }
   */
  normalizeResponse(subtitle) {
    throw new Error('normalizeResponse() must be implemented by subclass');
  }

  /**
   * Execute request with rate limiting
   */
  async executeWithRateLimit(fn) {
    if (!this.rateLimiter) {
      return fn();
    }
    return this.rateLimiter.wait(fn);
  }

  /**
   * Extract clean IMDB ID (remove 'tt' prefix)
   */
  cleanImdbId(imdbId) {
    return imdbId.replace(/^tt/, '');
  }

  /**
   * Check if provider is properly configured
   */
  isConfigured() {
    return this.config && this.config.enabled && this.config.apiKey;
  }
}

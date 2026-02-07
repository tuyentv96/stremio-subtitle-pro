/**
 * Custom error classes and centralized error handling
 */

export class SubtitleError extends Error {
  constructor(message, code, statusCode = 500, provider = null) {
    super(message);
    this.name = 'SubtitleError';
    this.code = code;
    this.statusCode = statusCode;
    this.provider = provider;
  }
}

// Error codes
export const ErrorCodes = {
  INVALID_API_KEY: 'INVALID_API_KEY',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  NO_SUBTITLES_FOUND: 'NO_SUBTITLES_FOUND',
  PROVIDER_ERROR: 'PROVIDER_ERROR',
  INVALID_CONFIG: 'INVALID_CONFIG',
  NETWORK_ERROR: 'NETWORK_ERROR'
};

/**
 * Handle errors and return Stremio-compatible response
 */
export function handleError(error, context = {}) {
  console.error(`[Error] ${context.provider || 'System'}:`, error.message, error.stack);

  // Always return valid Stremio format (empty subtitles array)
  return {
    subtitles: [],
    error: {
      message: error.message,
      code: error.code || 'UNKNOWN_ERROR',
      provider: error.provider || context.provider
    }
  };
}

/**
 * Create error response for HTTP endpoints
 */
export function createErrorResponse(error, statusCode = 500) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      error: {
        message: error.message,
        code: error.code || 'UNKNOWN_ERROR'
      }
    })
  };
}

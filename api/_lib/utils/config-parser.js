/**
 * Parse and validate user configuration from Base64-encoded URL parameter
 */

export function parseConfig(configParam) {
  if (!configParam) {
    throw new Error('Configuration parameter is required');
  }

  try {
    // Decode Base64 config
    const decoded = Buffer.from(configParam, 'base64').toString('utf-8');
    const config = JSON.parse(decoded);

    // Validate structure
    if (!config.providers || typeof config.providers !== 'object') {
      throw new Error('Invalid config: providers object is required');
    }

    // Ensure at least one provider is enabled
    const hasEnabledProvider = Object.values(config.providers).some(
      p => p && p.enabled && p.apiKey
    );

    if (!hasEnabledProvider) {
      throw new Error('At least one provider must be enabled with an API key');
    }

    // Apply defaults
    return {
      languages: config.languages || ['eng'],
      providers: {
        opensubtitles: config.providers.opensubtitles || { enabled: false },
        subsource: config.providers.subsource || { enabled: false }
      },
      preferences: {
        priorityProvider: config.preferences?.priorityProvider || 'opensubtitles',
        fallbackEnabled: config.preferences?.fallbackEnabled !== false
      }
    };
  } catch (error) {
    throw new Error(`Failed to parse config: ${error.message}`);
  }
}

/**
 * Create Base64-encoded config string from config object
 */
export function encodeConfig(config) {
  const json = JSON.stringify(config);
  return Buffer.from(json).toString('base64');
}

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

    // Parse subtitle pairs with backward compatibility
    let subtitlePairs = [];

    if (config.subtitlePairs && Array.isArray(config.subtitlePairs)) {
      // New format: use subtitlePairs directly
      subtitlePairs = config.subtitlePairs;
    } else if (config.languages && Array.isArray(config.languages)) {
      // Old format: convert languages array to subtitlePairs with secondary: null
      subtitlePairs = config.languages.map((lang, index) => ({
        id: `pair_${index}_${lang}_null`,
        primary: lang,
        secondary: null,
        enabled: true
      }));
    }

    // Validate and filter pairs
    subtitlePairs = subtitlePairs.filter(pair => {
      // Primary is required
      if (!pair.primary) return false;
      // Primary and secondary must be different if both present
      if (pair.secondary && pair.primary === pair.secondary) return false;
      // Only include enabled pairs
      if (pair.enabled === false) return false;
      return true;
    });

    // Default to English if no valid pairs
    if (subtitlePairs.length === 0) {
      subtitlePairs = [{
        id: 'pair_0_eng_null',
        primary: 'eng',
        secondary: null,
        enabled: true
      }];
    }

    // Apply defaults
    return {
      subtitlePairs,
      providers: {
        opensubtitles: config.providers.opensubtitles || { enabled: false },
        subsource: config.providers.subsource || { enabled: false }
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

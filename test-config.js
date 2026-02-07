/**
 * Test script to verify config encoding/decoding
 */

import { parseConfig, encodeConfig } from './api/_lib/utils/config-parser.js';

// Test configuration
const testConfig = {
  languages: ['eng', 'spa'],
  providers: {
    opensubtitles: {
      enabled: true,
      apiKey: 'test-opensubtitles-key'
    },
    subsource: {
      enabled: true,
      apiKey: 'test-subsource-key'
    }
  }
};

console.log('Testing config encoding/decoding...\n');

// Encode config
const encoded = encodeConfig(testConfig);
console.log('Encoded config:', encoded);
console.log('Encoded length:', encoded.length);

// Decode config
const decoded = parseConfig(encoded);
console.log('\nDecoded config:', JSON.stringify(decoded, null, 2));

// Verify
const isValid =
  decoded.languages.length === testConfig.languages.length &&
  decoded.providers.opensubtitles.enabled === testConfig.providers.opensubtitles.enabled &&
  decoded.providers.subsource.enabled === testConfig.providers.subsource.enabled;

console.log('\n✓ Config encoding/decoding test:', isValid ? 'PASSED' : 'FAILED');

// Generate sample manifest URL
const sampleUrl = `https://your-deployment.vercel.app/${encoded}/manifest.json`;
console.log('\nSample manifest URL:');
console.log(sampleUrl);

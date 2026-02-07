/**
 * Test script to verify config encoding/decoding
 */

import { parseConfig, encodeConfig } from './api/_lib/utils/config-parser.js';

// Test configuration with new subtitlePairs format
const testConfig = {
  subtitlePairs: [
    {
      id: 'pair_0_eng_null',
      primary: 'eng',
      secondary: null,
      enabled: true
    },
    {
      id: 'pair_1_spa_vie',
      primary: 'spa',
      secondary: 'vie',
      enabled: true
    }
  ],
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

// Test old configuration format (backward compatibility)
const oldTestConfig = {
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

console.log('=== Testing NEW config format (subtitlePairs) ===\n');

// Encode new format config
const encoded = encodeConfig(testConfig);
console.log('Encoded config:', encoded);
console.log('Encoded length:', encoded.length);

// Decode config
const decoded = parseConfig(encoded);
console.log('\nDecoded config:', JSON.stringify(decoded, null, 2));

// Verify new format
const isValid =
  decoded.subtitlePairs.length === testConfig.subtitlePairs.length &&
  decoded.subtitlePairs[0].primary === testConfig.subtitlePairs[0].primary &&
  decoded.subtitlePairs[1].primary === testConfig.subtitlePairs[1].primary &&
  decoded.subtitlePairs[1].secondary === testConfig.subtitlePairs[1].secondary &&
  decoded.providers.opensubtitles.enabled === testConfig.providers.opensubtitles.enabled &&
  decoded.providers.subsource.enabled === testConfig.providers.subsource.enabled;

console.log('\n✓ New format test:', isValid ? 'PASSED' : 'FAILED');

// Generate sample manifest URL
const sampleUrl = `https://your-deployment.vercel.app/${encoded}/manifest.json`;
console.log('\nSample manifest URL:');
console.log(sampleUrl);

console.log('\n=== Testing OLD config format (backward compatibility) ===\n');

// Encode old format config
const encodedOld = encodeConfig(oldTestConfig);
console.log('Encoded old config:', encodedOld);
console.log('Encoded length:', encodedOld.length);

// Decode old config
const decodedOld = parseConfig(encodedOld);
console.log('\nDecoded old config:', JSON.stringify(decodedOld, null, 2));

// Verify old format is converted to new format
const isOldValid =
  decodedOld.subtitlePairs.length === oldTestConfig.languages.length &&
  decodedOld.subtitlePairs[0].primary === oldTestConfig.languages[0] &&
  decodedOld.subtitlePairs[0].secondary === null &&
  decodedOld.subtitlePairs[1].primary === oldTestConfig.languages[1] &&
  decodedOld.subtitlePairs[1].secondary === null &&
  decodedOld.providers.opensubtitles.enabled === oldTestConfig.providers.opensubtitles.enabled &&
  decodedOld.providers.subsource.enabled === oldTestConfig.providers.subsource.enabled;

console.log('\n✓ Backward compatibility test:', isOldValid ? 'PASSED' : 'FAILED');

console.log('\n=== Summary ===');
console.log('All tests:', (isValid && isOldValid) ? 'PASSED ✓' : 'FAILED ✗');

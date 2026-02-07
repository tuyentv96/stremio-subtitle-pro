/**
 * Test manifest generation with new config format
 */

import { parseConfig, encodeConfig } from './api/_lib/utils/config-parser.js';

console.log('=== Testing Manifest with NEW config format ===\n');

// Test configuration
const testConfig = {
  subtitlePairs: [
    {
      id: 'pair_0_eng_vie',
      primary: 'eng',
      secondary: 'vie',
      enabled: true
    },
    {
      id: 'pair_1_spa_null',
      primary: 'spa',
      secondary: null,
      enabled: true
    }
  ],
  providers: {
    opensubtitles: {
      enabled: true,
      apiKey: 'test-key'
    },
    subsource: {
      enabled: false
    }
  }
};

// Encode config
const encoded = encodeConfig(testConfig);
console.log('Encoded config:', encoded.substring(0, 50) + '...');

// Parse config (simulating what manifest.js does)
const config = parseConfig(encoded);
console.log('\nParsed config:', JSON.stringify(config, null, 2));

// Simulate manifest generation logic
const enabledProviders = [];
if (config.providers.opensubtitles?.enabled) {
  enabledProviders.push('OpenSubtitles');
}
if (config.providers.subsource?.enabled) {
  enabledProviders.push('Subsource');
}

// Count unique languages from subtitle pairs
const uniqueLanguages = new Set();
config.subtitlePairs.forEach(pair => {
  uniqueLanguages.add(pair.primary);
  if (pair.secondary) {
    uniqueLanguages.add(pair.secondary);
  }
});

console.log('\n--- Manifest Generation ---');
console.log('Enabled providers:', enabledProviders.join(' + '));
console.log('Unique languages:', Array.from(uniqueLanguages).join(', '));
console.log('Language count:', uniqueLanguages.size);

// Create manifest (same as manifest.js)
const manifest = {
  id: 'com.subtitle.pro',
  version: '1.0.0',
  name: 'Subtitle Pro',
  description: `Multi-provider subtitle search (${enabledProviders.join(' + ')}) with support for ${uniqueLanguages.size} languages`,
  resources: ['subtitles'],
  types: ['movie', 'series'],
  idPrefixes: ['tt']
};

console.log('\nGenerated manifest:');
console.log(JSON.stringify(manifest, null, 2));

// Verify
const isValid =
  manifest.description.includes('OpenSubtitles') &&
  manifest.description.includes('3 languages') &&
  manifest.resources.includes('subtitles');

console.log('\n✓ Manifest generation test:', isValid ? 'PASSED' : 'FAILED');

// Test with old format
console.log('\n=== Testing Manifest with OLD config format ===\n');

const oldConfig = {
  languages: ['eng', 'spa'],
  providers: {
    opensubtitles: {
      enabled: true,
      apiKey: 'test-key'
    }
  }
};

const encodedOld = encodeConfig(oldConfig);
const parsedOld = parseConfig(encodedOld);

const uniqueLanguagesOld = new Set();
parsedOld.subtitlePairs.forEach(pair => {
  uniqueLanguagesOld.add(pair.primary);
  if (pair.secondary) {
    uniqueLanguagesOld.add(pair.secondary);
  }
});

console.log('Unique languages from old format:', Array.from(uniqueLanguagesOld).join(', '));
console.log('Language count:', uniqueLanguagesOld.size);

const isOldValid = uniqueLanguagesOld.size === 2;
console.log('\n✓ Old format manifest test:', isOldValid ? 'PASSED' : 'FAILED');

console.log('\n=== Summary ===');
console.log('All tests:', (isValid && isOldValid) ? 'PASSED ✓' : 'FAILED ✗');

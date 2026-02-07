/**
 * Frontend logic for Subtitle Pro configuration UI
 */

(function() {
  'use strict';

  const form = document.getElementById('configForm');
  const installLink = document.getElementById('installLink');
  const copyLinkBtn = document.getElementById('copyLink');
  const manifestUrlEl = document.getElementById('manifestUrl');

  // API key inputs
  const osApiKey = document.getElementById('osApiKey');
  const ssApiKey = document.getElementById('ssApiKey');

  // Subtitle pair management
  let pairCounter = 0;

  /**
   * Add a new subtitle pair
   */
  function addSubtitlePair(primaryLang = '', secondaryLang = '') {
    const template = document.getElementById('subtitlePairTemplate');
    const clone = template.content.cloneNode(true);

    const pairDiv = clone.querySelector('.subtitle-pair');
    pairDiv.dataset.pairId = `pair_${pairCounter++}`;

    // Set default values if provided
    if (primaryLang) {
      clone.querySelector('.primary-lang-select').value = primaryLang;
    }
    if (secondaryLang) {
      clone.querySelector('.secondary-lang-select').value = secondaryLang;
    }

    // Add remove button handler
    const removeBtn = clone.querySelector('.btn-remove-pair');
    removeBtn.addEventListener('click', () => {
      pairDiv.remove();
    });

    document.getElementById('subtitlePairsContainer').appendChild(clone);
  }

  /**
   * Get all configured subtitle pairs
   */
  function getSubtitlePairs() {
    const pairs = document.querySelectorAll('.subtitle-pair');
    return Array.from(pairs).map((pair, index) => {
      const primary = pair.querySelector('.primary-lang-select').value;
      const secondary = pair.querySelector('.secondary-lang-select').value;

      return {
        id: `pair_${index}_${primary}_${secondary || 'null'}`,
        primary,
        secondary: secondary || null,  // Empty string becomes null
        enabled: true
      };
    });
  }

  /**
   * Validate form before submission
   */
  function validateForm() {
    // Check if at least one API key is provided
    const hasOsKey = osApiKey.value.trim().length > 0;
    const hasSsKey = ssApiKey.value.trim().length > 0;

    if (!hasOsKey && !hasSsKey) {
      alert('Please enter at least one API key (OpenSubtitles or Subsource)');
      osApiKey.focus();
      return false;
    }

    // Check if at least one pair is configured
    const pairs = getSubtitlePairs();
    if (pairs.length === 0) {
      alert('Please add at least one language pair');
      return false;
    }

    // Validate each pair
    for (const pair of pairs) {
      // Check if primary is selected
      if (!pair.primary) {
        alert('Please select a primary language for all pairs');
        return false;
      }

      // Check if primary and secondary are different
      if (pair.secondary && pair.primary === pair.secondary) {
        alert('Primary and secondary languages must be different');
        return false;
      }
    }

    return true;
  }

  /**
   * Generate configuration object
   */
  function generateConfig() {
    const osKey = osApiKey.value.trim();
    const ssKey = ssApiKey.value.trim();

    return {
      subtitlePairs: getSubtitlePairs(),
      providers: {
        opensubtitles: {
          enabled: osKey.length > 0,
          apiKey: osKey
        },
        subsource: {
          enabled: ssKey.length > 0,
          apiKey: ssKey
        }
      }
    };
  }

  /**
   * Encode config to Base64
   */
  function encodeConfig(config) {
    const json = JSON.stringify(config);
    return btoa(unescape(encodeURIComponent(json)));
  }

  /**
   * Generate manifest URL
   */
  function generateManifestUrl(configBase64) {
    const baseUrl = window.BASE_URL || window.location.origin;
    return `${baseUrl}/${configBase64}/manifest.json`;
  }

  /**
   * Generate Stremio install URL
   */
  function generateInstallUrl(manifestUrl) {
    return `stremio://${encodeURIComponent(manifestUrl)}`;
  }

  /**
   * Copy text to clipboard
   */
  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    }
  }

  /**
   * Generate and update install URLs
   */
  function updateInstallUrls() {
    // Validate form
    if (!validateForm()) {
      return null;
    }

    // Generate config
    const config = generateConfig();
    console.log('Generated config:', config);

    // Encode config
    const configBase64 = encodeConfig(config);
    console.log('Encoded config:', configBase64);

    // Generate URLs
    const manifestUrl = generateManifestUrl(configBase64);
    const stremioInstallUrl = generateInstallUrl(manifestUrl);

    console.log('Manifest URL:', manifestUrl);
    console.log('Install URL:', stremioInstallUrl);

    // Update UI
    manifestUrlEl.textContent = manifestUrl;
    installLink.href = stremioInstallUrl;

    return { manifestUrl, stremioInstallUrl };
  }

  /**
   * Handle install button click
   */
  function handleInstallClick(event) {
    const urls = updateInstallUrls();
    if (!urls) {
      event.preventDefault();
    }
  }

  /**
   * Handle copy button click
   */
  function handleCopyClick() {
    // Generate URLs first
    const urls = updateInstallUrls();
    if (!urls) {
      return;
    }

    const manifestUrl = manifestUrlEl.textContent;

    copyToClipboard(manifestUrl).then(success => {
      if (success) {
        const originalText = copyLinkBtn.textContent;
        copyLinkBtn.textContent = '✓ Copied!';
        copyLinkBtn.style.background = 'var(--success)';

        setTimeout(() => {
          copyLinkBtn.textContent = originalText;
          copyLinkBtn.style.background = '';
        }, 2000);
      } else {
        alert('Failed to copy to clipboard. Please copy manually.');
      }
    });
  }

  /**
   * Initialize the app
   */
  function init() {
    // Prevent form submission
    form.addEventListener('submit', (e) => e.preventDefault());

    // Add event listeners
    installLink.addEventListener('click', handleInstallClick);
    copyLinkBtn.addEventListener('click', handleCopyClick);

    // Add subtitle pair button handler
    const addPairBtn = document.getElementById('addSubtitlePair');
    addPairBtn.addEventListener('click', () => addSubtitlePair());

    // Add initial pair by default (English, single mode)
    addSubtitlePair('eng', '');

    console.log('Subtitle Pro configuration UI initialized');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

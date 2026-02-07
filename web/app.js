/**
 * Frontend logic for Subtitle Pro configuration UI
 */

(function() {
  'use strict';

  const form = document.getElementById('configForm');
  const resultSection = document.getElementById('result');
  const installLink = document.getElementById('installLink');
  const copyLinkBtn = document.getElementById('copyLink');
  const manifestUrlEl = document.getElementById('manifestUrl');

  // API key inputs
  const osApiKey = document.getElementById('osApiKey');
  const ssApiKey = document.getElementById('ssApiKey');

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

    // Check if at least one language is selected
    const selectedLanguages = getSelectedLanguages();
    if (selectedLanguages.length === 0) {
      alert('Please select at least one language');
      return false;
    }

    return true;
  }

  /**
   * Get selected languages from checkboxes
   */
  function getSelectedLanguages() {
    const checkboxes = document.querySelectorAll('input[name="language"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
  }

  /**
   * Generate configuration object
   */
  function generateConfig() {
    const osKey = osApiKey.value.trim();
    const ssKey = ssApiKey.value.trim();

    return {
      languages: getSelectedLanguages(),
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
   * Handle form submission
   */
  function handleSubmit(event) {
    event.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
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
    resultSection.classList.remove('hidden');

    // Scroll to result
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /**
   * Handle copy button click
   */
  function handleCopyClick() {
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
    // Add event listeners
    form.addEventListener('submit', handleSubmit);
    copyLinkBtn.addEventListener('click', handleCopyClick);

    console.log('Subtitle Pro configuration UI initialized');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

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

  // Provider toggles
  const osEnabled = document.getElementById('osEnabled');
  const osApiKey = document.getElementById('osApiKey');
  const ssEnabled = document.getElementById('ssEnabled');
  const ssApiKey = document.getElementById('ssApiKey');

  // Language selection
  const languageSelect = document.getElementById('languages');

  // Advanced settings
  const priorityProvider = document.getElementById('priorityProvider');
  const fallbackEnabled = document.getElementById('fallbackEnabled');

  /**
   * Toggle API key field based on provider enable state
   */
  function setupProviderToggles() {
    osEnabled.addEventListener('change', function() {
      osApiKey.required = this.checked;
      osApiKey.disabled = !this.checked;
      if (!this.checked) {
        osApiKey.value = '';
      }
    });

    ssEnabled.addEventListener('change', function() {
      ssApiKey.required = this.checked;
      ssApiKey.disabled = !this.checked;
      if (!this.checked) {
        ssApiKey.value = '';
      }
    });

    // Initialize states
    osApiKey.disabled = !osEnabled.checked;
    ssApiKey.disabled = !ssEnabled.checked;
  }

  /**
   * Validate form before submission
   */
  function validateForm() {
    // Check if at least one provider is enabled
    if (!osEnabled.checked && !ssEnabled.checked) {
      alert('Please enable at least one subtitle provider');
      return false;
    }

    // Check if enabled providers have API keys
    if (osEnabled.checked && !osApiKey.value.trim()) {
      alert('Please enter your OpenSubtitles API key');
      osApiKey.focus();
      return false;
    }

    if (ssEnabled.checked && !ssApiKey.value.trim()) {
      alert('Please enter your Subsource API key');
      ssApiKey.focus();
      return false;
    }

    // Check if at least one language is selected
    const selectedLanguages = Array.from(languageSelect.selectedOptions);
    if (selectedLanguages.length === 0) {
      alert('Please select at least one language');
      languageSelect.focus();
      return false;
    }

    return true;
  }

  /**
   * Get selected languages from multi-select
   */
  function getSelectedLanguages() {
    return Array.from(languageSelect.selectedOptions).map(opt => opt.value);
  }

  /**
   * Generate configuration object
   */
  function generateConfig() {
    return {
      languages: getSelectedLanguages(),
      providers: {
        opensubtitles: {
          enabled: osEnabled.checked,
          apiKey: osEnabled.checked ? osApiKey.value.trim() : ''
        },
        subsource: {
          enabled: ssEnabled.checked,
          apiKey: ssEnabled.checked ? ssApiKey.value.trim() : ''
        }
      },
      preferences: {
        priorityProvider: priorityProvider.value,
        fallbackEnabled: fallbackEnabled.checked
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
    setupProviderToggles();

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

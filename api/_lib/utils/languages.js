/**
 * Language definitions and utilities
 * Complete list of supported languages for subtitle configuration
 */

export const LANGUAGES = [
  { code: 'afr', name: 'Afrikaans' },
  { code: 'alb', name: 'Albanian' },
  { code: 'ara', name: 'Arabic' },
  { code: 'arm', name: 'Armenian' },
  { code: 'aze', name: 'Azerbaijani' },
  { code: 'baq', name: 'Basque' },
  { code: 'bel', name: 'Belarusian' },
  { code: 'ben', name: 'Bengali' },
  { code: 'bos', name: 'Bosnian' },
  { code: 'bre', name: 'Breton' },
  { code: 'bul', name: 'Bulgarian' },
  { code: 'bur', name: 'Burmese' },
  { code: 'cat', name: 'Catalan' },
  { code: 'chi', name: 'Chinese (Simplified)' },
  { code: 'zht', name: 'Chinese (Traditional)' },
  { code: 'hrv', name: 'Croatian' },
  { code: 'cze', name: 'Czech' },
  { code: 'dan', name: 'Danish' },
  { code: 'dut', name: 'Dutch' },
  { code: 'eng', name: 'English' },
  { code: 'epo', name: 'Esperanto' },
  { code: 'est', name: 'Estonian' },
  { code: 'fin', name: 'Finnish' },
  { code: 'fra', name: 'French' },
  { code: 'geo', name: 'Georgian' },
  { code: 'deu', name: 'German' },
  { code: 'gre', name: 'Greek' },
  { code: 'heb', name: 'Hebrew' },
  { code: 'hin', name: 'Hindi' },
  { code: 'hun', name: 'Hungarian' },
  { code: 'ice', name: 'Icelandic' },
  { code: 'ind', name: 'Indonesian' },
  { code: 'gle', name: 'Irish' },
  { code: 'ita', name: 'Italian' },
  { code: 'jpn', name: 'Japanese' },
  { code: 'kan', name: 'Kannada' },
  { code: 'kaz', name: 'Kazakh' },
  { code: 'khm', name: 'Khmer' },
  { code: 'kor', name: 'Korean' },
  { code: 'kur', name: 'Kurdish' },
  { code: 'lav', name: 'Latvian' },
  { code: 'lit', name: 'Lithuanian' },
  { code: 'ltz', name: 'Luxembourgish' },
  { code: 'mac', name: 'Macedonian' },
  { code: 'may', name: 'Malay' },
  { code: 'mal', name: 'Malayalam' },
  { code: 'mlt', name: 'Maltese' },
  { code: 'mar', name: 'Marathi' },
  { code: 'mon', name: 'Mongolian' },
  { code: 'nep', name: 'Nepali' },
  { code: 'nor', name: 'Norwegian' },
  { code: 'per', name: 'Persian' },
  { code: 'pol', name: 'Polish' },
  { code: 'por', name: 'Portuguese' },
  { code: 'pob', name: 'Portuguese (Brazil)' },
  { code: 'rum', name: 'Romanian' },
  { code: 'rus', name: 'Russian' },
  { code: 'srp', name: 'Serbian' },
  { code: 'sin', name: 'Sinhala' },
  { code: 'slo', name: 'Slovak' },
  { code: 'slv', name: 'Slovenian' },
  { code: 'som', name: 'Somali' },
  { code: 'spa', name: 'Spanish' },
  { code: 'spl', name: 'Spanish (Latin America)' },
  { code: 'swa', name: 'Swahili' },
  { code: 'swe', name: 'Swedish' },
  { code: 'tgl', name: 'Tagalog' },
  { code: 'tam', name: 'Tamil' },
  { code: 'tel', name: 'Telugu' },
  { code: 'tha', name: 'Thai' },
  { code: 'tur', name: 'Turkish' },
  { code: 'ukr', name: 'Ukrainian' },
  { code: 'urd', name: 'Urdu' },
  { code: 'uzb', name: 'Uzbek' },
  { code: 'vie', name: 'Vietnamese' },
  { code: 'wel', name: 'Welsh' }
];

/**
 * Language code to name mapping for fast lookups
 */
export const LANGUAGE_MAP = Object.fromEntries(
  LANGUAGES.map(lang => [lang.code, lang.name])
);

/**
 * Get human-readable language name from ISO 639-2 code
 * @param {string} code - ISO 639-2 language code (e.g., 'eng', 'vie')
 * @returns {string} - Language name or the code itself if not found
 */
export function getLanguageName(code) {
  return LANGUAGE_MAP[code] || code;
}

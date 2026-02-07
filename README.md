# Subtitle Pro - Stremio Addon

![Deploy to Vercel](https://github.com/yourusername/subtitle-pro-plugin/workflows/Deploy%20to%20Vercel/badge.svg)
![Tests](https://github.com/yourusername/subtitle-pro-plugin/workflows/Tests/badge.svg)
![Code Quality](https://github.com/yourusername/subtitle-pro-plugin/workflows/Code%20Quality/badge.svg)

A powerful multi-provider subtitle addon for Stremio that integrates with **OpenSubtitles** and **Subsource**. Users can configure their own API keys, select preferred languages, and enjoy intelligent provider fallback for maximum reliability.

## Features

✨ **Multi-Provider Support**
- OpenSubtitles integration (official REST API)
- Subsource integration
- Automatic fallback between providers
- Configurable provider priority

🌍 **Language Support**
- Support for 12+ languages
- Multi-language selection
- Customizable language preferences

⚡ **Performance & Reliability**
- Rate limiting to respect provider limits
- Intelligent provider fallback
- Serverless architecture (Vercel)
- Fast subtitle search

🔒 **Privacy & Control**
- User-owned API keys
- No data collection
- Fully stateless
- Self-hosted option

📱 **Modern UI**
- Beautiful configuration interface
- Mobile-responsive design
- Dark theme
- One-click install

## Quick Start

### 1. Get API Keys

**OpenSubtitles** (Required):
1. Visit [OpenSubtitles Consumers](https://www.opensubtitles.com/en/consumers)
2. Create an account or log in
3. Generate an API key

**Subsource** (Optional):
1. Visit [Subsource API](https://subsource.net/api)
2. Sign up for API access
3. Get your API key

### 2. Configure the Addon

1. Visit the configuration page: [Your Deployment URL]/configure
2. Enter your API key(s)
3. Select your preferred subtitle languages
4. (Optional) Configure advanced settings
5. Click "Generate Install Link"

### 3. Install in Stremio

Click the "Install in Stremio" button or copy the manifest URL and add it manually in Stremio.

## Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/subtitle-pro-plugin)

Or manually:

```bash
# Install Vercel CLI
npm install -g vercel

# Clone the repository
git clone https://github.com/yourusername/subtitle-pro-plugin.git
cd subtitle-pro-plugin

# Install dependencies
npm install

# Deploy
vercel --prod
```

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Visit http://localhost:3000/configure
```

## Project Structure

```
subtitle-pro-plugin/
├── api/                          # Vercel serverless functions
│   ├── manifest.js               # Addon manifest endpoint
│   ├── configure.js              # Configuration UI endpoint
│   ├── subtitles/
│   │   ├── movie/[id].js         # Movie subtitle handler
│   │   └── series/[id].js        # TV series subtitle handler
│   └── _lib/                     # Utilities
│       ├── providers/
│       │   ├── base-provider.js  # Provider interface
│       │   ├── opensubtitles.js  # OpenSubtitles client
│       │   └── subsource.js      # Subsource client
│       └── utils/
│           ├── config-parser.js  # Config parser
│           ├── error-handler.js  # Error handling
│           └── rate-limiter.js   # Rate limiting
├── web/                          # Static web UI
│   ├── styles.css                # Styling
│   └── app.js                    # Frontend logic
├── vercel.json                   # Vercel configuration
├── package.json
└── README.md
```

## How It Works

### Configuration Flow

1. User visits `/configure` page
2. Enters API keys and selects languages
3. Clicks "Generate Install Link"
4. Frontend creates config object and Base64-encodes it
5. Generates manifest URL: `https://[domain]/[config]/manifest.json`
6. User installs addon in Stremio

### Subtitle Search Flow

1. User plays content in Stremio
2. Stremio requests subtitles from addon
3. Serverless function:
   - Parses config from URL
   - Queries primary provider
   - Falls back to secondary if needed
   - Merges and deduplicates results
4. Returns subtitles to Stremio

## API Endpoints

### `GET /[config]/manifest.json`

Returns the Stremio addon manifest.

**Parameters:**
- `config`: Base64-encoded configuration

**Response:**
```json
{
  "id": "com.subtitle.pro",
  "version": "1.0.0",
  "name": "Subtitle Pro",
  "resources": ["subtitles"],
  "types": ["movie", "series"]
}
```

### `GET /[config]/subtitles/movie/[id].json`

Returns subtitles for a movie.

**Parameters:**
- `config`: Base64-encoded configuration
- `id`: IMDB ID (e.g., `tt0111161`)

**Response:**
```json
{
  "subtitles": [
    {
      "id": "opensubtitles:12345",
      "url": "https://...",
      "lang": "eng"
    }
  ]
}
```

### `GET /[config]/subtitles/series/[id].json`

Returns subtitles for a TV series episode.

**Parameters:**
- `config`: Base64-encoded configuration
- `id`: Format `imdbId:season:episode` (e.g., `tt0944947:1:1`)

**Response:**
```json
{
  "subtitles": [
    {
      "id": "subsource:67890",
      "url": "https://...",
      "lang": "spa"
    }
  ]
}
```

## Configuration Options

### Providers

- **OpenSubtitles**: Largest subtitle database
- **Subsource**: Alternative high-quality provider

### Languages

Supported languages include:
- English (eng)
- Spanish (spa)
- French (fra)
- German (deu)
- Italian (ita)
- Portuguese (por)
- Russian (rus)
- Arabic (ara)
- Japanese (jpn)
- Korean (kor)
- Chinese (zho)
- Hindi (hin)

### Advanced Settings

- **Primary Provider**: Choose which provider to query first
- **Fallback**: Enable automatic fallback to secondary provider

## Rate Limits

- **OpenSubtitles**: 5 requests/second (enforced by p-queue)
- **Subsource**: 10 requests/second (adjustable)

## Troubleshooting

### Subtitles not appearing

1. Check if your API keys are valid
2. Verify the selected languages match available subtitles
3. Try enabling both providers with fallback
4. Check browser console for errors

### Invalid API Key error

1. Regenerate your API key from the provider
2. Update the configuration with the new key
3. Reinstall the addon in Stremio

### Rate limit errors

- Wait a few seconds and try again
- Rate limits are per-user (your API key)
- Consider enabling fallback to distribute load

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Credits

Built with:
- [Stremio Addon SDK](https://github.com/Stremio/stremio-addon-sdk)
- [OpenSubtitles API](https://www.opensubtitles.com/api)
- [Subsource API](https://subsource.net/api)
- [Vercel](https://vercel.com)

## Support

For issues and feature requests, please use the [GitHub issue tracker](https://github.com/yourusername/subtitle-pro-plugin/issues).

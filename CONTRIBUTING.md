# Contributing to Subtitle Pro

Thank you for your interest in contributing to Subtitle Pro! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Keep discussions on-topic

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/tuyentv96/subtitle-pro-plugin/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Your environment (OS, Stremio version, browser)

### Suggesting Features

1. Check existing issues for similar suggestions
2. Create a new issue with:
   - Clear description of the feature
   - Use case and motivation
   - Potential implementation approach (optional)

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit with clear messages (`git commit -m 'Add amazing feature'`)
6. Push to your fork (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Development Setup

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Git

### Setup

```bash
# Clone your fork
git clone https://github.com/tuyentv96/subtitle-pro-plugin.git
cd subtitle-pro-plugin

# Install dependencies
npm install

# Run tests
npm test

# Start development server
npm run dev
```

### Testing Locally

1. Get API keys for OpenSubtitles and/or Subsource
2. Visit `http://localhost:3000/configure`
3. Enter your API keys and configure
4. Generate install link
5. Test in Stremio

## Project Structure

```
subtitle-pro-plugin/
├── api/                    # Serverless functions
│   ├── _lib/              # Utilities and providers
│   ├── manifest.js        # Manifest endpoint
│   ├── configure.js       # Config UI endpoint
│   └── subtitles/         # Subtitle handlers
├── web/                    # Frontend assets
│   ├── styles.css         # Styling
│   └── app.js             # Frontend logic
├── vercel.json            # Vercel configuration
└── package.json
```

## Coding Guidelines

### JavaScript Style

- Use ES6+ features (const, let, arrow functions, etc.)
- Use async/await for asynchronous code
- Add JSDoc comments for functions
- Use meaningful variable names
- Keep functions small and focused

### Code Organization

- Put utility functions in `api/_lib/utils/`
- Put provider implementations in `api/_lib/providers/`
- Keep API endpoints simple - delegate logic to utilities
- Follow existing file structure

### Error Handling

- Always use try-catch for async operations
- Throw `SubtitleError` with appropriate error codes
- Log errors with context information
- Return valid Stremio format even on errors

### Example Code

```javascript
/**
 * Search for subtitles with error handling
 */
async function searchSubtitles(params) {
  try {
    // Validate parameters
    if (!params.imdbId) {
      throw new SubtitleError(
        'IMDB ID is required',
        ErrorCodes.INVALID_PARAMS,
        400
      );
    }

    // Execute search
    const results = await provider.search(params);
    return results;
  } catch (error) {
    console.error('Search failed:', error);
    throw error;
  }
}
```

## Testing

### Manual Testing Checklist

- [ ] Configuration UI loads correctly
- [ ] API key validation works
- [ ] Language selection works
- [ ] Install link generates correctly
- [ ] Manifest endpoint returns valid JSON
- [ ] Movie subtitle search works
- [ ] Series subtitle search works
- [ ] Provider fallback works
- [ ] Error handling works gracefully
- [ ] Mobile responsive design works

### Adding Tests

If adding new features, consider adding tests:

```javascript
// test-your-feature.js
import { yourFunction } from './api/_lib/utils/your-utility.js';

const result = yourFunction(testInput);
console.assert(result === expected, 'Test failed');
console.log('✓ Test passed');
```

## Adding New Providers

To add a new subtitle provider:

1. Create provider file in `api/_lib/providers/`
2. Extend `BaseProvider` class
3. Implement required methods:
   - `search(params)` - Search for subtitles
   - `normalizeResponse(subtitle)` - Convert to Stremio format
4. Add rate limiter in `api/_lib/utils/rate-limiter.js`
5. Update configuration UI in `api/configure.js`
6. Update subtitle handlers to support new provider
7. Add documentation in README.md

### Provider Template

```javascript
import { BaseProvider } from './base-provider.js';
import { SubtitleError, ErrorCodes } from '../utils/error-handler.js';

export class NewProvider extends BaseProvider {
  constructor(config, rateLimiter) {
    super(config, rateLimiter);
    this.name = 'newprovider';
    // Initialize client
  }

  async search(params) {
    try {
      // Implement search logic
      const results = await this.executeWithRateLimit(async () => {
        // API call
      });

      return results.map(sub => this.normalizeResponse(sub));
    } catch (error) {
      throw new SubtitleError(
        `NewProvider error: ${error.message}`,
        ErrorCodes.PROVIDER_ERROR,
        500,
        this.name
      );
    }
  }

  normalizeResponse(subtitle) {
    return {
      id: `newprovider:${subtitle.id}`,
      url: subtitle.download_url,
      lang: subtitle.language
    };
  }
}
```

## Documentation

When adding features:

- Update README.md
- Add JSDoc comments
- Update DEPLOYMENT.md if needed
- Add examples if appropriate

## Commit Messages

Use clear, descriptive commit messages:

- `feat: Add Subscene provider support`
- `fix: Handle rate limit errors correctly`
- `docs: Update deployment instructions`
- `refactor: Simplify provider initialization`
- `test: Add config parser tests`

## Review Process

1. Pull requests are reviewed by maintainers
2. Address review feedback
3. Ensure tests pass
4. Squash commits if requested
5. Once approved, PR will be merged

## Questions?

- Open an issue for questions
- Check existing documentation
- Look at existing code for examples

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing! 🎉

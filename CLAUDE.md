# Claude Code Instructions

This file contains durable instructions for Claude Code when working on this project.

## Project Overview

**Subtitle Pro** is a Stremio addon for multi-provider subtitle search with OpenSubtitles and Subsource integration. It's deployed as serverless functions on Vercel.

## Critical Rules

### Git Operations

**⚠️ NEVER FORCE PUSH TO MASTER/MAIN**
- Never use `git push --force` or `git push -f` on master/main branches
- Force pushing can overwrite others' work and destroy git history
- If you need to fix a commit, use `git revert` instead
- For local branch cleanup, create a new branch instead

**Other Git Rules:**
- Always commit with clear, descriptive messages
- Use conventional commit format: `feat:`, `fix:`, `docs:`, etc.
- Include "Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>" in commits
- Never commit sensitive data (API keys, tokens, secrets)
- Never commit the `.vercel/` directory

### Code Modifications

**Provider Integration:**
- Never hardcode API keys in source code
- Always use user-provided API keys via configuration
- Respect rate limits for all providers
- Implement proper error handling for all provider calls

**Error Handling:**
- Always return valid Stremio format, even on errors
- Use `SubtitleError` class for provider errors
- Log errors with context for debugging
- Never crash the serverless function

**Configuration:**
- Config must always be Base64-encoded in URLs
- Validate config structure before use
- Provide sensible defaults for missing fields
- Never store config server-side

### File Operations

**Protected Files:**
- `vercel.json` - Don't modify deployment config without reason
- `package.json` - Only add/update dependencies when necessary
- `.gitignore` - Don't remove critical entries
- `.github/workflows/*.yml` - Don't modify CI/CD without discussion

**Documentation Updates:**
- Update documentation when adding features
- Keep FEATURES.md in sync with actual features
- Update README.md for user-facing changes
- Add examples for complex features

## Architecture Guidelines

### Serverless Functions

**Best Practices:**
- Keep functions stateless
- Minimize cold start time
- Use async/await for all async operations
- Handle timeouts gracefully
- Return proper HTTP status codes

**Rate Limiting:**
- OpenSubtitles: Maximum 5 requests/second
- Subsource: Maximum 10 requests/second
- Use p-queue for rate limiting
- Don't bypass rate limiters

### Provider Implementation

**When Adding New Providers:**

1. Extend `BaseProvider` class
2. Implement required methods:
   - `search(params)` - Search for subtitles
   - `normalizeResponse(subtitle)` - Convert to Stremio format
3. Add rate limiter in `rate-limiter.js`
4. Update configuration UI
5. Update subtitle handlers
6. Add documentation
7. Add tests

**Provider Error Handling:**
- Catch authentication errors (401)
- Catch rate limit errors (429)
- Catch network errors
- Return empty array on failure
- Log errors for debugging

### Frontend Guidelines

**UI Changes:**
- Maintain mobile-first responsive design
- Keep dark theme consistent
- Test on multiple screen sizes
- Validate all user inputs
- Provide clear error messages

**JavaScript:**
- Use vanilla JavaScript (no frameworks)
- No build step required
- ES6+ features are OK
- Keep bundle size small
- Handle errors gracefully

## Testing Requirements

### Before Committing

**Always Run:**
```bash
npm test
```

**Manual Checks:**
- Config encoding/decoding works
- No JavaScript syntax errors
- All required files present
- Package.json is valid

### Before Deploying

**Verify:**
- All tests pass
- Dependencies installed
- No uncommitted changes
- Documentation updated
- No API keys in code

## Deployment Guidelines

### Vercel Deployment

**Production Deployment:**
- Only deploy to production from master/main branch
- Ensure all tests pass first
- Verify CI/CD workflows succeed
- Update README with deployment URL after first deploy

**Environment Variables:**
- Optional: Can set default API keys in Vercel dashboard
- Never commit API keys to repository
- Users provide their own keys via configuration UI

### CI/CD

**GitHub Actions:**
- All workflows must pass before merge
- PR deployments create preview URLs
- Master/main deployments go to production
- Review workflow logs for errors

## Development Workflow

### Adding Features

1. Create a new branch: `git checkout -b feature/feature-name`
2. Implement the feature
3. Add tests if applicable
4. Update documentation
5. Run tests: `npm test`
6. Commit changes with clear message
7. Push to GitHub
8. Create pull request
9. Wait for CI/CD checks
10. Merge after approval

### Fixing Bugs

1. Create a new branch: `git checkout -b fix/bug-description`
2. Reproduce the bug
3. Implement the fix
4. Test thoroughly
5. Update documentation if needed
6. Commit with descriptive message
7. Push and create pull request

### Code Review Checklist

- [ ] Code follows project style
- [ ] No hardcoded secrets
- [ ] Error handling implemented
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] No force push to master
- [ ] CI/CD checks pass

## Security Considerations

### API Keys
- Users provide their own API keys
- Keys are Base64-encoded in URLs (not encrypted)
- Always use HTTPS for transmission
- Never log API keys
- Never store API keys server-side

### Input Validation
- Validate all user inputs
- Validate config structure
- Validate IMDB IDs
- Validate season/episode numbers
- Validate language codes

### CORS
- Keep CORS permissive (Access-Control-Allow-Origin: *)
- This is a public API, no authentication needed
- Stremio needs to access from any origin

## Common Tasks

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update non-breaking
npm update

# Update all (careful!)
npm install <package>@latest
```

### Test Configuration Encoding

```bash
npm test
```

### Local Development

```bash
# Install Vercel CLI
npm install -g vercel

# Start dev server
npm run dev

# Visit http://localhost:3000/configure
```

### Manual Deployment

```bash
# Preview deployment
vercel

# Production deployment (only from master!)
vercel --prod
```

## Troubleshooting

### Deployment Fails

1. Check Vercel function logs
2. Verify vercel.json is valid
3. Ensure all dependencies in package.json
4. Check for syntax errors
5. Review GitHub Actions logs

### Tests Fail

1. Run tests locally: `npm test`
2. Check for missing dependencies
3. Verify Node.js version (18+)
4. Review error messages
5. Fix issues and re-test

### Subtitles Not Appearing

1. Verify API keys are valid
2. Check rate limits not exceeded
3. Test provider APIs directly
4. Review serverless function logs
5. Check CORS headers

## Resources

### Documentation
- [Stremio Addon SDK](https://github.com/Stremio/stremio-addon-sdk)
- [OpenSubtitles API](https://www.opensubtitles.com/docs/api)
- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Actions](https://docs.github.com/actions)

### Internal Docs
- README.md - User guide
- FEATURES.md - Feature documentation
- DEPLOYMENT.md - Deployment guide
- CONTRIBUTING.md - Contribution guide
- CICD_SETUP.md - CI/CD setup

## Contact

For questions or issues:
- GitHub Issues: https://github.com/yourusername/subtitle-pro-plugin/issues
- GitHub Discussions: https://github.com/yourusername/subtitle-pro-plugin/discussions

---

## Remember

1. **Never force push to master/main**
2. Always test before committing
3. Document your changes
4. Respect rate limits
5. Handle errors gracefully
6. Keep the code simple and maintainable
7. Think about the user experience
8. Security first (validate inputs, no secrets in code)
9. Performance matters (minimize cold starts)
10. Be kind in code reviews

---

**Last Updated:** February 7, 2026
**Version:** 1.0.0

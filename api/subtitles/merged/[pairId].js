import { mergeSrtFiles } from '../../_lib/utils/subtitle-merger.js';
import fetch from 'node-fetch';

/**
 * Merged subtitle endpoint
 * Downloads two SRT files and merges them into one with both languages
 * Route: /[config]/subtitles/merged/[pairId].srt
 */

// In-memory cache (cleared on cold start)
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export default async function handler(req, res) {
  try {
    const { pairId, primaryUrl, secondaryUrl } = req.query;

    // Validate parameters
    if (!pairId) {
      return res.status(400).send('Missing pairId parameter');
    }

    if (!primaryUrl || !secondaryUrl) {
      return res.status(400).send('Missing subtitle URLs (primaryUrl and secondaryUrl required)');
    }

    // Check cache
    const cacheKey = `${pairId}_${primaryUrl}_${secondaryUrl}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(200).send(cached.content);
    }

    // Decode URLs
    const decodedPrimaryUrl = decodeURIComponent(primaryUrl);
    const decodedSecondaryUrl = decodeURIComponent(secondaryUrl);

    console.log(`Fetching subtitles for merge:`, {
      pairId,
      primaryUrl: decodedPrimaryUrl.substring(0, 100),
      secondaryUrl: decodedSecondaryUrl.substring(0, 100)
    });

    // Download both SRT files in parallel
    const [primaryResponse, secondaryResponse] = await Promise.all([
      fetch(decodedPrimaryUrl, { timeout: 10000 }),
      fetch(decodedSecondaryUrl, { timeout: 10000 })
    ]);

    // Check responses
    if (!primaryResponse.ok) {
      throw new Error(`Failed to fetch primary subtitle: ${primaryResponse.status} ${primaryResponse.statusText}`);
    }

    if (!secondaryResponse.ok) {
      throw new Error(`Failed to fetch secondary subtitle: ${secondaryResponse.status} ${secondaryResponse.statusText}`);
    }

    // Get SRT content
    const [primarySrt, secondarySrt] = await Promise.all([
      primaryResponse.text(),
      secondaryResponse.text()
    ]);

    console.log(`Downloaded subtitles:`, {
      primaryLength: primarySrt.length,
      secondaryLength: secondarySrt.length
    });

    // Merge subtitles
    const mergedSrt = mergeSrtFiles(primarySrt, secondarySrt);

    if (!mergedSrt) {
      throw new Error('Failed to merge subtitles');
    }

    console.log(`Merged subtitle length: ${mergedSrt.length}`);

    // Cache result
    cache.set(cacheKey, {
      content: mergedSrt,
      timestamp: Date.now()
    });

    // Clean up old cache entries (keep cache size reasonable)
    if (cache.size > 100) {
      const now = Date.now();
      for (const [key, value] of cache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
          cache.delete(key);
        }
      }
    }

    // Return merged SRT
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes
    return res.status(200).send(mergedSrt);
  } catch (error) {
    console.error('Failed to merge subtitles:', error);

    // Return error but still set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(500).send(`Error merging subtitles: ${error.message}`);
  }
}

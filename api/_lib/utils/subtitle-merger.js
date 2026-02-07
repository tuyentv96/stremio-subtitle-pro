/**
 * Subtitle Merger Utility
 * Parses and merges two SRT subtitle files for dual language display
 */

/**
 * Convert SRT timestamp to seconds
 * @param {string} timeString - SRT timestamp (HH:MM:SS,mmm)
 * @returns {number} - Time in seconds
 */
function timeToSeconds(timeString) {
  const [time, ms] = timeString.split(',');
  const [hours, minutes, seconds] = time.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds + (parseInt(ms, 10) / 1000);
}

/**
 * Convert seconds to SRT timestamp
 * @param {number} seconds - Time in seconds
 * @returns {string} - SRT timestamp (HH:MM:SS,mmm)
 */
function secondsToTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
}

/**
 * Parse SRT content into array of subtitle objects
 * @param {string} srtContent - Raw SRT file content
 * @returns {Array} - Array of {index, startTime, endTime, startSeconds, endSeconds, text}
 */
function parseSrt(srtContent) {
  if (!srtContent || typeof srtContent !== 'string') {
    return [];
  }

  // Normalize line endings and trim
  const normalized = srtContent.replace(/\r\n/g, '\n').trim();

  // Split by double newline to get entries
  const entries = normalized.split(/\n\n+/);

  const subtitles = [];

  for (const entry of entries) {
    const lines = entry.split('\n');

    // Need at least 3 lines: index, timecode, text
    if (lines.length < 3) continue;

    // Parse index (first line)
    const index = parseInt(lines[0], 10);
    if (isNaN(index)) continue;

    // Parse timecode (second line)
    const timecodeMatch = lines[1].match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/);
    if (!timecodeMatch) continue;

    const startTime = timecodeMatch[1];
    const endTime = timecodeMatch[2];

    // Parse text (remaining lines)
    const text = lines.slice(2).join('\n').trim();
    if (!text) continue;

    subtitles.push({
      index,
      startTime,
      endTime,
      startSeconds: timeToSeconds(startTime),
      endSeconds: timeToSeconds(endTime),
      text
    });
  }

  return subtitles;
}

/**
 * Find overlapping or closest secondary subtitle for a primary subtitle
 * @param {Object} primarySub - Primary subtitle object
 * @param {Array} secondarySubs - Array of secondary subtitle objects
 * @returns {Object|null} - Matching secondary subtitle or null
 */
function findOverlappingSubtitle(primarySub, secondarySubs) {
  if (!secondarySubs || secondarySubs.length === 0) {
    return null;
  }

  let bestMatch = null;
  let maxOverlap = 0;

  // Find subtitle with maximum time overlap
  for (const secondarySub of secondarySubs) {
    const overlapStart = Math.max(primarySub.startSeconds, secondarySub.startSeconds);
    const overlapEnd = Math.min(primarySub.endSeconds, secondarySub.endSeconds);
    const overlap = overlapEnd - overlapStart;

    if (overlap > maxOverlap) {
      maxOverlap = overlap;
      bestMatch = secondarySub;
    }
  }

  // If we found an overlap, return it
  if (maxOverlap > 0) {
    return bestMatch;
  }

  // No overlap found, find closest by start time
  let closestSub = null;
  let minDistance = Infinity;

  for (const secondarySub of secondarySubs) {
    const distance = Math.abs(primarySub.startSeconds - secondarySub.startSeconds);
    if (distance < minDistance) {
      minDistance = distance;
      closestSub = secondarySub;
    }
  }

  // Only return closest if it's within 2 seconds
  return minDistance <= 2 ? closestSub : null;
}

/**
 * Generate SRT content from array of subtitle objects
 * @param {Array} subtitles - Array of subtitle objects
 * @returns {string} - SRT formatted string
 */
function generateSrt(subtitles) {
  return subtitles.map((sub, index) => {
    return `${index + 1}\n${sub.startTime} --> ${sub.endTime}\n${sub.text}\n`;
  }).join('\n');
}

/**
 * Merge two SRT files into one with both languages
 * @param {string} primarySrt - Primary language SRT content
 * @param {string} secondarySrt - Secondary language SRT content
 * @returns {string} - Merged SRT content with both languages
 */
export function mergeSrtFiles(primarySrt, secondarySrt) {
  // Parse both SRT files
  const primarySubs = parseSrt(primarySrt);
  const secondarySubs = parseSrt(secondarySrt);

  if (primarySubs.length === 0) {
    return secondarySrt || '';
  }

  if (secondarySubs.length === 0) {
    return primarySrt || '';
  }

  // Merge subtitles
  const merged = primarySubs.map(primarySub => {
    const secondarySub = findOverlappingSubtitle(primarySub, secondarySubs);

    // Combine text: primary on top, secondary on bottom
    const mergedText = secondarySub
      ? `${primarySub.text}\n${secondarySub.text}`
      : primarySub.text;

    return {
      index: primarySub.index,
      startTime: primarySub.startTime,
      endTime: primarySub.endTime,
      text: mergedText
    };
  });

  // Generate final SRT
  return generateSrt(merged);
}

import PQueue from 'p-queue';

/**
 * Rate limiter using p-queue for provider API calls
 */

export class RateLimiter {
  constructor(requestsPerSecond = 5) {
    this.queue = new PQueue({
      interval: 1000, // 1 second
      intervalCap: requestsPerSecond // Max requests per interval
    });
  }

  /**
   * Add request to queue and wait for execution
   */
  async wait(fn) {
    return this.queue.add(fn);
  }

  /**
   * Get queue size
   */
  getSize() {
    return this.queue.size;
  }

  /**
   * Get pending requests
   */
  getPending() {
    return this.queue.pending;
  }
}

// Create rate limiters for each provider
export const rateLimiters = {
  opensubtitles: new RateLimiter(5), // 5 requests/sec
  subsource: new RateLimiter(10) // 10 requests/sec (adjust as needed)
};

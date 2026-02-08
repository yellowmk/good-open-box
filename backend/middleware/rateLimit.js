/**
 * In-memory per-IP rate limiter for AI endpoints.
 * Appropriate for single-process deployment.
 */

function createRateLimit({ windowMs = 60_000, max = 30 } = {}) {
  const hits = new Map();

  // Clean up stale entries every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) {
      if (now - entry.resetTime > 0) hits.delete(key);
    }
  }, 5 * 60_000).unref();

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    let entry = hits.get(ip);

    if (!entry || now > entry.resetTime) {
      entry = { count: 0, resetTime: now + windowMs };
      hits.set(ip, entry);
    }

    entry.count++;

    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      res.set('Retry-After', String(retryAfter));
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
      });
    }

    next();
  };
}

module.exports = createRateLimit;

/**
 * Request / Response Logging Middleware
 */

const logger = require("../utils/logger");

/**
 * Logs method, path, status code, response time, IP, and userId for every request.
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Intercept res.json so we can capture the final status code
  const originalJson = res.json;
  res.json = function (data) {
    const responseTime = Date.now() - startTime;

    logger.info(`${req.method} ${req.path}`, {
      method:       req.method,
      path:         req.path,
      statusCode:   res.statusCode,
      responseTime: `${responseTime}ms`,
      ip:           req.ip,
      userId:       req.user?.id || "anonymous",
    });

    return originalJson.call(this, data);
  };

  next();
};

module.exports = requestLogger;
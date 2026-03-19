/**
 * Centralized Logging System
 */

const fs   = require("fs");
const path = require("path");

// ── Setup log directory ──────────────────────────────────────────────────────
const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// ── Log Levels ────────────────────────────────────────────────────────────────
const LOG_LEVELS = { ERROR: "ERROR", WARN: "WARN", INFO: "INFO", DEBUG: "DEBUG" };

// ── Helpers ───────────────────────────────────────────────────────────────────

const getTimestamp = () => new Date().toISOString();

const formatLog = (level, message, meta = {}) =>
  JSON.stringify({ timestamp: getTimestamp(), level, message, ...meta });

/**
 * Safe file write — catches ENOENT / permission errors so a log failure
 * never crashes the server process.
 */
const writeToFile = (filename, content) => {
  try {
    fs.appendFileSync(path.join(logsDir, filename), content + "\n");
  } catch {
    // Intentionally silent — logging must never crash the app
  }
};

// ── ANSI color codes ──────────────────────────────────────────────────────────
const COLORS = {
  reset:  "\x1b[0m",
  red:    "\x1b[31m",
  yellow: "\x1b[33m",
  cyan:   "\x1b[36m",
  magenta:"\x1b[35m",
  gray:   "\x1b[90m",
};

const isProd = process.env.NODE_ENV === "production";

// ── Logger ─────────────────────────────────────────────────────────────────────
const logger = {
  /**
   * Error — always logged to console + file
   */
  error: (message, error = null, meta = {}) => {
    const errorMeta = error
      ? { ...meta, errorMessage: error.message, stack: error.stack }
      : meta;

    const log = formatLog(LOG_LEVELS.ERROR, message, errorMeta);

    if (!isProd) {
      console.error(`${COLORS.red}[ERROR]${COLORS.reset} ${message}`, error || "");
    } else {
      console.error(`[ERROR] ${message}`);
    }

    writeToFile("error.log",    log);
    writeToFile("combined.log", log);
  },

  /**
   * Warning — logged to console + file
   */
  warn: (message, meta = {}) => {
    const log = formatLog(LOG_LEVELS.WARN, message, meta);

    if (!isProd) {
      console.warn(`${COLORS.yellow}[WARN]${COLORS.reset} ${message}`, meta);
    } else {
      console.warn(`[WARN] ${message}`);
    }

    writeToFile("warn.log",     log);
    writeToFile("combined.log", log);
  },

  /**
   * Info — general operational messages
   */
  info: (message, meta = {}) => {
    const log = formatLog(LOG_LEVELS.INFO, message, meta);

    if (!isProd) {
      // In dev, skip noisy meta objects in the console unless DEBUG is set
      const metaStr = process.env.LOG_META === "true"
        ? JSON.stringify(meta)
        : "";
      console.log(`${COLORS.cyan}[INFO]${COLORS.reset} ${message}${metaStr ? " " + metaStr : ""}`);
    }

    writeToFile("info.log",     log);
    writeToFile("combined.log", log);
  },

  /**
   * Debug — only printed in development
   */
  debug: (message, meta = {}) => {
    if (isProd) return;

    const log = formatLog(LOG_LEVELS.DEBUG, message, meta);
    console.debug(`${COLORS.magenta}[DEBUG]${COLORS.reset} ${message}`, meta);
    writeToFile("debug.log",    log);
    writeToFile("combined.log", log);
  },

  /**
   * HTTP request logger — called from requestLogger middleware
   */
  logRequest: (req, res, responseTime) => {
    const meta = {
      method:       req.method,
      path:         req.path,
      statusCode:   res.statusCode,
      responseTime: `${responseTime}ms`,
      ip:           req.ip,
      userAgent:    req.get("user-agent"),
      userId:       req.user?.id || "anonymous",
    };

    const message = `${req.method} ${req.path} ${res.statusCode}`;
    const log     = formatLog(LOG_LEVELS.INFO, message, meta);

    writeToFile("access.log",   log);
    writeToFile("combined.log", log);
  },
};

module.exports = logger;
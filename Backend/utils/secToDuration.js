/**
 * Duration Utility
 * Converts seconds to human-readable strings and vice-versa
 */

/**
 * Convert total seconds to a readable string
 * e.g. 3661 → "1h 1m 1s"
 *
 * @param {number} totalSeconds
 * @returns {string}
 */
const convertSecondsToDuration = (totalSeconds) => {
  if (!totalSeconds || isNaN(totalSeconds) || totalSeconds < 0) return "0s";

  const hours   = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const parts = [];
  if (hours   > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

  return parts.join(" ");
};

/**
 * Convert total minutes to a readable string
 * e.g. 125 → "2h 5m"
 *
 * @param {number} totalMinutes
 * @returns {string}
 */
const convertMinutesToDuration = (totalMinutes) => {
  if (!totalMinutes || isNaN(totalMinutes) || totalMinutes < 0) return "0m";

  const hours   = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);

  const parts = [];
  if (hours   > 0) parts.push(`${hours}h`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);

  return parts.join(" ");
};

/**
 * Convert a Cloudinary duration (float seconds) to a clean integer
 * and return both seconds and a formatted string
 *
 * @param {number|string} cloudinaryDuration
 * @returns {{ seconds: number, formatted: string }}
 */
const parseDuration = (cloudinaryDuration) => {
  const seconds = Math.round(parseFloat(cloudinaryDuration) || 0);
  return {
    seconds,
    formatted: convertSecondsToDuration(seconds),
  };
};

module.exports = {
  convertSecondsToDuration,
  convertMinutesToDuration,
  parseDuration,
};
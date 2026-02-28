function convertSecondsToDuration(totalSeconds) {
  if (!totalSeconds || isNaN(totalSeconds)) return "0s";

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const parts = [];

  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0)
    parts.push(`${seconds}s`);

  return parts.join(" ");
}

module.exports = { convertSecondsToDuration };
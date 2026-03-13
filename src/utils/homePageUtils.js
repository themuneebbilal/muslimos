export function getHomeGreeting() {
  const hour = new Date().getHours();
  if (hour < 5) return 'Assalamu Alaikum';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Assalamu Alaikum';
}

export function formatHomeGregorianDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function formatCoordinate(value, positiveLabel, negativeLabel) {
  const suffix = value >= 0 ? positiveLabel : negativeLabel;
  return `${Math.abs(value).toFixed(2)}°${suffix}`;
}

export function formatHomeLocation(location) {
  if (!location) return 'Lahore, Pakistan';
  if (location.city && location.city !== 'Your location') return location.city;
  if (location.label && location.label.includes('default')) return 'Lahore, Pakistan';
  if (typeof location.lat === 'number' && typeof location.lng === 'number') {
    const lat = formatCoordinate(location.lat, 'N', 'S');
    const lng = formatCoordinate(location.lng, 'E', 'W');
    if (typeof location.accuracy === 'number' && Number.isFinite(location.accuracy)) {
      return `${lat}, ${lng} · ±${Math.round(location.accuracy)}m`;
    }
    return `${lat}, ${lng}`;
  }
  if (location.label) return location.label;
  return 'Lahore, Pakistan';
}

export function getRamadanProgress(hijriParts) {
  const isRamadan = hijriParts.month === 9;
  const day = Math.max(1, Math.min(30, hijriParts.day || 1));
  return {
    isRamadan,
    day,
    pct: Math.round((day / 30) * 100),
  };
}

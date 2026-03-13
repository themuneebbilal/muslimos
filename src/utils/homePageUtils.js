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

export function formatHomeLocation(label) {
  if (!label || label.includes('default')) return 'Lahore, Pakistan';
  if (label.includes('°')) return 'Your location';
  return label;
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

const toRad = (d) => d * Math.PI / 180;
const toDeg = (r) => r * 180 / Math.PI;

const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

export function calculateQibla(lat, lng) {
  const dLng = toRad(KAABA_LNG - lng);
  const lat1 = toRad(lat);
  const lat2 = toRad(KAABA_LAT);
  const x = Math.sin(dLng) * Math.cos(lat2);
  const y = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  const bearing = toDeg(Math.atan2(x, y));
  return (bearing + 360) % 360;
}

// Prayer time calculation using solar position
// No API dependency — works fully offline

const toRad = (d) => d * Math.PI / 180;
const toDeg = (r) => r * 180 / Math.PI;

function julianDate(y, m, d) {
  if (m <= 2) { y--; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
}

function sunPosition(jd) {
  const D = jd - 2451545.0;
  const g = toRad((357.529 + 0.98560028 * D) % 360);
  const q = (280.459 + 0.98564736 * D) % 360;
  const L = toRad((q + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) % 360);
  const e = toRad(23.439 - 0.00000036 * D);
  const RA = toDeg(Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L))) / 15;
  const dec = toDeg(Math.asin(Math.sin(e) * Math.sin(L)));
  let EqT = q / 15 - RA;
  if (EqT > 12) EqT -= 24;
  if (EqT < -12) EqT += 24;
  return { dec, eq: EqT };
}

function computeHourAngle(angle, dec, lat) {
  const latR = toRad(lat);
  const decR = toRad(dec);
  const cosHA = (Math.sin(toRad(angle)) - Math.sin(latR) * Math.sin(decR)) /
                (Math.cos(latR) * Math.cos(decR));
  if (cosHA > 1 || cosHA < -1) return NaN;
  return toDeg(Math.acos(cosHA)) / 15;
}

export const CALC_METHODS = [
  { name: 'University of Islamic Sciences, Karachi', fajr: 18, isha: 18 },
  { name: 'Muslim World League', fajr: 18, isha: 17 },
  { name: 'Egyptian General Authority', fajr: 19.5, isha: 17.5 },
  { name: 'ISNA (North America)', fajr: 15, isha: 15 },
];

export function calculatePrayerTimes(lat, lng, tz, methodIdx = 0) {
  const now = new Date();
  const jd = julianDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const sun = sunPosition(jd);
  const method = CALC_METHODS[methodIdx];

  const dhuhr = 12 + tz - lng / 15 - sun.eq;
  const haSun = computeHourAngle(-0.833, sun.dec, lat);
  const sunrise = dhuhr - haSun;
  const sunset = dhuhr + haSun;
  const haFajr = computeHourAngle(-method.fajr, sun.dec, lat);
  const fajr = dhuhr - haFajr;
  const haIsha = computeHourAngle(-method.isha, sun.dec, lat);
  const isha = dhuhr + haIsha;

  // Asr (Shafi'i — factor = 1; Hanafi = 2)
  const asrAngle = toDeg(Math.atan(1 / (1 + Math.tan(Math.abs(toRad(lat) - toRad(sun.dec))))));
  const haAsr = computeHourAngle(asrAngle, sun.dec, lat);
  const asr = dhuhr + haAsr;

  return {
    Fajr: fajr,
    Sunrise: sunrise,
    Dhuhr: dhuhr,
    Asr: asr,
    Maghrib: sunset,
    Isha: isha,
  };
}

export function formatTime(h) {
  if (isNaN(h)) return '--:--';
  h = h % 24;
  if (h < 0) h += 24;
  let hr = Math.floor(h);
  let mn = Math.round((h - hr) * 60);
  if (mn >= 60) { hr++; mn = 0; }
  const ampm = hr >= 12 ? 'PM' : 'AM';
  const h12 = hr % 12 || 12;
  return `${h12}:${mn < 10 ? '0' : ''}${mn} ${ampm}`;
}

export function getNextPrayer(times) {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const prayerNames = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  for (const name of prayerNames) {
    const tMin = (times[name] % 24) * 60;
    if (nowMin < tMin) return { name, time: times[name] };
  }
  // All passed — next is tomorrow's Fajr
  return { name: 'Fajr', time: times.Fajr + 24 };
}

export function getCountdown(targetHours) {
  const now = new Date();
  const nowH = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
  let diff = targetHours - nowH;
  if (diff < 0) diff += 24;
  const totalSec = Math.floor(diff * 3600);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${h < 10 ? '0' : ''}${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}

export function getHijriDate() {
  const today = new Date();
  const gd = today.getDate(), gm = today.getMonth() + 1, gy = today.getFullYear();
  const jd = julianDate(gy, gm, gd);
  let l = Math.floor(jd - 1948439.5) + 10632;
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j = (Math.floor((10985 - l) / 5316)) * (Math.floor((50 * l) / 17719)) +
            (Math.floor(l / 5670)) * (Math.floor((43 * l) / 15238));
  l = l - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) -
      (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
  const hm = Math.floor((24 * l) / 709);
  const hd = l - Math.floor((709 * hm) / 24);
  const hy = 30 * n + j - 30;
  const months = ['Muharram','Safar',"Rabi' al-Awwal","Rabi' al-Thani","Jumada al-Ula","Jumada al-Thani",'Rajab',"Sha'ban",'Ramadan','Shawwal',"Dhul Qi'dah",'Dhul Hijjah'];
  return `${hd} ${months[hm - 1]} ${hy} AH`;
}

export function getHijriDateParts() {
  const today = new Date();
  const gd = today.getDate(), gm = today.getMonth() + 1, gy = today.getFullYear();
  const jd = julianDate(gy, gm, gd);
  let l = Math.floor(jd - 1948439.5) + 10632;
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j = (Math.floor((10985 - l) / 5316)) * (Math.floor((50 * l) / 17719)) +
            (Math.floor(l / 5670)) * (Math.floor((43 * l) / 15238));
  l = l - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) -
      (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
  const hm = Math.floor((24 * l) / 709);
  const hd = l - Math.floor((709 * hm) / 24);
  const hy = 30 * n + j - 30;
  return { day: hd, month: hm, year: hy };
}

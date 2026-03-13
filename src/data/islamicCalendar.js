// Key Islamic events by Hijri month and day
// Month numbers: 1=Muharram, 2=Safar, ..., 9=Ramadan, ..., 12=Dhul Hijjah
const ISLAMIC_EVENTS = [
  { month: 1, day: 1, name: 'Islamic New Year', nameAr: 'رأس السنة الهجرية', desc: 'First day of the Hijri calendar year' },
  { month: 1, day: 10, name: 'Day of Ashura', nameAr: 'يوم عاشوراء', desc: 'Fasting recommended, commemorates many prophetic events' },
  { month: 2, day: 27, name: 'Isra & Mi\'raj', nameAr: 'الإسراء والمعراج', desc: 'Night Journey of Prophet Muhammad (PBUH)' },
  { month: 3, day: 12, name: 'Mawlid al-Nabi', nameAr: 'المولد النبوي', desc: 'Birth of Prophet Muhammad (PBUH)' },
  { month: 7, day: 27, name: 'Laylat al-Raghaib', nameAr: 'ليلة الرغائب', desc: 'Night of Wishes in the month of Rajab' },
  { month: 8, day: 15, name: 'Shab-e-Barat', nameAr: 'ليلة النصف من شعبان', desc: 'Night of Forgiveness, mid-Sha\'ban' },
  { month: 9, day: 1, name: 'Ramadan Begins', nameAr: 'بداية رمضان', desc: 'First day of fasting in the holy month' },
  { month: 9, day: 27, name: 'Laylat al-Qadr', nameAr: 'ليلة القدر', desc: 'Night of Power, better than a thousand months' },
  { month: 10, day: 1, name: 'Eid al-Fitr', nameAr: 'عيد الفطر', desc: 'Festival of Breaking the Fast' },
  { month: 12, day: 8, name: 'Day of Tarwiyah', nameAr: 'يوم التروية', desc: 'Start of Hajj rites' },
  { month: 12, day: 9, name: 'Day of Arafah', nameAr: 'يوم عرفة', desc: 'Standing at Arafah, fasting highly recommended' },
  { month: 12, day: 10, name: 'Eid al-Adha', nameAr: 'عيد الأضحى', desc: 'Festival of Sacrifice' },
];

const HIJRI_MONTHS = [
  'Muharram', 'Safar', "Rabi' al-Awwal", "Rabi' al-Thani",
  "Jumada al-Ula", "Jumada al-Thani", 'Rajab', "Sha'ban",
  'Ramadan', 'Shawwal', "Dhul Qi'dah", 'Dhul Hijjah'
];

// Days in each Hijri month (alternating 30/29)
const HIJRI_MONTH_DAYS = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];

export function getUpcomingEvents(hijriDay, hijriMonth, count = 3) {
  const events = [];
  // Check current month and subsequent months (wrap around)
  for (let offset = 0; offset < 12 && events.length < count; offset++) {
    const m = ((hijriMonth - 1 + offset) % 12) + 1;
    for (const e of ISLAMIC_EVENTS) {
      if (events.length >= count) break;
      if (e.month === m) {
        if (offset === 0 && e.day < hijriDay) continue; // already passed this month
        const daysUntil = offset === 0
          ? e.day - hijriDay
          : ISLAMIC_EVENTS.reduce((sum, _, mi) => {
              // approximate days until
              let d = 0;
              for (let i = 0; i < offset; i++) {
                const mIdx = ((hijriMonth - 1 + i) % 12);
                d += HIJRI_MONTH_DAYS[mIdx];
              }
              return d;
            }, 0) + e.day - hijriDay;

        // Simpler approach: calculate total days
        let totalDays = 0;
        if (offset === 0) {
          totalDays = e.day - hijriDay;
        } else {
          for (let i = 0; i < offset; i++) {
            const mIdx = ((hijriMonth - 1 + i) % 12);
            totalDays += HIJRI_MONTH_DAYS[mIdx];
          }
          totalDays += e.day - hijriDay;
        }

        events.push({ ...e, daysUntil: totalDays });
      }
    }
  }
  return events;
}

export function getTodayEvent(hijriDay, hijriMonth) {
  return ISLAMIC_EVENTS.find(e => e.month === hijriMonth && e.day === hijriDay) || null;
}

export { ISLAMIC_EVENTS, HIJRI_MONTHS };

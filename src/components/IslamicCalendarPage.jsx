import React, { useMemo } from 'react';
import { getHijriDate, getHijriDateParts } from '../utils/prayerCalc';
import { getTodayEvent, getUpcomingEvents, HIJRI_MONTHS, ISLAMIC_EVENTS } from '../data/islamicCalendar';
import { IconBack, IconCalendar, IconCrescent } from './Icons';

const WEEK_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function IslamicCalendarPage({ onBack }) {
  const hijri = useMemo(() => getHijriDateParts(), []);
  const hijriLabel = useMemo(() => getHijriDate(), []);
  const gregorianLabel = useMemo(() => new Date().toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }), []);
  const monthName = HIJRI_MONTHS[hijri.month - 1];
  const monthEvents = useMemo(
    () => ISLAMIC_EVENTS.filter((event) => event.month === hijri.month),
    [hijri.month]
  );
  const todayEvent = useMemo(() => getTodayEvent(hijri.day, hijri.month), [hijri.day, hijri.month]);
  const upcoming = useMemo(() => getUpcomingEvents(hijri.day, hijri.month, 4), [hijri.day, hijri.month]);

  return (
    <div className="ritual-page animate-fade-up">
      <div className="ritual-page-header">
        <button className="back-btn" onClick={onBack}>
          <IconBack size={16} />
        </button>
        <div>
          <div className="page-title" style={{ padding: 0 }}>Islamic Calendar</div>
          <div className="page-subtitle" style={{ padding: 0 }}>
            Hijri-first planning with sacred dates surfaced for the current month.
          </div>
        </div>
      </div>

      <section className="ritual-hero glass-card ritual-hero-calendar">
        <div className="ritual-watermark">هِجْرِي</div>
        <div className="ritual-label">Today</div>
        <h2 className="ritual-title font-amiri">{hijriLabel}</h2>
        <p className="ritual-copy">{gregorianLabel}</p>
        {todayEvent && (
          <div className="ritual-inline-banner">
            <span className="ritual-icon ritual-icon-gold">
              <IconCrescent size={16} />
            </span>
            <span>{todayEvent.name} · {todayEvent.nameAr}</span>
          </div>
        )}
      </section>

      <section className="ritual-panel glass-card">
        <div className="ritual-panel-head">
          <div className="ritual-icon ritual-icon-emerald">
            <IconCalendar size={18} />
          </div>
          <div>
            <div className="ritual-panel-title">{monthName}</div>
            <div className="ritual-panel-sub">Current Hijri month overview</div>
          </div>
        </div>

        <div className="ritual-calendar-strip">
          {WEEK_LABELS.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>

        <div className="ritual-calendar-grid">
          {Array.from({ length: 30 }, (_, index) => {
            const day = index + 1;
            const hasEvent = monthEvents.some((event) => event.day === day);
            const isToday = day === hijri.day;
            return (
              <div
                key={day}
                className={`ritual-calendar-cell${isToday ? ' active' : ''}${hasEvent ? ' marked' : ''}`}
              >
                <span>{day}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="ritual-stack">
        {upcoming.map((event) => (
          <article key={`${event.month}-${event.day}-${event.name}`} className="ritual-entry glass-card">
            <div className="ritual-entry-meta">
              <span className="ritual-mini-pill">{event.daysUntil === 0 ? 'Today' : `In ${event.daysUntil} days`}</span>
              <span className="ritual-entry-time">{HIJRI_MONTHS[event.month - 1]} {event.day}</span>
            </div>
            <div className="ritual-panel-title">{event.name}</div>
            <div className="ritual-entry-ar">{event.nameAr}</div>
            <p className="ritual-panel-sub">{event.desc}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

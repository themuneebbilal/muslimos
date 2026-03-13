import React, { useMemo, useState } from 'react';
import { IconBack, IconHeart, IconJournal } from './Icons';
import {
  deleteJournalEntry,
  getDailyJournalPrompt,
  getJournalEntries,
  JOURNAL_ANCHORS,
  JOURNAL_MOODS,
  saveJournalEntry,
} from '../utils/journalStore';

function formatEntryTime(timestamp) {
  return new Date(timestamp).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function JournalPage({ onBack }) {
  const [entries, setEntries] = useState(() => getJournalEntries());
  const [mood, setMood] = useState('Calm');
  const [anchor, setAnchor] = useState('General');
  const [text, setText] = useState('');
  const prompt = useMemo(() => getDailyJournalPrompt(), []);

  function handleSave() {
    if (!text.trim()) return;
    setEntries(saveJournalEntry({ text, mood, anchor }));
    setText('');
  }

  function handleDelete(id) {
    setEntries(deleteJournalEntry(id));
  }

  return (
    <div className="ritual-page animate-fade-up">
      <div className="ritual-page-header">
        <button className="back-btn" onClick={onBack}>
          <IconBack size={16} />
        </button>
        <div>
          <div className="page-title" style={{ padding: 0 }}>Journal</div>
          <div className="page-subtitle" style={{ padding: 0 }}>
            A private place to capture gratitude, lessons, and moments between prayers.
          </div>
        </div>
      </div>

      <section className="ritual-hero glass-card">
        <div className="ritual-watermark">نِيَّة</div>
        <div className="ritual-label">Daily Reflection</div>
        <h2 className="ritual-title font-amiri">Write while the heart is still warm.</h2>
        <p className="ritual-copy">{prompt}</p>
      </section>

      <section className="ritual-panel glass-card">
        <div className="ritual-panel-head">
          <div className="ritual-icon ritual-icon-gold">
            <IconJournal size={18} />
          </div>
          <div>
            <div className="ritual-panel-title">New Entry</div>
            <div className="ritual-panel-sub">Prayer-linked notes, duas, and small reflections.</div>
          </div>
        </div>

        <div className="ritual-pill-row">
          {JOURNAL_ANCHORS.map((item) => (
            <button
              key={item}
              type="button"
              className={`ritual-pill${anchor === item ? ' active' : ''}`}
              onClick={() => setAnchor(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="ritual-pill-row">
          {JOURNAL_MOODS.map((item) => (
            <button
              key={item}
              type="button"
              className={`ritual-pill ritual-pill-soft${mood === item ? ' active' : ''}`}
              onClick={() => setMood(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <textarea
          className="ritual-textarea glass-input"
          placeholder="Write one sincere line. A dua, a lesson, a moment of sabr, or what you want to remember tonight."
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={6}
        />

        <div className="ritual-actions">
          <div className="ritual-note">Saved only on this device.</div>
          <button type="button" className="ritual-primary-btn" onClick={handleSave} disabled={!text.trim()}>
            Save Entry
          </button>
        </div>
      </section>

      <section className="ritual-stack">
        {entries.length === 0 ? (
          <article className="ritual-entry glass-card ritual-entry-empty">
            <div className="ritual-icon ritual-icon-emerald">
              <IconHeart size={18} />
            </div>
            <div>
              <div className="ritual-panel-title">No entries yet</div>
              <div className="ritual-panel-sub">Start with one line after your next prayer.</div>
            </div>
          </article>
        ) : (
          entries.map((entry) => (
            <article key={entry.id} className="ritual-entry glass-card">
              <div className="ritual-entry-meta">
                <span className="ritual-mini-pill">{entry.anchor}</span>
                <span className="ritual-mini-pill ritual-mini-pill-soft">{entry.mood}</span>
                <span className="ritual-entry-time">{formatEntryTime(entry.createdAt)}</span>
              </div>
              <p className="ritual-entry-text">{entry.text}</p>
              <div className="ritual-entry-actions">
                <button type="button" className="ritual-link-btn" onClick={() => handleDelete(entry.id)}>
                  Delete
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}

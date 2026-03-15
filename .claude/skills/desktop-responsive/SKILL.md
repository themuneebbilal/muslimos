---
name: desktop-responsive
description: Rules and patterns for writing desktop-responsive CSS in MuslimOS. Use this whenever modifying desktop layout or adding new pages.
---

# Desktop Responsiveness — MuslimOS Rules

## Golden Rule

**NEVER use fragile CSS selectors for desktop layout.** Always use explicit class names on components.

### Banned Patterns (will break silently when DOM changes)

```css
/* NEVER — nth-child depends on element order */
.app > .animate-fade-up > *:nth-child(6) { grid-column: 9 / span 4; }

/* NEVER — :has() with generic children is brittle */
.app > .animate-fade-up:has(> .glass-dark) { display: grid; }

/* NEVER — attribute substring matching hits unrelated elements */
[style*="grid-template-columns"] { grid-template-columns: repeat(4, 1fr) !important; }

/* NEVER — blanket rules on shared classes affect all pages */
.glass-elevated { max-width: 480px; margin: 0 auto; }
```

### Required Pattern

Every page component must have a unique root class. Desktop rules target that class.

```css
/* CORRECT — scoped to specific page */
.homev2 { max-width: 1320px; margin: 0 auto; }
.worshipv2 { max-width: 1120px; margin: 0 auto; }
.hadithv2-library-grid { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
```

---

## Current Page Classes (verified in JSX)

| Page | Root class | File |
|------|-----------|------|
| Home | `homev2` | HomePage.jsx |
| Prayer Times | `prayer-times-page` | PrayerTimesPage.jsx |
| Quran Reader | `quran-reader` | QuranReader.jsx |
| Worship | `worshipv2` | Worship.jsx |
| Hadith (main) | `hadithv2-page` | HadithPage.jsx |
| Hadith (collection) | `hadithv2-collection` | HadithCollection.jsx |
| Learn | `learnv3` | LearnPage.jsx |
| Guide Reader | `guide-reader-page` | GuideReader.jsx |
| Journal | `ritual-page` | JournalPage.jsx |
| Islamic Calendar | `ritual-page` | IslamicCalendarPage.jsx |

## Sub-component Classes for Desktop Grids

| Class | Purpose | Desktop behavior |
|-------|---------|-----------------|
| `homev2-hero-grid` | Home hero section | 2-column: content + sidebar |
| `homev2-fold-list` | Quick access cards | 2-column grid |
| `homev2-journey` | Journey section | 2-column: main + side |
| `learnv3-grid` | Learn guide cards | 2-column grid |
| `hadithv2-library-grid` | Hadith collection cards | 4-column grid |
| `worshipv3-tracker` | Worship tracker layout | 2-column: main + stats |
| `worshipv3-hero` | Worship hero card | Full width (span all) |
| `worshipv3-chip-row` | Worship chip row | Full width (span all) |
| `worshipv2-tasbeeh-shell` | Tasbeeh counter | max-width: 640px centered |
| `ritual-stack` | Journal/Calendar cards | 2-column grid |

---

## Desktop Breakpoint

All desktop rules live inside ONE media query block in `src/styles/theme.css`:

```css
@media (min-width: 1024px) {
  /* 1. SIDEBAR NAV */
  /* 2. APP SHELL — max-width, sidebar margin */
  /* 3. HOME PAGE — .homev2 rules */
  /* 4. QURAN READER — .quran-reader rules */
  /* 5. PAGE WIDTHS + GRIDS — all other pages */
}
```

## App Shell

```css
.app {
  max-width: none;
  width: min(1440px, calc(100vw - 72px));  /* 72px = sidebar */
  margin-left: 72px;
  margin-right: auto;
}
```

---

## Checklist: Adding a New Page

1. Add a unique root class to the component's wrapper div: `className="mypage animate-fade-up"`
2. Add desktop width rule: `.mypage { max-width: 1120px; margin: 0 auto; }`
3. If it needs a grid layout, add a class to the grid container and target that
4. Add the class to the page class table above
5. Test at 1024px, 1280px, and 1440px widths
6. Verify it doesn't affect other pages (no shared selectors)

## Checklist: Modifying Desktop Layout

1. Find the page's root class in the table above
2. Only write CSS rules scoped to that class
3. Use `minmax(0, 1fr)` instead of plain `1fr` to prevent overflow
4. Never use `!important` on shared classes — only on page-specific overrides of inline styles
5. Test ALL pages after changes, not just the one you modified

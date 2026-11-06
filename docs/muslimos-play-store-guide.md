# MuslimOS
## Android Play Store Launch Guide

Prayer times · Quran · Hadith · Dhikr · Qibla  
Inspired by the Sheikh Zayed Grand Mosque

Version: March 2026

---

## Executive Summary

Yes, this project can become a proper Android app on the Play Store.

The cleanest path is:

1. Keep the current app as the main web codebase.
2. Wrap it in a native Android shell with **Capacitor**.
3. Use **Android Studio** for signing, testing, icons, permissions, and Play Store builds.
4. Only introduce **SQLite** if MuslimOS grows into offline-first structured data at scale.

For MuslimOS specifically, the recommended architecture is:

- **Frontend**: keep the current Vite + React app.
- **Mobile shell**: Capacitor.
- **Default storage**: existing browser storage / Capacitor Preferences for simple user state.
- **Optional later**: SQLite for downloaded content, advanced search indexes, or large offline user data.

---

## Recommended Technical Approach

### Option A — Recommended
**Capacitor + existing Vite app**

Why this is the best fit:

- Keeps your current codebase alive.
- Fastest route to Play Store.
- Preserves design quality already built in web UI.
- Lets you add native Android features gradually.
- Easier team workflow than a full rewrite.

Use this if:

- the app is already mostly working in mobile viewport
- you want to ship faster
- you do not want to rebuild the full UI in Flutter or native Android

### Option B — Full native rewrite
**Flutter or React Native**

Only do this if:

- performance becomes a serious bottleneck
- you need much deeper native platform behavior
- you are planning a much larger product rewrite anyway

For MuslimOS right now, this is not the elegant move.

---

## Do You Need SQLite?

### No, not yet, if you are only storing:

- settings
- streaks
- bookmarks
- last-read position
- tasbeeh counts
- checklist progress
- journal entries in light volume

These can stay in simple key-value storage.

### Yes, consider SQLite if you want:

- large offline downloadable Quran or tafseer packs
- full hadith databases with advanced filtering
- offline search indexes
- many local journal/checklist records over time
- sync queues for future accounts/cloud backup

### Recommendation for MuslimOS

**Phase 1**: do not block Play Store launch on SQLite.  
**Phase 2**: add SQLite only when content scale or offline search actually demands it.

---

## What I Would Do For MuslimOS

### Phase 1 — Ship Fast, Ship Clean

- Wrap the existing app in Capacitor.
- Audit mobile safe areas, splash screen, status bar, and Android back behavior.
- Replace fragile browser-only APIs where needed.
- Keep storage simple.
- Publish the first Android release.

### Phase 2 — Harden the Product

- Add native notifications for prayer reminders.
- Add offline content bundles.
- Add optional SQLite for heavier content.
- Add account sync only if product direction requires it.

This keeps momentum high and avoids premature architecture work.

---

## Implementation Plan

## 1. Stabilize the Web App for Mobile Shell Use

Before packaging, verify:

- all pages work at 360px to 430px widths
- no accidental horizontal scroll
- bottom nav and audio bar behave with Android safe areas
- browser back already maps to in-app navigation
- all important data survives reload

MuslimOS is already partway there.

### Immediate checks

- test audio behavior after app background/foreground
- test Quran reader performance on long surahs
- test scroll restoration
- test Qibla access and permission states
- test landing page and app route separation

---

## 2. Add Capacitor

Install:

```bash
npm install @capacitor/core @capacitor/cli
npx cap init
```

Then add Android:

```bash
npx cap add android
```

Build and sync:

```bash
npm run build
npx cap sync android
```

Open in Android Studio:

```bash
npx cap open android
```

### Why Capacitor works well here

- it loads your built web app inside a native shell
- it supports native plugins cleanly
- Android Studio remains the source of truth for release builds

---

## 3. Native Integrations You Should Add

### High priority

- splash screen
- app icons
- status bar styling
- Android back handling
- notification permissions flow
- deep link handling if needed later

### Likely plugins

- `@capacitor/preferences`
- `@capacitor/app`
- `@capacitor/status-bar`
- `@capacitor/local-notifications`
- `@capacitor/device`

### Optional later

- `@capacitor-community/sqlite`
- background tasks
- biometric lock for private journal content

---

## 4. Storage Strategy

### Keep simple storage for now

Good for:

- theme
- language
- bookmarks
- streak
- reciter preference
- checklist completion
- journal entries if still lightweight

### Move to SQLite only when data becomes relational or heavy

Use SQLite for:

- journal archive
- downloaded hadith collections
- offline tafseer packs
- search tables
- sync-ready user tables

### Migration suggestion

If you later add SQLite:

1. keep reading existing local storage on first launch
2. migrate it once into SQLite
3. mark migration complete
4. continue using SQLite from then onward

---

## 5. Android QA Checklist

Before release, test on:

- one small Android phone
- one large Android phone
- one older/slower Android device if possible

### Critical flows

- Home loads correctly
- Quran opens and scrolls smoothly
- surah audio and ayah audio do not conflict
- tafseer language sync works
- Worship tracker persists correctly
- Journal saves and reloads correctly
- Islamic Calendar shows correct local Hijri date
- Qibla page handles permission limitations gracefully
- app does not break when resumed from background

---

## 6. Play Store Requirements

You will need:

- Google Play Console account
- signed Android App Bundle (`.aab`)
- app icon
- feature graphic
- screenshots
- privacy policy URL
- data safety form
- content rating
- target audience declaration

### Store assets you should prepare

- app name: `MuslimOS`
- short description
- full description
- screenshots for phone layouts
- clean icon and brand system matching current emerald/gold identity

---

## 7. Privacy and Compliance

Because MuslimOS uses:

- location
- notifications
- audio
- possibly user reflections/journal

you should clearly document:

- what data stays on device
- what is never sold
- what external APIs are used
- what permissions are optional

For MuslimOS, strong privacy language is a product advantage.

---

## 8. Release Process

### Build steps

```bash
npm run build
npx cap sync android
npx cap open android
```

In Android Studio:

1. set version code and version name
2. configure signing key
3. generate release bundle
4. upload `.aab` to Play Console
5. publish to internal testing first

### Recommended rollout

1. Internal testing
2. Closed testing
3. Small production rollout
4. Full release after crash-free verification

---

## 9. MuslimOS-Specific Advice

### Ship first with:

- Quran reader
- prayer times
- worship tools
- hadith
- qibla
- journal
- Islamic calendar

### Delay until later if needed:

- account system
- sync backend
- SQLite migration
- aggressive offline content downloads

That gives you a credible v1 without overengineering.

---

## 10. Recommended Next Steps

### If I were guiding the build from here, I would do this in order:

1. prepare the app for Capacitor
2. add Android shell
3. test audio, navigation, and permissions on device
4. style splash/icon/status bar
5. create Play Store assets
6. publish internal test build
7. only then decide whether SQLite is actually necessary

---

## Final Recommendation

For MuslimOS, the most elegant move is:

**Keep the current app. Package it with Capacitor. Ship to Android first. Add SQLite only when the product actually needs heavy offline structured data.**

That path is technically sound, fast to market, and aligned with the quality already present in the product.

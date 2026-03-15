# MuslimOS — Final QA Checklist

Complete this checklist before submitting to the Play Store.

---

## App Functionality

- [ ] Home dashboard loads with prayer hero, greeting, verse of the day
- [ ] Prayer times calculate correctly for current location
- [ ] Prayer times page shows all 6 prayer cards with windows
- [ ] Quran surah list loads all 114 surahs
- [ ] Quran reader renders Arabic text with Amiri font
- [ ] Quran audio playback works (recitation + word highlighting)
- [ ] Hadith collections load and individual hadiths display
- [ ] Hadith search returns results
- [ ] Worship page — tasbeeh counter increments and persists
- [ ] Worship page — adhkar cards mark complete
- [ ] Worship tracker — daily checklist saves state
- [ ] Qibla compass renders and shows correct direction
- [ ] Journal — new entry saves with mood and text
- [ ] Journal — past entries display correctly
- [ ] Islamic calendar page loads
- [ ] Learn guides (Salah, Wudu, etc.) open and step through
- [ ] Bookmarks save and display in Quran collections
- [ ] Continue reading resumes at correct surah/ayah
- [ ] Dark mode toggle works (light/dark/auto)
- [ ] Auto dark mode activates at Isha, deactivates at Fajr

## Navigation

- [ ] Bottom nav switches between Home, Quran, Worship, Hadith
- [ ] App drawer opens and all rows navigate correctly
- [ ] Back button/gesture returns to previous page
- [ ] Browser back/forward works with history state
- [ ] Deep links from home fold cards work (Prayer Times, Journal, Calendar)

## Screenshots

- [ ] All 8 phone screenshots captured at 1080×2400
- [ ] Feature graphic captured at 1024×500
- [ ] Home screenshot shows afternoon greeting, prayer hero, realistic data
- [ ] Prayer Times screenshot shows all 6 cards with times
- [ ] Surah list screenshot shows numbered surahs with Arabic names
- [ ] Quran reader screenshot shows Al-Fatihah with Arabic text
- [ ] Worship screenshot shows tasbeeh/tracker content
- [ ] Hadith screenshot shows collections grid and daily hadith
- [ ] Qibla screenshot shows compass with direction
- [ ] Journal screenshot shows entries with moods
- [ ] All screenshots use light mode
- [ ] Fonts (DM Sans + Amiri) fully rendered in all screenshots
- [ ] No loading spinners or empty states visible

## Store Listing

- [ ] App name: "MuslimOS" (8 chars, under 30 limit)
- [ ] Short description filled (under 80 chars)
- [ ] Full description filled (under 4000 chars)
- [ ] All 8 screenshots uploaded to phone screenshots
- [ ] Feature graphic uploaded (1024×500)
- [ ] App icon uploaded (512×512)
- [ ] App category: Lifestyle
- [ ] Content rating completed (IARC)
- [ ] Target audience: 13+

## Privacy & Compliance

- [ ] Privacy policy URL accessible: https://muslimos.netlify.app/privacy.html
- [ ] Privacy policy content matches actual data practices
- [ ] Contact email correct: themuneebbilal@gmail.com
- [ ] Data safety form completed accurately
- [ ] Location permission declared (precise, optional, for prayer times/qibla)
- [ ] No third-party analytics or crash reporting SDKs undeclared
- [ ] No ads SDK present
- [ ] COPPA compliance confirmed (not directed at children under 13)

## Build Verification

- [ ] Package name: `com.muslimos.app`
- [ ] Signed AAB generated with release keystore
- [ ] Version code incremented from previous upload
- [ ] Version name matches release (e.g., 1.0.0)
- [ ] minSdk: 24 (Android 7.0)
- [ ] compileSdk: 36
- [ ] ProGuard/R8 enabled for release build
- [ ] AAB file size under 150MB

## Device Testing

- [ ] Small phone (360dp width) — all layouts fit, no overflow
- [ ] Large phone (412dp width) — content fills appropriately
- [ ] Cold launch — app opens within 3 seconds
- [ ] Background resume — state preserved after backgrounding
- [ ] Location permission prompt appears on first use
- [ ] App works with location permission denied (manual city fallback)
- [ ] Rotation — app handles orientation change gracefully
- [ ] Low memory — no crashes when system is under pressure

## Final Steps

- [ ] Internal test track upload successful
- [ ] Internal testers can install and open
- [ ] All console warnings/errors resolved
- [ ] Production release submitted for review

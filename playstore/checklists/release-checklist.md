# Release Checklist

## Web QA Gate

- `npm run build` passes
- `npm run test:e2e` passes
- main routes load on mobile and desktop
- Quran audio, ayah audio, and floating player work together
- prayer times page renders correctly on phone and laptop
- favorites/bookmarks persist after reload
- qibla handles denied permission gracefully
- journal persists and reloads

## Performance Gate

- review `dist/assets/*.js` bundle sizes after build
- confirm no major regressions to startup time on a low-end Android device
- test long-surah reader scroll performance
- test audio playback while switching tabs/views

## Android Device QA

- small Android phone tested
- large Android phone tested
- older/slower Android device tested if available
- cold launch works
- app resume from background works
- Android back button behavior is correct
- status bar and safe areas look correct
- geolocation permission flow is acceptable
- audio survives common app state transitions

## Store Readiness

- app icon prepared
- feature graphic prepared
- screenshots prepared
- short description prepared
- full description prepared
- privacy policy published to a public URL
- Data safety form answers prepared
- target audience declaration prepared
- content rating questionnaire answers prepared

## Release Build

- Capacitor synced with latest web build
- Android version name updated
- Android version code incremented
- release signing configured
- signed `.aab` generated
- uploaded first to Internal Testing
- smoke tested from Play internal track build

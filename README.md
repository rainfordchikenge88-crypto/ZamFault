# ZamFault

ZamFault is a mobile-first fault reporting app for Zambia. Users can create accounts, log in, upload profile photos, report issues, track them, and access an admin-only dashboard.

## Features

- User signup and login
- Profile photo upload
- GPS location capture
- Fault reporting with photos and descriptions
- Status updates and review flow
- Admin dashboard with status editing
- Logout flow
- Installable PWA for Android/Chrome
- Offline-supporting service worker

## Run locally

```bash
npm install
npm run dev -- --host 0.0.0.0
```

Then open the local URL shown in the terminal.

## Build for deployment

```bash
npm run build
```

The generated app is ready to host on static hosts such as Vercel, Netlify, or Firebase Hosting.

## Install on Android

Open the app in Chrome on Android and use the browser menu to Install App or Add to Home Screen. This makes the app behave like a mobile app.

## Play Store note

For Google Play Store publishing, package the PWA as a Trusted Web Activity / Android wrapper. Tools such as Bubblewrap or Capacitor can be used to generate a store-ready APK/AAB from this app.

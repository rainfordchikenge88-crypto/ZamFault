# ZamFault Play Store packaging guide

This repository is now configured to be wrapped as an Android app with Capacitor for Google Play publishing.

## 1) Install dependencies

```bash
npm install
```

## 2) Build the web app

```bash
npm run build
```

## 3) Add the Android project

```bash
npx cap add android
```

## 4) Sync the generated web build into Android

```bash
npm run android:sync
```

## 5) Open in Android Studio

```bash
npm run android:open
```

## 6) Build a signed Android App Bundle (.aab)

In Android Studio:

- Build > Generate Signed Bundle / APK
- Choose Android App Bundle
- Create a keystore if needed
- Sign the app
- Export the `.aab`

## 7) Upload to Google Play Console

Before publishing, prepare:

- privacy policy URL
- app icon and screenshots
- app description
- category and contact details
- Data Safety form
- testing track

## 8) Play Store requirements to keep in mind

- target API level 34+ for new apps
- Android App Bundle (.aab) required
- privacy policy required
- Data Safety form must be completed
- for new personal accounts, closed testing is usually required before production

## 9) Suggested app metadata

- App name: ZamFault
- Package ID: zm.co.zamfault.app
- App type: Utility / Productivity / Local service
- Privacy URL: https://your-domain.example/privacy

## 10) Notes for this app

ZamFault collects or may access:

- user account data
- profile photos
- fault report images
- GPS location
- issue metadata

Your Play Store Data Safety form and privacy policy should reflect that accurately.

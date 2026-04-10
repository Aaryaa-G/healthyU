This is a smartwatch health monitoring dashboard built with [Next.js](https://nextjs.org).

## Getting Started

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Dataset Source

The dashboard reads smartwatch patient data from:

`public/data/smartwatch-health-cleaned.csv`

The current file was copied from:

`c:\Users\admin\Downloads\Stop_Watch_Health_Dataset_Cleaned.csv`

If you want to refresh the app with a new cleaned dataset, replace the CSV in `public/data/` and keep these headers unchanged:

- `User ID`
- `Heart Rate (BPM)`
- `Blood Oxygen Level (%)`
- `Step Count`
- `Sleep Duration (hours)`
- `Activity Level`
- `Stress Level`

## Firebase Connection

This project now supports both:

- Firebase-backed cloud data using Firestore and Cloud Storage
- Firebase deployment configuration for Next.js App Hosting
- Firebase Authentication for admin-only sync and export actions

### Environment Setup

Copy `.env.example` to `.env.local` and fill in your Firebase values.

Important server values:

- `HEALTH_DATA_SOURCE=local` or `firebase`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_ADMIN_EMAILS=your-email@somaiya.edu`

Important client values:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### Enable Firebase Authentication

In the Firebase console for project `healthyu-68691`:

1. Open `Build` -> `Authentication`
2. Click `Get started`
3. Open the `Sign-in method` tab
4. Enable `Google`
5. Set the project support email
6. Save
7. Optionally also enable `Email/Password` if you want password login in addition to Google sign-in
8. Add your admin email to `.env.local` in `FIREBASE_ADMIN_EMAILS`

The app only allows allowlisted admin emails to run:

- Firebase dataset sync
- CSV/PDF exports

### Add A Web App In Firebase

1. Open `Project settings`
2. In `General`, scroll to `Your apps`
3. Click the Web icon `</>`
4. Register the web app
5. Copy the Firebase config values into `.env.local`

### Create The Service Account Key

1. Open `Project settings`
2. Open `Service accounts`
3. Click `Generate new private key`
4. Download the JSON file
5. Copy these values into `.env.local`:
   - `project_id` -> `FIREBASE_PROJECT_ID`
   - `client_email` -> `FIREBASE_CLIENT_EMAIL`
   - `private_key` -> `FIREBASE_PRIVATE_KEY`

### Sync The Local CSV To Firebase

After your Firebase env values are set and you are signed in with an allowlisted admin account, use the Reports page button:

- `Sync Local CSV To Firebase`

Or call the route manually with a Firebase ID token in the `Authorization` header.

That route will:

- upload patient rows into the Firestore collection in `FIREBASE_HEALTH_COLLECTION`
- upload the raw CSV into Cloud Storage
- save sync metadata in `FIREBASE_HEALTH_METADATA_DOC`

Then switch the app to Firebase by setting:

```bash
HEALTH_DATA_SOURCE=firebase
```

### Firebase Files In This Repo

- `src/lib/firebase/admin.ts`
- `src/lib/firebase/client.ts`
- `src/lib/firebase/auth-server.ts`
- `src/app/api/auth/session/route.ts`
- `src/app/api/firebase/sync/route.ts`
- `firebase.json`
- `firestore.rules`
- `storage.rules`
- `apphosting.yaml`

### Hosting Note

Firestore and Cloud Storage both have free-tier usage limits. However, according to Firebase's official App Hosting docs, full Next.js server hosting on Firebase App Hosting may require the Blaze plan rather than the Spark free tier. The app is wired for Firebase hosting, but you should expect that deployment model to potentially need billing enabled.

## What The App Shows

- Dashboard cards with real averages for heart rate, blood oxygen, steps, and sleep
- High-risk patient trend chart based on a dataset-derived risk score
- Cohort alerts for low oxygen, high heart rate, short sleep, and high stress
- Population analytics grouped by smartwatch activity level
- Report summaries generated directly from the CSV
- Filtered report exports as CSV or branded PDF
- One-click raw patient dataset export as CSV

## Notes

- The supplied CSV does not include timestamps, so the app focuses on cohort and patient trend analysis instead of real-time time-series charts.
- Date filters automatically enable if a future cleaned dataset includes a `Date`, `Timestamp`, or `Recorded At` column.
- Dataset parsing and aggregation live in `src/lib/health-data.ts`.

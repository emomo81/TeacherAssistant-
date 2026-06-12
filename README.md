# TeacherAssistant — MarkScan

Cross-platform mobile app for Liberian schools that turns a **marked paper into the data-entry device**: photograph student papers, extract scores via OCR, review, and populate a grade book that syncs to the cloud and exports to Google Sheets / Excel — fully offline-capable.

Implemented from the **MarkScan Prototype** design handoff (Claude Design bundle) and the [MarkScan PRD v1.0](docs/MarkScan_PRD_v1.0.md).

- **Mobile:** React Native + Expo **SDK 54** (iOS + Android), TypeScript, expo-router
- **Backend:** Node.js + Express (offline-first sync replica + export API)
- **Design direction:** *Greenboard* (chalk green on cream) — the direction selected in the design tool, with light/dark support and the Ministry / Harmattan palettes also ported.

```
TeacherAssistant-/
├── mobile/     Expo SDK 54 app (the MarkScan client)
├── server/     Node.js/Express backend API
└── docs/       PRD
```

## What's implemented (every screen from the prototype)

| Screen | File | Notes |
|--------|------|-------|
| Animated logo splash + 3-step onboarding | [mobile/app/index.tsx](mobile/app/index.tsx) | Logo pop, scan-frame corners, sweeping OCR beam, letter-reveal wordmark |
| Home (class list, sync badge, profile + logout) | [mobile/app/home.tsx](mobile/app/home.tsx) | Greeting, completion rings, dark-mode toggle, archived classes |
| Class detail | [mobile/app/class.tsx](mobile/app/class.tsx) | Action tiles + recent activity |
| Pre-scan setup | [mobile/app/prescan.tsx](mobile/app/prescan.tsx) | Component picker, remaining-students list |
| **Scan flow** (camera → mark zone → OCR → review → summary) | [mobile/app/scan.tsx](mobile/app/scan.tsx) | Live `expo-camera`, drag-to-draw Mark Zone, simulated OCR pipeline, confidence warnings, duplicate detection, confetti summary |
| Grade book | [mobile/app/gradebook.tsx](mobile/app/gradebook.tsx) | Spreadsheet table, inline edit sheet, filters, stats footer |
| Assessment setup | [mobile/app/setup.tsx](mobile/app/setup.tsx) | Rename components, edit weights/max, 3 calculation methods (live recalc) |
| Export & sync | [mobile/app/export.tsx](mobile/app/export.tsx) | Cloud backup, animated Google Sheets write, Excel export |

Shared theme/data/components live in [mobile/src/](mobile/src/). The calculation engine (`weighted` / `points` / `droplow`, Liberian A–F scale, 60% MOE pass mark) is shared in spirit between [mobile/src/data.ts](mobile/src/data.ts) and [server/src/calc.js](server/src/calc.js).

> **OCR note:** on-device OCR (Google ML Kit per the PRD) is not available in Expo Go, so the scan flow uses the prototype's scripted OCR pipeline (real camera capture → simulated deskew/enhance/read → mandatory human review). Swap in `@react-native-ml-kit/text-recognition` (requires a dev build) to make it read real digits — the review/assign/save UX is already built around it.

## Run it

### Backend
```bash
cd server
npm install
npm start          # http://localhost:4000  (npm run dev for watch mode)
```
Quick check: `curl http://localhost:4000/classes/c1/gradebook`

Key endpoints: `GET /classes`, `GET /classes/:id/gradebook?method=weighted|points|droplow`,
`PUT /marks`, `POST /sync`, `POST /classes/:id/export/sheets`, `POST /classes/:id/export/excel`,
`POST /classes/:id/students/import`.

### Mobile (iOS + Android)
```bash
cd mobile
npm install
npm start          # Expo dev server — press i (iOS sim), a (Android), or scan the QR in Expo Go
# or:  npm run ios   /   npm run android
```
- Requires the camera on the Scan screen (grant the permission prompt). Everything else runs in **Expo Go**.
- `npm run typecheck` runs `tsc --noEmit` (currently clean).

### Point the app at the backend
The app ships with the prototype's in-memory demo data so it runs with no backend. To wire it to the API, set `EXPO_PUBLIC_API_URL` (e.g. `http://<your-LAN-ip>:4000`) and read it via `process.env.EXPO_PUBLIC_API_URL` in a data layer — the server already exposes the matching gradebook/sync/export contracts.

## Verified
- `server`: endpoints smoke-tested — gradebook stats, last-write-wins `/sync`, and real Google-Sheets formulas (`=(C2/10*10%)+…`).
- `mobile`: `tsc --noEmit` passes; `expo config` resolves all plugins on SDK 54.

## Not yet wired (PRD v1 scope beyond the prototype)
Supabase Auth/RLS, real Google OAuth + Sheets API calls, real `.xlsx` file writing, on-device ML Kit OCR, and the local SQLite (Drift-equivalent) store. The backend models and the app's state layer are shaped to drop these in.

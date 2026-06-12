# MarkScan — Product Requirements Document
**Version:** 1.0  
**Status:** Draft  
**Last Updated:** June 2026  
**Author:** Emmanuel  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Goals & Non-Goals](#3-goals--non-goals)
4. [Success Metrics](#4-success-metrics)
5. [User Personas](#5-user-personas)
6. [Core Features](#6-core-features)
7. [User Flows](#7-user-flows)
8. [Data Models](#8-data-models)
9. [Technical Architecture](#9-technical-architecture)
10. [Offline Strategy](#10-offline-strategy)
11. [Google Sheets Integration](#11-google-sheets-integration)
12. [Non-Functional Requirements](#12-non-functional-requirements)
13. [Out of Scope (v1)](#13-out-of-scope-v1)
14. [Phased Roadmap](#14-phased-roadmap)
15. [Open Questions](#15-open-questions)

---

## 1. Executive Summary

**MarkScan** is a cross-platform mobile application built for Liberian schools that eliminates manual data entry for teachers by letting them photograph marked student papers, extract scores via OCR, and automatically populate a connected Google Sheet or local Excel file. Teachers set up their class once, configure their assessment structure, and from then on their only job after marking is: open app → take photos → confirm numbers → done.

The app is designed around Liberia's K–12 education system, the Ministry of Education's three-term academic calendar, and the real-world constraints Liberian teachers face: low-end Android devices (Tecno, Itel, Infinix), unreliable internet outside Monrovia, and no dedicated school IT support. It works fully offline and syncs passively when a connection is available — no teacher should ever be blocked from entering grades because of poor connectivity.

---

## 2. Problem Statement

In Liberian schools — from community schools in rural counties to private institutions in Monrovia — teachers face a recurring, high-pressure task: after physically marking student papers, they must manually re-enter every score into a grade book or spreadsheet. A teacher managing 4 classes of 35 students each must re-enter 140+ marks per assessment, per term, entirely by hand, with no validation.

This problem is compounded by Liberia-specific realities:
- Many schools have no formal grading software; teachers rely on paper ledgers or personal Excel files
- Electricity is unreliable in many counties, limiting computer use
- Teachers often carry multiple subject loads and have minimal prep time
- Grade submission deadlines to school administration are strict, but data entry happens under rushed conditions
- Transcription errors directly affect student promotion decisions and WAEC exam eligibility

**MarkScan solves this by making the marked paper itself the data entry device — with a phone that every teacher already carries.**

---

## 3. Goals & Non-Goals

### Goals (v1)

- Allow any teacher to onboard without IT support in under 10 minutes
- Support batch scanning of a full class set of papers in one session
- Extract marks via OCR with a mandatory human review step before saving
- Support custom assessment components with weighted calculations
- Work fully offline with background sync to Supabase and Google Sheets
- Run on both Android and iOS from a single codebase

### Non-Goals (v1)

- Auto-identifying which student a paper belongs to via face recognition or handwriting
- Generating official report cards or certificates
- Parent/student portals
- School administration dashboards (multi-teacher management)
- SMS or email notifications
- Support for multiple languages (English only for v1)

---

## 4. Success Metrics

| Metric | Target |
|--------|--------|
| Onboarding time (first class + first assessment setup) | < 10 minutes |
| OCR accuracy on printed/handwritten numbers | ≥ 90% correct on first read |
| Time to scan a class of 40 papers (with review) | < 8 minutes |
| Sync success rate when connectivity returns | 99.5% |
| Teacher retention after first use | > 70% at 30 days |
| App crash rate | < 0.5% of sessions |

---

## 5. User Personas

### Primary: Classroom Teacher — "Ms. Kollie"
- Teaches Mathematics and Science at a Junior High School in Margibi County
- Uses a Tecno Spark (low-end Android, 2GB RAM) — the most common phone profile in Liberia
- Has basic smartphone literacy: WhatsApp, calls, camera — but not tech-savvy beyond that
- Internet access: mobile data (Lonestar Cell or Orange Liberia) is patchy; uses WiFi at school only occasionally
- Marks papers at home on weekends, must submit grades to the principal by Monday morning
- Pain point: Re-typing 120 marks every weekend, then recalculating weighted totals by hand

### Secondary: Department Head / Senior Teacher — "Mr. Wolo"
- Oversees the Mathematics department at a Senior High School in Monrovia
- Needs to compile marks from 3–4 subject teachers into one departmental spreadsheet for the VP
- Occasionally overrides a teacher's entered mark with a note (e.g., absent during exam)
- Pain point: Receiving grades in 4 different Excel formats from 4 different teachers every term

### Edge Case: New or Substitute Teacher
- Just assigned to cover a class mid-term; has no pre-existing setup
- Needs to be productive in the app within 10 minutes with no training
- May not have a Google account — must be able to use the app with just email sign-up and Excel export

---

## 6. Core Features

---

### Feature 1: Authentication & School Profile

**Description:** Teachers sign in with Google (OAuth 2.0) or email/password. On first login, they set up a school profile. The school profile is personal to each teacher — there is no institutional admin.

**Requirements:**
- Google Sign-In and email/password sign-up supported
- Teacher profile contains: Name, School Name, School Location (optional), Subject(s) taught
- Each teacher's data is fully isolated — no cross-teacher data visibility
- Profile is stored in Supabase Auth; school info in `profiles` table
- First-time onboarding wizard: 3 screens (sign up → school info → create first class)

**Edge Cases:**
- If teacher loses phone: data recoverable from Supabase via new login
- If teacher changes schools: they update school name in profile; all existing classes remain

---

### Feature 2: Class & Student Management

**Description:** Teachers create classes and populate them with student names. A class belongs to one teacher and contains multiple students.

**Requirements:**

**Class Setup:**
- Create class with: Name (e.g., "Grade 9A Mathematics", "Grade 7B English"), Academic Year, Term
- School level auto-detected from grade: Primary (1–6), Junior High (7–9), Senior High (10–12)
- Academic year runs September to June; three terms (First Term, Second Term, Third Term)
- Classes are listed on the home screen grouped by term
- Archive class at end of academic year (data preserved, hidden from active list)

**Student Management:**
- Add students individually (name + optional student ID number)
- Bulk import via CSV file (columns: Student ID, First Name, Last Name)
- Edit or remove individual students
- Student list ordered by student ID or alphabetically (teacher's choice)
- Maximum students per class: 80

**Student Fields:**
- `student_id` (UUID, system-generated)
- `student_number` (optional, school-assigned ID — used for OCR matching in v2)
- `first_name`
- `last_name`
- `class_id` (foreign key)

**CSV Import Format:**
```
student_number,first_name,last_name
001,Moses,Kollie
002,Grace,Pewee
003,Joseph,Kanneh
```
Errors in the CSV (missing name, duplicate student number) are reported row-by-row on import.

---

### Feature 3: Assessment Configuration

**Description:** Teachers define the structure of how marks are calculated — what components exist, their maximum marks, and their weight in the final grade.

**Requirements:**

**Assessment Period:**
- A "Period" is a reporting window aligned to Liberia's three-term calendar:
  - First Term (September – November)
  - Second Term (December – March)
  - Third Term (April – June)
- A period contains multiple Components

**Assessment Components:**
- Teacher creates components with: Name, Max Mark, Weight (%)
- Suggested defaults for Liberian schools (teacher can customize):
  - Classwork / Participation (10 marks, 10%)
  - Quizzes × 2 (20 marks each, 10% each)
  - Assignment (20 marks, 10%)
  - Mid-Term Test (50 marks, 20%)
  - End of Term Exam (100 marks, 40%)
- Weights must sum to 100% — the app validates this and shows a running total
- Teacher can add, reorder, or delete components at any time before marks are locked
- Once marks have been entered for a component, deleting it requires explicit confirmation with a warning

**Calculation Rules:**
- Final Period Mark = Σ (ComponentMark / ComponentMax × ComponentWeight)
- This is auto-calculated and displayed per student
- Teacher can override the final mark for a student with a note (e.g., "Medical exemption", "Absent — excused")
- Pass threshold is configurable per period (default: **60%**, in line with Liberia MOE standard)

**Liberian Grading Scale (applied automatically to Final Mark):**

| Grade | Range | Description |
|-------|-------|-------------|
| A | 90 – 100% | Excellent |
| B | 80 – 89% | Above Average |
| C | 70 – 79% | Average |
| D | 60 – 69% | Below Average (Passing) |
| F | 0 – 59% | Failing |

**Example Period Setup:**
```
Period: First Term — Grade 9A Mathematics
├── Classwork / Participation   max:10    weight:10%
├── Quiz 1                      max:20    weight:10%
├── Quiz 2                      max:20    weight:10%
├── Assignment                  max:20    weight:10%
├── Mid-Term Test               max:50    weight:20%
└── End of Term Exam            max:100   weight:40%
                                     Total weight: 100% ✓
Pass threshold: 60%
```

---

### Feature 4: Batch Scan & OCR

**Description:** The core feature of the app. Teacher scans a stack of papers, the app extracts numbers via OCR, and stores them against the correct student.

**This is the most critical UX flow in the app.**

#### 4a. Pre-Scan Setup

Before scanning, the teacher:
1. Selects the Class
2. Selects the Assessment Component (e.g., "Quiz 1")
3. Sees a list of all students — those without a mark for this component are highlighted
4. Taps "Start Scanning Session"

#### 4b. The Mark Zone System

**Problem solved:** OCR on a full paper is unreliable. The mark could be anywhere. MarkScan solves this by asking the teacher to define a "Mark Zone" — a rectangular region on the paper where the mark is written.

**How it works:**
- On the first scan of each session, after taking the photo, the teacher draws a box around the mark (pinch/drag on the image)
- This zone definition is saved for the rest of the session (all papers in the same batch are assumed to have the same layout)
- Teacher can re-define the zone at any time during the session

#### 4c. Scan Flow (per paper)

```
[Take Photo] → [Auto-crop & straighten] → [Apply Mark Zone] → [OCR extracts number] → [Review Screen]
```

1. **Camera Screen:** Full-screen camera with overlay guidelines to align paper. Supports auto-capture on document detection (optional, toggleable).
2. **Processing:** The image is cropped to the Mark Zone, contrast-enhanced, then passed to OCR (Google ML Kit on-device).
3. **Review Screen (mandatory, cannot be skipped):**
   - Shows the cropped Mark Zone region (zoomed in, high contrast)
   - Shows the extracted number in large text below it
   - Teacher taps "Correct ✓" or manually edits the number
   - Teacher assigns the mark to a student (tap from the remaining-students list)
   - Tap "Save & Next" to move to the next paper

4. **OCR Confidence:**
   - If confidence < 70%, the extracted number is shown in **orange** with a warning icon
   - If confidence < 40%, the field shows "?" and forces manual entry
   - Confidence threshold is configurable in Settings

#### 4d. Batch Session State

- The session tracks: total papers scanned, students assigned, students remaining
- Teacher can pause mid-session and resume later (session state saved locally)
- Papers scanned but not yet assigned to a student are held in a "Pending" queue
- Teacher can go back to a previous scan within the session and correct it
- Session ends when teacher taps "Finish Session" or all students are assigned

#### 4e. Duplicate Detection

- If a student already has a mark for this component, the app warns: "Alice Mugisha already has Quiz 1 = 18/20. Overwrite?"
- Teacher must explicitly confirm before overwriting

---

### Feature 5: Mark Review & Grade Book

**Description:** After scanning, teacher can view and edit all marks in a spreadsheet-style grade book.

**Requirements:**

**Grade Book View:**
- Table view: Rows = students, Columns = components + final calculated mark
- Color coding: Red = missing mark, Orange = below pass threshold, Green = above pass threshold
- Tap any cell to edit the mark inline
- Mark override shows a pencil icon and a tooltip with the note
- Scroll horizontally for many components

**Filters & Sorting:**
- Sort by student name, roll number, or final mark (ascending/descending)
- Filter by: All students, Missing marks only, Below threshold only

**Statistics Row (pinned at bottom):**
- Class Average, Highest Mark, Lowest Mark, Pass Rate (%)

**Mark History:**
- Every change to a mark is logged: old value, new value, timestamp, method (OCR / manual)
- Teacher can view history per student per component
- Cannot delete history (audit trail)

---

### Feature 6: Sync & Export

**Description:** Marks saved locally are synced to Supabase (cloud backup) and can be pushed to Google Sheets on demand.

#### 6a. Supabase Sync (Automatic)

- All data is stored locally first (SQLite via Drift)
- Background sync to Supabase runs whenever internet is detected
- Sync status shown as an icon in the header: synced ✓ / pending ↑ / offline ✗
- Conflicts resolved by "last-write-wins" with timestamp; conflicting records flagged for teacher review
- On new device login, all data is restored from Supabase

#### 6b. Google Sheets Export (On-Demand)

- Teacher connects their Google account once (OAuth 2.0)
- Per period, teacher taps "Export to Google Sheets"
- App creates a new sheet (or updates existing) with:
  - Sheet name = Class Name + Period Name
  - Row 1: Headers (Roll No, Student Name, Component 1, Component 2... Final Mark, Grade)
  - One row per student
  - Formula for Final Mark inserted as a real Google Sheets formula (not just a value)
- Teacher can choose: Create new spreadsheet OR add as a sheet to an existing one (picker)
- Export status: Success / Failed (with retry option)

#### 6c. Excel Export (Offline-Safe)

- Teacher can export to `.xlsx` file at any time, even offline
- File is saved to the device's Downloads folder
- Same structure as Google Sheets export

---

### Feature 7: Offline Mode

**Description:** All core functionality — scanning, OCR, mark entry, grade book viewing — works without internet. Sync happens in the background when connectivity returns.

**Requirements:**
- Local SQLite database (via Drift) as single source of truth
- Supabase is a sync target, not the primary store
- Offline queue: all writes go to a local change log
- When internet returns: sync queue is replayed against Supabase
- Google Sheets export requires internet — button is disabled offline with a tooltip
- User is never shown a loading spinner due to network; all reads are from local DB

**Conflict Resolution:**
- Each record has a `last_modified_at` timestamp (device local time + UTC offset)
- On sync: if server version is newer, download it; if local version is newer, upload it
- If both were modified while offline (unlikely but possible): show a conflict resolution dialog

---

### Feature 8: Settings & Customization

**Requirements:**
- Toggle: Auto-capture on document detection (on/off)
- OCR confidence threshold (slider: 40%–90%)
- Default pass mark (default: 60%, Liberia MOE standard)
- Mark display format: Raw (18) or Fraction (18/20) or Percentage (90%)
- Dark/Light mode
- Manage Google account connection
- Export default location (Downloads folder or Google Drive)
- Delete account + all local data (irreversible, requires confirmation)

---

## 7. User Flows

### Flow A: First-Time Onboarding
```
Download app
  → Sign up (Google or email)
  → Enter school name
  → Create first class (name + academic year + term)
  → Add students (CSV import or manual)
  → Create first assessment period
  → Add components to period
  → Ready to scan
```

### Flow B: Weekly Mark Entry (Returning Teacher)
```
Open app (home shows active classes)
  → Tap class
  → Tap "New Scan Session"
  → Select component (e.g., "Quiz 2")
  → Define mark zone on first paper
  → Scan papers one by one
    → Each: take photo → review OCR → assign student → save
  → Finish session
  → Review grade book (fix any errors)
  → Tap "Sync" (or it auto-syncs)
  → Optional: "Export to Google Sheets"
```

### Flow C: Correcting a Mark After Scanning
```
Open class → Grade Book
  → Find student row
  → Tap the mark cell
  → Edit the value
  → Enter reason (optional note)
  → Tap Save
  → Change logged in mark history
```

### Flow D: End of Term
```
Open period
  → All components filled (green status)
  → Review class statistics
  → Export to Google Sheets (for school records)
  → Download Excel backup
  → Archive the class
```

---

## 8. Data Models

### `profiles`
```
id              UUID (references auth.users)
full_name       TEXT
school_name     TEXT
school_location TEXT (optional)
subjects        TEXT[] (array)
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### `classes`
```
id              UUID PK
teacher_id      UUID FK → profiles.id
name            TEXT (e.g., "S3A Mathematics")
academic_year   TEXT (e.g., "2025–2026")
term            TEXT (e.g., "First Term")
is_archived     BOOLEAN DEFAULT false
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### `students`
```
id              UUID PK
class_id        UUID FK → classes.id
roll_number     TEXT (optional, unique within class)
first_name      TEXT
last_name       TEXT
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### `assessment_periods`
```
id              UUID PK
class_id        UUID FK → classes.id
name            TEXT (e.g., "First Term")
pass_threshold  DECIMAL DEFAULT 50.0
is_locked       BOOLEAN DEFAULT false
created_at      TIMESTAMP
```

### `assessment_components`
```
id              UUID PK
period_id       UUID FK → assessment_periods.id
name            TEXT (e.g., "Quiz 1")
max_mark        DECIMAL
weight          DECIMAL (percentage, e.g., 10.0)
display_order   INTEGER
created_at      TIMESTAMP
```

### `marks`
```
id              UUID PK
student_id      UUID FK → students.id
component_id    UUID FK → assessment_components.id
raw_mark        DECIMAL
is_override     BOOLEAN DEFAULT false
override_note   TEXT (optional)
entry_method    ENUM('ocr', 'manual', 'import')
ocr_confidence  DECIMAL (optional, 0–100)
created_at      TIMESTAMP
updated_at      TIMESTAMP
last_modified_at TIMESTAMP (for sync conflict resolution)
```

### `mark_history`
```
id              UUID PK
mark_id         UUID FK → marks.id
old_value       DECIMAL
new_value       DECIMAL
changed_by      UUID FK → profiles.id
change_reason   TEXT (optional)
changed_at      TIMESTAMP
```

### `sync_queue` (local SQLite only)
```
id              INTEGER PK AUTOINCREMENT
table_name      TEXT
record_id       UUID
operation       ENUM('INSERT', 'UPDATE', 'DELETE')
payload         TEXT (JSON)
created_at      TIMESTAMP
synced_at       TIMESTAMP (null until synced)
sync_error      TEXT (null if successful)
```

---

## 9. Technical Architecture

### Stack Decision

| Layer | Technology | Reason |
|-------|------------|--------|
| Mobile Framework | Flutter | True cross-platform (iOS + Android), excellent camera/image APIs, good OCR library support |
| Local Database | SQLite via Drift | Type-safe, offline-first, query-based, works on both platforms |
| Cloud Backend | Supabase | PostgreSQL + Auth + Storage + Realtime, generous free tier, easy RLS for data isolation |
| OCR Engine | Google ML Kit (on-device) | No internet required, fast, handles printed and handwritten numbers reasonably well |
| Google Sheets | Google Sheets API v4 | Direct integration via OAuth, teacher already has Google account |
| State Management | Riverpod | Works well with Flutter + async data |
| Image Processing | OpenCV (via flutter_opencv or dart image) | Pre-processing before OCR: contrast, deskew, crop |

### Architecture Diagram

```
┌─────────────────────────────────────┐
│           Flutter App               │
│                                     │
│  ┌──────────┐  ┌──────────────────┐ │
│  │ Camera   │  │   Grade Book     │ │
│  │ + OCR    │  │   + Settings     │ │
│  └────┬─────┘  └────────┬─────────┘ │
│       │                 │           │
│  ┌────▼─────────────────▼─────────┐ │
│  │        Riverpod Providers       │ │
│  └────────────────┬───────────────┘ │
│                   │                 │
│  ┌────────────────▼───────────────┐ │
│  │     Local SQLite (Drift)        │ │
│  │   [Single source of truth]      │ │
│  └────────────────┬───────────────┘ │
│                   │                 │
│  ┌────────────────▼───────────────┐ │
│  │     Sync Engine (background)    │ │
│  │  ┌──────────┐  ┌─────────────┐ │ │
│  │  │ Supabase │  │ Sheets API  │ │ │
│  │  │  Sync    │  │  (on-demand)│ │ │
│  │  └──────────┘  └─────────────┘ │ │
│  └────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Supabase Row Level Security (RLS)

All tables must have RLS enabled. Base policy pattern:
```sql
-- Teachers can only see their own data
CREATE POLICY "teacher_isolation" ON classes
  FOR ALL USING (teacher_id = auth.uid());
```
Same pattern applies to all tables via join to `classes.teacher_id`.

### OCR Pipeline

```
Raw camera image
  → Perspective correction (deskew)
  → Grayscale conversion
  → Adaptive thresholding (for poor lighting)
  → Crop to Mark Zone rectangle
  → Contrast enhancement (CLAHE)
  → Google ML Kit Text Recognition
  → Extract first number from result text
  → Return { value: number, confidence: float }
```

The pipeline runs entirely on-device. No image is sent to any server.

### Image Storage

Scanned paper images are:
- Stored temporarily in local cache during the scan session
- Deleted after the session is confirmed/closed (privacy)
- NOT uploaded to Supabase or any server
- Teacher can optionally keep session images for 7 days (opt-in setting)

---

## 10. Offline Strategy

### Principle: Local First, Cloud Second

The app treats SQLite as the database. Supabase is treated as a remote replica.

### Sync Flow

```
User Action
  → Write to SQLite immediately
  → Add record to sync_queue
  → UI updates instantly (no waiting)

Background Sync (runs every 30 seconds when online):
  → Read all unsynced records from sync_queue
  → For each record: POST/PATCH/DELETE to Supabase
  → On success: mark synced_at in sync_queue
  → On failure: increment retry_count, exponential backoff
  → After 5 failures: mark as error, alert teacher
```

### Conflict Resolution

Each `marks` record has `last_modified_at`. On sync:

```
If local.last_modified_at > server.last_modified_at:
  → Push local to server (local wins)

If server.last_modified_at > local.last_modified_at:
  → Pull server to local (server wins)

If timestamps are equal and values differ:
  → Show conflict dialog to teacher
  → Teacher picks which value to keep
```

### What Works Offline

| Feature | Offline? |
|---------|----------|
| Scanning & OCR | ✅ Full |
| Grade book view/edit | ✅ Full |
| Student management | ✅ Full |
| Assessment setup | ✅ Full |
| Excel export | ✅ Full |
| Supabase sync | ❌ Queued |
| Google Sheets export | ❌ Requires internet |
| Sign in (first time) | ❌ Requires internet |
| Sign in (returning) | ✅ Cached token |

---

## 11. Google Sheets Integration

### OAuth Setup
- Teacher signs in with Google once
- Scope requested: `https://www.googleapis.com/auth/spreadsheets`
- Token stored securely in Flutter Secure Storage
- Token refresh handled automatically (Google OAuth 2.0 refresh flow)

### Sheet Structure on Export

**Spreadsheet name:** `[School Name] — Grade Book`  
**Sheet tab name:** `[Class Name] [Period Name]`

**Columns:**
```
A: Roll No | B: Student Name | C: [Component 1] | D: [Component 2] | ... | Z: Final Mark | AA: Grade
```

**Row 1:** Bold headers with light blue background  
**Row 2 onward:** One student per row  
**Final Mark formula** (example for 3 components):
```
=(C2/20*10%)+(D2/20*10%)+(E2/100*80%)
```
This is written as a real formula so teachers can see and verify the logic.

**Grade column:** `=IF(Z2>=90,"A",IF(Z2>=80,"B",IF(Z2>=70,"C",IF(Z2>=60,"D","F"))))` (Liberian A–F grading scale)

### Re-Export Behavior
- If sheet already exists for this class+period: values are updated, formulas preserved
- Teacher is warned before overwriting: "This will update [Sheet Name]. Continue?"

---

## 12. Non-Functional Requirements

### Performance
- App launch to home screen: < 2 seconds (cold start)
- Camera to OCR result: < 1.5 seconds per paper
- Grade book load for 80 students × 10 components: < 0.5 seconds
- Google Sheets export for 40 students: < 10 seconds

### Security
- All Supabase tables protected by Row Level Security
- No student data sent to external servers (OCR is on-device)
- Google OAuth tokens encrypted via Flutter Secure Storage
- Session images deleted after session close (unless opt-in retention)
- App requires device authentication (biometric or PIN) on launch (optional, user setting)

### Reliability
- Scan session state saved after every individual paper confirmation — crash mid-session loses at most 1 paper
- All writes to SQLite are transactional
- Sync queue retry with exponential backoff (1s → 2s → 4s → 8s → 16s max)

### Accessibility
- Minimum touch target size: 48×48dp
- All OCR review screens support manual keyboard input as fallback
- High-contrast mode respected from system settings

### Platform Requirements
- **Primary target:** Android — Tecno, Itel, Infinix devices dominate the Liberian market. These are typically low-end (2–3GB RAM, 32GB storage, Android 8–11).
- Android: API 26+ (Android 8.0+) — covers the realistic Liberian device market while keeping ML Kit stable
- iOS: iOS 14+ — secondary priority; most Liberian teachers use Android
- App size target: **< 30MB** installed (low storage devices have limited space)
- RAM usage target: **< 150MB** active — ML Kit OCR must not cause OOM crashes on 2GB devices
- Storage required: ~30MB app + ~3MB per class of data
- **No assumption of persistent internet** — the app must be fully usable on mobile data bursts (Lonestar Cell / Orange Liberia), not continuous connectivity

---

## 13. Out of Scope (v1)

| Feature | Reason Deferred |
|---------|-----------------|
| Auto student-paper matching via student number on paper | Requires standardized paper templates; complex OCR; v2 |
| Multi-teacher / department head aggregation view | Requires institutional setup flow; v2 |
| Report card PDF generation (MOE-format) | High complexity; requires MOE template spec; v2 |
| Parent/student portal | Separate product; v3 |
| SMS mark alerts via Lonestar Cell / Orange Liberia | Requires Africa's Talking Liberia integration; v2 |
| Bulk paper scanning via document scanner (multi-page) | Complex session management; v2 |
| WAEC exam result tracking | Different data source; v3 |
| School admin / principal dashboard (web) | v2 |
| French localization | Liberia is English-speaking; low priority |
| MOE online grade submission portal integration | MOE portal API not yet publicly available |

---

## 14. Phased Roadmap

### Phase 1 — Foundation (Weeks 1–4)
- Flutter project setup (Riverpod, Drift, Supabase)
- Auth (Google Sign-In + email)
- Class + Student management (manual + CSV import)
- Assessment period + component configuration
- Local SQLite schema + CRUD
- Basic grade book view

**Milestone:** Teacher can set up a class and manually enter marks.

---

### Phase 2 — Core OCR Flow (Weeks 5–8)
- Camera integration (full-screen camera with guidelines)
- Mark Zone drawing tool (pinch/drag rectangle on image)
- OCR pipeline (image pre-processing + Google ML Kit)
- Review screen (extracted number + confirm/edit)
- Student assignment from remaining-students list
- Session state persistence (resume after crash/pause)
- Duplicate mark detection and warning

**Milestone:** Teacher can scan a full class set of papers and assign marks.

---

### Phase 3 — Sync & Export (Weeks 9–11)
- Supabase sync engine + sync_queue
- Conflict resolution dialog
- Google Sheets OAuth integration
- Google Sheets export (create/update sheet)
- Excel (.xlsx) offline export
- Sync status indicator in UI

**Milestone:** Marks sync to cloud and export to Google Sheets reliably.

---

### Phase 4 — Polish & Edge Cases (Weeks 12–14)
- OCR confidence thresholds + visual warnings
- Mark history / audit log view
- Class archiving
- Session summary screen (post-scan report: X papers scanned, Y assigned, Z pending)
- Settings screen (all configuration options)
- Onboarding wizard (first-time experience)
- Performance tuning + crash testing
- Beta testing with 3–5 real teachers

**Milestone:** App ready for public release on Play Store and App Store.

---

### Phase 5 — v2 Features (Future)
- Student number on paper → auto-assign student (no manual tap needed)
- Department head / principal aggregation view across teachers
- MOE-format report card PDF generation (term and annual)
- SMS mark alerts via Africa's Talking (Lonestar Cell + Orange Liberia)
- WAEC exam result import and correlation with class marks
- Integration with Confidence School System (school management platform)
- Web version for schools with computers and reliable power
- Offline-capable PWA for school computer labs

---

## 15. Open Questions

| # | Question | Owner | Due |
|---|----------|-------|-----|
| 1 | What OCR library gives best accuracy on handwritten numbers on Tecno/Itel devices (lower camera quality)? Evaluate: Google ML Kit vs Tesseract | Engineering | Phase 2 planning |
| 2 | Should the Mark Zone be re-used across sessions (for the same class) or reset each time? | UX decision | Phase 2 planning |
| 3 | Does Liberia MOE have a standard grade weighting structure that schools are required to follow, or is it school-by-school? | Product research | Phase 1 planning |
| 4 | Should students be shared across classes — e.g., same Grade 9A student appears in both Math and English classes without re-entry? | Product | Phase 1 planning |
| 5 | What happens if a teacher runs out of Google Drive storage on export? Show error + direct to Excel download? | Engineering | Phase 3 planning |
| 6 | For the Confidence School System integration (v2): will MarkScan push marks to CSS, or will CSS pull from MarkScan via API? | Architecture | Phase 5 scoping |
| 7 | Do we need a principal/admin mode in v1 — even read-only — for school owners who funded the pilot? | Product | Phase 1 planning |
| 8 | What is the maximum number of components per period? Schools using WAEC prep may have many small assessments. (Current assumption: 20) | UX decision | Phase 1 planning |

---

*MarkScan PRD v1.0 — Built for Liberian schools. For internal use. All data models and architecture decisions are subject to change during implementation.*

# MedLog (תרופותי) — Architecture & Functions Plan

**Version:** 0.19.0  
**Last reviewed:** 2025-03-16

---

## 1. Project Overview

MedLog is a family medication management and logging application. It allows families to:
- Track kids' medication doses and temperatures
- Browse a medicine database with dosage recommendations by weight/age
- Manage scheduled/recurring medication tasks with a take-tracking calendar
- Support multiple families and user roles (admin, owner, user)

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 18 + TypeScript |
| **Build** | Vite 5 |
| **Styling** | TailwindCSS 3 |
| **Routing** | react-router-dom v7 |
| **Backend/DB** | Firebase Firestore (cloud) |
| **Auth** | Custom username-based auth (no Firebase Auth password flow) |
| **i18n** | i18next + react-i18next (Hebrew / English) |
| **Icons** | Lucide React |
| **Calendar** | FullCalendar (day grid + interaction) |
| **Drag & Drop** | @hello-pangea/dnd |
| **Date Picker** | react-datepicker |
| **Hosting** | Firebase Hosting |

---

## 3. Directory Structure

```
src/
├── App.tsx                  # Root: AuthProvider → Router → MainLayout
├── main.tsx                 # Entry: initializes MedicineManager, renders App
├── types.ts                 # All TypeScript interfaces/enums
├── firebase.js              # Firebase init (app, db, auth, messaging)
├── firebase.d.ts            # TypeScript declarations for firebase.js
├── fileHandling.ts          # (entirely commented out) File System API helpers
├── custom.d.ts              # SVG module declarations
├── index.css                # Global styles
│
├── Layouts/
│   └── MainLayout.tsx       # Header + Routes + Navigation (bottom bar)
│
├── Pages/
│   ├── HomePage.tsx          # Kid buttons → MedicineDialog for quick logging
│   ├── LogPage.tsx           # Medication log table with filter/sort/edit/export
│   ├── KidsPage.tsx          # Kids list with drag-reorder, CRUD, expand details
│   ├── MedicinesPage.tsx     # Browse medicines by type or target audience
│   ├── ScheduledPage.tsx     # Scheduled tasks list with calendar tracking
│   ├── NotFound.tsx          # 404 page
│   ├── Kids/
│   │   └── AddKidForm.tsx    # (duplicate/older version of Forms/AddKidForm)
│   ├── Medicines/
│   │   └── AddMedicineForm.tsx # (duplicate — imported by MedicineManagement)
│   └── Settings/
│       ├── UserManagement.tsx    # Admin: add/remove users & families
│       └── MedicineManagement.tsx # Admin: CRUD medicines with filters/sort
│
├── Forms/
│   ├── AddKidForm.tsx            # Modal form: add/edit kid
│   ├── AddMedicineForm.tsx       # Modal form: add/edit medicine (all types)
│   └── AddScheduledTaskForm.tsx  # Modal form: add/edit scheduled task
│
├── components/
│   ├── Header.tsx            # Top bar: hamburger menu, language switcher, user
│   ├── Navigation.tsx        # Bottom tab bar (Home/Log/Scheduled/Medicines/Kids)
│   ├── MedicineDialog.tsx    # Quick-log dialog: select kid/medicine → save log
│   ├── LoginDialog.tsx       # Username-only login modal
│   ├── AboutDialog.tsx       # App info dialog (version, developer)
│   ├── TaskCalendar.tsx      # FullCalendar-based take tracking per task
│   └── TaskCalendar.css      # Calendar custom styles
│
├── services/
│   ├── firestoreService.ts   # Generic Firestore CRUD + typed collection wrappers
│   ├── medicineManager.ts    # Static MedicineManager class (init, search, dosage calc)
│   ├── kidManager.ts         # KidManager class + age calculation utilities
│   ├── logManager.ts         # LogManager class (load/save/delete/export logs)
│   ├── TaskManager.ts        # TaskManager class + remaining days calculation
│   ├── uiUtils.ts            # Date/time formatting utility class
│   └── usersManager.ts       # (empty/commented out)
│
├── Users/
│   ├── AuthContext.tsx        # AuthProvider + useAuth hook (context-based auth)
│   └── users.json            # Seed/reference data for families & users
│
├── i18n/
│   ├── i18n.ts               # i18next config (Hebrew fallback)
│   └── locales/
│       ├── en.json            # English translations (header + about only)
│       └── he.json            # Hebrew translations (header + about only)
│
└── migration/
    ├── dataMigration.ts       # One-time migration: medicines.json → Firestore
    ├── MigrationRunner.tsx    # UI component to trigger migration
    └── medicines.json         # Source medicine data for migration
```

---

## 4. Data Models (types.ts)

| Type | Key Fields | Firestore Collection |
|---|---|---|
| **LogEntry** | id, logDate, logHour, kidName, temperature, selectedMedicine, actualDosage | `logs` |
| **Kid** | id, name, birthDate, age (computed), weight, favoriteMedicine, familyId, familyName, lastUpdated | `kids` |
| **TaskEntry** | id, taskUser, taskLabel, medicine, dose, doseUnits, taskStartDate, taskEndDate, taskDays, timesPerDay, timeInDay, withFood, comment, takesHistory | `tasks` |
| **Medicine** | Union: SuspensionMedicine \| CapletMedicine \| GranulesMedicine — each has entries array with dosage rules | `medicines` |
| **User** | username, role (owner/admin/user), familyId, kidOrder | `users` |
| **Family** | id, name, ownerId | `families` |

### Medicine Subtypes

- **SuspensionMedicine**: concentration, entries with w_low/w_high/dos/perDay_low/perDay_high/maxDay/maxDayPerKg
- **CapletMedicine**: strength, entries with age_low/age_high/dos_low/dos_high/hoursInterval_low/hoursInterval_high/maxDay
- **GranulesMedicine**: strength, entries with same structure as Caplets

### Enums

- **MedicineType**: Suspension, Caplets, Granules
- **TargetAudience**: Kids, Adults, All
- **TreatmentType**: "סבב טיפול" (treatment cycle) | "תרופה קבועה" (ongoing)
- **Frequency**: "יומי" (daily) | "שבועי" (weekly)

---

## 5. Routing (MainLayout.tsx)

| Path | Page Component | Description |
|---|---|---|
| `/` | HomePage | Kid buttons + quick-log dialog |
| `/log` | LogPage | Medication log table |
| `/scheduled` | ScheduledPage | Scheduled medication tasks |
| `/medicines` | MedicinesPage | Medicine database browser |
| `/kids` | KidsPage | Kids management |
| `/settings/users` | UserManagement | User/family admin |
| `/settings/medicines` | MedicineManagement | Medicine CRUD admin |
| `*` | NotFoundPage | 404 |

---

## 6. Key Functional Flows

### 6.1 App Initialization
1. `main.tsx` calls `MedicineManager.initialize()` — loads medicines + metadata from Firestore
2. Renders `<App>` → `<AuthProvider>` → `<BrowserRouter>` → `<MainLayout>`
3. `AuthProvider` loads users/families from Firestore, restores last user from `localStorage`

### 6.2 Medication Logging (Home → MedicineDialog)
1. `HomePage` loads kids via `KidManager.loadKids()`
2. Click kid → opens `MedicineDialog` pre-filled with kid's name/weight/age/favorite medicine
3. Or click the circle button → "Quick Add" mode (empty dialog)
4. `MedicineManager.calculateDosage()` computes recommended dosage based on weight/age
5. Submit → creates `LogEntry` → saves via `LogManager.saveLogs()` to Firestore

### 6.3 Log Management (LogPage)
- Loads logs from Firestore via `LogManager.loadLogs()`
- Filters by time window (24h / 48h / week / all) and kid name
- Inline editing with date picker + hour formatter
- Export to JSON file download

### 6.4 Kids Management (KidsPage)
- Loads kids from Firestore, calculates ages via `KidManager`
- Role-based filtering: admin sees all, owner/user sees own family
- Drag-and-drop reordering (persisted per-user via `kidOrder` in user profile)
- Add/edit/delete with family assignment (admin can assign to any family)
- Weight staleness indicator (color-coded by age)

### 6.5 Scheduled Tasks (ScheduledPage)
- Tasks with start/end dates, dose, frequency, food instructions
- Filter: active / closed / all
- Per-task calendar (`TaskCalendar` with FullCalendar) for tracking daily takes
- `DailyTakesDialog` for multi-takes-per-day checkbox tracking
- Task CRUD currently calls `/api/saveToJsonFile` endpoint (not Firestore) — see Issues

### 6.6 Medicine Database (MedicinesPage)
- Browse by type (suspension / caplets / granules) or target audience (kids / adults)
- Dosage tables shown per medicine with smart column layout per type

### 6.7 Auth & User Management
- Simple username-based login (no password)
- Roles: **admin** (sees everything), **owner** (manages own family), **user** (limited access)
- Admin can create families and assign users; owner can add users to own family
- Session persisted in `localStorage` (key: last logged-in username)

---

## 7. Services Layer

| Service | Responsibilities |
|---|---|
| **firestoreService.ts** | Generic `getCollection`, `addDocument`, `updateDocument`, `deleteDocument`, `batchUpdate`; typed wrappers for kids, medicines, tasks, logs collections |
| **medicineManager.ts** | Singleton; loads medicines + metadata at startup; groups by name/type/audience; `calculateDosage(name, weight, age)` |
| **kidManager.ts** | Loads kids; `calculateAge(birthDate)`; `lastUpdatedStatus(kid)` for staleness detection |
| **logManager.ts** | `loadLogs()`, `saveLogs()`, `updateLog()`, `deleteLog()`, `exportLogs()` |
| **TaskManager.ts** | `loadTasks()`, `calculateRemainingDays(task)` |
| **uiUtils.ts** | `formatHourInput`, `validateHourFormat`, `stringToDate`, `dateToString`, `formatDateForUI`, `formatDateForCalc`, `sanitizedBirthDate` |

---

## 8. Internationalization (i18n)

- Configured in `src/i18n/i18n.ts` using `i18next` + `i18next-browser-languagedetector`
- Fallback language: Hebrew (`he`)
- Locale files: `en.json` and `he.json`
- **Current coverage is minimal** — only header and about dialog are translated
- All page content, form labels, navigation bar, and error messages are hardcoded in Hebrew

---

## 9. Observations & Known Issues

1. **Firestore rules expired** — `firestore.rules` allows read/write only until `2025-05-15`. Needs updating or proper security rules.
2. **Hardcoded Firebase config in migration** — `dataMigration.ts` has hardcoded API keys instead of using environment variables.
3. **ScheduledPage uses `/api/saveToJsonFile`** — `handleSubmit`, `handleDelete`, and `handleSave` call a REST API that does not exist in this project. Task create/update/delete is broken.
4. **MedicineManagement also uses `/api/saveToJsonFile`** — same issue for medicine CRUD in the admin panel.
5. **`vite.config.ts` proxy** — proxies `/api` to `localhost:3000` but no backend server exists in this project.
6. **Duplicate form files** — `AddKidForm.tsx` exists in both `src/Forms/` and `src/Pages/Kids/`. `AddMedicineForm.tsx` exists in both `src/Forms/` and `src/Pages/Medicines/`. Pages import from the `Pages/` subdirectories.
7. **Dead code** — `fileHandling.ts` (entirely commented out), `usersManager.ts` (empty/commented out).
8. **i18n coverage minimal** — only header/about translated; everything else hardcoded in Hebrew.
9. **No password authentication** — login is username-only with no Firebase Auth integration.
10. **React hooks violation** — `AddScheduledTaskForm.tsx` line 155 defines `useCallback` inside an `onChange` handler, violating rules of hooks. The callback also never gets called.
11. **Navigation labels hardcoded** — `Navigation.tsx` uses Hebrew strings instead of i18n keys.

---

## 10. Next Steps (To Be Filled by User)

> Review the items below. Mark priorities, add new items, or remove items you don't want. Then we'll implement them.

- [x] **Fix Firestore rules** — updated expiry, replaced with per-collection rules, deployed to Firebase
- [x] **Migrate ScheduledPage to Firestore** — replaced `/api/saveToJsonFile` calls with `addTask`/`updateTask`/`deleteTask` from firestoreService
- [x] **Migrate MedicineManagement to Firestore** — replaced `/api/saveToJsonFile` calls with `addMedicine`/`updateMedicine`/`deleteMedicine` from firestoreService
- [x] **Remove dead code** — deleted `fileHandling.ts`, `usersManager.ts`, `Pages/Kids/AddKidForm.tsx`, `Pages/Medicines/AddMedicineForm.tsx`
- [x] **Consolidate duplicate forms** — `MedicineManagement.tsx` now imports from `Forms/AddMedicineForm`
- [x] **Extend i18n** — all pages, forms, navigation, and error messages now use `useTranslation` with full `en.json` and `he.json` translation files
- [x] **Fix React hooks violation** — removed `useCallback` inside `onChange` handler in `AddScheduledTaskForm.tsx`, replaced with inline date formatting logic
- [x] **Add proper authentication** — Google Sign-In via Firebase Auth; test users retain username-only login; `User` model extended with `email?` and `authProvider?`; login dialog auto-shown when no session; Firestore rules tightened to `request.auth != null`
- [x] **Remove hardcoded API keys** — `dataMigration.ts` now imports shared `db` from `firebase.js`
- [x] **Clean up `vite.config.ts`** — removed unused `/api` proxy config
- [ ] **Add tests** — unit tests for services, component tests for key pages
- [ ] **Other**: _____

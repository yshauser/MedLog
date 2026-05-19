# Savta (Babysitter) Mode — Feature Plan

A delegation system allowing family owners to temporarily assign kids to babysitters (by email), granting scoped medicine-giving and task-checking permissions with full audit logging.

---

## 1. Refined Requirements

### 1.1 Assignment (Owner Side)

| # | Requirement |
|---|---|
| R1 | Any owner of a family can assign one or more of their kids to a babysitter, identified by email address. The babysitter must already be a registered user in the system. A family may have multiple owners (e.g. mom & dad) — all can manage assignments. |
| R2 | Assignments are **per kid** (not per owner). Any owner of the family can view/edit/revoke any assignment for kids in their family, regardless of which owner originally created it. |
| R3 | Each assignment can have an optional **expiry date**; at end-of-day (23:59) the assignment is automatically revoked. If no date is set, the assignment is indefinite until manually revoked. |
| R4 | Owner can manually unassign a kid from a babysitter at any time. |
| R5 | Per assignment, the owner selects which **medicines** and which **scheduled tasks** the babysitter may operate on for that kid. |
| R6 | Owner can edit the associated configuration (add/remove medicines & tasks) while the assignment is active. |
| R7 | The system **remembers** the last medicine/task selection per kid-babysitter pair, so re-assigning the same babysitter pre-fills the previous configuration as defaults. |
| R8 | Owner can see a list of all active (and recently expired) assignments for their family. |

### 1.2 Babysitter Side

| # | Requirement |
|---|---|
| R9 | Babysitter sees a dedicated view listing all kids currently assigned to them (across multiple families). |
| R10 | The kid list can be **filtered by family name** for babysitters watching kids from more than one family. |
| R11 | For each assigned kid, the babysitter can **give medicine** (open MedicineDialog) — only from the medicines the owner allowed. The babysitter can see the kid's **weight, age**, and can **record temperature** as part of the medicine-giving flow. |
| R12 | For each assigned kid, the babysitter can **check/uncheck scheduled tasks** — only the tasks the owner allowed. |
| R13 | After a kid is unassigned (manually or by expiry), the babysitter **can no longer see** that kid. |

### 1.3 Audit Logging

| # | Requirement |
|---|---|
| R14 | Every medicine-give or task-check action performed by a babysitter is logged with: who (babysitter username/email), what (action type, medicine/task details), when, and which kid. |
| R15 | The family owner can view babysitter activity logs for their own kids (new filter/tab on existing LogPage or a dedicated section). |
| R16 | Assignment/unassignment events themselves are also logged for traceability. |

### 1.4 Additional / Edge-Case Requirements (refined)

| # | Requirement |
|---|---|
| R17 | If the babysitter email does not match any registered user, show a clear error message and suggest the babysitter register first (link to `/register`). |
| R18 | A babysitter cannot assign kids further (no sub-delegation). |
| R19 | If the owner deletes a scheduled task or a medicine that was associated with an active assignment, the assignment config should gracefully ignore the deleted item (no crash, just hidden). |
| R20 | Expired assignments are cleaned up visually but kept in Firestore for audit history (soft-delete via status field). |
| R21 | Notifications: out of scope for v1 (no push/email notifications when assigned/unassigned), but the data model should not prevent adding them later. |

---

## 2. Data Model Changes

### 2.1 New Firestore Collection: `babysitter_assignments`

```ts
interface BabysitterAssignment {
  id: string;
  
  // Who
  babysitterEmail: string;       // email of the babysitter user
  babysitterUsername: string;     // resolved username
  
  // Which kid
  kidId: string;
  kidName: string;               // denormalized for quick display
  
  // Family
  familyId: string;
  familyName: string;            // denormalized for babysitter-side filtering
  createdByOwner: string;        // username of the owner who created (for audit only)
  
  // Scope
  allowedMedicines: string[];    // medicine names (or IDs) the babysitter can give
  allowedTaskIds: string[];      // task IDs the babysitter can check/uncheck
  
  // Timing
  assignedAt: string;            // ISO timestamp
  expiresAt?: string;            // ISO date (end of selected day) or undefined = indefinite
  
  // Status
  status: 'active' | 'expired' | 'revoked';
  revokedAt?: string;            // set when manually revoked or expired
}
```

> **Note:** `createdByOwner` is for audit purposes only. Any owner of the family (matching `familyId`) can view/edit/revoke the assignment.

### 2.2 New Firestore Collection: `babysitter_presets`

Remembers the last medicine/task selection per kid–babysitter pair so re-assignment pre-fills.

```ts
interface BabysitterPreset {
  id: string;                    // `${kidId}_${babysitterEmail}`
  kidId: string;
  babysitterEmail: string;
  allowedMedicines: string[];
  allowedTaskIds: string[];
  updatedAt: string;
}
```

### 2.3 Extended `LogEntry`

Add optional fields to existing logs:

```ts
// Existing LogEntry + new optional fields
performedBy?: string;            // babysitter username (undefined = family member)
performedByRole?: 'babysitter';  // to distinguish babysitter actions in queries
```

### 2.4 New Firestore Collection: `babysitter_activity_log`

A dedicated audit trail (separate from medicine logs) for assignment lifecycle events:

```ts
interface BabysitterActivityLog {
  id: string;
  type: 'assigned' | 'unassigned' | 'expired' | 'config_updated' |
        'medicine_given' | 'task_checked' | 'task_unchecked';
  assignmentId: string;
  kidId: string;
  kidName: string;
  familyId: string;
  babysitterEmail: string;
  performedBy: string;           // who did the action (owner or babysitter)
  details?: string;              // e.g. medicine name, task label
  timestamp: string;             // ISO
}
```

---

## 3. Firestore Rules

Add rules for the new collections:

```
match /babysitter_assignments/{docId} {
  allow read, write: if request.auth != null;
}
match /babysitter_presets/{docId} {
  allow read, write: if request.auth != null;
}
match /babysitter_activity_log/{docId} {
  allow read, write: if request.auth != null;
}
```

---

## 4. Service Layer

### 4.1 New: `babysitterManager.ts`

| Function | Description |
|---|---|
| `assignKid(assignment)` | Creates assignment doc + preset doc + activity log entry |
| `unassignKid(assignmentId)` | Sets status to `revoked`, logs event |
| `updateAssignmentConfig(id, medicines, tasks)` | Updates allowed items, saves preset, logs event |
| `getAssignmentsByFamily(familyId)` | Returns all assignments for a family (active + expired/revoked for history). Any family owner can call this. |
| `getActiveAssignmentsByBabysitter(email)` | Returns active assignments for a babysitter |
| `getPreset(kidId, email)` | Returns saved preset for pre-fill |
| `expireStaleAssignments()` | Checks `expiresAt` and marks expired (run on app load + periodic) |
| `logActivity(entry)` | Writes to `babysitter_activity_log` |
| `getActivityLog(familyId, filters?)` | Returns logs for owner view |

---

## 5. UI / UX Plan

### 5.1 Owner: "Babysitter Management" — New Screen (`/babysitter`)

Accessed from the hamburger menu (Header), visible to any user with **owner** role. All owners in the same family see the same assignments list.

#### Section A — Active Assignments List
- Table/cards showing: kid name, babysitter email, expiry date (or "indefinite"), allowed medicines count, allowed tasks count.
- Each row has: **Edit** (pencil icon) and **Revoke** (X icon) actions.
- Pill-shaped status badges: green = active, gray = expired/revoked.
- Toggle to show/hide expired/revoked assignments.

#### Section B — "Assign Babysitter" Dialog (single scrollable form modal)

Triggered by a prominent **"+ Assign Babysitter"** button. All fields are visible in a single scrollable form — no wizard steps.

**Form layout (top to bottom):**

| # | Field | Widget | Details |
|---|---|---|---|
| 1 | **Babysitter email** | Text input with autocomplete | Autocomplete suggests emails from the `users` collection. On blur, validates the email belongs to a registered user. If not found → inline error with link to `/register`. |
| 2 | **Kids** | Checkbox list | Shows all kids in the owner's family. Each kid shows name + age badge. At least one must be selected. |
| 3 | **Expiry date** | DatePicker (optional) | Minimum date = tomorrow. Placeholder: "ללא הגבלה" (indefinite). Clear button resets to indefinite. |
| 4 | **Permissions per kid** | Accordion sections (one per selected kid) | Appears dynamically as kids are checked. If only one kid selected, shown flat (no accordion). |
| 4a | — **Medicines** | Checkbox list + "Select All" toggle | Lists all medicines (grouped by type). Pre-checked from saved `BabysitterPreset` if one exists for this kid+babysitter pair. |
| 4b | — **Scheduled Tasks** | Checkbox list + "Select All" toggle | Lists the kid's active scheduled tasks. Each item shows task label + medicine name. Pre-checked from preset. |

**Behavior:**
- Permissions section (#4) is hidden until at least one kid is checked. When a kid is unchecked, its accordion section disappears.
- When babysitter email changes and resolves to a known user, presets are loaded for all selected kids automatically.
- A kid with no medicines and no tasks selected shows a small warning label but doesn't block save (owner may configure later via Edit).

**Footer:** Cancel + **Save** button. Save is enabled when: email resolves to a registered user AND ≥1 kid selected. Save creates one `BabysitterAssignment` doc per kid, saves/updates presets, and writes `assigned` activity log entries. On success → dialog closes + list refreshes.

#### Section C — "Edit Configuration" Dialog

Opens when clicking the **Edit** icon on an existing assignment row. Reuses the same form layout as Section B but for a single kid, with babysitter email and kid pre-filled and read-only. Only the permissions (medicines & tasks) and expiry date are editable. Save updates the assignment doc, saves preset, and logs a `config_updated` activity entry.

#### Section D — Babysitter Activity Log (inline)

Below the assignments list, a collapsible **"Activity Log"** section showing `babysitter_activity_log` entries for the family, sorted newest-first. Columns: timestamp, babysitter, kid, action, details. Filterable by kid and by babysitter.

### 5.2 Owner: LogPage Enhancement

On the existing **LogPage**, add a new filter toggle: **"Babysitter Activity"**.
- When toggled, shows only log entries where `performedByRole === 'babysitter'`.
- Adds a "Performed By" column showing babysitter name.

### 5.3 Babysitter: "My Kids" — New Screen (`/my-kids`)

Visible only when the logged-in user has active babysitter assignments. Accessible from:
- A new nav-bar item (conditionally shown), e.g. a **Baby** icon labeled "שמרטפות".
- Or a banner on the HomePage if assignments exist.

#### Layout
- **Family filter** dropdown at top (populated from distinct family names in active assignments).
- **Kid cards** (similar to HomePage style) showing kid name + family name badge + age.
- Click kid → opens a **Babysitter Action Sheet** (bottom-sheet or dialog):
  - **"Give Medicine"** button → opens MedicineDialog with:
    - Kid name, weight, and age pre-filled and visible (read-only).
    - Medicine dropdown **restricted** to `allowedMedicines` only.
    - Temperature field available (babysitter can record temperature).
    - On submit, log entry includes `performedBy` and `performedByRole: 'babysitter'`, plus an activity log entry of type `medicine_given`.
  - **"Scheduled Tasks"** section → shows only `allowedTaskIds` with check/uncheck toggles (similar to TaskCalendar daily-takes). Check/uncheck actions write activity log entries of type `task_checked` / `task_unchecked`.

### 5.4 Navigation Changes

- **Navigation.tsx**: conditionally add a "My Kids" (שמרטפות) tab when user has active babysitter assignments.
- **Header.tsx**: add "Babysitter Management" (ניהול שמרטפים) menu item for owner role.

### 5.5 Expiry Handling

- On app load (in `AuthProvider` or a new `useBabysitterAssignments` hook), call `expireStaleAssignments()` to mark any past-due assignments as expired.
- Babysitter's "My Kids" screen only shows `status === 'active'` assignments.

---

## 6. Implementation Phases

### Phase 1 — Data Model & Service Layer
1. Add new types to `types.ts` (`BabysitterAssignment`, `BabysitterPreset`, `BabysitterActivityLog`)
2. Create `babysitterManager.ts` with all CRUD + logging functions
3. Add Firestore collection wrappers to `firestoreService.ts`
4. Update Firestore rules
5. Extend `LogEntry` with optional `performedBy` / `performedByRole`

### Phase 2 — Owner UI (Assignment Management)
6. Create `BabysitterManagementPage.tsx` (`/babysitter`)
7. Create `AssignBabysitterDialog.tsx` (single scrollable form modal)
8. Create `EditAssignmentDialog.tsx`
9. Add route to `MainLayout.tsx`
10. Add menu item to `Header.tsx`

### Phase 3 — Babysitter UI
11. Create `MyKidsPage.tsx` (`/my-kids`)
12. Create `BabysitterActionSheet.tsx` (give medicine + task check)
13. Modify `MedicineDialog.tsx` to accept optional `allowedMedicines` filter prop + `performedBy` context
14. Modify task check/uncheck logic to write audit log when performer is babysitter
15. Add conditional nav item to `Navigation.tsx`
16. Create `useBabysitterAssignments.ts` hook

### Phase 4 — Audit & Logging
17. Add "Babysitter Activity" filter to `LogPage.tsx`
18. Wire `performedBy` into `MedicineDialog` submit and task-check flows
19. Show babysitter activity log on `BabysitterManagementPage`

### Phase 5 — Polish & Edge Cases
20. Expiry check logic (on app load + periodic)
21. Preset save/load for re-assignment
22. i18n keys (Hebrew + English) for all new strings
23. Firestore index creation if needed
24. Testing (unit + manual)

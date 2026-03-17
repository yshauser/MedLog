# User Management Improvements

Improve `UserManagement` with delete confirmation, an email column, and full create/edit via a modal form window.

---

## Recommendation: Option 2 — Modal Form for Create & Edit

**Option 1 (inline edit)** works fine for simple fields but becomes cramped with username + email + role + family — especially on mobile. It also means two different UX patterns for create vs edit.

**Option 2 (modal form)** is recommended because:
- Same form reused for both create and edit — less code, consistent UX.
- Scales naturally to online registration (the same form/schema can be surfaced in a public registration page later).
- The current "create" section at the top of the page is already complex (family checkbox, new-family input, family selector) — a modal gives it more breathing room.
- Aligns with how `AddKidForm` and `AddMedicineForm` work in the rest of the app.

---

## Changes

### Step 1 — Remove `ARCHITECTURE.md` from root
Delete `c:\Users\yhauser\workspace\my-repo\React\MedLog\ARCHITECTURE.md` (already exists at `src/plans/ARCHITECTURE.md`).

### Step 2 — Export `User` and `Family` types from `AuthContext`
Currently `User` and `Family` are local interfaces in `AuthContext.tsx` and not exported. `UserManagement.tsx` re-declares an incomplete local `User` interface.
- Export `User` and `Family` from `AuthContext.tsx`.
- `UserManagement` and `UserFormDialog` import the canonical types instead of local copies.

### Step 3 — Add `updateUser` to `AuthContext`
New function: `updateUser(username, fields)` — merges changes into the Firestore user doc and updates local `users` state.
- **Editable fields:** `email`, `role`, `familyId`.
- **Non-editable:** `username` (it's the Firestore doc ID).
- If `role` is changed to `owner`, also update `family.ownerId` in Firestore and local state.
- Returns `Promise<void>` and throws on failure (so the form can catch and display errors).
- Exported in `AuthContextType`.

### Step 4 — Create `UserFormDialog` component
New file: `src/components/UserFormDialog.tsx`

A modal dialog shared for both create and edit:
- Fields: username (disabled on edit), email, role, family (admin only: new-family toggle + family selector / name input)
- Prop `editingUser?: User | null` — when set, pre-fills the form and switches to edit mode
- Calls `addUser()` or `updateUser()` depending on mode
- Shows error banner inside the form on failure (same pattern as `AddMedicineForm`)
- Replaces the current inline create form at the top of `UserManagement`

### Step 5 — Update `UserManagement`

| Change | Detail |
|---|---|
| Remove inline create form | Replaced by "הוסף משתמש" button that opens `UserFormDialog` |
| Remove dead `updateUserRole` stub | Leftover from old code; replaced by `updateUser` |
| Remove duplicate local `User` interface | Import from `AuthContext` instead |
| Edit button | Opens `UserFormDialog` pre-filled with the selected user |
| Delete button | Shows a confirmation dialog before calling `removeUser` |
| Email column | Added to the table (shown for admin; hidden for owner/user who don't need it) |
| Actions column | Always renders a `<td>` (empty when no actions), fixing current table misalignment |

### Step 6 — Update `ARCHITECTURE.md` (in `src/plans/`)
Add a new checklist item: **Improve UserManagement** and mark it complete.

---

## Limitations

- **Test users (no Firebase Auth session) cannot write to Firestore** with the current rules (`request.auth != null`). Only Google-authenticated users (admin) can create/edit/delete users. This is by design for now.

---

## File Change Summary

| File | Change |
|---|---|
| `ARCHITECTURE.md` (root) | Delete |
| `src/Users/AuthContext.tsx` | Export `User`/`Family`; add `updateUser()` function and type |
| `src/components/UserFormDialog.tsx` | New modal form for create + edit |
| `src/Pages/Settings/UserManagement.tsx` | Wire confirm-delete, email column, edit button → dialog, replace inline form, remove dead code |
| `src/plans/ARCHITECTURE.md` | Mark improvement complete |

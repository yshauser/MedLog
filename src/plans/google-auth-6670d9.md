# Add Google Authentication

Add Firebase Google Sign-In as the primary auth method while preserving the existing username/role/family model and supporting test users without real Google accounts.

---

## Current State

- Auth is purely username-based — `login(username)` just finds the user in a Firestore `users` collection.
- `AuthContext` holds `user`, `users`, `families` in React state; no Firebase Auth involved.
- `firebase.js` already initialises `auth = getAuth(app)` but it is unused.
- `LoginDialog` is a simple text input (no password, no OAuth).
- Firestore rules are fully open (`if true`) with a TODO to tighten once Firebase Auth lands.

---

## Plan

### Step 1 — Enable Google provider in Firebase Console
- Firebase Console → Authentication → Sign-in methods → enable **Google**.
- Add `yshauser@gmail.com` as a test/admin email (no extra config needed — it just signs in normally).

### Step 2 — Extend the `User` model
Add optional `email` field to the `User` interface and Firestore document:
```ts
interface User {
  username: string;
  role: 'owner' | 'admin' | 'user';
  familyId: string;
  kidOrder: string[] | undefined;
  email?: string;          // real Google email, or undefined for test users
  authProvider?: 'google' | 'test';  // helps distinguish login paths
}
```

### Step 3 — Migrate `AuthContext` to Firebase Auth
- Import `signInWithPopup`, `GoogleAuthProvider`, `signOut`, `onAuthStateChanged` from `firebase/auth`.
- **On Google sign-in:**
  1. Call `signInWithPopup(auth, googleProvider)`.
  2. Take the returned `email` from `firebaseUser`.
  3. Look up the matching Firestore `users` doc by `email` field → set `user` state.
  4. If no match → show an error: *"Your Google account is not registered. Contact the admin."*
- **On app load:** `onAuthStateChanged` replaces the current `localStorage` restore pattern:
  - If Firebase reports an active session → look up user by `email` → set state.
  - If no Firebase session → `user` stays `null`; login dialog is shown automatically.
- **Logout:** call `signOut(auth)` + clear local `user` state.
- Keep `login(username)` for test users (see Step 5).
- Add `loginWithGoogle()` to `AuthContextType`.

### Step 4 — Update `LoginDialog`
Replace the single text-input dialog with a two-option dialog:
- **"Sign in with Google"** button (calls `loginWithGoogle()`).
- **"Test user"** section with the existing username text input — always visible.

### Step 5 — Test user strategy (no real email required)
Two complementary approaches:
1. **Username-only login** (current) — kept as-is under the "Test user" path. Test users have no `email` / `authProvider: 'test'` in their Firestore doc. They bypass Firebase Auth entirely.
2. **Firebase Auth test emails** (optional, future) — Firebase supports `createUserWithEmailAndPassword` with fake `@test.medlog` addresses. The admin can provision these from `UserManagement` when needed.

For now, approach (1) is sufficient — test users log in by username only, real users log in via Google.

### Step 6 — Admin bootstrap
- The admin user Firestore doc gets `email: 'yshauser@gmail.com'` and `authProvider: 'google'` stored in it.
- On first app load with no active Firebase session: show the login dialog (both in dev and production). The auto-admin fallback is removed.

### Step 7 — `UserManagement` — add email field
When admin creates a new user:
- Optional **email** input field added to the add-user form.
- If email is provided → `authProvider: 'google'`; otherwise `authProvider: 'test'`.

### Step 8 — Tighten Firestore rules
Replace the `if true` rules with proper Firebase Auth–aware rules:
```
allow read, write: if request.auth != null;
```
For collections that should be family-scoped (kids, logs, tasks), add a lookup against the user's Firestore document to verify `familyId`. Test users (no Firebase Auth) will still pass only while `request.auth != null` — they would need the email/password approach if stricter rules are needed later.

> **Scope note:** Full per-family Firestore rules are a separate follow-up. Step 8 here only removes the `if true` and requires any authenticated Firebase session.

### Step 9 — Update `ARCHITECTURE.md`
Mark **Add proper authentication** as complete.

---

## File Change Summary

| File | Change |
|---|---|
| `src/firebase.js` | already exports `auth` — no change |
| `src/Users/AuthContext.tsx` | add `email?`, `authProvider?` to User; add `loginWithGoogle()`; replace localStorage restore with `onAuthStateChanged`; keep `login(username)` for test users |
| `src/components/LoginDialog.tsx` | add Google sign-in button + keep username fallback |
| `src/Pages/Settings/UserManagement.tsx` | add optional email field to add-user form |
| `firestore.rules` | tighten from `if true` to `if request.auth != null` |
| `ARCHITECTURE.md` | mark item complete |


# System Defaults & Production Mode Improvements

Improve UX defaults and add production/development mode awareness across the app.

---

## Items to Implement

### 1. Fix Header Username Default ✅
**File:** `src/components/Header.tsx` line 140

Current: `{user?.username || 'admin'}` — shows 'admin' when no user logged in  
Fix: `{user?.username || ''}` — show empty string when no user

---

### 2. Session Persistence (Login) — No Change Needed ✅

**Login:** Already implemented — Google users restored via `onAuthStateChanged`, test users via `localStorage`.

**Language:** `LanguageDetector` already persists user's manual selection to `localStorage` key `i18nextLng`. Keeping existing behavior.

---

### 3. Production Mode Build (`VITE_APP_ENV`) ✅
**File:** `.github/workflows/deploy.yml`

- Add `VITE_APP_ENV=production` to the GitHub Actions `.env.production` creation step
- For local dev, `.env` should already have `VITE_APP_ENV=development`

---

### 4. Hide Test User Login in Production ✅
**File:** `src/components/LoginDialog.tsx`

Conditionally render the test-user section only when `import.meta.env.VITE_APP_ENV !== 'production'`

---

## GitHub Secrets Status

| Secret | Status |
|--------|--------|
| `VITE_FIREBASE_API_KEY` | ✅ Set |
| `VITE_FIREBASE_AUTH_DOMAIN` | ✅ Set |
| `VITE_FIREBASE_PROJECT_ID` | ✅ Set |
| `VITE_FIREBASE_STORAGE_BUCKET` | ✅ Set |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ✅ Set |
| `VITE_FIREBASE_APP_ID` | ✅ Set |
| `VITE_FIREBASE_MEASUREMENT_ID` | ✅ Set |
| `FIREBASE_SERVICE_ACCOUNT` | ✅ Created |
| `FIREBASE_TOKEN` | ✅ Created |

---

## Original Plan Status (registration-implementation-80d8d5.md)

### Done ✅
- [x] Firestore rules updated
- [x] RegistrationRequest type added
- [x] registrationService created
- [x] PublicRegistration page
- [x] RegistrationReview admin component
- [x] /register route added
- [x] LoginDialog registration link
- [x] RegistrationReview integrated into UserManagement
- [x] firebase.json updated for Vite
- [x] .firebaserc created
- [x] .gitignore updated
- [x] Deployment scripts in package.json
- [x] GitHub Actions workflow created
- [x] FIREBASE_SERVICE_ACCOUNT secret created
- [x] FIREBASE_TOKEN secret created

### Pending ❌
- [ ] GitHub Actions CI/CD end-to-end test (push to main and verify deploy)
- [ ] Approve/reject flow testing on deployed app

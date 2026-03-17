# User Registration with Admin Approval Implementation

Implement public self-service registration with admin approval workflow, followed by GitHub Actions deployment to Firebase Hosting.

---

## Implementation Phases

### Phase 1: User Registration System
### Phase 2: GitHub Actions CI/CD  
### Phase 3: Firebase Hosting Deployment

---

## Phase 1: User Registration System

### Step 1: Update Firestore Rules
**File:** `c:\Users\yhauser\workspace\MedLog\apps\client\firestore.rules`

Add new collection for registration requests:

```javascript
// Registration requests - public write, admin-only read
match /registration_requests/{docId} {
  allow read: if request.auth != null && 
              get(/databases/$(database)/documents/users/$(request.auth.token.email.split('@')[0])).data.role == 'admin';
  allow create: if request.resource.data.keys().hasAll(['username', 'email', 'familyName', 'timestamp', 'status']) &&
                request.resource.data.status == 'pending' &&
                request.resource.data.username is string &&
                request.resource.data.username.size() >= 2 &&
                request.resource.data.email is string &&
                request.resource.data.email.matches('.*@.*') &&
                request.resource.data.timestamp == request.time;
  allow update: if request.auth != null && 
                get(/databases/$(database)/documents/users/$(request.auth.token.email.split('@')[0])).data.role == 'admin';
  allow delete: if false;
}
```

**Validation rules:**
- Anyone can create (public registration)
- Only admins can read/update (for approval)
- Username must be 2+ characters
- Email must contain '@'
- Status must be 'pending' on creation
- Timestamp required

### Step 2: Create Registration Request Type
**File:** `c:\Users\yhauser\workspace\MedLog\apps\client\src\types.ts`

Add interface:

```typescript
export interface RegistrationRequest {
  id: string;
  username: string;
  email: string;
  familyName: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  rejectionReason?: string;
}
```

### Step 3: Create Public Registration Page
**New file:** `c:\Users\yhauser\workspace\MedLog\apps\client\src\Pages\PublicRegistration.tsx`

Features:
- Form fields: username, email, family name, optional notes
- Client-side validation (username length, email format, no duplicates)
- Submit to `registration_requests` collection
- Success message with next steps
- Link back to login page
- RTL support (Hebrew UI)

Form validation:
- Username: 2-20 characters, alphanumeric + underscore
- Email: Valid format
- Family name: 2-50 characters
- Check username doesn't already exist in `users` collection

### Step 4: Add Registration Route
**File:** `c:\Users\yhauser\workspace\MedLog\apps\client\src\App.tsx`

Add public route (no auth required):
```typescript
<Route path="/register" element={<PublicRegistration />} />
```

### Step 5: Update Login Dialog
**File:** `c:\Users\yhauser\workspace\MedLog\apps\client\src\components\LoginDialog.tsx`

Add registration link below the login options:
```tsx
<div className="text-center text-sm text-gray-600 mt-4">
  אין לך חשבון? <Link to="/register" className="text-blue-500 hover:underline">הירשם כאן</Link>
</div>
```

### Step 6: Create Registration Review Component
**New file:** `c:\Users\yhauser\workspace\MedLog\apps\client\src\components\RegistrationReview.tsx`

Features:
- List pending registration requests
- Show request details (username, email, family, notes, timestamp)
- Approve button → creates user + family, marks request as approved
- Reject button → shows rejection reason input, marks request as rejected
- Filter tabs: Pending / Approved / Rejected
- Real-time updates using Firestore snapshots

Approval flow:
1. Validate username still available
2. Create new family (if doesn't exist)
3. Create user with role 'owner'
4. Update request status to 'approved'
5. Show success message

Rejection flow:
1. Show modal for rejection reason
2. Update request status to 'rejected'
3. Store reason and reviewer info

### Step 7: Integrate into UserManagement
**File:** `c:\Users\yhauser\workspace\MedLog\apps\client\src\Pages\Settings\UserManagement.tsx`

Add tabs:
- "משתמשים" (Users) - existing user list
- "בקשות הרשמה" (Registration Requests) - new `<RegistrationReview />` component

Only show registration tab for admin role.

### Step 8: Add Service Functions
**New file:** `c:\Users\yhauser\workspace\MedLog\apps\client\src\services\registrationService.ts`

Functions:
- `submitRegistration(data)` - Create registration request
- `getRegistrationRequests(status?)` - Fetch requests with optional filter
- `approveRegistration(requestId, adminUsername)` - Approve and create user
- `rejectRegistration(requestId, reason, adminUsername)` - Reject with reason
- `checkUsernameAvailable(username)` - Validate username not taken

---

## Phase 2: GitHub Actions CI/CD

### Step 9: Create GitHub Actions Workflow
**New file:** `.github/workflows/deploy.yml`

Workflow triggers:
- Push to `main` branch
- Manual workflow dispatch

Steps:
1. Checkout code
2. Setup Node.js
3. Install dependencies
4. Create `.env.production` from GitHub Secrets
5. Build app (`npm run build`)
6. Deploy to Firebase Hosting
7. Deploy Firestore rules

Required GitHub Secrets:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
- `FIREBASE_TOKEN` (for deployment)

### Step 10: Create Firebase Token
Run locally:
```bash
firebase login:ci
```

Copy the token and add to GitHub Secrets as `FIREBASE_TOKEN`.

### Step 11: Create .firebaserc
**File:** `c:\Users\yhauser\workspace\MedLog\apps\client\.firebaserc`

```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

Use the value from `VITE_FIREBASE_PROJECT_ID` in your `.env`.

---

## Phase 3: Firebase Hosting Deployment

### Step 12: Update firebase.json
**File:** `c:\Users\yhauser\workspace\MedLog\apps\client\firebase.json`

Changes:
- Point `public` to `dist`
- Add SPA rewrites
- Add cache headers
- Configure hosting

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

### Step 13: Update .gitignore
**File:** `c:\Users\yhauser\workspace\MedLog\apps\client\.gitignore`

Change line 34 to allow `.firebaserc`:
```
# .firebaserc  (commented out - we need this file)
```

### Step 14: Add Deployment Scripts
**File:** `c:\Users\yhauser\workspace\MedLog\apps\client\package.json`

Add scripts:
```json
"deploy": "npm run build && firebase deploy --only hosting",
"deploy:rules": "firebase deploy --only firestore:rules",
"deploy:all": "npm run build && firebase deploy"
```

### Step 15: Manual Deployment Test
Before setting up GitHub Actions, test manual deployment:

```bash
cd c:\Users\yhauser\workspace\MedLog\apps\client
npm run build
firebase deploy --only hosting
```

Verify the app works at `https://your-project-id.web.app`

### Step 16: Set Up GitHub Secrets
In GitHub repository settings → Secrets and variables → Actions:

Add all secrets from your `.env` file:
1. `VITE_FIREBASE_API_KEY`
2. `VITE_FIREBASE_AUTH_DOMAIN`
3. `VITE_FIREBASE_PROJECT_ID`
4. `VITE_FIREBASE_STORAGE_BUCKET`
5. `VITE_FIREBASE_MESSAGING_SENDER_ID`
6. `VITE_FIREBASE_APP_ID`
7. `VITE_FIREBASE_MEASUREMENT_ID`
8. `FIREBASE_TOKEN` (from Step 10)

### Step 17: Push and Deploy
```bash
git add .
git commit -m "Add registration system and GitHub Actions deployment"
git push origin main
```

GitHub Actions will automatically build and deploy.

---

## File Changes Summary

### New Files
| File | Purpose |
|------|---------|
| `src/Pages/PublicRegistration.tsx` | Public registration form |
| `src/components/RegistrationReview.tsx` | Admin approval interface |
| `src/services/registrationService.ts` | Registration business logic |
| `.github/workflows/deploy.yml` | CI/CD pipeline |
| `.firebaserc` | Firebase project configuration |

### Modified Files
| File | Changes |
|------|---------|
| `firestore.rules` | Add `registration_requests` collection rules |
| `src/types.ts` | Add `RegistrationRequest` interface |
| `src/App.tsx` | Add `/register` route |
| `src/components/LoginDialog.tsx` | Add registration link |
| `src/Pages/Settings/UserManagement.tsx` | Add registration review tab |
| `firebase.json` | Update for Vite build output and SPA routing |
| `.gitignore` | Allow `.firebaserc` |
| `package.json` | Add deployment scripts |

---

## Testing Checklist

### Registration Flow
- [ ] Navigate to `/register` without authentication
- [ ] Submit registration with valid data
- [ ] Verify validation errors for invalid data
- [ ] Check duplicate username prevention
- [ ] Confirm success message displayed

### Admin Approval Flow
- [ ] Sign in as admin with Google
- [ ] Navigate to UserManagement → Registration Requests tab
- [ ] View pending requests
- [ ] Approve a request → verify user created
- [ ] Reject a request with reason
- [ ] Verify approved user can sign in with Google

### Deployment
- [ ] Build succeeds locally
- [ ] Manual Firebase deploy works
- [ ] GitHub Actions workflow runs successfully
- [ ] App accessible on smartphone
- [ ] All Firebase features work in production

---

## Security Considerations

1. **Rate limiting:** Consider adding Firebase App Check to prevent registration spam
2. **Email verification:** Currently not required - admin manually verifies
3. **Username validation:** Firestore rules enforce minimum length and format
4. **Admin-only approval:** Only users with `role: 'admin'` can approve/reject
5. **Audit trail:** All requests store timestamp, reviewer, and status

---

## Future Enhancements (Post-Deployment)

1. **Email notifications:** Notify users when registration is approved/rejected
2. **Migration to Option 3:** Self-registration with email/password (1-2 hours)
3. **Family invitation system:** Allow owners to invite family members
4. **Registration analytics:** Track approval rates and common rejection reasons
5. **Bulk approval:** Select multiple requests to approve at once

---

## Migration Path to Option 3 (Future)

When ready to switch to self-registration:

1. Add `registerWithEmail()` to `AuthContext`
2. Update `PublicRegistration` to call `createUserWithEmailAndPassword()`
3. Add email verification flow
4. Update Firestore rules to allow self-creation
5. Remove `RegistrationReview` component
6. Update `authProvider` to support `'email'` type

Estimated effort: 1-2 hours

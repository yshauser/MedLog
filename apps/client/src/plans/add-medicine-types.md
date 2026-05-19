# Add 4 New Medicine Types

Add Suppositories (פתילות), Oral Drops (טיפות), Inhalers (משאפים), and Ointments (משחות) — all following the age-based entry pattern (like Caplets/Capsules/Granules).

## Files to Change

### 1. `types.ts` — Enum, interfaces, union type
- Add to `MedicineType` enum: `Suppositories = "suppositories"`, `OralDrops = "oralDrops"`, `Inhalers = "inhalers"`, `Ointments = "ointments"`
- Add entry interfaces: `SuppositoriesEntry`, `OralDropsEntry`, `InhalersEntry`, `OintmentsEntry` (same shape as `CapletEntry`)
- Add medicine interfaces: `SuppositoriesMedicine`, `OralDropsMedicine`, `InhalersMedicine`, `OintmentsMedicine` (extend `MedicineBase`, with `strength` + entries)
- Expand `Medicine` union type to include all 4 new interfaces

### 2. `AddMedicineForm.tsx` — Form for add/edit
- Add imports for the 4 new types
- Add `createEmpty*Entry()` and `createEmpty*Medicine()` factory functions for each new type
- Update `handleMedicineTypeChange` to handle new types
- Update `handleEntryChange`, `addEntry`, `removeEntry`, `onReset` to handle new types
- Add `<option>` entries in the type `<select>` dropdown for each new type

### 3. `MedicinesPage.tsx` — Browse medicines by type
- Add imports for new medicine interfaces
- Add labels in `medicineLabels` record: Suppositories → פתילות, OralDrops → טיפות, Inhalers → משאפים, Ointments → משחות
- Add heading labels in the `selectedType` ternary chain
- Add table header columns and table body rows for each new type in the details table (same columns as caplets: age, dosage, hours interval, max/day)

### 4. `MedicineManagement.tsx` — Admin management page
- Add imports for new medicine interfaces
- Add cases in `getMedicineTypeDisplay()` switch
- Add table header and body rendering branches for each new type in the expanded details section (same columns as caplets)

### 5. `medicineManager.ts` — Service layer
- Add imports for new medicine interfaces
- Update `MedicinesData` interface to include new type arrays
- In `initialize()`: add filter + map blocks for each new type
- In `calculateDosage()`: add `else if` branches for each new type with appropriate Hebrew unit labels (פתילות, טיפות, שאיפות, כמות למריחה)
- In `hasEqualValues()`: add `else if` branches for each new type

### 6. `i18n/locales/en.json` — English translations
- `addMedicineForm`: add `"suppositories"`, `"oralDrops"`, `"inhalers"`, `"ointments"`
- `medicines`: add `"suppositories"`, `"oralDrops"`, `"inhalers"`, `"ointments"` and dosage column labels

### 7. `i18n/locales/he.json` — Hebrew translations
- `addMedicineForm`: add `"suppositories": "פתילות"`, `"oralDrops": "טיפות"`, `"inhalers": "משאפים"`, `"ointments": "משחות"`
- `medicines`: add matching plural labels and dosage column labels

### 8. `test/medicineManager.test.ts` — Unit tests
- Optionally add mock data and test cases for at least one new type to verify `calculateDosage` works correctly

## Notes
- All 4 new types use the **age-based** entry pattern (identical to Caplets: `age_low`, `age_high`, `dos_low`, `dos_high`, `hoursInterval_low`, `hoursInterval_high`, `maxDay`).
- All 4 new types use a `strength` field (not `concentration`).

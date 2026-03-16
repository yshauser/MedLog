import React, { useState, useEffect } from 'react';
import { Plus, Minus, X, RotateCw  } from 'lucide-react';
import {Medicine, MedicineType, TargetAudience, SuspensionEntry, SuspensionMedicine, CapletEntry, CapletMedicine, GranulesEntry, GranulesMedicine, CapsulesEntry, CapsulesMedicine} from '../types';
import { constrainPoint } from '@fullcalendar/core/internal';
import { useTranslation } from 'react-i18next';

interface AddMedicineFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (medicine: Medicine) => Promise<void>;
  editingMedicine: Medicine | null;
}

const createEmptySuspensionEntry = (): SuspensionEntry => ({
  w_low: 0,
  w_high: 0,
  dos: 0,
  perDay_low: 0,
  perDay_high: 0,
  maxDay: 0,
  maxDayPerKg: 0
});

const createEmptyCapletEntry = (): CapletEntry => ({
  age_low: 0,
  age_high: undefined,
  dos_low: 0,
  dos_high: 0,
  hoursInterval_low: 0,
  hoursInterval_high: 0,
  maxDay: 0
});

const createEmptyGranulesEntry = (): GranulesEntry => ({
  age_low: 0,
  age_high: undefined,
  dos_low: 0,
  dos_high: 0,
  hoursInterval_low: 0,
  hoursInterval_high: 0,
  maxDay: 0
});

const createEmptyCapsulesEntry = (): CapsulesEntry => ({
  age_low: 0,
  age_high: undefined,
  dos_low: 0,
  dos_high: 0,
  hoursInterval_low: 0,
  hoursInterval_high: 0,
  maxDay: 0
});

const createEmptySuspensionMedicine = (id: string): SuspensionMedicine => ({
  id,
  type: MedicineType.Suspension,
  name: '',
  hebName: '',
  activeIngredient: '',
  targetAudience: TargetAudience.Kids,
  concentration: '',
  entries: [createEmptySuspensionEntry()]
});

const createEmptyCapletMedicine = (id: string): CapletMedicine => ({
  id,
  type: MedicineType.Caplets,
  name: '',
  hebName: '',
  activeIngredient: '',
  targetAudience: TargetAudience.Kids,
  strength: '',
  entries: [createEmptyCapletEntry()]
});

const createEmptyGranulesMedicine = (id: string): GranulesMedicine => ({
  id,
  type: MedicineType.Granules,
  name: '',
  hebName: '',
  activeIngredient: '',
  targetAudience: TargetAudience.Kids,
  strength: '',
  entries: [createEmptyGranulesEntry()]
});

const createEmptyCapsulesMedicine = (id: string): CapsulesMedicine => ({
  id,
  type: MedicineType.Capsules,
  name: '',
  hebName: '',
  activeIngredient: '',
  targetAudience: TargetAudience.Kids,
  strength: '',
  entries: [createEmptyCapsulesEntry()]
});

export const AddMedicineForm: React.FC<AddMedicineFormProps> = ({
  isOpen,
  onClose,
  onSave,
  editingMedicine
  }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Medicine>(createEmptySuspensionMedicine(generateId()));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (editingMedicine) {
      setFormData(editingMedicine);
    }
  },[editingMedicine]);

  // Function to generate a unique ID
  function generateId() {
      return 'med_' + Date.now().toString();
  }
  
  const handleBasicInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {name, value} = e.target;
    setFormData(prev => ({
      ...prev,
      [name]:value
    }));
  };

  const handleMedicineTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as MedicineType;
    // Reset form data with appropriate type specific fields
    setFormData(
      newType === MedicineType.Suspension
      ? createEmptySuspensionMedicine(generateId())
      : newType === MedicineType.Caplets
      ? createEmptyCapletMedicine(generateId())
      : newType === MedicineType.Granules
      ? createEmptyGranulesMedicine(generateId())
      : createEmptyCapsulesMedicine(generateId())
    );
  };

  const handleEntryChange = (index: number, field: string, value: string) => {
    const numValue = parseFloat(value);
    setFormData(prev => {
      if (prev.type === MedicineType.Suspension) {
        const medicine = prev as SuspensionMedicine;
        const newEntries = [...medicine.entries];
        newEntries[index] = { ...newEntries[index], [field]: numValue };
        return { ...medicine, entries: newEntries };
      } else if (prev.type === MedicineType.Caplets) {
        const medicine = prev as CapletMedicine;
        const newEntries = [...medicine.entries];
        newEntries[index] = { ...newEntries[index], [field]: numValue };
        return { ...medicine, entries: newEntries };
      } else if (prev.type === MedicineType.Granules) {
        const medicine = prev as GranulesMedicine;
        const newEntries = [...medicine.entries];
        newEntries[index] = { ...newEntries[index], [field]: numValue };
        return { ...medicine, entries: newEntries };
      } else {
        const medicine = prev as CapsulesMedicine;
        const newEntries = [...medicine.entries];
        newEntries[index] = { ...newEntries[index], [field]: numValue };
        return { ...medicine, entries: newEntries };
      }
    });
  };

  const addEntry = () => {
    setFormData(prev => {
      if (prev.type === MedicineType.Suspension) {
        const m = prev as SuspensionMedicine;
        return { ...m, entries: [...m.entries, createEmptySuspensionEntry()] };
      } else if (prev.type === MedicineType.Caplets) {
        const m = prev as CapletMedicine;
        return { ...m, entries: [...m.entries, createEmptyCapletEntry()] };
      } else if (prev.type === MedicineType.Granules) {
        const m = prev as GranulesMedicine;
        return { ...m, entries: [...m.entries, createEmptyGranulesEntry()] };
      } else {
        const m = prev as CapsulesMedicine;
        return { ...m, entries: [...m.entries, createEmptyCapsulesEntry()] };
      }
    });
  };

  const removeEntry = (index: number) => {
    setFormData(prev => {
      if (prev.type === MedicineType.Suspension) {
        const m = prev as SuspensionMedicine;
        return { ...m, entries: m.entries.filter((_, i) => i !== index) };
      } else if (prev.type === MedicineType.Caplets) {
        const m = prev as CapletMedicine;
        return { ...m, entries: m.entries.filter((_, i) => i !== index) };
      } else if (prev.type === MedicineType.Granules) {
        const m = prev as GranulesMedicine;
        return { ...m, entries: m.entries.filter((_, i) => i !== index) };
      } else {
        const m = prev as CapsulesMedicine;
        return { ...m, entries: m.entries.filter((_, i) => i !== index) };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log ('handle submit', {formData});
    try {
      setErrorMessage(null);
      await onSave(formData);
      onReset();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : String(error));
    }
  };

  const onReset= () => {
    // Reset form with appropriate type
    setFormData(
      formData.type === MedicineType.Suspension
      ? createEmptySuspensionMedicine(generateId())
      : formData.type === MedicineType.Caplets
      ? createEmptyCapletMedicine(generateId())
      : formData.type === MedicineType.Granules
      ? createEmptyGranulesMedicine(generateId())
      : createEmptyCapsulesMedicine(generateId())
    ); 
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
        <div className="flex justify-between items-center relative">
          <h2 className="text-2xl font-bold mb-6 text-emerald-600">
            {editingMedicine ? t('addMedicineForm.titleEdit') : t('addMedicineForm.titleAdd')}
          </h2>
        <div className="items-left flex mb-5">
        <button
            onClick={onReset}
            className="text-gray-500 hover:text-gray-700"
            >
            <RotateCw size={24} />
          </button>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            >
            <X size={24} />
          </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <select
              value={formData.type}
              onChange={handleMedicineTypeChange}
              className="w-full p-2 border rounded"
            >
              <option value="suspension">{t('addMedicineForm.suspension')}</option>
              <option value="caplets">{t('addMedicineForm.caplets')}</option>
              <option value="granules">{t('addMedicineForm.granules')}</option>
              <option value="capsules">{t('addMedicineForm.capsules')}</option>
            </select>

            <select
              name="targetAudience"
              value={formData.targetAudience}
              onChange={handleBasicInfoChange}
              className="w-full p-2 border rounded"
              required
              >
                <option value="ילדים">{t('addMedicineForm.kids')}</option>
                <option value="מבוגרים">{t('addMedicineForm.adults')}</option>
                <option value="כולם">{t('addMedicineForm.all')}</option>
            </select>

            <input
              type="text"
              name="name"
              placeholder={t('addMedicineForm.namePlaceholder')}
              value={formData.name}
              onChange={handleBasicInfoChange}
              className="w-full p-2 border rounded"
              required
            />

            <input
              type="text"
              name="hebName"
              placeholder={t('addMedicineForm.hebNamePlaceholder')}
              value={formData.hebName}
              onChange={handleBasicInfoChange}
              className="w-full p-2 border rounded"
              required
            />

            <input
              type="text"
              name="activeIngredient"
              placeholder={t('addMedicineForm.ingredientPlaceholder')}
              value={formData.activeIngredient}
              onChange={handleBasicInfoChange}
              className="w-full p-2 border rounded"
              required
            />

            {formData.type === 'suspension' ? (
              <input
                type="text"
                name="concentration"
                placeholder={t('addMedicineForm.concentrationPlaceholder')}
                value={formData.concentration}
                onChange={handleBasicInfoChange}
                className="w-full p-2 border rounded"
                required
              />
            ) : (  // for both formData.type === 'caplets' and 'granules'
              <input
                type="text"
                name="strength"
                placeholder={t('addMedicineForm.strengthPlaceholder')}
                value={formData.strength}
                onChange={handleBasicInfoChange}
                className="w-full p-2 border rounded"
                required
              />
            )}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">{t('addMedicineForm.dosages')}</h3>
              <button
                type="button"
                onClick={addEntry}
                className="p-2 text-emerald-600 hover:text-emerald-700"
                >
                <Plus size={20} />
              </button>
            </div>

            {formData.entries.map((entry, index) => (
              <div key={index} className="p-4 border rounded space-y-4">
                {formData.type === 'suspension' ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="number"
                        placeholder={t('addMedicineForm.weightMin')}
                        value={formData.entries[index].w_low || ''}
                        onChange={(e) => handleEntryChange(index, 'w_low', e.target.value)}
                        className="p-2 border rounded"
                        required
                      />
                      <input
                        type="number"
                        placeholder={t('addMedicineForm.weightMax')}
                        value={formData.entries[index].w_high || ''}
                        onChange={(e) => handleEntryChange(index, 'w_high', e.target.value)}
                        className="p-2 border rounded"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="number"
                        placeholder={t('addMedicineForm.dosageMl')}
                        value={formData.entries[index].dos || ''}
                        onChange={(e) => handleEntryChange(index, 'dos', e.target.value)}
                        className="p-2 border rounded"
                        required
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder={t('addMedicineForm.timesMin')}
                          value={formData.entries[index].perDay_low || ''}
                          onChange={(e) => handleEntryChange(index, 'perDay_low', e.target.value)}
                          className="p-2 border rounded"
                          required
                        />
                        <input
                          type="number"
                          placeholder={t('addMedicineForm.timesMax')}
                          value={formData.entries[index].perDay_high || ''}
                          onChange={(e) => handleEntryChange(index, 'perDay_high', e.target.value)}
                          className="p-2 border rounded"
                          required
                        />
                      </div>
                    </div>
                  </>
                ) : ( // for both formData.type === 'caplets' and 'granules'
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="number"
                        placeholder={t('addMedicineForm.ageMin')}
                        value={formData.entries[index].age_low || ''}
                        onChange={(e) => handleEntryChange(index, 'age_low', e.target.value)}
                        className="p-2 border rounded"
                        required
                      />
                      <input
                        type="number"
                        placeholder={t('addMedicineForm.ageMax')}
                        value={formData.entries[index].age_high || ''}
                        onChange={(e) => handleEntryChange(index, 'age_high', e.target.value)}
                        className="p-2 border rounded"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder={t('addMedicineForm.dosageMin')}
                          value={formData.entries[index].dos_low || ''}
                          onChange={(e) => handleEntryChange(index, 'dos_low', e.target.value)}
                          className="p-2 border rounded"
                          required
                        />
                        <input
                          type="number"
                          placeholder={t('addMedicineForm.dosageMax')}
                          value={formData.entries[index].dos_high || ''}
                          onChange={(e) => handleEntryChange(index, 'dos_high', e.target.value)}
                          className="p-2 border rounded"
                          required
                        />
                      </div>
                      <input
                        type="number"
                        placeholder={t('addMedicineForm.maxPerDay')}
                        value={entry.maxDay || ''}
                        onChange={(e) => handleEntryChange(index, 'maxDay', e.target.value)}
                        className="p-2 border rounded"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder={t('addMedicineForm.hoursMin')}
                        value={formData.entries[index].hoursInterval_low || ''}
                        onChange={(e) => handleEntryChange(index, 'hoursInterval_low', e.target.value)}
                        className="p-2 border rounded"
                        required
                      />
                      <input
                        type="number"
                        placeholder={t('addMedicineForm.hoursMax')}
                        value={formData.entries[index].hoursInterval_high || ''}
                        onChange={(e) => handleEntryChange(index, 'hoursInterval_high', e.target.value)}
                        className="p-2 border rounded"
                        required
                      />
                    </div>
                  </>
                )}

                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeEntry(index)}
                    className="p-2 text-red-600 hover:text-red-700"
                  >
                    <Minus size={20} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-800 rounded flex justify-between items-start">
              <span>{errorMessage}</span>
              <button type="button" onClick={() => setErrorMessage(null)} className="ml-4 text-red-600 hover:text-red-800 font-bold">✕</button>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-emerald-600 text-white p-3 rounded hover:bg-emerald-700 transition-colors"
          >
            {editingMedicine ? t('addMedicineForm.saveChanges') : t('addMedicineForm.addMedicine')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddMedicineForm;
import React, { useEffect } from 'react';
import { Kid } from '../types.ts';
import { useAuth } from '../Users/AuthContext.tsx';
import { addKid, updateKid } from '../services/firestoreService';

interface AddKidFormProps {
  isOpen: boolean;
  isEditMode: boolean;
  kidData: Partial<Kid>;
  userRole: string | null;
  onClose: () => void;
  onSave: (kidData: Partial<Kid>) => Promise<void>;
  onKidDataChange: (data: Partial<Kid>) => void;
}

export const AddKidForm: React.FC<AddKidFormProps> = ({
  isOpen,
  isEditMode,
  kidData,
  userRole,
  onClose,
  onSave,
  onKidDataChange,
}) => {
  const { user, getCurrentUserFamily } = useAuth(); // Get the logged-in user
  const families = useAuth().families;

  // Set default familyName for new kids
  useEffect(() => {
    if (isOpen && !isEditMode && !kidData.familyName) {
      const currentUserFamily = getCurrentUserFamily();
      if (currentUserFamily) {
        onKidDataChange({ ...kidData, familyName: currentUserFamily.name, familyId: currentUserFamily.id });
      }
    }
  }, [isOpen, isEditMode, kidData, onKidDataChange, getCurrentUserFamily]);

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center ${!isOpen && 'hidden'}`}>
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl">{isEditMode ? 'ערוך ילד' : 'הוסף ילד חדש'}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="space-y-4">
          <input
            className="w-full p-2 border rounded"
            placeholder="שם"
            value={kidData.name || ''}
            onChange={e => onKidDataChange({ ...kidData, name: e.target.value })}
          />
          <input
            className="w-full p-2 border rounded"
            placeholder="תאריך לידה (DD/MM/YYYY)"
            value={kidData.birthDate || ''}
            onChange={e => onKidDataChange({ ...kidData, birthDate: e.target.value })}
          />
          <input
            className="w-full p-2 border rounded"
            type="number"
            placeholder="משקל"
            value={kidData.weight || ''}
            onChange={e => onKidDataChange({ ...kidData, weight: Number(e.target.value) })}
          />
          <input
            className="w-full p-2 border rounded"
            placeholder="תרופה מועדפת"
            value={kidData.favoriteMedicine || ''}
            onChange={e => onKidDataChange({ ...kidData, favoriteMedicine: e.target.value })}
          />
          {user?.role === 'admin' && (
            <select
              value={kidData.familyId || ''}
              onChange={(e) => onKidDataChange({ ...kidData, familyId: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="">בחר משפחה</option>
              {families.map(family => (
                <option key={`family-${family.id}`} value={family.id}>
                  {family.name}
                </option>
              ))}
            </select>
          )}
          <input
            type="hidden"
            value={kidData.lastUpdated || new Date().toISOString()}
            onChange={() => {}}
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              ביטול
            </button>
            <button
              onClick={async () => {
                // Ensure birthDate is not undefined before calling onSave
                if (kidData.birthDate === undefined) {
                  kidData.birthDate = ''; // Set a default value if undefined
                }
                await onSave(kidData);
                onClose();
              }}
              className="px-4 py-2 bg-emerald-600 text-white rounded
                        hover:bg-emerald-700
                        disabled:bg-gray-400 disabled:text-gray-200 disabled:cursor-not-allowed"
              disabled={user?.role === 'admin' && !kidData.familyId} // Disable if admin and familyId is missing
            >
              שמור
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddKidForm;

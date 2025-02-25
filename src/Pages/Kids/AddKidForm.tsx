import React from 'react';
import { Kid } from '../../types.ts';

interface AddKidFormProps {
  isOpen: boolean;
  isEditMode: boolean;
  kidData: Partial<Kid>;
  onClose: () => void;
  onSave: (kidData: Partial<Kid>) => Promise<void>;
  onKidDataChange: (data: Partial<Kid>) => void;
}

export const AddKidForm: React.FC<AddKidFormProps> = ({
  isOpen,
  isEditMode,
  kidData,
  onClose,
  onSave,
  onKidDataChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
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
          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              ביטול
            </button>
            <button
              onClick={() => onSave(kidData)}
              className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
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
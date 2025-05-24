import React from 'react';

interface AddMedicineFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (medicine: any) => void;
  editingMedicine: any;
}

const AddMedicineForm: React.FC<AddMedicineFormProps> = ({ isOpen, onClose, onSave, editingMedicine }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-4">Add/Edit Medicine</h2>
        {/* Add form fields here */}
        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
          <button onClick={() => onSave({})} className="px-4 py-2 bg-emerald-600 text-white rounded">Save</button>
        </div>
      </div>
    </div>
  );
};

export default AddMedicineForm;

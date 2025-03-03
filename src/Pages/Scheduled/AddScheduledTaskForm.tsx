import React , {useState, useEffect, SyntheticEvent, useCallback} from 'react';
import { TaskEntry, TreatmentType, Frequency } from '../../types';
import {CalendarIcon} from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";


interface AddScheduledTaskFormProps {
  isOpen: boolean;
  isEditMode: boolean;
  formData: Partial<TaskEntry>;
  onClose: () => void;
  onSubmit: (formData: Partial<TaskEntry>) => Promise<void>;
  onTaskDataChange: (data: Partial<TaskEntry>) => void;
}

export const AddScheduledTaskForm: React.FC<AddScheduledTaskFormProps> = ({
  isOpen,
  isEditMode,
  formData,
  onClose,
  onSubmit,
  onTaskDataChange,
}) => {
  if (!isOpen) return null;

    const [treatmentType, setTreatmentType] = useState<TreatmentType>('סבב טיפול');
    const [frequency, setFrequency] = useState<Frequency>('יומי');

    // Handler for treatment type changes
    const handleTreatmentTypeChange = (value: TreatmentType) => {
      setTreatmentType(value);
      if (value === 'תרופה קבועה') {
        // Set a default high number of days for ongoing treatment
        onTaskDataChange({ ...formData, taskDays: 365 });
      } else {
        // Reset to default for treatment cycle
        onTaskDataChange({ ...formData, taskDays: 1 });
      }
    };
  
    // Handler for frequency changes
    const handleFrequencyChange = (value: Frequency) => {
      setFrequency(value);
      // Update taskDays based on frequency
      const days = value === 'יומי' ? 365 : 52;
      onTaskDataChange({ ...formData, taskDays: days });
    };

      // Initialize treatment type and frequency based on formData
  useEffect(() => {
    if (formData.taskDays) {
      // If taskDays is 365 or 52, it's likely a regular medication
      if (formData.taskDays === 365) {
        setTreatmentType('תרופה קבועה');
        setFrequency('יומי');
      } else if (formData.taskDays === 52) {
        setTreatmentType('תרופה קבועה');
        setFrequency('שבועי');
      } else {
        setTreatmentType('סבב טיפול');
      }
    }
  }, [formData.taskDays, setTreatmentType, setFrequency]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{isEditMode ? 'עריכת תרופה תקופתית' : 'הוספת תרופה תקופתית חדשה'}</h2>          
            <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            >
            ✕
            </button>
        </div>

        <div className="space-y-4">
            <div>
            <label htmlFor="taskUser" className="block text-sm font-medium text-gray-700 mb-1">
                משתמש
            </label>
            <input
                className="w-full p-2 border rounded"
                placeholder="שם"
                value={formData.taskUser}
                onChange={e => onTaskDataChange({ ...formData, taskUser: e.target.value })}
                required
            />
            </div>
            <div>
            <label htmlFor="taskLabel" className="block text-sm font-medium text-gray-700 mb-1">
                תיאור
            </label>
            <input
                className="w-full p-2 border rounded"
                placeholder="אנטיביוטיקה, לחץ דם, הרגעה, וכד'"
                value={formData.taskLabel}
                onChange={e => onTaskDataChange({ ...formData, taskLabel: e.target.value })}
            />
            </div>
            <div>
            <label htmlFor="medicine" className="block text-sm font-medium text-gray-700 mb-1">
              שם התרופה
            </label>
            <input
                className="w-full p-2 border rounded"
                placeholder=""
                value={formData.medicine}
                onChange={e => onTaskDataChange({ ...formData, medicine: e.target.value })}
                required
            />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label htmlFor="dose" className="block text-sm font-medium text-gray-700 mb-1">
                מינון
                </label>
            <input
                className="w-full p-2 border rounded"
                placeholder="מינון"
                value={formData.dose}
                onChange={e => onTaskDataChange({ ...formData, dose:Number(e.target.value)||0 })}
            />
            </div>
            <div className="flex-1">
            <label htmlFor="doseUnits" className="block text-sm font-medium text-gray-700 mb-1">
              יחידות
            </label>
            <input
                className="w-full p-2 border rounded"
                placeholder='מ"ל, כדור, וכד'
                value={formData.doseUnits}
                onChange={e => onTaskDataChange({ ...formData, doseUnits: e.target.value })}
                required
            />
            </div>
            </div>

            <div className="flex-1">
            <label htmlFor="taskStartDate" className="block text-sm font-medium text-gray-700 mb-1">
            תאריך התחלה 
            </label>
            <div className="relative">
                <DatePicker
                selected={formData.taskStartDate ? new Date(formData.taskStartDate.split('/').reverse().join('-')) : null}
                onChange={(date: Date | null, event?: SyntheticEvent<any, Event>) => {
                  const handleDateChange = useCallback((date: Date | null) => {
                    if (date) {
                    const day = date.getDate().toString().padStart(2, '0');
                    const month = (date.getMonth() + 1).toString().padStart(2, '0');
                    const year = date.getFullYear();
                    const formattedDate = `${day}/${month}/${year}`;
                    onTaskDataChange({ ...formData, taskStartDate: formattedDate });
                    }
                  }, [formData, onTaskDataChange]);
                }}
                dateFormat="dd/MM/yyyy"
                className="w-full p-2 border rounded pl-10"
                placeholderText="DD/MM/YYYY"
                showYearDropdown
                scrollableYearDropdown
                yearDropdownItemNumber={10}
                // locale="he"
                />
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
            </div>
         
            <div className="flex gap-4">
            <div className="flex-1">
            <label htmlFor="taskDays" className="block text-sm font-medium text-gray-700 mb-1"
              style={{ height: '40px' }}
              >
              משך תקופה
            </label>
            <select
              id="treatmentType"
              className="w-full p-2 border rounded"
              value={treatmentType}
              onChange={(e)=> handleTreatmentTypeChange(e.target.value as TreatmentType)}
              >
              <option value="סבב טיפול">סבב טיפול</option>
              <option value="תרופה קבועה">תרופה קבועה</option>
            </select>
            </div>
            {/* Conditional Rendering based on Treatment Type */}
            <div className="flex-1">
              {treatmentType === 'סבב טיפול' ? (
                <>
                  <label htmlFor="taskDays" className="block text-sm font-medium text-gray-700 mb-1"
                        style={{ height: '40px' }}
                  >
                    מספר ימים לנטילה
                  </label>
                  <input
                    className="w-full p-2 border rounded"
                    placeholder="1 / 2 / ..."
                    value={formData.taskDays}
                    onChange={e => onTaskDataChange({ 
                      ...formData, 
                      taskDays: e.target.value ? Number(e.target.value) : 1 
                    })}
                    type="number"
                    min="1"
                    required
                  />
                </>
              ) : (
                <>
                  <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1"
                        style={{ height: '40px' }}
                  >
                    תדירות
                  </label>
                  <select
                    id="frequency"
                    className="w-full p-2 border rounded"
                    value={frequency}
                    onChange={(e) => handleFrequencyChange(e.target.value as Frequency)}
                  >
                    <option value="יומי">יומי</option>
                    {/* <option value="שבועי">שבועי</option> */}
                  </select>
                </>
              )}
            </div>
            <div className="flex-1">
            <label htmlFor="timesPerDay" className="block text-sm font-medium text-gray-700 mb-1"
              style={{ height: '40px' }}
              >
               מספר פעמים ביום
            </label>
            <input
                className="w-full p-2 border rounded"
                placeholder="מספר פעמים ביום"
                type="number"
                min="1"
                value={formData.timesPerDay}
                onChange={e => onTaskDataChange({ ...formData, timesPerDay: Number(e.target.value)||0 })}
                // required
            />
            </div>
            </div>

            <div>
            <label htmlFor="timeInDay" className="block text-sm font-medium text-gray-700 mb-1">
              זמן ביום
            </label>
            <input
                className="w-full p-2 border rounded"
                placeholder="בוקר/צהריים/ערב/20:00/..."
                value={formData.timeInDay}
                onChange={e => onTaskDataChange({ ...formData, timeInDay: e.target.value })}
                // required
            />
            </div>
            <div>
            <label htmlFor="withFood" className="block text-sm font-medium text-gray-700 mb-1">
              עם אוכל
            </label>
            <select
              id="withFood"
              className="w-full p-2 border rounded"
              value={formData.withFood || 'לא משנה'}
              onChange={e => onTaskDataChange({ ...formData, withFood: e.target.value })}
              >
              <option value="לא משנה">לא משנה</option>
              <option value="לפני האוכל">לפני האוכל</option>
              <option value="עם או אחרי האוכל">עם או אחרי האוכל</option>
            </select>
            </div>

            <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                הערות
            </label>
            <input
                className="w-full p-2 border rounded"
                placeholder="הערות"
                value={formData.comment}
                onChange={e => onTaskDataChange({ ...formData, comment: e.target.value })}
                // required
            />
            </div>


          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              ביטול
            </button>
            <button
              onClick={() => onSubmit(formData)}
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

export default AddScheduledTaskForm;
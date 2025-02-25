// src/components/MedicineDialog.tsx
import React, { useState, useEffect } from 'react';
import { MedicineManager } from '../services/medicineManager';
import { LogManager } from '../services/logManager';
import { LogEntry } from '../types';

interface MedicineDialogProps {
  isOpen: boolean;
  onClose: () => void;
  kidName?: string;
  kidWeight?: number;
  kidAge?: number;
  kidFavoriteMedicine?: string;
  logData: LogEntry[];
  setLogData: React.Dispatch<React.SetStateAction<LogEntry[]>>;
  isQuickAdd?: boolean;
}

export const MedicineDialog: React.FC<MedicineDialogProps > = ({
    isOpen, onClose, kidName: initialKidName, kidWeight: initialKidWeight, kidAge: initialKidAge, kidFavoriteMedicine, logData, setLogData, isQuickAdd = false }) => {
// console.log('initials', { initialKidName, initialKidWeight, initialKidAge});

  const isFirstRender = React.useRef(true);       // Use a ref to track if this is the first render
  const [temperature, setTemperature] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState('');
  const [recommendedDosage, setRecommendedDosage] = useState('');
  const [actualDosage, setActualDosage] = useState('');
  const [kidName, setKidName] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const medicineGroups = MedicineManager.getMedicineGroups();

  // console.log('MedicineDialog initiated', {isFirstRender, selectedMedicine, kidName, initialKidName, initialKidWeight, weight, age, initialKidAge});

  useEffect(() => {
    if (isOpen && isFirstRender.current) {
        // console.log('Initializing dialog with:', { isFirstRender,initialKidName, initialKidWeight, initialKidAge, kidName, weight, age });
        setKidName(initialKidName || '');
        setWeight(initialKidWeight?.toString() || '');
        setAge(initialKidAge?.toString() || '');
        setSelectedMedicine(kidFavoriteMedicine || '');
        isFirstRender.current = false;
    }
    // Reset the firstRender flag and the form when dialog closes
    if (!isOpen) {
        isFirstRender.current = true;
        setTemperature('');
        setRecommendedDosage('');
        setActualDosage('');
        setSelectedMedicine('');
        if (!initialKidName) setKidName('');
        if (!initialKidWeight) setWeight('');
        if (!initialKidAge) setAge('');
    }
    }, [isOpen, initialKidName, initialKidWeight, initialKidAge]);

  useEffect(() => {
    if (selectedMedicine && weight) {
      const weightNum = parseFloat(weight);
      const ageNum = age ? parseFloat(age) : undefined;
      // console.log('MedicineDialog use effect', {selectedMedicine, weight, weightNum, age, ageNum});
      const recommended = MedicineManager.calculateDosage(selectedMedicine, weightNum, ageNum);
      setRecommendedDosage(recommended);
      
      // Extract the higher value if it's a range, or use the single value
      const match = recommended.match(/(\d+(?:\.\d+)?)/g);
      if (match && match.length > 0) {
          // Get the last number in case it's a range (which will be the higher value)
          const highestValue = match[match.length - 1];
          setActualDosage(highestValue);
        } else {
          setActualDosage('');
        }
      } else {
        setRecommendedDosage('');
        setActualDosage('');
      }
      }, [selectedMedicine, weight, age]);

  const handleTemperatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty input for better typing experience
    if (value === '') {setTemperature(''); return;}
    // Allow typing decimal point
    if (value === '.') {setTemperature('0.');return;}
    if (value === '3' || value === '4') {setTemperature(value);}
    
    // Parse the number for validation
    const numValue = parseFloat(value);
        
    // Check if it's a valid number and within range
    if (!isNaN(numValue)) {
      if (numValue >= 34 && numValue <= 43) {
        setTemperature(value);
      } else if (value.endsWith('.')) {
        // Allow typing decimal point even if the current number is out of range
        setTemperature(value);
      }
    }
  };
    
  const validateTemperature = () => {
    const numValue = parseFloat(temperature);
    if (!isNaN(numValue) && (numValue < 34 || numValue > 43)) {
      setTemperature('');
    }
  };
      
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try{
    const now = new Date();
    const logHour = String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
    const logDate = String(now.getDate()).padStart(2,'0')+'/'+String(now.getMonth()+1).padStart(2,'0')+'/'+String(now.getFullYear()).slice(-2);
   
    const newLogEntry: LogEntry = {
      id: crypto.randomUUID(),  
      logDate, logHour, kidName, temperature, selectedMedicine, actualDosage
    };
    const loadedLogs = await LogManager.loadLogs();
    const updatedLogs = [...loadedLogs, newLogEntry];
    setLogData(updatedLogs);
    // console.log(' log entry:', {logData, loadedLogs, newLogEntry}); // For debugging

    // Save to file
    await LogManager.saveLogs(updatedLogs);

    onClose();
    }catch (error){
      console.error ('Failed saving log entry: ', error)
      setLogData(logData);       // Optionally revert the state if save fails
      alert('שגיאה בשמירת הרשומה. אנא נסה שנית.'); // Optionally show an error message to the user
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
      <h2 className="text-xl mb-4 text-right">מתן תרופה{kidName && ` - ${kidName}`}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Kid Name field - shown only in quick add mode or if no initial kid name */}
        {(isQuickAdd || !initialKidName) && (
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  className="w-full p-2 border rounded text-right"
                  placeholder="שם הילד"
                  value={kidName}
                  onChange={(e) => setKidName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}
           {/* Weight field - shown only in quick add mode or if no initial weight */}
           {(isQuickAdd || !initialKidWeight) && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">ק"ג</span>
              <div className="relative flex-1">
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="150"
                  className="w-full p-2 border rounded text-right"
                  placeholder="משקל"
                  value={weight}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow empty input or valid number with up to one decimal
                    if (/^\d*\.?\d{0,1}$/.test(value)) {
                      setWeight(value);
                    }
                  }}
                  // required
                />
              </div>
            </div>
           )}
          {/* Age field - shown only in quick add mode or if no initial age */}
          {(isQuickAdd || !initialKidAge) && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">שנים</span>
              <div className="relative flex-1">
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="120"
                  className="w-full p-2 border rounded text-right"
                  placeholder="גיל"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>
            </div>
           )}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">°C</span>
          <div className="relative flex-1">
              <input
                type="text"  // Changed to text type for better control
                inputMode="decimal"  // Shows numeric keyboard on mobile
                className="w-full p-2 border rounded text-right"
                placeholder="חום"
                value={temperature}
                onChange={handleTemperatureChange}
                onBlur={validateTemperature}  // Validate when focus is lost
                pattern="[0-9]*[.]?[0-9]+"  // Allow only numbers and one decimal point
              />
                {(parseFloat(temperature) < 34 || parseFloat(temperature) > 43) &&
                temperature !== "" ? (
                  'טמפרטורה חייבת להיות בין 34-43') : ('')
                }
            </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500"></span>
          <div className="relative flex-1">
            {/*Only show button when there's content */}
            {selectedMedicine && (
              <button
                type="button"
                className="absolute -right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setSelectedMedicine('')}
                aria-label="clear input"
              >
                ×
              </button>
            )}
            <input
              list="medicines"
              className="w-full p-2 border rounded text-right"
              placeholder="תרופה"
              value={selectedMedicine}
              onChange={(e) => setSelectedMedicine(e.target.value)}
            />
            <datalist id="medicines">
              {medicineGroups.map(group => (
                group.data.map(medicine => (
                  <option key={medicine.id} value={group.name} />
                ))
              ))}
            </datalist>
          </div>
        </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1 text-right">מינון מומלץ</label>
            <input
              className="w-full p-2 border rounded text-right bg-gray-50"
              value={recommendedDosage}
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1 text-right">מינון שניתן</label>
            <input
              className="w-full p-2 border rounded text-right"
              type="number"
              step="any"
              min="0"
              value={actualDosage}
              onChange={(e) => {
                const value = e.target.value;
                // Allow empty input or valid number with up to two decimals
                if (/^\d*\.?\d{0,2}$/.test(value)) {
                  setActualDosage(value);
                }
              }}
              />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              ביטול
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
            >
              שמור
            </button>
          </div>
        </form>
        {/* <LogPage logData={logData} /> */}
      </div>
    </div>
  );
};
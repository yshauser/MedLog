import React, { useState } from 'react';
import {useNavigate} from 'react-router-dom';
import { SuspensionMedicine, CapletMedicine, GranulesMedicine, MedicineType, TargetAudience } from '../types';
import { MedicineManager, MedicineGroup } from '../services/medicineManager';
import { useAuth } from '../Users/AuthContext';

type OrganizationType = 'type' | 'audience';

export const MedicinesPage = () => {
  const navigate = useNavigate();
  const {user} = useAuth(); // Get the logged-in user
  const [selectedType, setSelectedType] = useState<MedicineType |TargetAudience| null>(null);
  const [selectedMedicine, setSelectedMedicine] = useState<MedicineGroup | null>(null);
  // const [showAddForm, setShowAddForm] = useState(false);
  const [organizationMethod, setOrganizationMethod] = useState<OrganizationType>('type');

  const handleBackClick = () => {
    if (selectedMedicine) {
      setSelectedMedicine(null);
    } else if (selectedType) {
      setSelectedType(null);
    }
  };

  const medicineLabels: Record<MedicineType, string> = {
    [MedicineType.Suspension]: 'תרחיפים',
    [MedicineType.Caplets]: 'קפליות',
    [MedicineType.Granules]: 'גרנולות',
  };

  return (
    <main className="flex-1 flex flex-col p-4 bg-white overflow-auto">
      <h1 className="text-2xl text-emerald-600 mb-6 text-center">תרופות</h1>

      {/* Organization Method Selection */}
      {!selectedType && !selectedMedicine && (
        <div className="w-full max-w-md mx-auto mb-6">
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setOrganizationMethod('type')}
              className={`p-2 rounded ${
                organizationMethod === 'type' 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              לפי סוג תרופה
            </button>
            <button
              onClick={() => setOrganizationMethod('audience')}
              className={`p-2 rounded ${
                organizationMethod === 'audience' 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              לפי קהל יעד
            </button>
          </div>
        </div>
      )}

      {/* Back Button */}
      {(selectedType || selectedMedicine) && (
        <button
          onClick={handleBackClick}
          className="mb-4 text-emerald-600 hover:text-emerald-700 flex items-center gap-2"
        >
          <span>←</span> חזור {selectedMedicine ? 'לרשימה' : 'לסוגי תרופות'}
        </button>
      )}

      
      {/* Medicine Categories Selection */}
      {!selectedType && !selectedMedicine && (
        <div className="flex flex-col gap-4 w-full max-w-md mx-auto">
          <h2 className="text-xl text-emerald-600 mb-2 text-center">
            {organizationMethod === 'type' ? 'בחר סוג תרופה' : 'בחר קהל יעד'}
          </h2>
          {organizationMethod === 'type' ? (
            Object.values(MedicineType).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className="bg-emerald-600 text-white p-4 rounded-lg shadow-md hover:bg-emerald-700 transition-colors text-right"
              >
                {medicineLabels[type] || type}
              </button>
            ))
          ) : (
            Object.values(TargetAudience)
            .filter((type) => type !== TargetAudience.All) // Exculde All 
            .map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className="bg-emerald-600 text-white p-4 rounded-lg shadow-md hover:bg-emerald-700 transition-colors text-right"
              >
                {type === TargetAudience.Adults ? 'מבוגרים' : 'ילדים' }
              </button>
            )))}
        </div>
      )}

      {/* Medicine List By Category */}
      {selectedType && !selectedMedicine && (
        <div className="flex flex-col gap-4 w-full max-w-md mx-auto">
          <h2 className="text-xl text-emerald-600 mb-2 text-center">
            {selectedType === MedicineType.Suspension ? 'תרחיפים' : 
             selectedType === MedicineType.Caplets ? 'קפליות' : 
             selectedType === MedicineType.Granules ? 'גרנולות' : 
             selectedType === 'kids' ? 'תרופות לילדים' : 'תרופות למבוגרים'}
          </h2>
          {(organizationMethod === 'type' 
            ? MedicineManager.findMedicinesGroupsByType(selectedType as MedicineType)
            : MedicineManager.findMedicinesByTargetAudience(selectedType as string)
          ).map((medicineGroup) => (
            <button
              key={medicineGroup.name}
              onClick={() => setSelectedMedicine(medicineGroup)}
              className="bg-emerald-600 text-white p-4 rounded-lg shadow-md hover:bg-emerald-700 transition-colors text-right"
            >
              {medicineGroup.name}
            </button>
          ))}
        </div>
      )}

      {/* Medicine Details Table */}
      {selectedMedicine && (
        <div className="w-full mb-8">
          <h2 className="text-xl text-emerald-600 mb-4">{selectedMedicine.name}</h2>        
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-emerald-100">
                  {selectedMedicine.data[0].type === "suspension" ? (
                    <>
                      {MedicineManager.hasEqualValues(selectedMedicine.data, 'w_low', 'w_high') ? (
                        <th className="border p-2 text-right">משקל (ק״ג)</th>
                      ) : (
                        <>
                          <th className="border p-2 text-right">משקל מינימום (ק״ג)</th>
                          <th className="border p-2 text-right">משקל מקסימום (ק״ג)</th>
                        </>
                      )}
                      <th className="border p-2 text-right">מינון (מ״ל)</th>
                      <th className="border p-2 text-right">פעמים ביום</th>
                    </>
                  ) : selectedMedicine.data[0].type === "caplets" ? (
                    <>
                      <th className="border p-2 text-right">גיל מינימום (שנים)</th>
                      <th className="border p-2 text-right">גיל מקסימום (שנים)</th>
                      <th className="border p-2 text-right">מינון (קפליות)</th>
                      <th className="border p-2 text-right">שעות בין מינונים</th>
                      <th className="border p-2 text-right">מקסימום ליום</th>
                    </>
                  ) : selectedMedicine.data[0].type === "granules" ? (
                    <>
                      <th className="border p-2 text-right">גיל מינימום (שנים)</th>
                      <th className="border p-2 text-right">גיל מקסימום (שנים)</th>
                      <th className="border p-2 text-right">מינון (גרנולות)</th>
                      <th className="border p-2 text-right">שעות בין מינונים</th>
                      <th className="border p-2 text-right">מקסימום ביום</th>
                    </>
                  ) : null}            
                </tr>
              </thead>
              <tbody>
              {selectedMedicine?.data[0].entries.map((item: SuspensionMedicine["entries"][0] | CapletMedicine["entries"][0] | GranulesMedicine["entries"][0] , index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {selectedMedicine.data[0].type === "suspension" ? (
                      (item as SuspensionMedicine["entries"][0]) && (
                        <>
                          {MedicineManager.hasEqualValues(selectedMedicine.data, 'w_low', 'w_high') ? (
                            <td className="border p-2 text-right">{(item as SuspensionMedicine["entries"][0]).w_low}</td>
                          ) : (
                            <>
                              <td className="border p-2 text-right">{(item as SuspensionMedicine["entries"][0]).w_low}</td>
                              <td className="border p-2 text-right">{(item as SuspensionMedicine["entries"][0]).w_high}</td>
                            </>
                          )}
                          <td className="border p-2 text-right">{(item as SuspensionMedicine["entries"][0]).dos}</td>
                          {MedicineManager.hasEqualValues(selectedMedicine.data, 'perDay_low', 'perDay_high') ? (
                            <td className="border p-2 text-right">{(item as SuspensionMedicine["entries"][0]).perDay_low}</td>
                          ) : (
                            <>
                              <td className="border p-2 text-right">{(item as SuspensionMedicine["entries"][0]).perDay_high} - {(item as SuspensionMedicine["entries"][0]).perDay_low}</td>
                            </>
                          )}
                        </>
                      )
                    ) : selectedMedicine.data[0].type === "caplets" ? (
                      <>
                        <td className="border p-2 text-right">{(item as CapletMedicine["entries"][0]).age_low}</td>
                        <td className="border p-2 text-right">{(item as CapletMedicine["entries"][0]).age_high ? ((item as CapletMedicine["entries"][0]).age_high):('∞')}</td>
                        {(item as CapletMedicine["entries"][0]).dos_high === (item as CapletMedicine["entries"][0]).dos_low ? (
                          <td className="border p-2 text-right">{(item as CapletMedicine["entries"][0]).dos_low}</td>
                        ) : (
                          <td className="border p-2 text-right">
                            {(item as CapletMedicine["entries"][0]).dos_high} - {(item as CapletMedicine["entries"][0]).dos_low}
                          </td>
                        )}
                        <td className="border p-2 text-right">
                          {(item as CapletMedicine["entries"][0]).hoursInterval_high} - {(item as CapletMedicine["entries"][0]).hoursInterval_low}
                        </td>
                        <td className="border p-2 text-right">{(item as CapletMedicine["entries"][0]).maxDay}</td>
                      </>
                      ) : selectedMedicine.data[0].type === "granules" ? (
                        <>
                          <td className="border p-2 text-right">{(item as GranulesMedicine["entries"][0]).age_low}</td>
                          <td className="border p-2 text-right">{(item as GranulesMedicine["entries"][0]).age_high ? ((item as GranulesMedicine["entries"][0]).age_high):('∞')}</td>
                          {(item as GranulesMedicine["entries"][0]).dos_high === (item as GranulesMedicine["entries"][0]).dos_low ? (
                            <td className="border p-2 text-right">{(item as GranulesMedicine["entries"][0]).dos_low}</td>
                          ) : (
                            <td className="border p-2 text-right">
                              {(item as GranulesMedicine["entries"][0]).dos_high} - {(item as GranulesMedicine["entries"][0]).dos_low}
                            </td>
                          )}
                          <td className="border p-2 text-right">
                            {(item as GranulesMedicine["entries"][0]).hoursInterval_high} - {(item as GranulesMedicine["entries"][0]).hoursInterval_low}
                          </td>
                          <td className="border p-2 text-right">{(item as GranulesMedicine["entries"][0]).maxDay}</td>
                        </>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

     {/* Bottom Container */}
      <div className="w-full mt-8">
        {/* Show this section only for admin or owner */}
        {user?.role === 'admin' || user?.role === 'owner' ? (
          <div className="w-full max-w-md mx-auto">
            <button
              onClick={() => navigate('/Settings/medicines')}
              className="w-full bg-emerald-600 text-white p-3 rounded hover:bg-emerald-700 transition-colors"
            >
              ניהול תרופות
            </button>
          </div>
          ) : null}
      </div>
    </main>
  );
};

export default MedicinesPage;

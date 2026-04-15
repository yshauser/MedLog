// src/pages/Home/HomePage.tsx
import React, { useState } from 'react';
import { MedicineDialog } from '../components/MedicineDialog';
import { LogEntry, Kid } from '../types';
import { useAuth } from '../Users/AuthContext';
import { useTranslation } from 'react-i18next';

const ADMIN_FAMILY_ID = 'admin-family';

interface HomePageProps {
  logData: LogEntry[];
  setLogData: React.Dispatch<React.SetStateAction<LogEntry[]>>;
}

export const HomePage: React.FC<HomePageProps> = ({ logData, setLogData }) => {
  const { t } = useTranslation();
  const { user, families, kids, kidsLoading } = useAuth();
  const [selectedKid, setSelectedKid] = useState<Kid | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [selectedFamilyFilter, setSelectedFamilyFilter] = useState<string>('all');

  const isAdminFamilyMember = user?.familyId === ADMIN_FAMILY_ID;

  const filteredKids = isAdminFamilyMember && selectedFamilyFilter !== 'all'
    ? kids.filter(k => k.familyId === selectedFamilyFilter)
    : kids;

  const handleKidClick = (kid: Kid) => {
    console.log ('home page, handle kid click', {kid});
    setSelectedKid(kid);
    setIsDialogOpen(true);
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-4 bg-white">
      {isAdminFamilyMember && (
        <div className="w-full max-w-2xl mb-4 flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">{t('kids.filterFamily')}</label>
          <select
            value={selectedFamilyFilter}
            onChange={e => setSelectedFamilyFilter(e.target.value)}
            className="p-2 border rounded text-sm"
          >
            <option value="all">{t('kids.allFamilies')}</option>
            {families
              .filter(f => f.id !== ADMIN_FAMILY_ID)
              .map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
          </select>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-4xl mb-8">
        {kidsLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-gray-200 animate-pulse p-4 rounded-lg shadow-md h-14" />
            ))
          : filteredKids.map((kid, index) => (
              <button
                key={kid.id || index}
                onClick={() => handleKidClick(kid)}
                className="bg-emerald-600 text-white p-4 rounded-lg shadow-md hover:bg-emerald-700 transition-colors text-center flex-1"
              >
                {kid.name}
              </button>
            ))
        }
      </div>
      
      <button 
        onClick={() => setIsQuickAddOpen(true)}
        className="bg-emerald-600 text-white w-32 h-32 rounded-full shadow-md hover:bg-emerald-700 transition-colors flex items-center justify-center text-xl"
      >
        {t('home.logMedicine')}
      </button>

      <MedicineDialog
        isOpen={isDialogOpen}
        onClose={() => {
          console.log ('onClose', {selectedKid});
          setIsDialogOpen(false);
          setSelectedKid(null);
        }}
        kidName={selectedKid?.name ?? ''}
        kidWeight={selectedKid?.weight ?? undefined}
        kidAge={selectedKid?.age ?? undefined}
        kidFavoriteMedicine = {selectedKid?.favoriteMedicine ?? undefined}
        logData={logData}
        setLogData={setLogData}
      />
      <MedicineDialog
        isOpen={isQuickAddOpen}
        onClose={() => {
          console.log ('onClose quick add');
          setIsQuickAddOpen(false);
        }}
        logData={logData}
        setLogData={setLogData}
        isQuickAdd={true}
        />
    </main>
  );
};

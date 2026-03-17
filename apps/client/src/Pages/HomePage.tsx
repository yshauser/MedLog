// src/pages/Home/HomePage.tsx
import React, { useState, useEffect } from 'react';
import { MedicineDialog } from '../components/MedicineDialog';
import { KidManager } from '../services/kidManager';
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
  const { user, getCurrentUserFamily, families } = useAuth();
  const [selectedKid, setSelectedKid] = useState<Kid | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [kids, setKids] = useState<Kid[]>([]);
  const [selectedFamilyFilter, setSelectedFamilyFilter] = useState<string>('all');
  const [filteredKids, setFilteredKids] = useState<Kid[]>([]);

  const isAdminFamilyMember = user?.familyId === ADMIN_FAMILY_ID;

  useEffect(() => {
    const loadKids = async () => {
      const isAdminFamilyMember = user?.familyId === ADMIN_FAMILY_ID;
      let loadedKids: Kid[];

      if (isAdminFamilyMember) {
        loadedKids = await KidManager.loadKids();
      } else {
        const userFamily = getCurrentUserFamily();
        loadedKids = userFamily
          ? await KidManager.loadKidsByFamily(userFamily.id)
          : [];
      }

      // Sort by user's kidOrder if available
      if (user?.kidOrder?.length) {
        loadedKids.sort((a, b) => {
          const indexA = user.kidOrder!.indexOf(a.id);
          const indexB = user.kidOrder!.indexOf(b.id);
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });
      }

      setKids(loadedKids);
    };
    loadKids();
  }, [user]);

  useEffect(() => {
    if (user?.familyId === ADMIN_FAMILY_ID && selectedFamilyFilter !== 'all') {
      setFilteredKids(kids.filter(k => k.familyId === selectedFamilyFilter));
    } else {
      setFilteredKids(kids);
    }
  }, [kids, selectedFamilyFilter]);

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
        {filteredKids.map((kid,index) => (
          <button
            key={kid.id || index}
            onClick={() => handleKidClick(kid)}
            className="bg-emerald-600 text-white p-4 rounded-lg shadow-md hover:bg-emerald-700 transition-colors text-center flex-1"
          >
            {kid.name}
          </button>
        ))}
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
        onClose={() => setIsQuickAddOpen(false)}
        logData={logData}
        setLogData={setLogData}
        isQuickAdd={true}
        />
    </main>
  );
};

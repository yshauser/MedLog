// src/pages/Home/HomePage.tsx
import React, { useState, useEffect } from 'react';
import { MedicineDialog } from '../components/MedicineDialog';
import { KidManager } from '../services/kidManager';
import { LogEntry, Kid } from '../types';

interface HomePageProps {
  logData: LogEntry[];
  setLogData: React.Dispatch<React.SetStateAction<LogEntry[]>>;
}

export const HomePage: React.FC<HomePageProps> = ({ logData, setLogData }) => {
  const [selectedKid, setSelectedKid] = useState<Kid | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [kids, setKids] = useState<Kid[]>([]);

  useEffect(() => {
    const loadKids = async () => {
      const loadedKids = await KidManager.loadKids();
      setKids(loadedKids);
    };
    loadKids();
  }, []);

  const handleKidClick = (kid: Kid) => {
    console.log ('home page, handle kid click', {kid});
    setSelectedKid(kid);
    setIsDialogOpen(true);
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-4 bg-white">
      {/* <div className="flex flex-col sm:flex-row gap-4 mb-8 w-full max-w-xs sm:max-w-md"> */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-4xl mb-8">
        {kids.map((kid,index) => (
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
        תיעוד תרופה/חום
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

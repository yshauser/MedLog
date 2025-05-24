// src/layouts/MainLayout.tsx
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Header } from '../components/Header';
import { Navigation } from '../components/Navigation';
import { HomePage } from '../Pages/HomePage'
import { LogPage } from '../Pages/LogPage';
import { MedicinesPage } from '../Pages/MedicinesPage';
import { KidsPage } from '../Pages/KidsPage';
import { NotFoundPage } from '../Pages/NotFound';
import { LogEntry } from '../types';
import ScheduledPage from '../Pages/ScheduledPage';
import UserManagement from '../Pages/Settings/UserManagement';
import MedicineManagement from '../Pages/Settings/MedicineManagement';

export const MainLayout = () => {
  const [logData, setLogData] = useState<LogEntry[]>([]);
  
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto h-screen flex flex-col shadow-lg">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage logData={logData} setLogData={setLogData} />} />
          <Route path="/log" element={<LogPage logData={logData} setLogData={setLogData} />} />
          <Route path="/scheduled" element={<ScheduledPage />} />
          <Route path="/medicines" element={<MedicinesPage />} />
          <Route path="/kids" element={<KidsPage />} />
          <Route path="/settings/users" element={<UserManagement />} />
          <Route path="/settings/medicines" element={<MedicineManagement/>}/>
          <Route path="*" element={<NotFoundPage/>}/>
        </Routes>
        <Navigation />
      </div>
    </div>
  );
};

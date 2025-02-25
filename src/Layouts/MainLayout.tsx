// src/layouts/MainLayout.tsx
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Header } from '../components/Header';
import { Navigation } from '../components/Navigation';
import { HomePage } from '../Pages/Home/HomePage'
import { LogPage } from '../Pages/Log/LogPage';
import { MedicinesPage } from '../Pages/Medicines/MedicinesPage';
import { KidsPage } from '../Pages/Kids/KidsPage';
import { NotFoundPage } from '../Pages/NotFound';
import { LogEntry } from '../types';
import ScheduledPage from '../Pages/Scheduled/ScheduledPage';
import MedicineManagement from '../Pages/Settings/MedicineManagement';
import UserManagement from '../Pages/Settings/UserManagement';

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
          <Route path="/settings/medicines" element={<MedicineManagement />} />
          <Route path="*" element={<NotFoundPage/>}/>
        </Routes>
        <Navigation />
      </div>
    </div>
  );
};

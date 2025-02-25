import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { MedicineManager } from './services/medicineManager';

MedicineManager.initialize().then(() => {

  const container = document.getElementById('root');
  if (container) {
    console.log ('In main');
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } else {
    console.error('Root element not found');
  }
});
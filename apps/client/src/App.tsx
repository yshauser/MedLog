import { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MainLayout } from './Layouts/MainLayout';
import { AuthProvider } from './Users/AuthContext';
import { SplashScreen } from './components/SplashScreen';
import './i18n/i18n';

import MigrationRunner from './migration/MigrationRunner';

// Main App component
const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <SplashScreen isVisible={showSplash} />
      <AuthProvider>
        <Router>
          <MainLayout />
        </Router>
      </AuthProvider>
    </>
  );
};

// function for running migration (should me execute only once)
// function App() {
//   return (
//     <div>
//       {/* Add this temporarily - remove after migration */}
//       <MigrationRunner />
      
//       {/* Your existing app components */}
//     </div>
//   );
// }


export default App;


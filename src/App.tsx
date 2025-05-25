import { BrowserRouter as Router } from 'react-router-dom';
import { MainLayout } from './Layouts/MainLayout';
import { AuthProvider } from './Users/AuthContext';

import MigrationRunner from './migration/MigrationRunner';

// Main App component
const App = () => {
  return (
    <AuthProvider>
    <Router>
      <MainLayout />
    </Router>
    </AuthProvider>
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


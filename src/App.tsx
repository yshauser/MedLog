import { BrowserRouter as Router } from 'react-router-dom';
import { MainLayout } from './Layouts/MainLayout';
import { AuthProvider } from './Users/AuthContext';


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

export default App;
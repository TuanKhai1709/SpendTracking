import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BudgetProvider } from '../context/BudgetContext';
import { CategoryProvider } from '../context/CategoryContext';
import { RecurringProvider } from '../context/RecurringContext';
import Navbar from './Navbar';

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <CategoryProvider>
      <BudgetProvider>
        <RecurringProvider>
          <div className="app-layout">
            <div className="main-content">
              {children}
            </div>
            <Navbar />
          </div>
        </RecurringProvider>
      </BudgetProvider>
    </CategoryProvider>
  );
}

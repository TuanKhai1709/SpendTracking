import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LangProvider } from './context/LangContext';
import { ThemeProvider } from './context/ThemeContext';
import { BudgetProvider } from './context/BudgetContext';
import { CategoryProvider } from './context/CategoryContext';
import { RecurringProvider } from './context/RecurringContext';
import { TransactionCacheProvider } from './context/TransactionCacheContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Income from './pages/Income';
import Settings from './pages/Settings';
import Report from './pages/Report';
import CategoryManagement from './pages/CategoryManagement';
import BudgetManagement from './pages/BudgetManagement';
import ChangePassword from './pages/ChangePassword';
import RecurringExpenses from './pages/RecurringExpenses';
import './App.css';

function App() {
  const protectedRoutes = (
    <TransactionCacheProvider>
      <CategoryProvider>
        <BudgetProvider>
          <RecurringProvider>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/income" element={<Income />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/report" element={<Report />} />
              <Route path="/categories" element={<CategoryManagement />} />
              <Route path="/budgets" element={<BudgetManagement />} />
              <Route path="/change-password" element={<ChangePassword />} />
              <Route path="/recurring" element={<RecurringExpenses />} />
            </Routes>
          </RecurringProvider>
        </BudgetProvider>
      </CategoryProvider>
    </TransactionCacheProvider>
  );

  return (
    <ThemeProvider>
      <LangProvider>
        <AuthProvider>
          <HashRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/*" element={<PrivateRoute>{protectedRoutes}</PrivateRoute>} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </HashRouter>
        </AuthProvider>
      </LangProvider>
    </ThemeProvider>
  );
}

export default App;

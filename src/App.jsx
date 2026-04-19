import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LangProvider } from './context/LangContext';
import { ThemeProvider } from './context/ThemeContext';
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
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <LangProvider>
        <AuthProvider>
          <HashRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/expenses" element={<PrivateRoute><Expenses /></PrivateRoute>} />
              <Route path="/income" element={<PrivateRoute><Income /></PrivateRoute>} />
              <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
              <Route path="/report" element={<PrivateRoute><Report /></PrivateRoute>} />
              <Route path="/categories" element={<PrivateRoute><CategoryManagement /></PrivateRoute>} />
              <Route path="/budgets" element={<PrivateRoute><BudgetManagement /></PrivateRoute>} />
              <Route path="/change-password" element={<PrivateRoute><ChangePassword /></PrivateRoute>} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </HashRouter>
        </AuthProvider>
      </LangProvider>
    </ThemeProvider>
  );
}

export default App;

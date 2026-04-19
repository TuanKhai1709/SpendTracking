import { createContext, useContext, useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

const BudgetContext = createContext(null);

export function BudgetProvider({ children }) {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);

  const getColRef = () => collection(db, 'users', user.uid, 'budgets');

  const fetchBudgets = async () => {
    if (!user) return;
    try {
      const snap = await getDocs(getColRef());
      const now = new Date().toISOString().split('T')[0];
      const items = [];
      for (const d of snap.docs) {
        const data = { id: d.id, ...d.data() };
        if (data.endDate < now) {
          await deleteDoc(doc(db, 'users', user.uid, 'budgets', d.id));
        } else {
          items.push(data);
        }
      }
      setBudgets(items);
    } catch (err) {
      console.error('Failed to fetch budgets', err);
    }
  };

  useEffect(() => {
    if (user) fetchBudgets();
    else setBudgets([]);
  }, [user]);

  const addBudget = async (data) => {
    await addDoc(getColRef(), { ...data, createdAt: Timestamp.now() });
    await fetchBudgets();
  };

  const updateBudget = async (id, data) => {
    await updateDoc(doc(db, 'users', user.uid, 'budgets', id), data);
    await fetchBudgets();
  };

  const deleteBudget = async (id) => {
    await deleteDoc(doc(db, 'users', user.uid, 'budgets', id));
    await fetchBudgets();
  };

  return (
    <BudgetContext.Provider value={{ budgets, fetchBudgets, addBudget, updateBudget, deleteBudget }}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  return useContext(BudgetContext);
}

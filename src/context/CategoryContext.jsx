import { createContext, useContext, useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

const DEFAULT_EXPENSE_CATEGORIES = [
  'Food & Dining', 'Coffee', 'Transportation', 'Shopping', 'Bills',
  'Recurring Expenses', 'Recurring Investments', 'Entertainment',
  'Healthcare', 'Education',
];

const DEFAULT_INCOME_CATEGORIES = ['Salary', 'Bonus'];

const CategoryContext = createContext(null);

export function CategoryProvider({ children }) {
  const { user } = useAuth();
  const [expenseCategories, setExpenseCategories] = useState(DEFAULT_EXPENSE_CATEGORIES);
  const [incomeCategories, setIncomeCategories] = useState(DEFAULT_INCOME_CATEGORIES);
  const [loaded, setLoaded] = useState(false);

  const getColRef = () => collection(db, 'users', user.uid, 'categories');

  const fetchCategories = async () => {
    if (!user) return;
    try {
      const snap = await getDocs(getColRef());
      if (snap.empty) {
        setExpenseCategories(DEFAULT_EXPENSE_CATEGORIES);
        setIncomeCategories(DEFAULT_INCOME_CATEGORIES);
      } else {
        const expCats = [];
        const incCats = [];
        snap.forEach((d) => {
          const data = { id: d.id, ...d.data() };
          if (data.type === 'expense') expCats.push(data);
          else incCats.push(data);
        });
        expCats.sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0));
        incCats.sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0));
        if (expCats.length > 0) setExpenseCategories(expCats.map((c) => c.name));
        else setExpenseCategories(DEFAULT_EXPENSE_CATEGORIES);
        if (incCats.length > 0) setIncomeCategories(incCats.map((c) => c.name));
        else setIncomeCategories(DEFAULT_INCOME_CATEGORIES);
      }
      setLoaded(true);
    } catch (err) {
      console.error('Failed to fetch categories', err);
      setLoaded(true);
    }
  };

  useEffect(() => {
    if (user) fetchCategories();
    else {
      setExpenseCategories(DEFAULT_EXPENSE_CATEGORIES);
      setIncomeCategories(DEFAULT_INCOME_CATEGORIES);
      setLoaded(false);
    }
  }, [user]);

  const initializeDefaults = async () => {
    if (!user) return;
    const snap = await getDocs(getColRef());
    if (!snap.empty) return;
    const now = Timestamp.now();
    for (const name of DEFAULT_EXPENSE_CATEGORIES) {
      await addDoc(getColRef(), { name, type: 'expense', updatedAt: now });
    }
    for (const name of DEFAULT_INCOME_CATEGORIES) {
      await addDoc(getColRef(), { name, type: 'income', updatedAt: now });
    }
    await fetchCategories();
  };

  const addCategory = async (name, type) => {
    await addDoc(getColRef(), { name, type, updatedAt: Timestamp.now() });
    await fetchCategories();
  };

  const updateCategory = async (oldName, newName, type) => {
    const snap = await getDocs(getColRef());
    const found = snap.docs.find((d) => d.data().name === oldName && d.data().type === type);
    if (found) {
      await updateDoc(doc(db, 'users', user.uid, 'categories', found.id), {
        name: newName,
        updatedAt: Timestamp.now(),
      });
      await fetchCategories();
    }
  };

  const deleteCategory = async (name, type) => {
    const snap = await getDocs(getColRef());
    const found = snap.docs.find((d) => d.data().name === name && d.data().type === type);
    if (found) {
      await deleteDoc(doc(db, 'users', user.uid, 'categories', found.id));
      await fetchCategories();
    }
  };

  return (
    <CategoryContext.Provider value={{
      expenseCategories, incomeCategories, loaded,
      initializeDefaults, addCategory, updateCategory, deleteCategory,
      fetchCategories,
    }}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategory() {
  return useContext(CategoryContext);
}

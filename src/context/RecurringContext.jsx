import { createContext, useContext, useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

const RecurringContext = createContext(null);

export function RecurringProvider({ children }) {
  const { user } = useAuth();
  const [recurringItems, setRecurringItems] = useState([]);

  const getColRef = () => collection(db, 'users', user.uid, 'recurring');
  const getExpenseColRef = () => collection(db, 'users', user.uid, 'expenses');

  const fetchRecurring = async () => {
    if (!user) return;
    try {
      const snap = await getDocs(getColRef());
      const items = [];
      snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
      items.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setRecurringItems(items);
    } catch (err) {
      console.error('Failed to fetch recurring', err);
    }
  };

  const processRecurring = async () => {
    if (!user) return;
    try {
      const snap = await getDocs(getColRef());
      const now = new Date();
      const todayDay = now.getDate();
      const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const todayStr = now.toISOString().split('T')[0];

      for (const d of snap.docs) {
        const item = d.data();
        if (item.dayOfMonth === todayDay && item.lastRunMonth !== currentYM) {
          await addDoc(getExpenseColRef(), {
            title: item.title,
            amount: item.amount,
            category: 'Recurring Expenses',
            date: todayStr,
          });
          await updateDoc(doc(db, 'users', user.uid, 'recurring', d.id), {
            lastRunMonth: currentYM,
          });
        }
      }
    } catch (err) {
      console.error('Failed to process recurring', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRecurring();
      processRecurring();
    } else {
      setRecurringItems([]);
    }
  }, [user]);

  const addRecurring = async (data) => {
    await addDoc(getColRef(), { ...data, lastRunMonth: '', createdAt: Timestamp.now() });
    await fetchRecurring();
  };

  const updateRecurring = async (id, data) => {
    await updateDoc(doc(db, 'users', user.uid, 'recurring', id), data);
    await fetchRecurring();
  };

  const deleteRecurring = async (id) => {
    await deleteDoc(doc(db, 'users', user.uid, 'recurring', id));
    await fetchRecurring();
  };

  return (
    <RecurringContext.Provider value={{ recurringItems, addRecurring, updateRecurring, deleteRecurring }}>
      {children}
    </RecurringContext.Provider>
  );
}

export function useRecurring() {
  return useContext(RecurringContext);
}

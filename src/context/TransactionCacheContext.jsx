import { createContext, useCallback, useContext, useEffect, useRef } from 'react';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

const TransactionCacheContext = createContext(null);

const COLLECTION_BY_TYPE = {
  expense: 'expenses',
  income: 'income',
};

const createEmptyCache = () => ({
  expense: {},
  income: {},
});

const formatMonthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const formatDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const getMonthKey = (dateStr) => dateStr.slice(0, 7);

const getMonthBounds = (ym) => {
  const [year, month] = ym.split('-').map(Number);
  const startDate = `${ym}-01`;
  const nextMonth = new Date(year, month, 1);
  const endDateExclusive = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-01`;
  return { startDate, endDateExclusive };
};

const sortTransactions = (items) => [...items].sort((a, b) => {
  if (a.date !== b.date) return b.date.localeCompare(a.date);
  const aCreated = a.createdAt?.seconds || 0;
  const bCreated = b.createdAt?.seconds || 0;
  return bCreated - aCreated;
});

const listMonthsInRange = (startDate, endDateExclusive) => {
  if (!startDate || !endDateExclusive || startDate >= endDateExclusive) return [];

  const current = new Date(`${startDate}T00:00:00`);
  current.setDate(1);

  const end = new Date(`${endDateExclusive}T00:00:00`);
  end.setDate(end.getDate() - 1);

  if (end < current) return [];

  const months = [];
  const cursor = new Date(current);
  while (cursor <= end) {
    months.push(formatMonthKey(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return months;
};

export function TransactionCacheProvider({ children }) {
  const { user } = useAuth();
  const cacheRef = useRef(createEmptyCache());

  useEffect(() => {
    cacheRef.current = createEmptyCache();
  }, [user?.uid]);

  const getTransactionsForMonth = useCallback(async (type, ym, options = {}) => {
    if (!user) return [];

    const cached = cacheRef.current[type]?.[ym];
    if (cached && !options.force) {
      return cached;
    }

    const collectionName = COLLECTION_BY_TYPE[type];
    const { startDate, endDateExclusive } = getMonthBounds(ym);
    const monthQuery = query(
      collection(db, 'users', user.uid, collectionName),
      where('date', '>=', startDate),
      where('date', '<', endDateExclusive),
      orderBy('date', 'desc')
    );
    const snap = await getDocs(monthQuery);
    const items = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));

    cacheRef.current[type][ym] = sortTransactions(items);
    return cacheRef.current[type][ym];
  }, [user]);

  const getTransactionsForRange = useCallback(async (type, startDate, endDateExclusive) => {
    if (!user) return [];

    const months = listMonthsInRange(startDate, endDateExclusive);
    const monthGroups = await Promise.all(months.map((ym) => getTransactionsForMonth(type, ym)));

    return sortTransactions(
      monthGroups.flat().filter((item) => item.date >= startDate && item.date < endDateExclusive)
    );
  }, [getTransactionsForMonth, user]);

  const upsertTransaction = useCallback((type, transaction, previousTransaction = null) => {
    const previousMonth = previousTransaction ? getMonthKey(previousTransaction.date) : null;
    const nextMonth = getMonthKey(transaction.date);

    if (previousMonth && cacheRef.current[type][previousMonth]) {
      cacheRef.current[type][previousMonth] = cacheRef.current[type][previousMonth]
        .filter((item) => item.id !== transaction.id);
    }

    if (cacheRef.current[type][nextMonth]) {
      cacheRef.current[type][nextMonth] = sortTransactions([
        transaction,
        ...cacheRef.current[type][nextMonth].filter((item) => item.id !== transaction.id),
      ]);
    }
  }, []);

  const removeTransaction = useCallback((type, transaction) => {
    const month = getMonthKey(transaction.date);
    if (cacheRef.current[type][month]) {
      cacheRef.current[type][month] = cacheRef.current[type][month]
        .filter((item) => item.id !== transaction.id);
    }
  }, []);

  const clearTransactionCache = useCallback(() => {
    cacheRef.current = createEmptyCache();
  }, []);

  return (
    <TransactionCacheContext.Provider value={{
      getTransactionsForMonth,
      getTransactionsForRange,
      upsertTransaction,
      removeTransaction,
      clearTransactionCache,
      formatDate,
    }}>
      {children}
    </TransactionCacheContext.Provider>
  );
}

export function useTransactionCache() {
  return useContext(TransactionCacheContext);
}
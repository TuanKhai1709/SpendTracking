import { createContext, useContext, useEffect, useState } from 'react';
import {
  collection, doc, getDocs, setDoc, updateDoc, deleteDoc, onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

const SubscriptionContext = createContext(null);

export const DEFAULT_PACKAGES = [
  { id: '1year', name: '1 Năm', originalPrice: 75000, years: 1, order: 1 },
  { id: '2year', name: '2 Năm', originalPrice: 140000, years: 2, order: 2 },
  { id: '3year', name: '3 Năm', originalPrice: 200000, years: 3, order: 3 },
  { id: 'lifetime', name: 'Vĩnh Viễn', originalPrice: 300000, years: null, order: 4 },
];

const FALLBACK_PACKAGES = DEFAULT_PACKAGES.map((p) => ({
  ...p,
  saleEnabled: false,
  salePrice: null,
}));

export function SubscriptionProvider({ children }) {
  const { user } = useAuth();
  const [packages, setPackages] = useState([]);
  const [loadingPkgs, setLoadingPkgs] = useState(true);

  async function seedPackages() {
    const col = collection(db, 'packages');
    const snap = await getDocs(col);
    if (snap.empty) {
      await Promise.all(
        DEFAULT_PACKAGES.map((p) =>
          setDoc(doc(db, 'packages', p.id), {
            ...p,
            saleEnabled: false,
            salePrice: null,
          })
        )
      );
    }
  }

  useEffect(() => {
    // Wait for user to be authenticated before reading Firestore
    if (!user) {
      setLoadingPkgs(true);
      return;
    }

    seedPackages().catch(console.error);

    const unsub = onSnapshot(
      collection(db, 'packages'),
      (snap) => {
        const pkgs = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
        setPackages(pkgs.length > 0 ? pkgs : FALLBACK_PACKAGES);
        setLoadingPkgs(false);
      },
      (err) => {
        console.error('Failed to load packages from Firestore:', err.code);
        // Firestore rules may not be configured — use hardcoded defaults
        setPackages(FALLBACK_PACKAGES);
        setLoadingPkgs(false);
      }
    );
    return unsub;
  }, [user?.uid]);

  const updatePackage = async (packageId, changes) => {
    await updateDoc(doc(db, 'packages', packageId), changes);
  };

  const addPackage = async ({ months, originalPrice }) => {
    const id = `${months}month_${Date.now()}`;
    const name = months === 1 ? '1 Tháng' : `${months} Tháng`;
    const maxOrder = packages.reduce((m, p) => Math.max(m, p.order ?? 0), 0);
    await setDoc(doc(db, 'packages', id), {
      id,
      name,
      originalPrice: Number(originalPrice),
      months,
      years: null,
      order: maxOrder + 1,
      saleEnabled: false,
      salePrice: null,
    });
  };

  const deletePackage = async (packageId) => {
    await deleteDoc(doc(db, 'packages', packageId));
  };

  const effectivePrice = (pkg) =>
    pkg.saleEnabled && pkg.salePrice ? pkg.salePrice : pkg.originalPrice;

  return (
    <SubscriptionContext.Provider value={{ packages, loadingPkgs, updatePackage, addPackage, deletePackage, effectivePrice }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  return useContext(SubscriptionContext);
}

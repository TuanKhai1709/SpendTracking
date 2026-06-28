import { createContext, useContext, useEffect, useState } from 'react';
import {
  collection, doc, getDocs, setDoc, updateDoc, onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';

const SubscriptionContext = createContext(null);

export const DEFAULT_PACKAGES = [
  { id: '1year', name: '1 Năm', originalPrice: 75000, years: 1, order: 1 },
  { id: '2year', name: '2 Năm', originalPrice: 140000, years: 2, order: 2 },
  { id: '3year', name: '3 Năm', originalPrice: 200000, years: 3, order: 3 },
  { id: 'lifetime', name: 'Vĩnh Viễn', originalPrice: 300000, years: null, order: 4 },
];

export function SubscriptionProvider({ children }) {
  const [packages, setPackages] = useState([]);
  const [loadingPkgs, setLoadingPkgs] = useState(true);

  // Seed default packages into Firestore if they don't exist
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
    seedPackages().catch(console.error);

    const unsub = onSnapshot(collection(db, 'packages'), (snap) => {
      const pkgs = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
      setPackages(pkgs);
      setLoadingPkgs(false);
    });
    return unsub;
  }, []);

  // Admin: toggle sale on/off + set sale price
  const updatePackage = async (packageId, changes) => {
    await updateDoc(doc(db, 'packages', packageId), changes);
  };

  // Compute the effective price of a package
  const effectivePrice = (pkg) =>
    pkg.saleEnabled && pkg.salePrice ? pkg.salePrice : pkg.originalPrice;

  return (
    <SubscriptionContext.Provider value={{ packages, loadingPkgs, updatePackage, effectivePrice }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  return useContext(SubscriptionContext);
}

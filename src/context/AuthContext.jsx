import { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
  signInWithRedirect,
  getRedirectResult,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext(null);
const googleProvider = new GoogleAuthProvider();

const ADMIN_EMAILS = ['admin@gmail.com', 'tuankhai17092005@gmail.com'];

// ──────────────────────────────────────────────
// Ensure a Firestore user doc exists
// Called after login / register / Google sign-in
// ──────────────────────────────────────────────
async function ensureUserDoc(firebaseUser) {
  const ref = doc(db, 'users', firebaseUser.uid);
  const snap = await getDoc(ref);

  const trialEnd = new Date(firebaseUser.metadata.creationTime || Date.now());
  trialEnd.setDate(trialEnd.getDate() + 7);
  const isAdmin = ADMIN_EMAILS.includes(firebaseUser.email);

  if (!snap.exists()) {
    await setDoc(ref, {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName || '',
      role: isAdmin ? 'admin' : 'user',
      status: 'active',
      subscription: isAdmin
        ? {
          plan: 'lifetime',
          planName: 'Vĩnh Viễn',
          expiryDate: null,
          trialEndDate: null,
          activatedAt: serverTimestamp(),
        }
        : {
          plan: 'trial',
          planName: 'Dùng thử',
          expiryDate: null,
          trialEndDate: Timestamp.fromDate(trialEnd),
          activatedAt: null,
        },
      createdAt: serverTimestamp(),
    });
    const newSnap = await getDoc(ref);
    return newSnap.data();
  }

  // Update role in case email was added to ADMIN_EMAILS later
  const data = snap.data();
  const updates = {};
  if (isAdmin && data.role !== 'admin') updates.role = 'admin';
  // Upgrade existing admins who still have trial plan to lifetime
  if (isAdmin && data.subscription?.plan === 'trial') {
    updates['subscription.plan'] = 'lifetime';
    updates['subscription.planName'] = 'Vĩnh Viễn';
    updates['subscription.expiryDate'] = null;
    updates['subscription.activatedAt'] = serverTimestamp();
  }
  if (Object.keys(updates).length > 0) {
    await updateDoc(ref, updates);
    const updated = await getDoc(ref);
    return updated.data();
  }
  return data;
}

// Compute derived subscription status from Firestore doc
function computeSubStatus(firestoreData) {
  if (!firestoreData?.subscription) return { active: false, planKey: 'expired', label: null, daysLeft: 0 };
  const { plan, expiryDate, trialEndDate } = firestoreData.subscription;

  if (plan === 'lifetime') return { active: true, planKey: 'lifetime', label: 'Lifetime', daysLeft: Infinity };

  const now = Date.now();

  if (plan && plan !== 'trial' && expiryDate) {
    const exp = expiryDate.toDate?.() ?? new Date(expiryDate);
    const daysLeft = Math.ceil((exp - now) / 86400000);
    return { active: daysLeft > 0, planKey: plan, label: firestoreData.subscription.planName, daysLeft: Math.max(0, daysLeft) };
  }

  // Trial
  if (trialEndDate) {
    const end = trialEndDate.toDate?.() ?? new Date(trialEndDate);
    const daysLeft = Math.ceil((end - now) / 86400000);
    return { active: daysLeft > 0, planKey: 'trial', label: 'Trial', daysLeft: Math.max(0, daysLeft) };
  }

  return { active: false, planKey: 'expired', label: null, daysLeft: 0 };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionPassword, setSessionPassword] = useState(
    () => sessionStorage.getItem('_sp') || null
  );

  const saveSessionPassword = (pwd) => {
    if (pwd) {
      sessionStorage.setItem('_sp', pwd);
    } else {
      sessionStorage.removeItem('_sp');
    }
    setSessionPassword(pwd);
  };

  // Build user state from Firebase Auth + Firestore doc
  const buildUserState = async (firebaseUser) => {
    const firestoreData = await ensureUserDoc(firebaseUser);
    const sub = computeSubStatus(firestoreData);
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      emailVerified: firebaseUser.emailVerified,
      photoURL: firebaseUser.photoURL || null,
      creationTime: firebaseUser.metadata?.creationTime || null,
      isGoogleUser: firebaseUser.providerData?.[0]?.providerId === 'google.com',
      isAdmin: firestoreData?.role === 'admin' || ADMIN_EMAILS.includes(firebaseUser.email),
      role: firestoreData?.role || 'user',
      accountStatus: firestoreData?.status || 'active',
      subscription: firestoreData?.subscription || null,
      subStatus: sub,
    };
  };

  // Refresh user subscription from Firestore (called after payment)
  const refreshSubscription = async () => {
    if (!auth.currentUser) return;
    const ref = doc(db, 'users', auth.currentUser.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const firestoreData = snap.data();
    const sub = computeSubStatus(firestoreData);
    setUser((prev) => prev ? {
      ...prev,
      accountStatus: firestoreData.status,
      subscription: firestoreData.subscription,
      subStatus: sub,
    } : prev);
  };

  useEffect(() => {
    // Handle redirect result from Google sign-in
    getRedirectResult(auth).catch((error) => {
      console.error('Google redirect error:', error);
    });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userState = await buildUserState(firebaseUser);
          setUser(userState);
        } catch (err) {
          console.error('Failed to load user profile', err);
          // Fallback: set minimal user state
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            emailVerified: firebaseUser.emailVerified,
            photoURL: firebaseUser.photoURL || null,
            creationTime: firebaseUser.metadata?.creationTime || null,
            isGoogleUser: firebaseUser.providerData?.[0]?.providerId === 'google.com',
            isAdmin: ADMIN_EMAILS.includes(firebaseUser.email),
            role: 'user',
            accountStatus: 'active',
            subscription: null,
            subStatus: { active: true, label: null, daysLeft: 7 },
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email, password, rememberMe = false) => {
    await signInWithEmailAndPassword(auth, email, password);
    saveSessionPassword(password);
    if (rememberMe) {
      localStorage.setItem('rememberMe_email', email);
    } else {
      localStorage.removeItem('rememberMe_email');
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result;
    } catch (error) {
      if (
        error.code === 'auth/popup-blocked' ||
        error.code === 'auth/popup-closed-by-user' ||
        error.code === 'auth/cancelled-popup-request'
      ) {
        signInWithRedirect(auth, googleProvider);
        return null;
      }
      throw error;
    }
  };

  const register = async (username, email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: username });
    await sendEmailVerification(cred.user);
    saveSessionPassword(password);
    // ensureUserDoc will be called by onAuthStateChanged
  };

  const logout = async () => {
    localStorage.removeItem('rememberMe_email');
    saveSessionPassword(null);
    await signOut(auth);
  };

  const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
  };

  const resendEmailVerification = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      loginWithGoogle,
      register,
      logout,
      resetPassword,
      resendEmailVerification,
      refreshSubscription,
      loading,
      sessionPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

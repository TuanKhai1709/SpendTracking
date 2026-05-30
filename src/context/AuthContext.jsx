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
import { auth } from '../firebase';

const AuthContext = createContext(null);
const googleProvider = new GoogleAuthProvider();

const ADMIN_EMAILS = ['admin@gmail.com', 'tuankhai17092005@gmail.com'];

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

  useEffect(() => {
    // Handle redirect result from Google sign-in
    getRedirectResult(auth).catch((error) => {
      console.error('Google redirect error:', error);
    });

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          emailVerified: firebaseUser.emailVerified,
          photoURL: firebaseUser.photoURL || null,
          creationTime: firebaseUser.metadata?.creationTime || null,
          isGoogleUser: firebaseUser.providerData?.[0]?.providerId === 'google.com',
          isAdmin: ADMIN_EMAILS.includes(firebaseUser.email),
        });
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
      // Try popup first (works in most browsers)
      const result = await signInWithPopup(auth, googleProvider);
      return result;
    } catch (error) {
      // If popup is blocked, fall back to redirect
      if (
        error.code === 'auth/popup-blocked' ||
        error.code === 'auth/popup-closed-by-user' ||
        error.code === 'auth/cancelled-popup-request'
      ) {
        signInWithRedirect(auth, googleProvider); // page will navigate away
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
    setUser({
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: username,
      emailVerified: cred.user.emailVerified,
      photoURL: cred.user.photoURL || null,
      creationTime: cred.user.metadata?.creationTime || null,
      isGoogleUser: false,
      isAdmin: ADMIN_EMAILS.includes(cred.user.email),
    });
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

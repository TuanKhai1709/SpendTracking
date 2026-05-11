import { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  sendEmailVerification,
  signInWithRedirect,
  getRedirectResult,
} from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext(null);
const googleProvider = new GoogleAuthProvider();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
    if (rememberMe) {
      localStorage.setItem('rememberMe_email', email);
    } else {
      localStorage.removeItem('rememberMe_email');
    }
  };

  const loginWithGoogle = async () => {
    await signInWithRedirect(auth, googleProvider);
    // Page will redirect to Google, then come back.
    // onAuthStateChanged will fire when the user is signed in.
  };

  const register = async (username, email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: username });
    await sendEmailVerification(cred.user);
    setUser({
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: username,
      emailVerified: cred.user.emailVerified,
    });
  };

  const logout = async () => {
    localStorage.removeItem('rememberMe_email');
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
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

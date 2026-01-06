import { useEffect, useState } from 'react';
import { 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../firebase/config';

interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  credits: number;
}

export const useFirebaseAuth = () => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if auth is properly initialized
  const isAuthInitialized = () => {
    if (!auth) {
      console.error('Firebase auth is not initialized');
      return false;
    }
    return true;
  };

  const login = async (email: string, password: string) => {
    if (!isAuthInitialized()) throw new Error('Auth not initialized');
    const result = await signInWithEmailAndPassword(auth, email, password);
    return {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      credits: 1
    };
  };

  const signup = async (name: string, email: string, password: string) => {
    if (!isAuthInitialized()) throw new Error('Auth not initialized');
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return {
      uid: result.user.uid,
      email: result.user.email,
      displayName: name,
      credits: 1
    };
  };

  const logout = async () => {
    if (!isAuthInitialized()) throw new Error('Auth not initialized');
    await signOut(auth);
  };

  useEffect(() => {
    if (!isAuthInitialized()) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          credits: 1
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, login, signup, logout, loading };
};

import { initializeApp, getApp, getApps } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { User } from '../types';

const firebaseConfig = {
  apiKey: "AIzaSyAs5z8PBxvy8b_kaSb8sN0nBQfAAmfBIbg",
  authDomain: "infinityhouse-1794f.firebaseapp.com",
  databaseURL: "https://infinityhouse-1794f-default-rtdb.firebaseio.com",
  projectId: "infinityhouse-1794f",
  storageBucket: "infinityhouse-1794f.firebasestorage.app",
  messagingSenderId: "750858809775",
  appId: "1:750858809775:web:04971eb7dc21fed699bf5a",
  measurementId: "G-CWK7LG56ZP"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL
    };
  } catch (error: any) {
    console.error("Google Auth Error:", error.message);
    throw error;
  }
};

export const signInMock = async (): Promise<User> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        uid: "guest-" + Math.random().toString(36).substr(2, 5),
        email: "guest@mimanifesto.art",
        displayName: "Guest Author",
        photoURL: null
      });
    }, 800);
  });
};

export const signUpWithEmail = async (email: string, pass: string): Promise<User> => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    const displayName = email.split('@')[0];
    await updateProfile(result.user, { displayName });
    return {
      uid: result.user.uid,
      email: result.user.email,
      displayName: displayName,
      photoURL: null
    };
  } catch (error: any) {
    throw error;
  }
};

export const signInWithEmail = async (email: string, pass: string): Promise<User> => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL
    };
  } catch (error: any) {
    throw error;
  }
};

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      callback({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL
      });
    } else {
      callback(null);
    }
  });
};

export const logout = async () => {
  await signOut(auth);
  window.location.reload();
};

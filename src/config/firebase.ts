import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, getDocs, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDbaCW9Qd-64OtSdMobrGluXtRis1STsLI",
  authDomain: "gen-lang-client-0655097153.firebaseapp.com",
  projectId: "gen-lang-client-0655097153",
  storageBucket: "gen-lang-client-0655097153.firebasestorage.app",
  messagingSenderId: "205792581271",
  appId: "1:205792581271:web:d2feac1c67d559a25ebbd2",
  databaseId: "ai-studio-sol-9f87fa24-97e0-4836-be08-6a9f3eb8463b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Google Sign-In Helper
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user exists in Firestore, if not create one
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: new Date().toISOString(),
        wishlist: [],
        craftedItems: [],
        cart: []
      });
    }
    
    return user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

// Sign Out Helper
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

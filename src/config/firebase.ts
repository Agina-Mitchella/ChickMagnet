import { initializeApp, setLogLevel } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { initializeFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

// Mute internal info/warning/error logs in client console for offline resilience
setLogLevel('silent');

// Support Vercel environment variables or fallback to firebase-applet-config.json
const firebaseConfig = {
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || firebaseConfigJson.apiKey,
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigJson.authDomain,
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || firebaseConfigJson.projectId,
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigJson.storageBucket,
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigJson.messagingSenderId,
  appId: import.meta.env?.VITE_FIREBASE_APP_ID || firebaseConfigJson.appId,
};

const databaseId = import.meta.env?.VITE_FIREBASE_DATABASE_ID || firebaseConfigJson.firestoreDatabaseId || "(default)";

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Services with long-polling fallback for iframe sandboxes
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, databaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Standard Error Handler
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Operation Notice:', JSON.stringify(errInfo));
  return errInfo;
}

// Connection test with soft fallback for offline/connecting state
async function testConnection() {
  try {
    const connDoc = doc(db, 'system', 'connection');
    await getDoc(connDoc);
  } catch (error) {
    console.log("Firestore initial connection note (operating in standard mode):", error instanceof Error ? error.message : error);
  }
}
testConnection();

// Google Sign-In Helper
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user exists in Firestore, if not create one
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    const isAdminAccount = user.email?.toLowerCase() === 'uxagina@gmail.com' || user.email?.toLowerCase().includes('admin') || user.email?.toLowerCase() === 'manyaos7@gmail.com';

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || (isAdminAccount ? 'Agina (Admin)' : 'Poultry Farmer'),
        role: isAdminAccount ? 'ADMIN' : 'BUYER',
        buyerType: isAdminAccount ? 'wholesale' : 'retail',
        avatarEmoji: isAdminAccount ? '👑' : '🐣',
        photoURL: user.photoURL,
        createdAt: new Date().toISOString(),
      });
    }
    
    return user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

// Email & Password Sign In Helper
export const signInWithEmail = async (email: string, pass: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    const user = result.user;

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      const isAdminAccount = user.email?.toLowerCase() === 'uxagina@gmail.com' || user.email?.toLowerCase().includes('admin') || user.email?.toLowerCase() === 'manyaos7@gmail.com';
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || 'Member',
        role: isAdminAccount ? 'ADMIN' : 'BUYER',
        buyerType: isAdminAccount ? 'wholesale' : 'retail',
        avatarEmoji: isAdminAccount ? '👑' : '🐣',
        createdAt: new Date().toISOString(),
      });
    }
    return user;
  } catch (error) {
    console.error("Error signing in with email:", error);
    throw error;
  }
};

// Email & Password Registration Helper
export const registerWithEmail = async (
  email: string,
  pass: string,
  name: string,
  avatarEmoji: string = '🐣',
  role: string = 'BUYER'
) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    const user = result.user;

    await updateProfile(user, {
      displayName: name
    });

    const isAdminAccount = email.toLowerCase() === 'uxagina@gmail.com' || email.toLowerCase().includes('admin') || email.toLowerCase() === 'manyaos7@gmail.com';
    const finalRole = isAdminAccount ? 'ADMIN' : role;

    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: name,
      role: finalRole,
      buyerType: finalRole === 'ADMIN' ? 'wholesale' : 'retail',
      avatarEmoji: avatarEmoji || '🐣',
      createdAt: new Date().toISOString(),
    });

    return user;
  } catch (error) {
    console.error("Error registering with email:", error);
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

// Real-time Auth User Listener
export const subscribeAuthUser = (callback: (user: FirebaseUser | null, profileData?: any) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          callback(firebaseUser, userSnap.data());
          return;
        }
      } catch (err) {
        console.warn('Error fetching Firestore user profile on auth change:', err);
      }
      callback(firebaseUser, null);
    } else {
      callback(null, null);
    }
  });
};

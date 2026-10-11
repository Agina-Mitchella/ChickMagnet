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
  User as FirebaseUser,
  IdTokenResult,
} from 'firebase/auth';
import { initializeFirestore, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

// Mute internal info/warning/error logs in client console for offline resilience
setLogLevel('silent');

const environmentProjectId = import.meta.env?.VITE_FIREBASE_PROJECT_ID?.trim();
if (environmentProjectId && environmentProjectId !== firebaseConfigJson.projectId) {
  throw new Error(
    `Firebase project mismatch: expected ${firebaseConfigJson.projectId}, received ${environmentProjectId}.`
  );
}

// The checked-in Firebase app config is the canonical project binding. Vercel
// overrides are accepted only when they explicitly identify that same project,
// which prevents a stale partial environment from mixing two Firebase apps.
const useEnvironmentConfig = environmentProjectId === firebaseConfigJson.projectId;
const firebaseConfig = {
  apiKey: useEnvironmentConfig && import.meta.env?.VITE_FIREBASE_API_KEY
    ? import.meta.env.VITE_FIREBASE_API_KEY
    : firebaseConfigJson.apiKey,
  authDomain: useEnvironmentConfig && import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN
    ? import.meta.env.VITE_FIREBASE_AUTH_DOMAIN
    : firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: useEnvironmentConfig && import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET
    ? import.meta.env.VITE_FIREBASE_STORAGE_BUCKET
    : firebaseConfigJson.storageBucket,
  messagingSenderId: useEnvironmentConfig && import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID
    ? import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID
    : firebaseConfigJson.messagingSenderId,
  appId: useEnvironmentConfig && import.meta.env?.VITE_FIREBASE_APP_ID
    ? import.meta.env.VITE_FIREBASE_APP_ID
    : firebaseConfigJson.appId,
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Services with long-polling fallback for iframe sandboxes
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export interface FirebaseAuthorization {
  claims: IdTokenResult['claims'];
  isAdmin: boolean;
}

export async function getFirebaseAuthorization(user: FirebaseUser): Promise<FirebaseAuthorization> {
  const tokenResult = await user.getIdTokenResult();
  const isAdmin = tokenResult.claims.admin === true || tokenResult.claims.role === 'ADMIN';
  return { claims: tokenResult.claims, isAdmin };
}

async function ensureUserProfile(
  user: FirebaseUser,
  defaults: { displayName?: string; avatarEmoji?: string } = {}
) {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email || '',
      displayName: defaults.displayName || user.displayName || 'Poultry Buyer',
      buyerType: 'retail',
      avatarEmoji: defaults.avatarEmoji || '🐣',
      photoURL: user.photoURL || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

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
    
    await ensureUserProfile(user);
    
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

    await ensureUserProfile(user, {
      displayName: user.displayName || user.email?.split('@')[0] || 'Member',
    });
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
  avatarEmoji: string = '🐣'
) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    const user = result.user;

    await updateProfile(user, {
      displayName: name
    });

    await ensureUserProfile(user, {
      displayName: name,
      avatarEmoji,
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

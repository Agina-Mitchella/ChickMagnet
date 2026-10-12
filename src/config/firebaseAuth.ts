import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type IdTokenResult,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth } from './firebaseClient';
import type { UserProfileData } from './firebaseDb';

export interface FirebaseAuthorization {
  claims: IdTokenResult['claims'];
  isAdmin: boolean;
}

export async function getFirebaseAuthorization(user: FirebaseUser): Promise<FirebaseAuthorization> {
  const tokenResult = await user.getIdTokenResult();
  const isAdmin = tokenResult.claims.admin === true || tokenResult.claims.role === 'ADMIN';
  return { claims: tokenResult.claims, isAdmin };
}

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, new GoogleAuthProvider());
  const { ensureUserProfile } = await import('./firebaseDb');
  await ensureUserProfile(result.user);
  return result.user;
}

export async function signInWithEmail(email: string, pass: string) {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  const { ensureUserProfile } = await import('./firebaseDb');
  await ensureUserProfile(result.user, {
    displayName: result.user.displayName || result.user.email?.split('@')[0] || 'Member',
  });
  return result.user;
}

export async function registerWithEmail(
  email: string,
  pass: string,
  name: string,
  avatarEmoji = '🐣',
) {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  await updateProfile(result.user, { displayName: name });
  const { ensureUserProfile } = await import('./firebaseDb');
  await ensureUserProfile(result.user, { displayName: name, avatarEmoji });
  return result.user;
}

export function logoutUser() {
  return signOut(auth);
}

export function subscribeAuthUser(
  callback: (user: FirebaseUser | null, profileData?: UserProfileData | null) => void,
) {
  return onAuthStateChanged(auth, async firebaseUser => {
    if (!firebaseUser) {
      callback(null, null);
      return;
    }

    try {
      const { getUserProfile } = await import('./firebaseDb');
      callback(firebaseUser, await getUserProfile(firebaseUser.uid));
    } catch (error) {
      console.warn('Error fetching Firestore user profile on auth change:', error);
      callback(firebaseUser, null);
    }
  });
}

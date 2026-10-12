import type { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, initializeFirestore, serverTimestamp, setDoc } from 'firebase/firestore';
import { app, auth } from './firebaseClient';

export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface UserProfileData extends Record<string, unknown> {
  displayName?: string;
  buyerType?: string;
  avatarEmoji?: string;
}

export interface FirebaseAuthorizationErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: Array<{
      providerId?: string | null;
      email?: string | null;
    }>;
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
): FirebaseAuthorizationErrorInfo {
  const errInfo: FirebaseAuthorizationErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore Operation Notice:', JSON.stringify(errInfo));
  return errInfo;
}

export async function ensureUserProfile(
  user: FirebaseUser,
  defaults: { displayName?: string; avatarEmoji?: string } = {},
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

export async function getUserProfile(userId: string): Promise<UserProfileData | null> {
  const userSnap = await getDoc(doc(db, 'users', userId));
  return userSnap.exists() ? userSnap.data() : null;
}

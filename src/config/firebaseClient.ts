import { initializeApp, setLogLevel } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import firebaseConfigJson from '../../firebase-applet-config.json';

setLogLevel('silent');

const environmentProjectId = import.meta.env?.VITE_FIREBASE_PROJECT_ID?.trim();
if (environmentProjectId && environmentProjectId !== firebaseConfigJson.projectId) {
  throw new Error(
    `Firebase project mismatch: expected ${firebaseConfigJson.projectId}, received ${environmentProjectId}.`
  );
}

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

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// @ts-ignore
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || "";
// @ts-ignore
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "";
// @ts-ignore
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || "";
// @ts-ignore
const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "";
// @ts-ignore
const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "";
// @ts-ignore
const appId = import.meta.env.VITE_FIREBASE_APP_ID || "";

const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId
};

let app;
if (apiKey) {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
}

export const auth = app ? getAuth(app) : null as any; 
export const googleProvider = new GoogleAuthProvider();
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import {
  initializeAuth,
  getReactNativePersistence,
  connectAuthEmulator,
  getAuth, // ✅ ADD THIS
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Init app once
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Auth with RN persistence (handle Fast Refresh)
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  auth = getAuth(app); 
}

export const db = getFirestore(app);
export const storage = getStorage(app);
export { app, auth };

// --------------------
// Emulator toggle
// --------------------
const USE_EMULATORS =
  __DEV__ && process.env.EXPO_PUBLIC_USE_EMULATORS === "1";

// Pick host automatically for sim/emulator
const DEFAULT_HOST = Platform.OS === "android" ? "10.0.2.2" : "localhost";

// Optional: only use env override if you explicitly want phone testing
const EMULATOR_HOST =
  process.env.EXPO_PUBLIC_FORCE_EMULATOR_HOST === "1"
    ? process.env.EXPO_PUBLIC_EMULATOR_HOST
    : DEFAULT_HOST;


if (USE_EMULATORS && !globalThis.__FIREBASE_EMU_CONNECTED__) {
  globalThis.__FIREBASE_EMU_CONNECTED__ = true;

  console.log("✅ Using Firebase EMULATORS:", EMULATOR_HOST);

  connectAuthEmulator(auth, `http://${EMULATOR_HOST}:9099`, {
    disableWarnings: true,
  });
  connectFirestoreEmulator(db, EMULATOR_HOST, 8080);
}


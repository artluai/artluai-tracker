import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBRoWbCf5rrys1mwZC3Nr_jsGibpvaFAv4",
  authDomain: "artluai-tracker.firebaseapp.com",
  projectId: "artluai-tracker",
  storageBucket: "artluai-tracker.firebasestorage.app",
  messagingSenderId: "1050589162643",
  appId: "1:1050589162643:web:bd44fb5534730951a0b166",
  measurementId: "G-KZ7XSV57QX"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const analytics = getAnalytics(app);
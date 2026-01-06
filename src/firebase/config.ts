// Firebase core and services
import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAnalytics, Analytics } from "firebase/analytics";

// Firebase configuration from your Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyBEUWoaDW_H8fcstYeBab282Udxge-_3IE",
  authDomain: "agriseal-ai.firebaseapp.com",
  projectId: "agriseal-ai",
  storageBucket: "agriseal-ai.appspot.com", // ✅ fixed from .firebasestorage.app
  messagingSenderId: "159150218702",
  appId: "1:159150218702:web:c8b0c728e78e67ec1a5f9f",
  measurementId: "G-X270FFTRX8"
};

// Initialize Firebase App
const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth: Auth = getAuth(app);
const firestore: Firestore = getFirestore(app);

// Initialize Analytics (only in browser)
let analytics: Analytics | undefined;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

// Export initialized services
export { app, auth, firestore, analytics };
export default app;

// Firebase configuration
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDDejGpE0VFazG9QiL9CmibT_P9tbHzzBY",
  authDomain: "vue-belajar-91262.firebaseapp.com",
  projectId: "vue-belajar-91262",
  storageBucket: "vue-belajar-91262.firebasestorage.app",
  messagingSenderId: "275214723212",
  appId: "1:275214723212:web:ee7d69ecf040259532b3a9",
  measurementId: "G-SL99PP2SWB",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;

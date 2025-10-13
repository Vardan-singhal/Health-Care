import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDXPVH02_1P5e46d7qXafEiP80zlshlcZU",
  authDomain: "healthcare-appointments-6283a.firebaseapp.com",
  projectId: "healthcare-appointments-6283a",
  storageBucket: "healthcare-appointments-6283a.firebasestorage.app",
  messagingSenderId: "132313347723",
  appId: "1:132313347723:web:81445de4407fdaf127868e",
  measurementId: "G-TM3Z5PPJXZ",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";  // 🔹 MUST import getAuth

const firebaseConfig = {
  apiKey: "AIzaSyCpOIYlmduqaSxR_ceLNIcKtO5YBDZs2Zc",
  authDomain: "vyaas-66ec4.firebaseapp.com",
  projectId: "vyaas-66ec4",
  storageBucket: "vyaas-66ec4.appspot.com", // 🔹 fix typo: .firebasestorage.app → .appspot.com
  messagingSenderId: "231012625474",
  appId: "1:231012625474:web:29eed8409e633818f751db"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);   // 🔹 export auth correctly

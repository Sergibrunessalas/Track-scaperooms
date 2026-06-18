import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Configuració del projecte Firebase — omplir amb les dades del teu projecte
const firebaseConfig = {
  apiKey: "POSA_EL_TEU_API_KEY",
  authDomain: "POSA_EL_TEU_AUTH_DOMAIN",
  projectId: "POSA_EL_TEU_PROJECT_ID",
  storageBucket: "POSA_EL_TEU_STORAGE_BUCKET",
  messagingSenderId: "POSA_EL_TEU_MESSAGING_SENDER_ID",
  appId: "POSA_EL_TEU_APP_ID",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

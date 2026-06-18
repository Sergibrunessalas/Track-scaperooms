import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDhzJ_JyNOkrpHt65USWmWGKRve0rX_1mc",
  authDomain: "escape-room-tracker-92d60.firebaseapp.com",
  projectId: "escape-room-tracker-92d60",
  storageBucket: "escape-room-tracker-92d60.firebasestorage.app",
  messagingSenderId: "429520999110",
  appId: "1:429520999110:web:82bec74ea8a28a24d93dc7",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// frontend/src/lib/firestoreLite.js
// Firestore "lite": só leituras/escritas simples, sem tempo real.
// Bem mais pequeno que o SDK completo -> usado no site público.
import { getFirestore } from "firebase/firestore/lite";
import { app } from "./firebase";

export const db = getFirestore(app);

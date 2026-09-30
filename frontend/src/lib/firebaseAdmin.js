// frontend/src/lib/firebaseAdmin.js
// Firestore completo + autenticação. Só é importado pelas páginas do admin,
// que são carregadas à parte (lazy) em App.js.
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { app } from "./firebase";

export const auth = getAuth(app);
export const db = getFirestore(app);

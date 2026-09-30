// frontend/src/lib/firebase.js
import { initializeApp } from "firebase/app";

// Chaves web do Firebase (públicas — a segurança é feita pelas regras do Firestore).
const firebaseConfig = {
    apiKey: "AIzaSyDD8Ktr4ozcNj2SdwSbiz8ynHE_I_7yHYs",
    authDomain: "portfolio-5d3ee.firebaseapp.com",
    projectId: "portfolio-5d3ee",
    storageBucket: "portfolio-5d3ee.firebasestorage.app",
    messagingSenderId: "1034769508450",
    appId: "1:1034769508450:web:1d1e07d23b4273a290093b",
};

// Só a app (usada pelo admin). O Firestore e o login vivem em ficheiros à parte para o site
// público não carregar código que só o admin usa:
//  - lib/projectsApi.js   -> leitura dos projetos (site público, API REST, sem SDK)
//  - lib/firebaseAdmin.js -> Firestore completo + login (só em /admin)
export const app = initializeApp(firebaseConfig);

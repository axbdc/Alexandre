import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

// Se um ficheiro do site falhar a carregar (ex.: abriu a meio de uma publicação),
// recarrega a página uma vez em vez de ficar sem abrir os projetos.
window.addEventListener("vite:preloadError", (e) => {
    try {
        if (sessionStorage.getItem("ptf:reloaded")) return;
        sessionStorage.setItem("ptf:reloaded", "1");
    } catch (_) {
        return;
    }
    e.preventDefault();
    window.location.reload();
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);


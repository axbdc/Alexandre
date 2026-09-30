// frontend/src/admin/AdminLogin.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebaseAdmin";

const AdminLogin = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Se já houver sessão, salta para o admin
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            if (user) navigate("/admin", { replace: true });
        });
        return unsub;
    }, [navigate]);

    const onSubmit = async () => {
        setError("");
        if (!email || !password) {
            setError("Preenche email e password.");
            return;
        }
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate("/admin", { replace: true });
        } catch (e) {
            setError("Login falhou. Verifica os dados.");
        } finally {
            setLoading(false);
        }
    };

    const onKeyDown = (e) => {
        if (e.key === "Enter") onSubmit();
    };

    return (
        <div className="min-h-screen bg-bone flex items-center justify-center px-4">
            <div className="w-full max-w-sm border border-hairline bg-white p-8 shadow-[0_30px_70px_-30px_rgba(28,27,26,0.4)]">
                <div className="overline text-mist mb-1">Área reservada</div>
                <h1 className="font-display text-2xl text-ink mb-6">
                    Portfólio — Admin
                </h1>

                <label className="overline text-mist">Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={onKeyDown}
                    className="w-full border border-hairline bg-bone px-3 py-2 mt-1 mb-4 text-sm text-ink outline-none focus:border-ink"
                    autoComplete="username"
                />

                <label className="overline text-mist">Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={onKeyDown}
                    className="w-full border border-hairline bg-bone px-3 py-2 mt-1 mb-4 text-sm text-ink outline-none focus:border-ink"
                    autoComplete="current-password"
                />

                {error ? (
                    <div className="text-sm text-terracotta mb-4">{error}</div>
                ) : null}

                <button
                    type="button"
                    onClick={onSubmit}
                    disabled={loading}
                    className="w-full bg-ink text-bone py-2.5 text-xs tracking-[0.18em] uppercase hover:bg-terracotta transition-colors disabled:opacity-50"
                >
                    {loading ? "A entrar…" : "Entrar"}
                </button>
            </div>
        </div>
    );
};

export default AdminLogin;

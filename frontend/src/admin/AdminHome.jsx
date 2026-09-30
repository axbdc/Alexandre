// frontend/src/admin/AdminHome.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseAdmin";

const AdminHome = () => {
    const navigate = useNavigate();

    const logout = async () => {
        await signOut(auth);
        navigate("/admin/login", { replace: true });
    };

    return (
        <div className="min-h-screen bg-bone text-ink">
            <header className="hairline-bottom flex items-center justify-between px-6 h-14">
                <span className="overline">Portfólio — Admin</span>
                <button
                    type="button"
                    onClick={logout}
                    className="text-xs tracking-[0.18em] uppercase text-mist hover:text-ink transition-colors"
                >
                    Sair
                </button>
            </header>

            <div className="max-w-2xl mx-auto px-6 py-16 text-center">
                <div className="overline text-mist mb-2">Login a funcionar</div>
                <h1 className="font-display text-3xl text-ink mb-4">
                    Estás dentro.
                </h1>
                <p className="text-sm text-graphite">
                    A gestão de projetos (lista, criar/editar, imagens) chega no
                    próximo passo. Por agora isto confirma que o Firebase e o
                    login estão a funcionar.
                </p>
            </div>
        </div>
    );
};

export default AdminHome;

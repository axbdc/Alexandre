import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseAdmin";

// Barra de cima do admin com as abas (Projetos / Destaques) e o "Sair".
const TABS = [
    { to: "/admin", label: "Projetos" },
    { to: "/admin/destaques", label: "Destaques" },
];

const AdminTabs = () => {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const logout = async () => {
        await signOut(auth);
        navigate("/admin/login", { replace: true });
    };
    return (
        <header className="hairline-bottom flex items-center justify-between px-6 h-14 bg-bone">
            <nav className="flex items-center gap-1">
                <span className="overline mr-4 hidden sm:inline">Portfólio</span>
                {TABS.map((t) => {
                    const on = pathname === t.to;
                    return (
                        <Link
                            key={t.to}
                            to={t.to}
                            className={`px-3 py-1.5 text-xs tracking-[0.14em] uppercase border ${
                                on ? "border-ink text-ink bg-white" : "border-transparent text-mist hover:text-ink"
                            }`}
                        >
                            {t.label}
                        </Link>
                    );
                })}
            </nav>
            <button
                type="button"
                onClick={logout}
                className="text-xs tracking-[0.18em] uppercase text-mist hover:text-ink"
            >
                Sair
            </button>
        </header>
    );
};

export default AdminTabs;
